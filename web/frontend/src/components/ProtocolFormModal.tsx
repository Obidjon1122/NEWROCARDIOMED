import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal, Form, Input, Button,
  Typography, notification, Divider, Select, Tag, Tooltip,
} from 'antd';
import { SaveOutlined, CloseOutlined, FileTextOutlined, EyeOutlined, QuestionCircleOutlined, PrinterOutlined } from '@ant-design/icons';
import type { Client, ProtocolDashboardItem } from '../types';
import { createProtocolForm, previewProtocolDraft, type PreviewParagraph, getCustomOptions as fetchCustomOptions, saveCustomOption as apiSaveCustomOption, deleteCustomOption as apiDeleteCustomOption } from '../api/protocols';
import { getProtocolForm, type FormField } from '../data/protocolForms';
import { CloseCircleOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;
const { TextArea } = Input;

/* Dropdown — yozish ham, tanlash ham, o'chirish ham mumkin */
const FieldSelect: React.FC<{
  fieldKey: string;
  options: string[];
  defaults: string[];
  placeholder?: string;
  value?: string;
  onChange?: (val: string) => void;
  onDeleteOption?: (fieldKey: string, value: string) => void;
}> = ({ fieldKey, options, defaults, placeholder, value, onChange, onDeleteOption }) => {
  const [search, setSearch] = useState('');
  const opts = options.map((o) => ({
    value: o,
    label: defaults.includes(o) ? o : (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{o}</span>
        <CloseCircleOutlined
          style={{ color: '#ff4d4f', fontSize: 12 }}
          onClick={(e) => { e.stopPropagation(); onDeleteOption?.(fieldKey, o); }}
        />
      </div>
    ),
  }));
  if (search && !options.includes(search)) {
    opts.push({ value: search, label: search });
  }
  return (
    <Select
      showSearch
      allowClear
      value={value || undefined}
      placeholder={placeholder}
      searchValue={search}
      onSearch={setSearch}
      onChange={(val) => { onChange?.(val ?? ''); setSearch(''); }}
      onBlur={() => setSearch('')}
      options={opts}
      filterOption={(input, option) =>
        String(option?.value ?? '').toLowerCase().includes(input.toLowerCase())
      }
      notFoundContent={null}
      style={{ width: '100%' }}
    />
  );
};

interface Props {
  open: boolean;
  client: Client | null;
  protocols: ProtocolDashboardItem[];
  onClose: () => void;
  onSaved: () => void;
  initialProtocolId?: number | null;
  initialFormData?: Record<string, string> | null;
}

const ProtocolFormModal: React.FC<Props> = ({
  open, client, protocols, onClose, onSaved,
  initialProtocolId = null, initialFormData = null,
}) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = React.useState(false);
  const [selectedProtocolId, setSelectedProtocolId] = React.useState<number | null>(null);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewParagraphs, setPreviewParagraphs] = React.useState<PreviewParagraph[]>([]);
  const [previewLoading, setPreviewLoading] = React.useState(false);
  const [customOptions, setCustomOptions] = React.useState<Record<string, string[]>>({});

  useEffect(() => {
    if (open) {
      fetchCustomOptions().then(setCustomOptions).catch(() => {});
    }
  }, [open]);

  const protocolDef = useMemo(
    () => (selectedProtocolId ? getProtocolForm(selectedProtocolId) : null),
    [selectedProtocolId],
  );

  useEffect(() => {
    if (open) {
      form.resetFields();
      setSelectedProtocolId(initialProtocolId ?? null);
    }
  }, [open, form, initialProtocolId]);

  useEffect(() => {
    if (!protocolDef) return;
    const defaults: Record<string, unknown> = {};
    for (const section of protocolDef.sections) {
      for (const field of section.fields) {
        // Only pre-fill from saved data (editing), never apply defaultValue
        if (initialFormData && initialFormData[field.key] !== undefined) {
          defaults[field.key] = initialFormData[field.key];
        }
      }
    }
    form.setFieldsValue(defaults);
  }, [protocolDef, form, initialFormData]);

  /* ── Filled fields counter ──────────────────────────────── */
  const totalFields = protocolDef
    ? protocolDef.sections.reduce((acc, s) => acc + s.fields.length, 0)
    : 0;

  const handlePreview = async () => {
    if (!protocolDef || !client || !selectedProtocolId) return;
    const values = form.getFieldsValue();
    const formData: Record<string, unknown> = {};
    for (const section of protocolDef.sections) {
      for (const field of section.fields) {
        const val = values[field.key];
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          formData[field.key] = val;
        }
      }
    }
    setPreviewOpen(true);
    setPreviewLoading(true);
    try {
      const paragraphs = await previewProtocolDraft(selectedProtocolId, client.id, formData);
      setPreviewParagraphs(paragraphs);
    } catch {
      setPreviewParagraphs([]);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handlePrint = () => {
    if (!previewParagraphs.length) return;
    const html = previewParagraphs.map((p) => {
      const style = [
        p.centered ? 'text-align:center;' : '',
        p.bold ? 'font-weight:bold;' : '',
        'font-size:12pt;', 'margin:0;', 'line-height:1.4;',
        'font-family:"Times New Roman",serif;',
      ].join('');
      return `<p style="${style}">${p.text.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</p>`;
    }).join('');
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
<style>body{margin:1mm;font-family:"Times New Roman",serif;font-size:12pt;}
@media print{body{margin:1mm;}}</style>
</head><body>${html}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  const handleSave = async () => {
    if (!client || !selectedProtocolId || !protocolDef) return;
    try {
      const values = await form.validateFields();
      const protocolForm: Record<string, unknown> = {};
      for (const section of protocolDef.sections) {
        for (const field of section.fields) {
          const val = values[field.key];
          if (val !== undefined && val !== null && val !== '') {
            protocolForm[field.key] = val;
          }
        }
      }
      // Yangi variantlarni bazaga saqlash
      for (const section of protocolDef.sections) {
        for (const field of section.fields) {
          if (field.type !== 'textarea' && protocolForm[field.key]) {
            apiSaveCustomOption(field.key, String(protocolForm[field.key]));
          }
        }
      }

      setSaving(true);
      await createProtocolForm(client.id, selectedProtocolId, protocolForm);
      notification.success({ message: 'Protokol muvaffaqiyatli saqlandi!' });
      onSaved();
    } catch (err: unknown) {
      const e = err as { errorFields?: unknown; response?: { data?: { detail?: string } } };
      if (e?.errorFields) return;
      notification.error({ message: e?.response?.data?.detail || 'Saqlashda xato yuz berdi' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOption = async (fieldKey: string, value: string) => {
    try {
      await apiDeleteCustomOption(fieldKey, value);
      setCustomOptions((prev) => {
        const updated = { ...prev };
        updated[fieldKey] = (updated[fieldKey] || []).filter((v) => v !== value);
        return updated;
      });
    } catch { /* ignore */ }
  };

  const renderField = (field: FormField) => {
    const fullWidth = field.type === 'textarea';
    let input: React.ReactNode;

    if (field.type === 'textarea') {
      input = <TextArea rows={3} placeholder={field.hint ?? ''} />;
    } else {
      const defaults = field.options ?? [];
      const custom = customOptions[field.key] || [];
      const allOptions = [...defaults, ...custom.filter((c: string) => !defaults.includes(c))];
      input = (
        <FieldSelect
          fieldKey={field.key}
          options={allOptions}
          defaults={defaults}
          placeholder={field.hint ?? field.defaultValue ?? ''}
          onDeleteOption={handleDeleteOption}
        />
      );
    }

    const isTextarea = field.type === 'textarea';

    const label = (
      <span style={{ fontSize: 14, whiteSpace: 'normal', lineHeight: '1.4', color: 'var(--gray-600)' }}>
        {field.label}
        {field.unit ? ` (${field.unit})` : ''}
        {field.hint && (
          <Tooltip title={field.hint} placement="topLeft">
            <QuestionCircleOutlined style={{ marginLeft: 4, fontSize: 12, color: 'var(--gray-400)' }} />
          </Tooltip>
        )}
      </span>
    );

    return (
      <div key={field.key} style={isTextarea || fullWidth ? { gridColumn: '1 / -1' } : undefined}>
        <Form.Item
          name={field.key}
          label={label}
          style={{ marginBottom: 10 }}
        >
          {input}
        </Form.Item>
      </div>
    );
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width="100vw"
      style={{ top: 0, paddingBottom: 0, margin: 0, maxWidth: '100vw' }}
      title={null}
      destroyOnClose
      styles={{ body: { padding: 0, height: 'calc(100vh - 108px)', overflowY: 'auto' } }}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '4px 4px' }}>
          <Button icon={<CloseOutlined />} onClick={onClose} style={{ borderRadius: 'var(--radius-sm)' }}>
            Bekor qilish
          </Button>
          <Button
            icon={<EyeOutlined />}
            onClick={handlePreview}
            disabled={!selectedProtocolId}
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            Ko'rish
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={handleSave}
            disabled={!selectedProtocolId}
            style={{
              background: selectedProtocolId ? 'linear-gradient(135deg, #1574b3 0%, #105b8e 100%)' : undefined,
              border: 'none',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm)',
              boxShadow: selectedProtocolId ? '0 2px 8px rgba(21, 116, 179, 0.2)' : undefined,
            }}
          >
            Saqlash
          </Button>
        </div>
      }
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0a2f4a 0%, #105b8e 60%, #0d9488 100%)',
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255,255,255,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <FileTextOutlined style={{ fontSize: 22, color: '#fff' }} />
        </div>
        <div style={{ flex: 1 }}>
          <Text style={{ color: '#fff', fontWeight: 700, fontSize: 16, display: 'block', letterSpacing: '-0.01em' }}>
            Protokol to'ldirish
          </Text>
          {client && (
            <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>
              {client.last_name} {client.first_name}
              {client.birth_date ? ` · ${client.birth_date}` : ''}
            </Text>
          )}
        </div>
        {selectedProtocolId && (
          <Tag
            color="rgba(255,255,255,0.15)"
            style={{ color: '#fff', border: '1px solid rgba(255,255,255,0.15)', fontSize: 11 }}
          >
            {totalFields} ta maydon
          </Tag>
        )}
      </div>

      <div style={{ padding: '16px 24px' }}>
        {/* ── Protocol selector ──────────────────────────────── */}
        <div style={{ marginBottom: 18 }}>
          <Text strong style={{ display: 'block', marginBottom: 8, fontSize: 12, color: 'var(--gray-600)' }}>
            Protokol turini tanlang *
          </Text>
          <Select
            style={{ width: '100%' }}
            placeholder="Protokol tanlang..."
            value={selectedProtocolId}
            onChange={(val) => {
              setSelectedProtocolId(val);
              form.resetFields();
            }}
            options={protocols.map((p) => ({ value: p.protocol_id, label: p.protocol_title }))}
            showSearch
            filterOption={(input, option) =>
              (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
            }
            size="large"
          />
        </div>

        {/* ── Form fields ────────────────────────────────────── */}
        {protocolDef && (
          <Form form={form} layout="vertical" size="small">
            {protocolDef.sections.map((section, si) => (
              <div key={si} className="animate-fade-in" style={{ animationDelay: `${si * 60}ms`, animationFillMode: 'both' }}>
                {si > 0 && <Divider style={{ margin: '12px 0' }} />}
                <Title
                  level={5}
                  style={{
                    fontSize: 12,
                    margin: '0 0 10px',
                    color: 'var(--primary-700)',
                    textTransform: 'uppercase',
                    letterSpacing: 0.8,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      width: 4,
                      height: 16,
                      borderRadius: 2,
                      background: 'linear-gradient(180deg, var(--primary-500), var(--accent-teal))',
                      display: 'inline-block',
                    }}
                  />
                  {section.title}
                </Title>
                {section.fields.length > 3 && !section.title.includes('Заключение') ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0 20px' }}>
                    {section.fields.map(renderField)}
                  </div>
                ) : (
                  <div>
                    {section.fields.map(renderField)}
                  </div>
                )}
              </div>
            ))}
          </Form>
        )}

        {!selectedProtocolId && (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 'var(--radius-xl)',
                background: 'var(--gray-50)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
              }}
            >
              <FileTextOutlined style={{ fontSize: 26, color: 'var(--gray-300)' }} />
            </div>
            <Text style={{ color: 'var(--gray-400)', fontSize: 13, fontWeight: 500 }}>
              Protokol turini tanlang
            </Text>
          </div>
        )}
      </div>

      {/* ── Preview modal (document format) ───────────────── */}
      <Modal
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        width={700}
        style={{ top: 30 }}
        title={null}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setPreviewOpen(false)} style={{ borderRadius: 'var(--radius-sm)' }}>
              Yopish
            </Button>
            <Button
              icon={<PrinterOutlined />}
              onClick={handlePrint}
              disabled={!previewParagraphs.length}
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              Chop etish
            </Button>
          </div>
        }
        styles={{ body: { padding: 0, maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' } }}
      >
        <div style={{
          background: 'linear-gradient(135deg, #0a2f4a 0%, #105b8e 60%, #0d9488 100%)',
          padding: '14px 24px',
        }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>
            {protocols.find((p) => p.protocol_id === selectedProtocolId)?.protocol_title}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>
            {client ? `${client.last_name} ${client.first_name}` : ''}
            {client?.birth_date ? ` · ${client.birth_date}` : ''}
          </div>
        </div>
        <div style={{ padding: '24px 40px', background: '#fff', fontFamily: '"Times New Roman", serif', fontSize: 13 }}>
          {previewLoading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <span>Yuklanmoqda...</span>
            </div>
          ) : previewParagraphs.length > 0 ? (
            previewParagraphs.map((p, i) => (
              <p key={i} style={{
                margin: '2px 0', lineHeight: 1.4,
                fontWeight: p.bold ? 700 : 400,
                textAlign: p.centered ? 'center' : 'left',
                whiteSpace: 'pre-wrap',
              }}>
                {p.text}
              </p>
            ))
          ) : (
            <div style={{ color: '#aaa', textAlign: 'center', padding: 30 }}>Ko'rish mavjud emas</div>
          )}
        </div>
      </Modal>
    </Modal>
  );
};

export default ProtocolFormModal;

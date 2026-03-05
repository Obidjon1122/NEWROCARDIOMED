import React, { useEffect, useMemo } from 'react';
import {
  Modal, Form, Input, InputNumber, AutoComplete, Button,
  Space, Typography, notification, Divider, Row, Col, Select, Tag,
} from 'antd';
import { SaveOutlined, CloseOutlined, FileTextOutlined, EyeOutlined } from '@ant-design/icons';
import type { Client, ProtocolDashboardItem } from '../types';
import { createProtocolForm } from '../api/protocols';
import { getProtocolForm, type FormField } from '../data/protocolForms';

const { Text, Title } = Typography;
const { TextArea } = Input;

interface Props {
  open: boolean;
  client: Client | null;
  protocols: ProtocolDashboardItem[];
  onClose: () => void;
  onSaved: () => void;
}

const ProtocolFormModal: React.FC<Props> = ({ open, client, protocols, onClose, onSaved }) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = React.useState(false);
  const [selectedProtocolId, setSelectedProtocolId] = React.useState<number | null>(null);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewData, setPreviewData] = React.useState<Record<string, string>>({});

  const protocolDef = useMemo(
    () => (selectedProtocolId ? getProtocolForm(selectedProtocolId) : null),
    [selectedProtocolId],
  );

  useEffect(() => {
    if (open) {
      form.resetFields();
      setSelectedProtocolId(null);
    }
  }, [open, form]);

  useEffect(() => {
    if (!protocolDef) return;
    const defaults: Record<string, unknown> = {};
    for (const section of protocolDef.sections) {
      for (const field of section.fields) {
        if (field.defaultValue !== undefined) {
          defaults[field.key] = field.defaultValue;
        }
      }
    }
    form.setFieldsValue(defaults);
  }, [protocolDef, form]);

  const handlePreview = () => {
    if (!protocolDef) return;
    const values = form.getFieldsValue();
    const data: Record<string, string> = {};
    for (const section of protocolDef.sections) {
      for (const field of section.fields) {
        const val = values[field.key];
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          data[field.key] = String(val);
        }
      }
    }
    setPreviewData(data);
    setPreviewOpen(true);
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

  const renderField = (field: FormField) => {
    const span = (field.span ?? 1) * 6; // 4 columns = 24, so 1col=6, 2col=12, 3col=18, 4col=24

    let input: React.ReactNode;

    if (field.type === 'number') {
      input = (
        <InputNumber
          style={{ width: '100%' }}
          placeholder={field.hint ?? ''}
          addonAfter={field.unit}
          step={0.1}
        />
      );
    } else if (field.type === 'combobox') {
      input = (
        <AutoComplete
          options={(field.options ?? []).map((o) => ({ value: o }))}
          placeholder={field.hint ?? ''}
          filterOption={(inputValue, option) =>
            (option?.value as string).toLowerCase().includes(inputValue.toLowerCase())
          }
        >
          <Input />
        </AutoComplete>
      );
    } else if (field.type === 'textarea') {
      input = <TextArea rows={3} placeholder={field.hint ?? ''} />;
    } else {
      input = <Input placeholder={field.hint ?? ''} addonAfter={field.unit} />;
    }

    return (
      <Col key={field.key} span={span}>
        <Form.Item
          name={field.key}
          label={<span style={{ fontSize: 11, whiteSpace: 'normal', lineHeight: '1.3' }}>{field.label}{field.unit && field.type !== 'number' ? ` (${field.unit})` : ''}</span>}
          style={{ marginBottom: 8 }}
        >
          {input}
        </Form.Item>
      </Col>
    );
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={860}
      style={{ top: 30 }}
      title={null}
      destroyOnClose
      styles={{ body: { padding: 0, maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' } }}
      footer={
        <Space>
          <Button icon={<CloseOutlined />} onClick={onClose}>Bekor qilish</Button>
          <Button
            icon={<EyeOutlined />}
            onClick={handlePreview}
            disabled={!selectedProtocolId}
          >
            Ko'rish
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={handleSave}
            disabled={!selectedProtocolId}
            style={{ background: '#1a5276' }}
          >
            Saqlash
          </Button>
        </Space>
      }
    >
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a5276 0%, #2980b9 100%)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <FileTextOutlined style={{ fontSize: 28, color: '#fff' }} />
        <div>
          <Text style={{ color: '#fff', fontWeight: 700, fontSize: 15, display: 'block' }}>
            Protokol to'ldirish
          </Text>
          {client && (
            <Text style={{ color: '#cce4f7', fontSize: 12 }}>
              {client.last_name} {client.first_name}
              {client.birth_date ? ` · ${client.birth_date}` : ''}
            </Text>
          )}
        </div>
      </div>

      <div style={{ padding: '14px 20px' }}>
        {/* Protocol selector */}
        <div style={{ marginBottom: 16 }}>
          <Text strong style={{ display: 'block', marginBottom: 6, fontSize: 12 }}>Protokol turini tanlang *</Text>
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
          />
        </div>

        {/* Form fields */}
        {protocolDef && (
          <Form form={form} layout="vertical" size="small">
            {protocolDef.sections.map((section, si) => (
              <div key={si}>
                {si > 0 && <Divider style={{ margin: '8px 0' }} />}
                <Title level={5} style={{ fontSize: 12, margin: '0 0 8px', color: '#1a5276', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {section.title}
                </Title>
                <Row gutter={[10, 0]}>
                  {section.fields.map(renderField)}
                </Row>
              </div>
            ))}
          </Form>
        )}

        {!selectedProtocolId && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#bbb' }}>
            Protokol turini tanlang
          </div>
        )}
      </div>
      {/* Preview modal */}
      <Modal
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        width={720}
        style={{ top: 40 }}
        title={null}
        footer={<Button onClick={() => setPreviewOpen(false)}>Yopish</Button>}
        styles={{ body: { padding: 0, maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' } }}
      >
        <div style={{ background: 'linear-gradient(135deg, #1a5276 0%, #2980b9 100%)', padding: '14px 20px' }}>
          <Text style={{ color: '#fff', fontWeight: 700, fontSize: 15, display: 'block' }}>
            {protocols.find((p) => p.protocol_id === selectedProtocolId)?.protocol_title}
          </Text>
          <Text style={{ color: '#cce4f7', fontSize: 12 }}>
            {client ? `${client.last_name} ${client.first_name}` : ''}
            {client?.birth_date ? ` · ${client.birth_date}` : ''}
          </Text>
        </div>
        <div style={{ padding: '16px 20px' }}>
          {client && (
            <div style={{ background: '#f0f7ff', border: '1px solid #d0e9ff', borderRadius: 6, padding: '10px 14px', marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <Text type="secondary" style={{ fontSize: 11 }}>Пациент</Text>
                <Text strong style={{ display: 'block', fontSize: 13 }}>{client.last_name} {client.first_name}</Text>
              </div>
              {client.birth_date && (
                <div>
                  <Text type="secondary" style={{ fontSize: 11 }}>Дата рождения</Text>
                  <Text strong style={{ display: 'block', fontSize: 13 }}>{client.birth_date}</Text>
                </div>
              )}
              {client.gender && (
                <div>
                  <Text type="secondary" style={{ fontSize: 11 }}>Пол</Text>
                  <div>
                    <Tag color={client.gender === 'male' ? 'blue' : 'pink'} style={{ fontSize: 11 }}>
                      {client.gender === 'male' ? 'Мужской' : 'Женский'}
                    </Tag>
                  </div>
                </div>
              )}
            </div>
          )}
          {protocolDef?.sections.map((section, si) => {
            const sectionFields = section.fields.filter(
              (f) => previewData[f.key] !== undefined && String(previewData[f.key]).trim() !== '',
            );
            if (sectionFields.length === 0) return null;
            const isConclusion = section.title === 'Заключение';
            return (
              <div key={si} style={{ marginBottom: 12 }}>
                {si > 0 && <Divider style={{ margin: '10px 0 8px' }} />}
                <Title level={5} style={{ fontSize: 12, margin: '0 0 8px', color: '#1a5276', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {section.title}
                </Title>
                {isConclusion ? (
                  <div>
                    {sectionFields.map((field) => (
                      <div key={field.key} style={{ marginBottom: 8 }}>
                        <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>{field.label}</Text>
                        <div style={{ background: '#fffbf0', border: '1px solid #ffe7a0', borderRadius: 4, padding: '8px 12px', fontSize: 13, whiteSpace: 'pre-wrap' }}>
                          {previewData[field.key]}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <tbody>
                      {sectionFields.map((field, fi) => (
                        <tr key={fi} style={{ background: fi % 2 === 0 ? '#f8fbff' : '#fff' }}>
                          <td style={{ padding: '5px 10px', width: '50%', border: '1px solid #e8f0fe', color: '#555', fontWeight: 500 }}>
                            {field.label}{field.unit ? ` (${field.unit})` : ''}
                          </td>
                          <td style={{
                            padding: '5px 10px',
                            border: '1px solid #e8f0fe',
                            fontWeight: previewData[field.key] !== 'в норме' && previewData[field.key] !== 'без особенностей' ? 600 : 400,
                            color: previewData[field.key] !== 'в норме' && previewData[field.key] !== 'без особенностей' ? '#c0392b' : '#1a1a1a',
                          }}>
                            {previewData[field.key]}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            );
          })}
        </div>
      </Modal>
    </Modal>
  );
};

export default ProtocolFormModal;

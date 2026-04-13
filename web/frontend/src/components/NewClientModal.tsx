import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal, Form, Input, Select, DatePicker,
  Button, Typography, notification, Row, Col,
  Divider, InputNumber, AutoComplete, Tooltip,
} from 'antd';
import { UserAddOutlined, SaveOutlined, CloseOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Client, ProtocolDashboardItem } from '../types';
import { createClient } from '../api/clients';
import { createProtocolForm } from '../api/protocols';
import { getProtocolForm, type FormField } from '../data/protocolForms';
import { authStore } from '../store/auth';

const { Text } = Typography;
const { TextArea } = Input;

const REGIONS = [
  'Toshkent sh.', 'Toshkent vil.', 'Andijon', "Farg'ona", 'Namangan',
  'Samarqand', 'Buxoro', 'Navoiy', 'Qashqadaryo', 'Surxondaryo',
  'Jizzax', 'Sirdaryo', 'Xorazm', "Qoraqalpog'iston",
];

interface Props {
  open: boolean;
  protocols: ProtocolDashboardItem[];
  onClose: () => void;
  onSaved: (client: Client) => void;
}

const NewClientModal: React.FC<Props> = ({ open, protocols, onClose, onSaved }) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [selectedProtocolId, setSelectedProtocolId] = useState<number | null>(null);
  const user = authStore.getUser();

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

  // Set default values for protocol fields when protocol changes
  useEffect(() => {
    if (!protocolDef) return;
    const defaults: Record<string, unknown> = {};
    for (const section of protocolDef.sections)
      for (const field of section.fields)
        defaults[field.key] = field.defaultValue !== undefined ? field.defaultValue : undefined;
    form.setFieldsValue(defaults);
  }, [protocolDef, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const clientData = {
        first_name: values.first_name,
        last_name: values.last_name,
        patronymic: values.patronymic || '',
        gender: values.gender || '',
        phone: values.phone || '',
        birth_date: values.birth_date ? dayjs(values.birth_date).format('YYYY-MM-DD') : '',
        region: values.region || '',
      };
      setSaving(true);
      const savedClient = await createClient(clientData);

      // If protocol selected, also save protocol form
      if (selectedProtocolId && protocolDef) {
        const protocolForm: Record<string, unknown> = {};
        for (const section of protocolDef.sections) {
          for (const field of section.fields) {
            const val = values[field.key];
            if (val !== undefined && val !== null && val !== '') {
              protocolForm[field.key] = val;
            }
          }
        }
        await createProtocolForm(savedClient.id, selectedProtocolId, protocolForm);
        notification.success({ message: "Bemor va protokol muvaffaqiyatli saqlandi!" });
      } else {
        notification.success({ message: "Bemor muvaffaqiyatli qo'shildi!" });
      }

      onSaved(savedClient);
    } catch (err: unknown) {
      const e = err as { errorFields?: unknown; response?: { data?: { detail?: string } } };
      if (e?.errorFields) return;
      notification.error({ message: e?.response?.data?.detail || 'Saqlashda xato yuz berdi' });
    } finally {
      setSaving(false);
    }
  };

  const doctorName = user
    ? `${user.last_name} ${user.first_name} ${user.patronymic_name || ''}`.trim()
    : '';

  const renderProtocolField = (field: FormField) => {
    const isTextarea = field.type === 'textarea';
    let input: React.ReactNode;

    if (field.type === 'number') {
      input = (
        <InputNumber style={{ width: '100%' }} placeholder={field.hint ?? ''} addonAfter={field.unit} step={0.1} />
      );
    } else if (field.type === 'combobox') {
      input = (
        <AutoComplete
          options={(field.options ?? []).map((o) => ({ value: o }))}
          placeholder={field.hint ?? field.defaultValue ?? ''}
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

    const label = (
      <span style={{ fontSize: 14, whiteSpace: 'normal', lineHeight: '1.4', color: 'var(--gray-600)' }}>
        {field.label}
        {field.unit && field.type !== 'number' ? ` (${field.unit})` : ''}
        {field.hint && (
          <Tooltip title={field.hint} placement="topLeft">
            <QuestionCircleOutlined style={{ marginLeft: 4, fontSize: 12, color: 'var(--gray-400)' }} />
          </Tooltip>
        )}
      </span>
    );

    return (
      <div key={field.key} style={isTextarea ? { gridColumn: '1 / -1' } : undefined}>
        <Form.Item name={field.key} label={label} style={{ marginBottom: 12 }}>
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
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '4px 8px' }}>
          <Button icon={<CloseOutlined />} onClick={onClose} style={{ borderRadius: 'var(--radius-sm)' }}>
            Bekor qilish
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={handleSave}
            style={{
              background: 'linear-gradient(135deg, #1574b3 0%, #105b8e 100%)',
              border: 'none', fontWeight: 600,
              borderRadius: 'var(--radius-sm)',
              boxShadow: '0 2px 8px rgba(21, 116, 179, 0.2)',
            }}
          >
            {selectedProtocolId ? "Bemor + Protokol saqlash" : "Saqlash"}
          </Button>
        </div>
      }
      styles={{ body: { padding: 0, height: 'calc(100vh - 108px)', overflowY: 'auto' } }}
    >
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0a2f4a 0%, #105b8e 60%, #0d9488 100%)',
        padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 'var(--radius-md)',
          background: 'rgba(255,255,255,0.12)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <UserAddOutlined style={{ fontSize: 20, color: '#fff' }} />
        </div>
        <div>
          <Text style={{ color: '#fff', fontWeight: 700, fontSize: 16, display: 'block', letterSpacing: '-0.01em' }}>
            Yangi bemor qo'shish
          </Text>
          {doctorName && (
            <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>
              Shifokor: {doctorName}
            </Text>
          )}
        </div>
      </div>

      {/* Form */}
      <div style={{ padding: '20px 32px' }}>
        <Form form={form} layout="vertical" size="large" requiredMark={false}>

          {/* Client fields — compact top strip */}
          <div style={{
            background: 'var(--gray-50)', border: '1px solid var(--gray-200)',
            borderRadius: 'var(--radius-md)', padding: '16px 20px', marginBottom: 20,
          }}>
            <Text style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary-700)',
              textTransform: 'uppercase', letterSpacing: 0.6, display: 'block', marginBottom: 12 }}>
              Bemor ma'lumotlari
            </Text>
            <Row gutter={16}>
              <Col span={4}>
                <Form.Item
                  name="last_name"
                  label={<span style={{ fontWeight: 500, fontSize: 12, color: 'var(--gray-600)' }}>Familiya</span>}
                  style={{ marginBottom: 0 }}
                >
                  <Input placeholder="Karimov" />
                </Form.Item>
              </Col>
              <Col span={3}>
                <Form.Item
                  name="first_name"
                  label={<span style={{ fontWeight: 500, fontSize: 12, color: 'var(--gray-600)' }}>Ism</span>}
                  style={{ marginBottom: 0 }}
                >
                  <Input placeholder="Alisher" />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  name="patronymic"
                  label={<span style={{ fontWeight: 500, fontSize: 12, color: 'var(--gray-600)' }}>Otasining ismi</span>}
                  style={{ marginBottom: 0 }}
                >
                  <Input placeholder="Nodirovich" />
                </Form.Item>
              </Col>
              <Col span={3}>
                <Form.Item
                  name="gender"
                  label={<span style={{ fontWeight: 500, fontSize: 12, color: 'var(--gray-600)' }}>Jins</span>}
                  style={{ marginBottom: 0 }}
                >
                  <Select placeholder="Tanlang" allowClear options={[
                    { value: 'male', label: 'Erkak' },
                    { value: 'female', label: 'Ayol' },
                  ]} />
                </Form.Item>
              </Col>
              <Col span={3}>
                <Form.Item
                  name="phone"
                  label={<span style={{ fontWeight: 500, fontSize: 12, color: 'var(--gray-600)' }}>Telefon</span>}
                  style={{ marginBottom: 0 }}
                >
                  <Input placeholder="+998..." />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  name="birth_date"
                  label={<span style={{ fontWeight: 500, fontSize: 12, color: 'var(--gray-600)' }}>Tug'ilgan sana</span>}
                  style={{ marginBottom: 0 }}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    format={["DD.MM.YYYY", "DD-MM-YYYY", "D.M.YYYY", "D-M-YYYY"]}
                    placeholder="KK.OO.YYYY"
                  />
                </Form.Item>
              </Col>
              <Col span={3}>
                <Form.Item
                  name="region"
                  label={<span style={{ fontWeight: 500, fontSize: 12, color: 'var(--gray-600)' }}>Viloyat</span>}
                  style={{ marginBottom: 0 }}
                >
                  <Select placeholder="Tanlang" showSearch allowClear
                    options={REGIONS.map((r) => ({ value: r, label: r }))} />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Protocol selector */}
          <div style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary-700)',
              textTransform: 'uppercase', letterSpacing: 0.6, display: 'block', marginBottom: 8 }}>
              Protokol qo'shish (ixtiyoriy)
            </Text>
            <Select
              style={{ width: '100%', maxWidth: 480 }}
              placeholder="Protokol tanlang..."
              allowClear
              showSearch
              value={selectedProtocolId}
              onChange={(val) => {
                setSelectedProtocolId(val ?? null);
                if (protocolDef) {
                  const clear: Record<string, undefined> = {};
                  for (const s of protocolDef.sections)
                    for (const f of s.fields)
                      clear[f.key] = undefined;
                  form.setFieldsValue(clear);
                }
              }}
              filterOption={(input, option) =>
                (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
              }
              options={protocols.map((p) => ({ value: p.protocol_id, label: p.protocol_title }))}
            />
          </div>

          {/* Protocol form fields — 3-column grid */}
          {protocolDef && protocolDef.sections.map((section, si) => (
            <div key={si} style={{ marginBottom: 8 }}>
              {si > 0 && <Divider style={{ margin: '8px 0' }} />}
              <Text style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary-700)',
                textTransform: 'uppercase', letterSpacing: 0.6, display: 'block', marginBottom: 6 }}>
                {section.title}
              </Text>
              {section.fields.length > 3 && !section.title.includes('Заключение') ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0 20px' }}>
                  {section.fields.map(renderProtocolField)}
                </div>
              ) : (
                <div style={{ maxWidth: 600 }}>{section.fields.map(renderProtocolField)}</div>
              )}
            </div>
          ))}
        </Form>
      </div>
    </Modal>
  );
};

export default NewClientModal;

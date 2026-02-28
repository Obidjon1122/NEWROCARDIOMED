import React, { useState, useEffect } from 'react';
import {
  Modal, Form, Input, Select, DatePicker,
  Space, Button, Typography, notification, Row, Col,
} from 'antd';
import {
  UserAddOutlined, EyeOutlined, SaveOutlined, CloseOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Client, ProtocolDashboardItem } from '../types';
import { getProtocolConfig } from '../data/protocolFields';
import { createClient } from '../api/clients';
import { getDoctorProtocols, createProtocolForm } from '../api/protocols';
import { authStore } from '../store/auth';
import ProtocolFormFields from './ProtocolFormFields';

const { Text } = Typography;

const REGIONS = [
  'Toshkent sh.', 'Toshkent vil.', 'Andijon', "Farg'ona", 'Namangan',
  'Samarqand', 'Buxoro', 'Navoiy', 'Qashqadaryo', 'Surxondaryo',
  'Jizzax', 'Sirdaryo', 'Xorazm', "Qoraqalpog'iston",
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: (client: Client) => void;
  onPreview: (protocolId: number, formData: Record<string, string>, tempClient: Client) => void;
}

const NewClientModal: React.FC<Props> = ({ open, onClose, onSaved, onPreview }) => {
  const [clientForm] = Form.useForm();
  const [protocolForm] = Form.useForm();
  const [protocols, setProtocols] = useState<ProtocolDashboardItem[]>([]);
  const [selectedProtocol, setSelectedProtocol] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const user = authStore.getUser();

  useEffect(() => {
    getDoctorProtocols().then(setProtocols).catch(console.error);
  }, []);

  useEffect(() => {
    if (open) {
      clientForm.resetFields();
      protocolForm.resetFields();
      setSelectedProtocol(null);
    }
  }, [open, clientForm, protocolForm]);

  const config = selectedProtocol ? getProtocolConfig(selectedProtocol) : null;

  const handleProtocolChange = (val: number | undefined) => {
    setSelectedProtocol(val ?? null);
    protocolForm.resetFields();
  };

  const buildTempClient = (): Client | null => {
    const v = clientForm.getFieldsValue();
    if (!v.first_name || !v.last_name) return null;
    return {
      id: 0,
      first_name: v.first_name || '',
      last_name: v.last_name || '',
      gender: v.gender || 'male',
      phone: v.phone || '',
      birth_date: v.birth_date ? dayjs(v.birth_date).format('YYYY-MM-DD') : '',
      region: v.region || '',
    };
  };

  const buildProtocolData = (): Record<string, string> => {
    const values = protocolForm.getFieldsValue();
    const filtered: Record<string, string> = {};
    for (const [k, v] of Object.entries(values)) {
      if (v !== undefined && v !== null && String(v).trim() !== '') {
        filtered[k] = String(v);
      }
    }
    return filtered;
  };

  const handlePreview = () => {
    if (!selectedProtocol) {
      notification.warning({ message: 'Avval protokol turini tanlang' });
      return;
    }
    const tempClient = buildTempClient();
    if (!tempClient) {
      notification.warning({ message: 'Avval bemor ism-familiyasini kiriting' });
      return;
    }
    onPreview(selectedProtocol, buildProtocolData(), tempClient);
  };

  const handleSave = async () => {
    try {
      const clientValues = await clientForm.validateFields();
      const clientData = {
        first_name: clientValues.first_name,
        last_name: clientValues.last_name,
        gender: clientValues.gender,
        phone: clientValues.phone,
        birth_date: clientValues.birth_date
          ? dayjs(clientValues.birth_date).format('YYYY-MM-DD')
          : '',
        region: clientValues.region,
      };

      setSaving(true);
      const savedClient = await createClient(clientData);

      if (selectedProtocol) {
        const protocolData = buildProtocolData();
        await createProtocolForm(savedClient.id, selectedProtocol, protocolData);
        notification.success({ message: 'Bemor va protokol saqlandi!' });
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

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={Math.min(window.innerWidth - 24, 980)}
      style={{ top: window.innerWidth < 640 ? 0 : 10 }}
      title={null}
      footer={
        <Space>
          <Button icon={<CloseOutlined />} onClick={onClose}>
            Bekor qilish
          </Button>
          {selectedProtocol && (
            <Button icon={<EyeOutlined />} onClick={handlePreview}>
              Ko'rish
            </Button>
          )}
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={handleSave}
            style={{ background: '#1a5276' }}
          >
            Saqlash
          </Button>
        </Space>
      }
      styles={{
        body: { maxHeight: 'calc(100vh - 160px)', overflowY: 'auto', padding: 0 },
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1a5276 0%, #2980b9 100%)',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <UserAddOutlined style={{ fontSize: 28, color: '#fff' }} />
        <div>
          <Text style={{ color: '#fff', fontWeight: 700, fontSize: 15, display: 'block' }}>
            Yangi bemor qo'shish
          </Text>
          {doctorName && (
            <Text style={{ color: '#cce4f7', fontSize: 12 }}>Врач: {doctorName}</Text>
          )}
        </div>
      </div>

      {/* ── Client info form ── */}
      <div style={{ padding: '16px 20px 8px', borderBottom: '1px solid #e8f4fd', background: '#f8fbff' }}>
        <Text strong style={{ color: '#1a5276', fontSize: 13, display: 'block', marginBottom: 10 }}>
          Bemor ma'lumotlari
        </Text>
        <Form form={clientForm} layout="vertical" size="small">
          <Row gutter={14}>
            <Col span={12}>
              <Form.Item
                name="last_name"
                label={<span style={{ fontSize: 11 }}>Familiya</span>}
                rules={[{ required: true, message: 'Familiya kiriting' }]}
                style={{ marginBottom: 8 }}
              >
                <Input placeholder="Karimov" style={{ fontSize: 12 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="first_name"
                label={<span style={{ fontSize: 11 }}>Ism</span>}
                rules={[{ required: true, message: 'Ism kiriting' }]}
                style={{ marginBottom: 8 }}
              >
                <Input placeholder="Alisher" style={{ fontSize: 12 }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="gender"
                label={<span style={{ fontSize: 11 }}>Jins</span>}
                rules={[{ required: true, message: 'Jins tanlang' }]}
                style={{ marginBottom: 8 }}
              >
                <Select
                  placeholder="Tanlang"
                  style={{ fontSize: 12 }}
                  options={[
                    { value: 'male', label: 'Erkak' },
                    { value: 'female', label: 'Ayol' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="phone"
                label={<span style={{ fontSize: 11 }}>Telefon</span>}
                rules={[{ required: true, message: 'Telefon kiriting' }]}
                style={{ marginBottom: 8 }}
              >
                <Input placeholder="+998901234567" style={{ fontSize: 12 }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="birth_date"
                label={<span style={{ fontSize: 11 }}>Tug'ilgan sana</span>}
                rules={[{ required: true, message: 'Sanani kiriting' }]}
                style={{ marginBottom: 8 }}
              >
                <DatePicker style={{ width: '100%', fontSize: 12 }} format="YYYY-MM-DD" placeholder="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="region"
                label={<span style={{ fontSize: 11 }}>Viloyat</span>}
                rules={[{ required: true, message: 'Viloyat tanlang' }]}
                style={{ marginBottom: 4 }}
              >
                <Select
                  placeholder="Tanlang"
                  showSearch
                  style={{ fontSize: 12 }}
                  options={REGIONS.map((r) => ({ value: r, label: r }))}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>

      {/* ── Protocol selector ── */}
      <div
        style={{
          padding: '12px 20px',
          borderBottom: selectedProtocol ? '1px solid #e8f4fd' : undefined,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <Text strong style={{ color: '#1a5276', whiteSpace: 'nowrap' }}>
          Protokol turi:
        </Text>
        <Select
          placeholder="Ixtiyoriy — protokol tanlang..."
          allowClear
          style={{ flex: 1, minWidth: 280, maxWidth: 420 }}
          onChange={handleProtocolChange}
          value={selectedProtocol ?? undefined}
          options={protocols.map((p) => ({ value: p.protocol_id, label: p.protocol_title }))}
        />
        {!selectedProtocol && (
          <Text type="secondary" style={{ fontSize: 11 }}>
            (ixtiyoriy — keyinroq ham to'ldirsa bo'ladi)
          </Text>
        )}
      </div>

      {/* ── Protocol form fields (with voice input) ── */}
      {config && (
        <div style={{ padding: '8px 20px 20px' }}>
          <ProtocolFormFields form={protocolForm} config={config} />
        </div>
      )}
    </Modal>
  );
};

export default NewClientModal;

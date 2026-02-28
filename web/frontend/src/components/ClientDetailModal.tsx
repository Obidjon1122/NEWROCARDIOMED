import React, { useState, useEffect } from 'react';
import {
  Modal, Select, Form, Typography,
  Space, Button, Avatar, Tag, notification,
} from 'antd';
import {
  UserOutlined, EyeOutlined, SaveOutlined,
  EditOutlined, CloseOutlined,
} from '@ant-design/icons';
import type { Client, ProtocolDashboardItem } from '../types';
import { getProtocolConfig } from '../data/protocolFields';
import { getDoctorProtocols, createProtocolForm } from '../api/protocols';
import ProtocolFormFields from './ProtocolFormFields';

const { Text, Title } = Typography;

interface Props {
  open: boolean;
  client: Client;
  onClose: () => void;
  onEditClient: () => void;
  onSaved: () => void;
  onPreview: (protocolId: number, formData: Record<string, string>) => void;
}

const ClientDetailModal: React.FC<Props> = ({
  open, client, onClose, onEditClient, onSaved, onPreview,
}) => {
  const [form] = Form.useForm();
  const [protocols, setProtocols] = useState<ProtocolDashboardItem[]>([]);
  const [selectedProtocol, setSelectedProtocol] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getDoctorProtocols().then(setProtocols).catch(console.error);
  }, []);

  useEffect(() => {
    if (open) {
      form.resetFields();
      setSelectedProtocol(null);
    }
  }, [open, form]);

  const config = selectedProtocol ? getProtocolConfig(selectedProtocol) : null;

  const handleProtocolChange = (val: number | undefined) => {
    setSelectedProtocol(val ?? null);
    form.resetFields();
  };

  const buildFormData = (): Record<string, string> => {
    const values = form.getFieldsValue();
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
    onPreview(selectedProtocol, buildFormData());
  };

  const handleSave = async () => {
    if (!selectedProtocol) {
      notification.warning({ message: 'Protokol tanlanmagan' });
      return;
    }
    try {
      await form.validateFields();
      const filtered = buildFormData();
      setSaving(true);
      await createProtocolForm(client.id, selectedProtocol, filtered);
      notification.success({ message: 'Protokol muvaffaqiyatli saqlandi!' });
      form.resetFields();
      setSelectedProtocol(null);
      onSaved();
    } catch (err: unknown) {
      const e = err as { errorFields?: unknown; response?: { data?: { detail?: string } } };
      if (e?.errorFields) return;
      notification.error({ message: e?.response?.data?.detail || 'Saqlashda xato yuz berdi' });
    } finally {
      setSaving(false);
    }
  };

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
            Yopish
          </Button>
          {selectedProtocol && (
            <>
              <Button icon={<EyeOutlined />} onClick={handlePreview}>
                Ko'rish
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={saving}
                onClick={handleSave}
                style={{ background: '#1a5276' }}
              >
                Saqlash
              </Button>
            </>
          )}
        </Space>
      }
      styles={{
        body: { maxHeight: 'calc(100vh - 160px)', overflowY: 'auto', padding: 0 },
      }}
    >
      {/* ── Client info header ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1a5276 0%, #2980b9 100%)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Space size={14}>
          <Avatar
            icon={<UserOutlined />}
            size={52}
            style={{
              background: client.gender === 'male' ? '#1677ff' : '#eb2f96',
              border: '2px solid rgba(255,255,255,0.4)',
            }}
          />
          <div>
            <Title level={5} style={{ margin: 0, color: '#fff' }}>
              {client.last_name} {client.first_name}
            </Title>
            <Space size={8} style={{ marginTop: 4 }}>
              <Tag color={client.gender === 'male' ? 'blue' : 'pink'} style={{ borderColor: 'transparent' }}>
                {client.gender === 'male' ? 'Erkak' : 'Ayol'}
              </Tag>
              <Text style={{ color: '#cce4f7', fontSize: 12 }}>📞 {client.phone}</Text>
              <Text style={{ color: '#cce4f7', fontSize: 12 }}>🎂 {client.birth_date}</Text>
              <Text style={{ color: '#cce4f7', fontSize: 12 }}>📍 {client.region}</Text>
            </Space>
          </div>
        </Space>
        <Button
          icon={<EditOutlined />}
          size="small"
          onClick={onEditClient}
          style={{ borderColor: 'rgba(255,255,255,0.5)', color: '#fff', background: 'rgba(255,255,255,0.15)' }}
        >
          Tahrirlash
        </Button>
      </div>

      {/* ── Protocol selector ── */}
      <div
        style={{
          padding: '14px 20px',
          background: '#f8fbff',
          borderBottom: '1px solid #e8f4fd',
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
          placeholder="Protokol turini tanlang..."
          allowClear
          style={{ flex: 1, maxWidth: 400 }}
          onChange={handleProtocolChange}
          value={selectedProtocol ?? undefined}
          options={protocols.map((p) => ({ value: p.protocol_id, label: p.protocol_title }))}
        />
        {!selectedProtocol && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            Tanlagandan keyin forma avtomatik ko'rinadi
          </Text>
        )}
      </div>

      {/* ── Protocol form fields (with voice input) ── */}
      {config ? (
        <div style={{ padding: '8px 20px 20px' }}>
          <ProtocolFormFields form={form} config={config} />
        </div>
      ) : (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#aaa', fontSize: 14 }}>
          Yuqoridan protokol turini tanlang — forma avtomatik ko'rinadi
        </div>
      )}
    </Modal>
  );
};

export default ClientDetailModal;

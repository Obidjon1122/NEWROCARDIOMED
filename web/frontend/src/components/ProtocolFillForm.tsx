import React, { useEffect, useState } from 'react';
import {
  Modal, Button, Space, Alert,
  Input, Form, Typography, Divider, notification,
} from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import type { Client } from '../types';
import type { ProtocolField } from '../data/protocolFields';
import { createProtocolForm } from '../api/protocols';
import { authStore } from '../store/auth';
import { getProtocolConfig, getFieldsBySection } from '../data/protocolFields';

const { Text } = Typography;
const { TextArea } = Input;

interface Props {
  open: boolean;
  protocolId: number;
  client: Client;
  onClose: () => void;
  onSaved: () => void;
}

const ProtocolFillForm: React.FC<Props> = ({ open, protocolId, client, onClose, onSaved }) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const user = authStore.getUser();

  const config = getProtocolConfig(protocolId);
  const sectionMap = config ? getFieldsBySection(config.fields) : new Map();

  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, protocolId]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const filtered: Record<string, string> = {};
      for (const [k, v] of Object.entries(values)) {
        if (v !== undefined && v !== null && String(v).trim() !== '') {
          filtered[k] = String(v);
        }
      }
      setSaving(true);
      await createProtocolForm(client.id, protocolId, filtered);
      notification.success({ message: 'Protokol muvaffaqiyatli saqlandi!' });
      onSaved();
    } catch (err: any) {
      if (err?.errorFields) return;
      notification.error({ message: err?.response?.data?.detail || 'Saqlashda xato yuz berdi' });
    } finally {
      setSaving(false);
    }
  };

  if (!config) {
    return (
      <Modal open={open} onCancel={onClose} footer={null} title="Xato">
        <Alert message={`Protokol konfiguratsiyasi topilmadi (ID: ${protocolId})`} type="error" />
      </Modal>
    );
  }

  const today = new Date();
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
  ];
  const dateStr = `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()} г.`;
  const doctorName = user
    ? `${user.last_name} ${user.first_name} ${user.patronymic_name || ''}`.trim()
    : '';

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={920}
      style={{ top: 10 }}
      styles={{
        body: {
          maxHeight: 'calc(100vh - 200px)',
          overflowY: 'auto',
          padding: '12px 20px',
        },
      }}
      footer={
        <Space>
          <Button icon={<CloseOutlined />} onClick={onClose}>
            Bekor qilish
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
        </Space>
      }
      title={
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontSize: 15, color: '#1a5276' }}>
            {config.title} — protokolni to'ldirish
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {client.last_name} {client.first_name} · {client.birth_date} · {dateStr}
          </Text>
          {doctorName && (
            <Text type="secondary" style={{ fontSize: 11 }}>
              Врач: {doctorName}
            </Text>
          )}
        </Space>
      }
    >
      <Form form={form} layout="vertical" size="small">
        {Array.from(sectionMap.entries()).map(([sectionName, fields]) => (
          <div key={sectionName}>
            <Divider
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#1a5276',
                borderColor: '#AED6F1',
                margin: '10px 0 6px',
              }}
            >
              {sectionName}
            </Divider>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
                gap: '2px 14px',
              }}
            >
              {fields.map((field: ProtocolField) => (
                <Form.Item
                  key={field.name}
                  name={field.name}
                  label={
                    <span style={{ fontSize: 11, color: '#444' }}>
                      {field.label}
                      {field.unit && (
                        <span style={{ color: '#aaa', marginLeft: 3 }}>({field.unit})</span>
                      )}
                    </span>
                  }
                  style={{ marginBottom: 5 }}
                >
                  {field.type === 'textarea' ? (
                    <TextArea
                      rows={3}
                      placeholder={field.label}
                      style={{ fontSize: 12 }}
                    />
                  ) : (
                    <Input
                      placeholder={field.label}
                      style={{ fontSize: 12 }}
                    />
                  )}
                </Form.Item>
              ))}
            </div>
          </div>
        ))}
      </Form>
    </Modal>
  );
};

export default ProtocolFillForm;

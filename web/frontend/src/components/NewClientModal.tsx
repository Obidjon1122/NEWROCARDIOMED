import React, { useState, useEffect } from 'react';
import {
  Modal, Form, Input, Select, DatePicker,
  Space, Button, Typography, notification, Row, Col,
} from 'antd';
import { UserAddOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Client } from '../types';
import { createClient } from '../api/clients';
import { authStore } from '../store/auth';

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
}

const NewClientModal: React.FC<Props> = ({ open, onClose, onSaved }) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const user = authStore.getUser();

  useEffect(() => {
    if (open) form.resetFields();
  }, [open, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const clientData = {
        first_name: values.first_name,
        last_name: values.last_name,
        gender: values.gender || '',
        phone: values.phone || '',
        birth_date: values.birth_date ? dayjs(values.birth_date).format('YYYY-MM-DD') : '',
        region: values.region || '',
      };
      setSaving(true);
      const savedClient = await createClient(clientData);
      notification.success({ message: "Bemor muvaffaqiyatli qo'shildi!" });
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
      width={560}
      style={{ top: 60 }}
      title={null}
      footer={
        <Space>
          <Button icon={<CloseOutlined />} onClick={onClose}>Bekor qilish</Button>
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
      styles={{ body: { padding: 0 } }}
    >
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

      <div style={{ padding: '16px 20px' }}>
        <Form form={form} layout="vertical" size="small">
          <Row gutter={14}>
            <Col span={12}>
              <Form.Item
                name="last_name"
                label={<span style={{ fontSize: 11 }}>Familiya *</span>}
                rules={[{ required: true, message: 'Familiya kiriting' }]}
                style={{ marginBottom: 8 }}
              >
                <Input placeholder="Karimov" style={{ fontSize: 12 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="first_name"
                label={<span style={{ fontSize: 11 }}>Ism *</span>}
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
                style={{ marginBottom: 8 }}
              >
                <Select
                  placeholder="Tanlang"
                  allowClear
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
                style={{ marginBottom: 8 }}
              >
                <Input placeholder="+998901234567" style={{ fontSize: 12 }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="birth_date"
                label={<span style={{ fontSize: 11 }}>Tug'ilgan sana</span>}
                style={{ marginBottom: 8 }}
              >
                <DatePicker
                  style={{ width: '100%', fontSize: 12 }}
                  format={["DD.MM.YYYY", "DD-MM-YYYY", "D.M.YYYY", "D-M-YYYY"]}
                  placeholder="KK.OO.YYYY"
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="region"
                label={<span style={{ fontSize: 11 }}>Viloyat</span>}
                style={{ marginBottom: 4 }}
              >
                <Select
                  placeholder="Tanlang"
                  showSearch
                  allowClear
                  options={REGIONS.map((r) => ({ value: r, label: r }))}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </Modal>
  );
};

export default NewClientModal;

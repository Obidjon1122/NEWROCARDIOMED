import React, { useEffect } from 'react';
import { Form, Input, Select, Button, Space, Modal } from 'antd';
import type { Client } from '../types';
import { createClient, updateClient } from '../api/clients';

const { Option } = Select;

const REGIONS = [
  'Toshkent sh.', 'Toshkent vil.', 'Andijon', "Farg'ona", 'Namangan',
  'Samarqand', 'Buxoro', 'Navoiy', 'Qashqadaryo', 'Surxondaryo',
  'Jizzax', 'Sirdaryo', 'Xorazm', "Qoraqalpog'iston"
];

interface Props {
  open: boolean;
  client: Client | null;
  onClose: () => void;
  onSaved: (client: Client) => void;
}

const ClientForm: React.FC<Props> = ({ open, client, onClose, onSaved }) => {
  const [form] = Form.useForm();
  const isEdit = !!client;

  useEffect(() => {
    if (open) {
      if (client) {
        form.setFieldsValue({
          ...client,
          birth_date: client.birth_date || '',
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, client, form]);

  const onFinish = async (values: Record<string, unknown>) => {
    const data = {
      first_name: String(values.first_name || ''),
      last_name: String(values.last_name || ''),
      patronymic: String(values.patronymic || ''),
      gender: String(values.gender || ''),
      phone: String(values.phone || ''),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      birth_date: values.birth_date ? String(values.birth_date) : '',
      region: String(values.region || ''),
    };
    try {
      const saved = isEdit
        ? await updateClient(client!.id, data)
        : await createClient(data);
      onSaved(saved);
      onClose();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Xato yuz berdi';
      form.setFields([{ name: 'phone', errors: [msg] }]);
    }
  };

  return (
    <Modal
      title={isEdit ? 'Bemorni tahrirlash' : 'Yangi bemor'}
      open={open}
      onCancel={onClose}
      footer={null}
      width={520}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="last_name" label="Familiya">
          <Input placeholder="Karimov" />
        </Form.Item>
        <Form.Item name="first_name" label="Ism">
          <Input placeholder="Alisher" />
        </Form.Item>
        <Form.Item name="patronymic" label="Otasining ismi">
          <Input placeholder="Nodirovich" />
        </Form.Item>
        <Form.Item name="gender" label="Jins">
          <Select placeholder="Tanlang" allowClear>
            <Option value="male">Erkak</Option>
            <Option value="female">Ayol</Option>
          </Select>
        </Form.Item>
        <Form.Item name="phone" label="Telefon">
          <Input placeholder="+998901234567" />
        </Form.Item>
        <Form.Item name="birth_date" label="Tug'ilgan yili">
          <Input placeholder="masalan: 1990" />
        </Form.Item>
        <Form.Item name="region" label="Viloyat">
          <Select placeholder="Tanlang" showSearch allowClear>
            {REGIONS.map((r) => (
              <Option key={r} value={r}>{r}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Space>
            <Button onClick={onClose}>Bekor qilish</Button>
            <Button type="primary" htmlType="submit" style={{ background: '#1a5276' }}>
              {isEdit ? 'Saqlash' : "Qo'shish"}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ClientForm;

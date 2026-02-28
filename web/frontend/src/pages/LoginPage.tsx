import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Space } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { loginApi } from '../api/auth';
import { authStore } from '../store/auth';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onFinish = async (values: { phone: string; password: string }) => {
    setLoading(true);
    setError('');
    try {
      const res = await loginApi(values.phone, values.password);
      authStore.setAuth(res.token, res.user);
      navigate('/clients');
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Login xatosi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a5276 0%, #2e86c1 100%)',
      }}
    >
      <Card
        style={{
          width: 420,
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          padding: '8px 0',
        }}
      >
        <Space direction="vertical" style={{ width: '100%', textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0, color: '#1a5276' }}>
            NEVROCARDIOMED
          </Title>
          <Text type="secondary">Tibbiy protokol boshqarish tizimi</Text>
        </Space>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Form layout="vertical" onFinish={onFinish} size="large">
          <Form.Item
            name="phone"
            label="Telefon raqam"
            rules={[{ required: true, message: 'Telefon raqamini kiriting' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="+998901234567"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Parol"
            rules={[{ required: true, message: 'Parolni kiriting' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Parol"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ background: '#1a5276', borderColor: '#1a5276' }}
            >
              Kirish
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;

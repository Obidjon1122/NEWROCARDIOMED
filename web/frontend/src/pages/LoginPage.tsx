import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert } from 'antd';
import { UserOutlined, LockOutlined, HeartOutlined } from '@ant-design/icons';
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
      console.error('Login error:', e);
      let errorMsg = 'Server bilan bog\'lanishda xato yuz berdi';
      if (e.response?.data?.detail) {
        if (typeof e.response.data.detail === 'string') {
          errorMsg = e.response.data.detail;
        } else if (Array.isArray(e.response.data.detail)) {
          errorMsg = e.response.data.detail.map((err: any) => err.msg).join(', ');
        }
      }
      setError(errorMsg);
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
        background: 'linear-gradient(135deg, #0a2f4a 0%, #105b8e 40%, #1574b3 70%, #0d9488 100%)',
        backgroundSize: '300% 300%',
        animation: 'gradient-shift 12s ease infinite',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative background elements */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-15%',
        left: '-10%',
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(13,148,136,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div
        className="animate-scale-in"
        style={{
          width: 440,
          maxWidth: '92vw',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255,255,255,0.05)',
        }}
      >
        {/* Glass header */}
        <div
          className="glass-dark"
          style={{
            padding: '32px 36px 28px',
            textAlign: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, #1574b3 0%, #0d9488 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 4px 16px rgba(21, 116, 179, 0.35)',
            }}
          >
            <HeartOutlined style={{ fontSize: 26, color: '#fff' }} />
          </div>
          <Title
            level={3}
            style={{
              margin: '0 0 4px',
              color: '#fff',
              fontWeight: 700,
              letterSpacing: '-0.01em',
              fontSize: 22,
            }}
          >
            NEVROCARDIOMED
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
            Tibbiy protokol boshqarish tizimi
          </Text>
        </div>

        {/* Form body */}
        <div
          style={{
            background: '#fff',
            padding: '28px 36px 32px',
          }}
        >
          {error && (
            <Alert
              message="Avtorizatsiya xatosi"
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => setError('')}
              style={{
                marginBottom: 20,
                borderRadius: 'var(--radius-sm)',
                animation: 'fadeInDown 0.3s ease-out',
              }}
            />
          )}

          <Form
            layout="vertical"
            onFinish={onFinish}
            size="large"
            requiredMark={false}
          >
            <Form.Item
              name="phone"
              label={
                <span style={{ fontWeight: 500, fontSize: 13, color: 'var(--gray-700)' }}>
                  Telefon raqam
                </span>
              }
              rules={[{ required: true, message: 'Telefon raqamini kiriting' }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: 'var(--gray-400)' }} />}
                placeholder="+998901234567"
                style={{ height: 44 }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={
                <span style={{ fontWeight: 500, fontSize: 13, color: 'var(--gray-700)' }}>
                  Parol
                </span>
              }
              rules={[{ required: true, message: 'Parolni kiriting' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: 'var(--gray-400)' }} />}
                placeholder="••••••••"
                style={{ height: 44 }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{
                  height: 46,
                  fontSize: 15,
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #1574b3 0%, #105b8e 100%)',
                  border: 'none',
                  boxShadow: '0 4px 14px rgba(21, 116, 179, 0.3)',
                }}
              >
                {loading ? 'Kirish...' : 'Tizimga kirish'}
              </Button>
            </Form.Item>
          </Form>

          <div style={{
            textAlign: 'center',
            marginTop: 20,
            paddingTop: 16,
            borderTop: '1px solid var(--gray-100)',
          }}>
            <Text style={{ color: 'var(--gray-400)', fontSize: 12 }}>
              © 2026 NEVROCARDIOMED · Barcha huquqlar himoyalangan
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

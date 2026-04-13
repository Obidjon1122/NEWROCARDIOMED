import React, { useState, useEffect, useCallback } from 'react';
import {
  Button, Space, Typography, Tag, Spin, Select,
  DatePicker, Empty, Tooltip,
} from 'antd';
import {
  PlusOutlined, EyeOutlined, FileTextOutlined,
  CalendarOutlined, FilterOutlined,
} from '@ant-design/icons';
import type { Client, ProtocolDashboardItem, ProtocolFormItem, PaginationResponse } from '../types';
import { getDoctorProtocols, getFormsByClientAndProtocol, getFormsByClient } from '../api/protocols';

const { Text, Title } = Typography;

interface Props {
  client: Client | null;
  onAddProtocol?: () => void;
  onViewProtocol?: (item: ProtocolFormItem) => void;
}

const ProtocolList: React.FC<Props> = ({ client, onAddProtocol, onViewProtocol }) => {
  const [protocols, setProtocols] = useState<ProtocolDashboardItem[]>([]);
  const [selectedProtocol, setSelectedProtocol] = useState<number | null>(null);
  const [forms, setForms] = useState<PaginationResponse<ProtocolFormItem> | null>(null);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 100;

  useEffect(() => {
    getDoctorProtocols().then(setProtocols).catch(console.error);
  }, []);

  const loadForms = useCallback(async () => {
    if (!client) return;
    setLoading(true);
    try {
      if (selectedProtocol) {
        const res = await getFormsByClientAndProtocol(client.id, selectedProtocol, page, PAGE_SIZE, date);
        setForms(res);
      } else {
        const res = await getFormsByClient(client.id, page, PAGE_SIZE);
        setForms(res);
      }
    } finally {
      setLoading(false);
    }
  }, [client, selectedProtocol, page, date]);

  useEffect(() => {
    setPage(1);
    setForms(null);
  }, [client]);

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  /* ── No client selected ──────────────────────────────────── */
  if (!client) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          flexDirection: 'column',
          gap: 12,
          padding: 40,
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 'var(--radius-xl)',
            background: 'var(--gray-100)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 4,
          }}
        >
          <FileTextOutlined style={{ fontSize: 30, color: 'var(--gray-300)' }} />
        </div>
        <Text style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-500)' }}>
          Bemorni tanlang
        </Text>
        <Text type="secondary" style={{ fontSize: 13, textAlign: 'center', maxWidth: 250 }}>
          Chap paneldan bemorni tanlang yoki yangi bemor qo'shing
        </Text>
      </div>
    );
  }

  const items = forms?.items || [];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ── Client header + filters ───────────────────────────── */}
      <div
        className="animate-fade-in"
        style={{
          padding: '18px 20px 14px 52px',
          borderBottom: '1px solid var(--gray-100)',
          background: 'var(--bg-secondary)',
        }}
      >
        {/* Client info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <Title level={5} style={{ margin: 0, fontSize: 16, color: 'var(--gray-900)' }}>
            {client.last_name} {client.first_name}{client.patronymic ? ` ${client.patronymic}` : ''}
          </Title>
          <Tag
            color={client.gender === 'male' ? 'blue' : 'magenta'}
            style={{ fontSize: 11, border: 'none' }}
          >
            {client.gender === 'male' ? 'Erkak' : 'Ayol'}
          </Tag>
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
          {client.phone && (
            <Text type="secondary" style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              📞 {client.phone}
            </Text>
          )}
          {client.birth_date && (
            <Text type="secondary" style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              🎂 {client.birth_date}
            </Text>
          )}
          {client.region && (
            <Text type="secondary" style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              📍 {client.region}
            </Text>
          )}
        </div>

        {/* Filter bar + Add button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flex: 1,
            minWidth: 200,
          }}>
            <FilterOutlined style={{ color: 'var(--gray-400)', fontSize: 13 }} />
            <Select
              placeholder="Protokol turi"
              allowClear
              style={{ width: 220 }}
              options={protocols.map((p) => ({ value: p.protocol_id, label: p.protocol_title }))}
              onChange={(val) => { setSelectedProtocol(val ?? null); setPage(1); }}
            />
            <DatePicker
              placeholder="Sana"
              format="YYYY-MM-DD"
              style={{ width: 140 }}
              onChange={(_, s) => { setDate(typeof s === 'string' ? s : ''); setPage(1); }}
            />
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onAddProtocol}
            style={{
              background: 'linear-gradient(135deg, #1574b3 0%, #105b8e 100%)',
              border: 'none',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(21, 116, 179, 0.2)',
            }}
          >
            Protokol qo'shish
          </Button>
        </div>
      </div>

      {/* ── Protocol cards ────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px 12px 52px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 50 }}>
            <Spin size="large" />
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px' }}>
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
            <Text style={{ fontSize: 14, fontWeight: 500, color: 'var(--gray-500)', display: 'block', marginBottom: 4 }}>
              Protokol topilmadi
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Bu bemor uchun hali protokol yozilmagan
            </Text>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map((item, idx) => (
              <div
                key={item.protocol_form_id}
                className="premium-card animate-fade-in-up"
                onClick={() => onViewProtocol?.(item)}
                style={{
                  padding: '14px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  animationDelay: `${idx * 40}ms`,
                  animationFillMode: 'both',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 'var(--radius-md)',
                      background: 'linear-gradient(135deg, var(--primary-50), var(--primary-100))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <FileTextOutlined style={{ fontSize: 18, color: 'var(--primary-600)' }} />
                  </div>
                  <div>
                    <Text strong style={{ fontSize: 13, color: 'var(--gray-800)', display: 'block', lineHeight: 1.3 }}>
                      {item.protocol_title}
                    </Text>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                      <CalendarOutlined style={{ fontSize: 11, color: 'var(--gray-400)' }} />
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {item.created_at}
                      </Text>
                    </div>
                  </div>
                </div>
                <Tooltip title="Ko'rish" key="view">
                  <Button
                    type="text"
                    icon={<EyeOutlined />}
                    size="small"
                    style={{
                      color: 'var(--primary-600)',
                      width: 32,
                      height: 32,
                      borderRadius: 'var(--radius-sm)',
                    }}
                    onClick={(e) => { e.stopPropagation(); onViewProtocol?.(item); }}
                  />
                </Tooltip>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Pagination ────────────────────────────────────────── */}
      {forms && forms.total_pages > 1 && (
        <div style={{
          padding: '10px 20px',
          borderTop: '1px solid var(--gray-100)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-secondary)',
        }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Jami: {forms.total_count} ta protokol
          </Text>
          <Button
            size="small"
            onClick={() => setPage((p) => p + 1)}
            disabled={!forms.has_next}
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            Ko'proq yuklash
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProtocolList;

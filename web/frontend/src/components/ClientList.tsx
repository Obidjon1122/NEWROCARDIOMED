import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Input, Button, Space, Typography, Tag, Pagination, Avatar, Empty,
} from 'antd';
import {
  SearchOutlined, UserAddOutlined, UserOutlined, PhoneOutlined,
  CalendarOutlined, EnvironmentOutlined,
} from '@ant-design/icons';
import type { Client, PaginationResponse } from '../types';
import { getClients } from '../api/clients';

const { Text } = Typography;

interface Props {
  selectedClientId: number | null;
  onSelectClient: (client: Client) => void;
  onAddClient: () => void;
  onDoubleClickClient?: (client: Client) => void;
}

/* ── Skeleton row ────────────────────────────────────────────── */
const SkeletonRow: React.FC = () => (
  <div style={{ padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'center' }}>
    <div className="skeleton skeleton-avatar" />
    <div style={{ flex: 1 }}>
      <div className="skeleton skeleton-text" style={{ width: '60%' }} />
      <div className="skeleton skeleton-text" style={{ width: '40%', height: 11 }} />
    </div>
  </div>
);

const ClientList: React.FC<Props> = ({ selectedClientId, onSelectClient, onAddClient, onDoubleClickClient }) => {
  const [data, setData] = useState<PaginationResponse<Client> | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async (p: number, s: string) => {
    setLoading(true);
    try {
      const res = await getClients({ page: p, page_size: 15, search: s });
      setData(res);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(page, search);
  }, [page, search, load]);

  const handleSearch = (val: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(val);
      setPage(1);
    }, 300);
  };

  const items = data?.items || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* ── Search & Add ─────────────────────────────────────────── */}
      <div style={{ padding: '14px 14px 10px' }}>
        <Input
          placeholder="Qidirish..."
          prefix={<SearchOutlined style={{ color: 'var(--gray-400)' }} />}
          allowClear
          onChange={(e) => handleSearch(e.target.value)}
          style={{
            marginBottom: 10,
            borderRadius: 'var(--radius-full)',
            background: 'var(--gray-50)',
            border: '1px solid var(--gray-200)',
          }}
        />
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={onAddClient}
          block
          style={{
            background: 'linear-gradient(135deg, #1574b3 0%, #105b8e 100%)',
            border: 'none',
            height: 38,
            fontWeight: 600,
            borderRadius: 'var(--radius-sm)',
            boxShadow: '0 2px 8px rgba(21, 116, 179, 0.2)',
          }}
        >
          Yangi bemor
        </Button>
      </div>

      {/* ── Divider line ──────────────────────────────────────────── */}
      <div style={{ height: 1, background: 'var(--gray-100)', margin: '0 14px' }} />

      {/* ── Client list ──────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 8px' }}>
        {loading ? (
          <>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </>
        ) : items.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {search ? 'Natija topilmadi' : 'Bemor topilmadi'}
                </Text>
              }
            />
          </div>
        ) : (
          items.map((client, idx) => {
            const selected = selectedClientId === client.id;
            return (
              <div
                key={client.id}
                onClick={() => onSelectClient(client)}
                onDoubleClick={() => onDoubleClickClient?.(client)}
                className="animate-fade-in"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 11,
                  padding: '10px 12px',
                  margin: '2px 0',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-md)',
                  background: selected
                    ? 'linear-gradient(135deg, var(--primary-50) 0%, #e3f2fd 100%)'
                    : 'transparent',
                  border: selected
                    ? '1px solid var(--primary-200)'
                    : '1px solid transparent',
                  transition: 'all var(--transition-fast)',
                  animationDelay: `${idx * 30}ms`,
                  animationFillMode: 'both',
                }}
                onMouseEnter={(e) => {
                  if (!selected) {
                    e.currentTarget.style.background = 'var(--gray-50)';
                    e.currentTarget.style.borderColor = 'var(--gray-200)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!selected) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                  }
                }}
              >
                <Avatar
                  icon={<UserOutlined />}
                  style={{
                    background: client.gender === 'male'
                      ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                      : 'linear-gradient(135deg, #ec4899, #be185d)',
                    flexShrink: 0,
                    boxShadow: selected
                      ? '0 2px 8px rgba(21, 116, 179, 0.25)'
                      : '0 1px 3px rgba(0,0,0,0.08)',
                  }}
                  size={38}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Text
                      strong
                      style={{
                        fontSize: 13,
                        color: selected ? 'var(--primary-800)' : 'var(--gray-800)',
                        lineHeight: 1.3,
                      }}
                      ellipsis
                    >
                      {client.last_name} {client.first_name}
                    </Text>
                    <Tag
                      color={client.gender === 'male' ? 'blue' : 'magenta'}
                      style={{
                        fontSize: 10,
                        lineHeight: '16px',
                        padding: '0 6px',
                        margin: 0,
                        border: 'none',
                      }}
                    >
                      {client.gender === 'male' ? 'E' : 'A'}
                    </Tag>
                  </div>
                  <Space size={8} style={{ marginTop: 3 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--gray-400)' }}>
                      <PhoneOutlined style={{ fontSize: 10 }} />
                      {client.phone}
                    </span>
                    {client.birth_date && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--gray-400)' }}>
                        <CalendarOutlined style={{ fontSize: 10 }} />
                        {client.birth_date}
                      </span>
                    )}
                  </Space>
                  {client.region && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--gray-400)', marginTop: 1 }}>
                      <EnvironmentOutlined style={{ fontSize: 10 }} />
                      {client.region}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Pagination ───────────────────────────────────────────── */}
      {data && data.total_pages > 1 && (
        <div style={{
          padding: '10px 14px',
          borderTop: '1px solid var(--gray-100)',
          textAlign: 'center',
        }}>
          <Pagination
            current={page}
            total={data.total_count}
            pageSize={15}
            onChange={setPage}
            showSizeChanger={false}
            simple
            size="small"
          />
        </div>
      )}
    </div>
  );
};

export default ClientList;

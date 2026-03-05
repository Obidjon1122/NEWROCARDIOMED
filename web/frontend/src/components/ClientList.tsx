import React, { useState, useEffect, useCallback } from 'react';
import {
  List, Input, Button, Space, Typography, Tag, Spin, Pagination, Avatar
} from 'antd';
import { SearchOutlined, UserAddOutlined, UserOutlined, PhoneOutlined } from '@ant-design/icons';
import type { Client, PaginationResponse } from '../types';
import { getClients } from '../api/clients';

const { Text } = Typography;

interface Props {
  selectedClientId: number | null;
  onSelectClient: (client: Client) => void;

  onAddClient: () => void;
}

const ClientList: React.FC<Props> = ({ selectedClientId, onSelectClient, onAddClient }) => {
  const [data, setData] = useState<PaginationResponse<Client> | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

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
    setSearch(val);
    setPage(1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid #f0f0f0' }}>
        <Space.Compact style={{ width: '100%', marginBottom: 8 }}>
          <Input
            placeholder="Qidirish (ism, familiya, telefon, sana)..."
            prefix={<SearchOutlined />}
            allowClear
            onChange={(e) => handleSearch(e.target.value)}
          />
        </Space.Compact>
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={onAddClient}
          style={{ width: '100%', background: '#1a5276' }}
        >
          Yangi bemor
        </Button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin />
          </div>
        ) : (
          <List
            dataSource={data?.items || []}
            locale={{ emptyText: 'Bemor topilmadi' }}
            renderItem={(client) => (
              <List.Item
                style={{
                  cursor: 'pointer',
                  padding: '10px 12px',
                  background: selectedClientId === client.id ? '#e6f7ff' : 'transparent',
                  borderLeft: selectedClientId === client.id ? '3px solid #1890ff' : '3px solid transparent',
                  transition: 'all 0.2s',
                }}
                onClick={() => onSelectClient(client)}
              >
                <Space>
                  <Avatar
                    icon={<UserOutlined />}
                    style={{
                      background: client.gender === 'male' ? '#1677ff' : '#eb2f96',
                      flexShrink: 0,
                    }}
                    size={36}
                  />
                  <div>
                    <div>
                      <Text strong style={{ fontSize: 13 }}>
                        {client.last_name} {client.first_name}
                      </Text>
                    </div>
                    <Space size={4}>
                      <PhoneOutlined style={{ fontSize: 11, color: '#999' }} />
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {client.phone}
                      </Text>
                      <Tag
                        color={client.gender === 'male' ? 'blue' : 'pink'}
                        style={{ fontSize: 10, lineHeight: '16px', padding: '0 4px' }}
                      >
                        {client.gender === 'male' ? 'Erkak' : 'Ayol'}
                      </Tag>
                    </Space>
                    <div>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {client.birth_date} · {client.region}
                      </Text>
                    </div>
                  </div>
                </Space>
              </List.Item>
            )}
          />
        )}
      </div>

      {data && data.total_pages > 1 && (
        <div style={{ padding: '8px 12px', borderTop: '1px solid #f0f0f0', textAlign: 'center' }}>
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

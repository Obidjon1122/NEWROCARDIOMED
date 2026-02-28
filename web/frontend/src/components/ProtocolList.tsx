import React, { useState, useEffect, useCallback } from 'react';
import {
  List, Button, Space, Typography, Tag, Spin, Select,
  DatePicker, Empty
} from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import type { Client, ProtocolDashboardItem, ProtocolFormItem, PaginationResponse } from '../types';
import { getDoctorProtocols, getFormsByClientAndProtocol, getFormsByClient } from '../api/protocols';

const { Text, Title } = Typography;

interface Props {
  client: Client | null;
  onViewForm: (formId: number, protocolId: number) => void;
}

const ProtocolList: React.FC<Props> = ({ client, onViewForm }) => {
  const [protocols, setProtocols] = useState<ProtocolDashboardItem[]>([]);
  const [selectedProtocol, setSelectedProtocol] = useState<number | null>(null);
  const [forms, setForms] = useState<PaginationResponse<ProtocolFormItem> | null>(null);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState('');
  const [page, setPage] = useState(1);
  // Large page size so pagination is rarely needed (all forms visible at once)
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

  if (!client) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Empty description="Bemorni tanlang (ikki marta bosish — yangi protokol)" />
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #f0f0f0' }}>
        <Title level={5} style={{ margin: '0 0 6px' }}>
          {client.last_name} {client.first_name}
          <Tag
            color={client.gender === 'male' ? 'blue' : 'pink'}
            style={{ marginLeft: 8, fontSize: 11 }}
          >
            {client.gender === 'male' ? 'Erkak' : 'Ayol'}
          </Tag>
        </Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 10, fontSize: 12 }}>
          📞 {client.phone} · 🎂 {client.birth_date} · 📍 {client.region}
        </Text>
        <Text type="secondary" style={{ display: 'block', marginBottom: 10, fontSize: 11, fontStyle: 'italic' }}>
          Yangi protokol yaratish uchun chap panelda bemorni ikki marta bosing
        </Text>

        <Space wrap>
          <Select
            placeholder="Protokol bo'yicha filter"
            allowClear
            style={{ width: 230 }}
            options={protocols.map((p) => ({ value: p.protocol_id, label: p.protocol_title }))}
            onChange={(val) => { setSelectedProtocol(val ?? null); setPage(1); }}
          />
          <DatePicker
            placeholder="Sana bo'yicha"
            format="YYYY-MM-DD"
            style={{ width: 160 }}
            onChange={(_, s) => { setDate(typeof s === 'string' ? s : ''); setPage(1); }}
          />
        </Space>
      </div>

      {/* Forms list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
        ) : (
          <List
            dataSource={forms?.items || []}
            locale={{ emptyText: 'Protokol topilmadi' }}
            renderItem={(item) => (
              <List.Item
                style={{ padding: '10px 16px', cursor: 'default' }}
                actions={[
                  <Button
                    key="view"
                    type="link"
                    icon={<EyeOutlined />}
                    title="Ko'rish"
                    onClick={() => onViewForm(item.protocol_form_id, item.protocol_id)}
                  />,
                ]}
              >
                <div>
                  <Text strong style={{ display: 'block' }}>{item.protocol_title}</Text>
                  <Tag color="geekblue" style={{ fontSize: 11, marginTop: 2 }}>
                    📅 {item.created_at}
                  </Tag>
                </div>
              </List.Item>
            )}
          />
        )}
      </div>

      {/* Pagination only if truly needed (>100 forms) */}
      {forms && forms.total_pages > 1 && (
        <div style={{ padding: '8px 16px', borderTop: '1px solid #f0f0f0', textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: 11, marginRight: 8 }}>
            Jami: {forms.total_count} ta protokol
          </Text>
          <Button size="small" onClick={() => setPage((p) => p + 1)} disabled={!forms.has_next}>
            Ko'proq yuklash
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProtocolList;

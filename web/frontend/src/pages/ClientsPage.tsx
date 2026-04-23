import React, { useState, useEffect } from 'react';
import { Layout, Button, Typography, Tooltip, Badge, Space } from 'antd';
import {
  LogoutOutlined,
  HeartOutlined,
  UserOutlined,
  FileTextOutlined,
  CalendarOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { Client, ProtocolDashboardItem, ProtocolFormItem } from '../types';
import { authStore } from '../store/auth';
import ClientList from '../components/ClientList';
import NewClientModal from '../components/NewClientModal';
import ProtocolList from '../components/ProtocolList';
import ProtocolViewModal from '../components/ProtocolViewModal';
import { getDoctorProtocols } from '../api/protocols';

const { Sider, Content } = Layout;
const { Text } = Typography;

const ClientsPage: React.FC = () => {
  const navigate = useNavigate();
  const user = authStore.getUser();

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [listRefreshKey, setListRefreshKey] = useState(0);
  const [protocols, setProtocols] = useState<ProtocolDashboardItem[]>([]);
  const [siderCollapsed, setSiderCollapsed] = useState(false);

  const [newClientOpen, setNewClientOpen] = useState(false);
  const [protocolFormOpen, setProtocolFormOpen] = useState(false);
  const [viewItem, setViewItem] = useState<ProtocolFormItem | null>(null);
  const [editProtocolId, setEditProtocolId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    getDoctorProtocols().then(setProtocols).catch(console.error);
  }, []);

  const handleLogout = () => {
    authStore.clear();
    navigate('/login');
  };

  const handleNewClientSaved = (client: Client) => {
    setSelectedClient(client);
    setNewClientOpen(false);
    setListRefreshKey((k) => k + 1);
  };

  const handleProtocolSaved = (_client: Client) => {
    setProtocolFormOpen(false);
    setEditProtocolId(null);
    setEditFormData(null);
    setListRefreshKey((k) => k + 1);
  };

  const handleEditProtocol = (protocolId: number, formData: Record<string, string>) => {
    setEditProtocolId(protocolId);
    setEditFormData(formData);
    setProtocolFormOpen(true);
  };

  const doctorName = user
    ? `${user.last_name} ${user.first_name}`
    : '';

  return (
    <Layout style={{ height: '100vh', background: 'var(--bg-primary)' }}>
      {/* ── Premium Header ─────────────────────────────────────────── */}
      <div
        className="glass-dark"
        style={{
          height: 56,
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          zIndex: 10,
          background: 'linear-gradient(135deg, #0a2f4a 0%, #105b8e 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #1574b3 0%, #0d9488 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(21, 116, 179, 0.3)',
            }}
          >
            <HeartOutlined style={{ fontSize: 17, color: '#fff' }} />
          </div>
          <Text style={{ color: '#fff', fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em' }}>
            NEVROCARDIOMED
          </Text>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Stats badges */}
          <div style={{ display: 'flex', gap: 12, marginRight: 8 }}>
            <Tooltip title="Protokol turlari">
              <Badge
                count={protocols.length}
                style={{ backgroundColor: 'var(--accent-teal)' }}
                size="small"
              >
                <FileTextOutlined style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)' }} />
              </Badge>
            </Tooltip>
            <Tooltip title="Bugun">
              <CalendarOutlined style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }} />
            </Tooltip>
          </div>

          {/* User info */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '5px 12px 5px 8px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1574b3 0%, #42a5e8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UserOutlined style={{ fontSize: 13, color: '#fff' }} />
            </div>
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 500 }}>
              {doctorName}
            </Text>
          </div>

          <Tooltip title="Chiqish">
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              style={{
                color: 'rgba(255,255,255,0.6)',
                width: 34,
                height: 34,
                borderRadius: 'var(--radius-sm)',
              }}
            />
          </Tooltip>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────── */}
      <Layout style={{ background: 'transparent' }}>
        <Sider
          width={siderCollapsed ? 0 : 340}
          style={{
            background: 'var(--bg-secondary)',
            borderRight: '1px solid var(--gray-200)',
            height: 'calc(100vh - 56px)',
            transition: 'width var(--transition-normal)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <ClientList
            key={listRefreshKey}
            selectedClientId={selectedClient?.id || null}
            onSelectClient={(client) => setSelectedClient(client)}
            onAddClient={() => setNewClientOpen(true)}
            onDoubleClickClient={(client) => {
              setSelectedClient(client);
              setEditProtocolId(null);
              setEditFormData(null);
              setProtocolFormOpen(true);
            }}
          />
        </Sider>

        <Content
          style={{
            background: 'var(--bg-primary)',
            height: 'calc(100vh - 56px)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          {/* Sider toggle */}
          <Tooltip title={siderCollapsed ? "Panelni ochish" : "Panelni yopish"}>
            <Button
              type="text"
              icon={siderCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setSiderCollapsed(c => !c)}
              style={{
                position: 'absolute',
                top: 12,
                left: 12,
                zIndex: 5,
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-secondary)',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid var(--gray-200)',
                color: 'var(--gray-500)',
              }}
            />
          </Tooltip>

          <ProtocolList
            key={`${selectedClient?.id}-${listRefreshKey}`}
            client={selectedClient}
            onAddProtocol={() => setProtocolFormOpen(true)}
            onViewProtocol={(item) => setViewItem(item)}
          />
        </Content>
      </Layout>

      <NewClientModal
        open={newClientOpen}
        protocols={protocols}
        onClose={() => setNewClientOpen(false)}
        onSaved={handleNewClientSaved}
      />

      <NewClientModal
        open={protocolFormOpen}
        protocols={protocols}
        existingClient={selectedClient}
        initialProtocolId={editProtocolId}
        initialFormData={editFormData}
        onClose={() => { setProtocolFormOpen(false); setEditProtocolId(null); setEditFormData(null); }}
        onSaved={handleProtocolSaved}
      />

      <ProtocolViewModal
        open={viewItem !== null}
        formItem={viewItem}
        client={selectedClient}
        onClose={() => setViewItem(null)}
        onEditProtocol={handleEditProtocol}
      />
    </Layout>
  );
};

export default ClientsPage;

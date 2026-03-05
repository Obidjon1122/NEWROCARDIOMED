import React, { useState, useEffect } from 'react';
import { Layout, Button, Space, Typography, Tooltip } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { Client, ProtocolDashboardItem, ProtocolFormItem } from '../types';
import { authStore } from '../store/auth';
import ClientList from '../components/ClientList';
import NewClientModal from '../components/NewClientModal';
import ProtocolList from '../components/ProtocolList';
import ProtocolFormModal from '../components/ProtocolFormModal';
import ProtocolViewModal from '../components/ProtocolViewModal';
import { getDoctorProtocols } from '../api/protocols';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const ClientsPage: React.FC = () => {
  const navigate = useNavigate();
  const user = authStore.getUser();

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [listRefreshKey, setListRefreshKey] = useState(0);
  const [protocols, setProtocols] = useState<ProtocolDashboardItem[]>([]);

  const [newClientOpen, setNewClientOpen] = useState(false);
  const [protocolFormOpen, setProtocolFormOpen] = useState(false);
  const [viewItem, setViewItem] = useState<ProtocolFormItem | null>(null);

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

  const handleProtocolSaved = () => {
    setProtocolFormOpen(false);
    setListRefreshKey((k) => k + 1);
  };

  return (
    <Layout style={{ height: '100vh' }}>
      <Header
        style={{
          background: '#1a5276',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 52,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>
          🏥 NEVROCARDIOMED
        </Text>
        <Space>
          <Text style={{ color: '#cce4f7', fontSize: 13 }}>
            {user?.last_name} {user?.first_name}
          </Text>
          <Tooltip title="Chiqish">
            <Button
              type="text"
              icon={<LogoutOutlined />}
              style={{ color: '#fff' }}
              onClick={handleLogout}
            />
          </Tooltip>
        </Space>
      </Header>

      <Layout>
        <Sider
          width={320}
          style={{
            background: '#fff',
            borderRight: '1px solid #f0f0f0',
            overflowY: 'hidden',
            height: 'calc(100vh - 52px)',
          }}
        >
          <ClientList
            key={listRefreshKey}
            selectedClientId={selectedClient?.id || null}
            onSelectClient={(client) => setSelectedClient(client)}
            onAddClient={() => setNewClientOpen(true)}
          />
        </Sider>

        <Content
          style={{
            background: '#fafafa',
            height: 'calc(100vh - 52px)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
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
        onClose={() => setNewClientOpen(false)}
        onSaved={handleNewClientSaved}
      />

      <ProtocolFormModal
        open={protocolFormOpen}
        client={selectedClient}
        protocols={protocols}
        onClose={() => setProtocolFormOpen(false)}
        onSaved={handleProtocolSaved}
      />

      <ProtocolViewModal
        open={viewItem !== null}
        formItem={viewItem}
        client={selectedClient}
        onClose={() => setViewItem(null)}
      />
    </Layout>
  );
};

export default ClientsPage;

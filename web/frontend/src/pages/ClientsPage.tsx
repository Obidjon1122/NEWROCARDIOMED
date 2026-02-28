import React, { useState } from 'react';
import { Layout, Button, Space, Typography, Tooltip } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { Client } from '../types';
import { authStore } from '../store/auth';
import ClientList from '../components/ClientList';
import ClientForm from '../components/ClientForm';
import NewClientModal from '../components/NewClientModal';
import ClientDetailModal from '../components/ClientDetailModal';
import ProtocolList from '../components/ProtocolList';
import ProtocolView from '../components/ProtocolView';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const ClientsPage: React.FC = () => {
  const navigate = useNavigate();
  const user = authStore.getUser();

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [listRefreshKey, setListRefreshKey] = useState(0);

  // "Yangi bemor" modal (combined client form + protocol)
  const [newClientOpen, setNewClientOpen] = useState(false);

  // Client detail modal (2nd click on same client)
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailClient, setDetailClient] = useState<Client | null>(null);

  // Edit existing client (opened from ClientDetailModal)
  const [clientFormOpen, setClientFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Saved protocol view (from right panel eye button)
  const [viewFormId, setViewFormId] = useState<number>(0);
  const [viewProtocolId, setViewProtocolId] = useState<number>(0);
  const [viewOpen, setViewOpen] = useState(false);

  // Live preview — shared by both ClientDetailModal and NewClientModal
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewProtocolId, setPreviewProtocolId] = useState<number>(0);
  const [previewFormData, setPreviewFormData] = useState<Record<string, string>>({});
  const [previewClient, setPreviewClient] = useState<Client | null>(null);

  const handleLogout = () => {
    authStore.clear();
    navigate('/login');
  };

  const handleSelectClient = (client: Client) => setSelectedClient(client);

  const handleDetailClient = (client: Client) => {
    setDetailClient(client);
    setDetailOpen(true);
  };

  const handleViewForm = (formId: number, protocolId: number) => {
    setViewFormId(formId);
    setViewProtocolId(protocolId);
    setViewOpen(true);
  };

  // Live preview from ClientDetailModal (existing client)
  const handleDetailPreview = (protocolId: number, formData: Record<string, string>) => {
    setPreviewProtocolId(protocolId);
    setPreviewFormData(formData);
    setPreviewClient(detailClient);
    setPreviewOpen(true);
  };

  // Live preview from NewClientModal (temp client not yet saved)
  const handleNewClientPreview = (
    protocolId: number,
    formData: Record<string, string>,
    tempClient: Client
  ) => {
    setPreviewProtocolId(protocolId);
    setPreviewFormData(formData);
    setPreviewClient(tempClient);
    setPreviewOpen(true);
  };

  const handleDetailSaved = () => {
    setListRefreshKey((k) => k + 1);
    // modal stays open for next protocol
  };

  const handleNewClientSaved = (client: Client) => {
    setSelectedClient(client);
    setNewClientOpen(false);
    setListRefreshKey((k) => k + 1);
  };

  const handleClientEditSaved = (client: Client) => {
    setSelectedClient(client);
    if (detailClient && detailClient.id === client.id) {
      setDetailClient(client);
    }
    setClientFormOpen(false);
    setListRefreshKey((k) => k + 1);
  };

  const handleEditFromDetail = () => {
    setEditingClient(detailClient);
    setClientFormOpen(true);
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
        {/* Left panel */}
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
            onSelectClient={handleSelectClient}
            onDetailClient={handleDetailClient}
            onAddClient={() => setNewClientOpen(true)}
          />
        </Sider>

        {/* Right panel */}
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
            onViewForm={handleViewForm}
          />
        </Content>
      </Layout>

      {/* ── Yangi bemor + protokol (combined) ── */}
      <NewClientModal
        open={newClientOpen}
        onClose={() => setNewClientOpen(false)}
        onSaved={handleNewClientSaved}
        onPreview={handleNewClientPreview}
      />

      {/* ── Edit existing client (from detail modal) ── */}
      <ClientForm
        open={clientFormOpen}
        client={editingClient}
        onClose={() => setClientFormOpen(false)}
        onSaved={handleClientEditSaved}
      />

      {/* ── Client detail modal (2nd click) ── */}
      {detailClient && (
        <ClientDetailModal
          open={detailOpen}
          client={detailClient}
          onClose={() => setDetailOpen(false)}
          onEditClient={handleEditFromDetail}
          onSaved={handleDetailSaved}
          onPreview={handleDetailPreview}
        />
      )}

      {/* ── Saved protocol view (right panel) ── */}
      {user && selectedClient && viewOpen && (
        <ProtocolView
          open={viewOpen}
          formId={viewFormId}
          protocolId={viewProtocolId}
          client={selectedClient}
          doctor={user}
          onClose={() => setViewOpen(false)}
        />
      )}

      {/* ── Live preview (from any modal, before saving) ── */}
      {user && previewClient && previewOpen && (
        <ProtocolView
          open={previewOpen}
          protocolId={previewProtocolId}
          client={previewClient}
          doctor={user}
          localFormData={previewFormData}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </Layout>
  );
};

export default ClientsPage;

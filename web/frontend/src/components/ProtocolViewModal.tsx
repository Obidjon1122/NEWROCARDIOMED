import React, { useEffect, useState } from 'react';
import {
  Modal, Button, Space, Typography, Spin, Divider, Tag,
} from 'antd';
import { PrinterOutlined, DownloadOutlined, CloseOutlined } from '@ant-design/icons';
import type { Client, ProtocolFormItem } from '../types';
import { getFormData } from '../api/protocols';
import { getProtocolForm } from '../data/protocolForms';

const { Text, Title } = Typography;

interface Props {
  open: boolean;
  formItem: ProtocolFormItem | null;
  client: Client | null;
  onClose: () => void;
}

const ProtocolViewModal: React.FC<Props> = ({ open, formItem, client, onClose }) => {
  const [data, setData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !formItem || !client) return;
    setLoading(true);
    getFormData(formItem.protocol_form_id, client.id)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [open, formItem, client]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadDocx = () => {
    if (!formItem || !client) return;
    const token = localStorage.getItem('token');
    const url = `/api/protocol-forms/${formItem.protocol_form_id}/download/docx?client_id=${client.id}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `protokol_${formItem.protocol_form_id}_${client.last_name}.docx`;
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch(console.error);
  };

  const protocolDef = formItem ? getProtocolForm(formItem.protocol_id) : null;

  const clientName = client
    ? `${client.last_name} ${client.first_name}`
    : '';

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={780}
      style={{ top: 30 }}
      title={null}
      destroyOnClose
      styles={{ body: { padding: 0, maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' } }}
      footer={
        <Space>
          <Button icon={<CloseOutlined />} onClick={onClose}>Закрыть</Button>
          <Button icon={<PrinterOutlined />} onClick={handlePrint}>Печать</Button>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownloadDocx}
            style={{ background: '#1a5276' }}
          >
            Скачать DOCX
          </Button>
        </Space>
      }
    >
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a5276 0%, #2980b9 100%)', padding: '14px 20px' }}>
        <Text style={{ color: '#fff', fontWeight: 700, fontSize: 15, display: 'block' }}>
          {formItem?.protocol_title}
        </Text>
        <Text style={{ color: '#cce4f7', fontSize: 12 }}>
          {clientName}
          {client?.birth_date ? ` · ${client.birth_date}` : ''}
          {formItem?.created_at ? ` · ${formItem.created_at}` : ''}
        </Text>
      </div>

      <div id="print-area" style={{ padding: '16px 20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
        ) : !protocolDef ? (
          <Text type="secondary">Протокол не найден</Text>
        ) : (
          <>
            {/* Patient info block */}
            <div style={{
              background: '#f0f7ff',
              border: '1px solid #d0e9ff',
              borderRadius: 6,
              padding: '10px 14px',
              marginBottom: 16,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 16,
            }}>
              <div>
                <Text type="secondary" style={{ fontSize: 11 }}>Пациент</Text>
                <Text strong style={{ display: 'block', fontSize: 13 }}>{clientName}</Text>
              </div>
              {client?.birth_date && (
                <div>
                  <Text type="secondary" style={{ fontSize: 11 }}>Дата рождения</Text>
                  <Text strong style={{ display: 'block', fontSize: 13 }}>{client.birth_date}</Text>
                </div>
              )}
              {client?.gender && (
                <div>
                  <Text type="secondary" style={{ fontSize: 11 }}>Пол</Text>
                  <div>
                    <Tag color={client.gender === 'male' ? 'blue' : 'pink'} style={{ fontSize: 11 }}>
                      {client.gender === 'male' ? 'Мужской' : 'Женский'}
                    </Tag>
                  </div>
                </div>
              )}
              {formItem?.created_at && (
                <div>
                  <Text type="secondary" style={{ fontSize: 11 }}>Дата исследования</Text>
                  <Text strong style={{ display: 'block', fontSize: 13 }}>{formItem.created_at}</Text>
                </div>
              )}
            </div>

            {/* Protocol sections */}
            {protocolDef.sections.map((section, si) => {
              const sectionFields = section.fields.filter(
                (f) => data[f.key] !== undefined && data[f.key] !== null && String(data[f.key]).trim() !== '',
              );
              if (sectionFields.length === 0) return null;

              const isConclusion = section.title === 'Заключение';

              return (
                <div key={si} style={{ marginBottom: 12 }}>
                  {si > 0 && <Divider style={{ margin: '10px 0 8px' }} />}
                  <Title level={5} style={{
                    fontSize: 12,
                    margin: '0 0 8px',
                    color: '#1a5276',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}>
                    {section.title}
                  </Title>

                  {isConclusion ? (
                    <div>
                      {sectionFields.map((field) => (
                        <div key={field.key} style={{ marginBottom: 8 }}>
                          <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>{field.label}</Text>
                          <div style={{
                            background: '#fffbf0',
                            border: '1px solid #ffe7a0',
                            borderRadius: 4,
                            padding: '8px 12px',
                            fontSize: 13,
                            whiteSpace: 'pre-wrap',
                          }}>
                            {data[field.key]}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                      <tbody>
                        {sectionFields.map((field, fi) => (
                          <tr key={fi} style={{ background: fi % 2 === 0 ? '#f8fbff' : '#fff' }}>
                            <td style={{
                              padding: '5px 10px',
                              width: '50%',
                              border: '1px solid #e8f0fe',
                              color: '#555',
                              fontWeight: 500,
                            }}>
                              {field.label}{field.unit ? ` (${field.unit})` : ''}
                            </td>
                            <td style={{
                              padding: '5px 10px',
                              border: '1px solid #e8f0fe',
                              fontWeight: data[field.key] !== 'в норме' && data[field.key] !== 'без особенностей' ? 600 : 400,
                              color: data[field.key] !== 'в норме' && data[field.key] !== 'без особенностей' ? '#c0392b' : '#1a1a1a',
                            }}>
                              {data[field.key]}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>

      <style>{`
        @media print {
          body > * { display: none !important; }
          .ant-modal-root { display: block !important; }
          .ant-modal-mask { display: none !important; }
          .ant-modal { position: static !important; box-shadow: none !important; }
          .ant-modal-content { box-shadow: none !important; }
          .ant-modal-footer { display: none !important; }
          .ant-modal-close { display: none !important; }
          #print-area { max-height: none !important; overflow: visible !important; }
        }
      `}</style>
    </Modal>
  );
};

export default ProtocolViewModal;

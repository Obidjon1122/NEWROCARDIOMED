import React, { useEffect, useState } from 'react';
import { Modal, Button, Spin } from 'antd';
import { PrinterOutlined, DownloadOutlined, CloseOutlined, FileTextOutlined, EditOutlined } from '@ant-design/icons';
import type { Client, ProtocolFormItem } from '../types';
import { getProtocolPreview, type PreviewParagraph, type PreviewResponse } from '../api/protocols';

interface Props {
  open: boolean;
  formItem: ProtocolFormItem | null;
  client: Client | null;
  onClose: () => void;
  onEditProtocol?: (protocolId: number, formData: Record<string, string>) => void;
}

const ProtocolViewModal: React.FC<Props> = ({ open, formItem, client, onClose, onEditProtocol }) => {
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !formItem || !client) return;
    setLoading(true);
    setPreview(null);
    getProtocolPreview(formItem.protocol_form_id, client.id)
      .then(setPreview)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [open, formItem, client]);

  const handlePrint = () => {
    if (!preview) return;
    const paragraphs = preview.paragraphs;
    const html = paragraphs.map((p) => {
      const style = [
        p.centered ? 'text-align:center;' : '',
        p.bold ? 'font-weight:bold;' : '',
        'font-size:12pt;',
        'margin:0;',
        'line-height:1.6;',
        'font-family:"Times New Roman",serif;',
      ].join('');
      return `<p style="${style}">${p.text.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</p>`;
    }).join('');

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  body { margin: 20mm 25mm; font-family: "Times New Roman", serif; font-size: 12pt; }
  @media print { body { margin: 15mm 20mm; } }
</style>
</head><body>${html}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
    win.close();
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

  const handleEdit = () => {
    if (!preview || !onEditProtocol) return;
    onClose();
    onEditProtocol(preview.protocol_id, preview.form_data);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={720}
      style={{ top: 20 }}
      title={null}
      destroyOnClose
      styles={{ body: { padding: 0, maxHeight: 'calc(100vh - 140px)', overflowY: 'auto' } }}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '4px 4px' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button icon={<CloseOutlined />} onClick={onClose} style={{ borderRadius: 'var(--radius-sm)' }}>
              Yopish
            </Button>
            {onEditProtocol && (
              <Button
                icon={<EditOutlined />}
                onClick={handleEdit}
                disabled={!preview}
                style={{ borderRadius: 'var(--radius-sm)' }}
              >
                Asosida yangi
              </Button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              icon={<PrinterOutlined />}
              onClick={handlePrint}
              disabled={!preview}
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              Chop etish
            </Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleDownloadDocx}
              style={{
                background: 'linear-gradient(135deg, #1574b3 0%, #105b8e 100%)',
                border: 'none',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                boxShadow: '0 2px 8px rgba(21, 116, 179, 0.2)',
              }}
            >
              DOCX yuklab olish
            </Button>
          </div>
        </div>
      }
    >
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0a2f4a 0%, #105b8e 60%, #0d9488 100%)',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <FileTextOutlined style={{ fontSize: 20, color: '#fff' }} />
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em' }}>
            {formItem?.protocol_title}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>
            {client ? `${client.last_name} ${client.first_name}${client.patronymic ? ` ${client.patronymic}` : ''}` : ''}
            {client?.birth_date ? ` · ${client.birth_date}` : ''}
            {formItem?.created_at ? ` · ${formItem.created_at}` : ''}
          </div>
        </div>
      </div>

      {/* Document body */}
      <div style={{ padding: '24px 40px', background: '#fff', minHeight: 300 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Spin size="large" />
          </div>
        ) : preview && preview.paragraphs.length > 0 ? (
          <div style={{ fontFamily: '"Times New Roman", serif', fontSize: 13 }}>
            {preview.paragraphs.map((p: PreviewParagraph, i: number) => (
              <p
                key={i}
                style={{
                  margin: '2px 0',
                  lineHeight: 1.8,
                  fontWeight: p.bold ? 700 : 400,
                  textAlign: p.centered ? 'center' : 'left',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {p.text}
              </p>
            ))}
          </div>
        ) : !loading ? (
          <div style={{ textAlign: 'center', color: '#aaa', padding: 40 }}>
            Ko'rish mavjud emas
          </div>
        ) : null}
      </div>
    </Modal>
  );
};

export default ProtocolViewModal;

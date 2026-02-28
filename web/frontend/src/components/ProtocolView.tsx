import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button, Space, Spin, Alert, notification } from 'antd';
import { PrinterOutlined, CloseOutlined, FileWordOutlined } from '@ant-design/icons';
import type { Client, User } from '../types';
import { getFormData, downloadProtocolDocx } from '../api/protocols';

// DB protokol ID → HTML shablon fayli manzili
const PROTOCOL_TEMPLATES: Record<number, string> = {
  1:  '/templates/Mashonka/index.html',
  2:  '/templates/Shitavitka/index.html',
  3:  '/templates/Pechen_blank/index.html',
  4:  '/templates/Pochki_blank/index.html',
  5:  '/templates/Maliy_taz_blank/index.html',
  6:  '/templates/Molochnye_zhelezy_blank/index.html',
  7:  '/templates/Selezjonka/index.html',
  8:  '/templates/Kolenniy_sustav/index.html',
  9:  '/templates/Nadpochechniki/index.html',
  10: '/templates/Perviy_trimestr/index.html',
  11: '/templates/Follikulometriya/index.html',
  12: '/templates/Plod_blank/index.html',
  13: '/templates/Podzheludochnaya/index.html',
  14: '/templates/Prostata/index.html',
};

function fillHtmlTemplate(html: string, data: Record<string, string>): string {
  return html.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] ?? '');
}

function formatDateToRussian(dateStr: string): string {
  if (!dateStr) return '';
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
  ];
  const [y, m, d] = dateStr.split('-');
  if (!y || !m || !d) return dateStr;
  return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y} г.`;
}

interface Props {
  open: boolean;
  formId?: number;            // required when localFormData is NOT provided
  protocolId: number;
  client: Client;
  doctor: User;
  onClose: () => void;
  /** Live preview mode: skip DB fetch, use this data directly */
  localFormData?: Record<string, string>;
}

const ProtocolView: React.FC<Props> = ({
  open, formId, protocolId, client, doctor, onClose, localFormData,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [filledHtml, setFilledHtml] = useState('');
  const [iframeHeight, setIframeHeight] = useState(600);

  useEffect(() => {
    if (!open) return;
    setError('');
    setFilledHtml('');
    setIframeHeight(600);

    const templatePath = PROTOCOL_TEMPLATES[protocolId];
    if (!templatePath) {
      setError(`Protokol shabloni topilmadi (ID: ${protocolId})`);
      return;
    }

    const buildVars = (formData: Record<string, string>): Record<string, string> => {
      const dateStr = formData['date'] || new Date().toISOString().split('T')[0];
      return {
        ...formData,
        fio: `${client.last_name} ${client.first_name}`,
        gender: client.gender === 'male' ? 'Мужской' : 'Женский',
        birth_year: client.birth_date,
        date: formatDateToRussian(dateStr),
        year: dateStr.split('-')[0] || '',
        vrach: `${doctor.last_name} ${doctor.first_name} ${doctor.patronymic_name || ''}`.trim(),
        telefon: doctor.phone,
      };
    };

    const fetchTemplate = () =>
      fetch(templatePath).then((r) => {
        if (!r.ok) throw new Error('Shablon fayl topilmadi: ' + templatePath);
        return r.text();
      });

    setLoading(true);

    if (localFormData !== undefined) {
      // Live preview — use locally provided form data without DB fetch
      fetchTemplate()
        .then((templateHtml) => {
          setFilledHtml(fillHtmlTemplate(templateHtml, buildVars(localFormData)));
        })
        .catch((e: Error) => setError(e.message || 'Xato yuz berdi'))
        .finally(() => setLoading(false));
    } else {
      // DB mode — fetch saved form data
      Promise.all([getFormData(formId!, client.id), fetchTemplate()])
        .then(([formData, templateHtml]) => {
          setFilledHtml(fillHtmlTemplate(templateHtml, buildVars(formData)));
        })
        .catch((e: Error) => setError(e.message || 'Xato yuz berdi'))
        .finally(() => setLoading(false));
    }
  }, [open, formId, protocolId, client, doctor, localFormData]);

  // Auto-resize iframe so ALL pages of the template are visible (no cropping)
  const handleIframeLoad = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    try {
      const body = iframe.contentDocument?.body;
      if (body) {
        const h = body.scrollHeight;
        if (h > 0) setIframeHeight(h + 24);
      }
    } catch {
      // srcDoc is same-origin, so this won't throw
    }
  };

  const handlePrint = () => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;
    iframe.contentWindow.print();
  };

  const handleDownloadDocx = async () => {
    if (localFormData !== undefined) {
      notification.info({ message: "Avval protokolni saqlang, so'ngra DOCX yuklab oling" });
      return;
    }
    setDownloading(true);
    try {
      const fname = `${client.last_name}_${client.first_name}_protocol_${protocolId}.docx`;
      await downloadProtocolDocx(formId!, client.id, fname);
      notification.success({ message: 'DOCX fayl yuklab olindi!' });
    } catch {
      notification.error({ message: 'DOCX yuklab olishda xato yuz berdi' });
    } finally {
      setDownloading(false);
    }
  };

  const isPreviewMode = localFormData !== undefined;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={860}
      style={{ top: 16 }}
      styles={{
        body: {
          padding: '8px 0',
          // Scrollable — iframe grows to fit all content pages
          maxHeight: 'calc(100vh - 180px)',
          overflowY: 'auto',
        },
      }}
      footer={
        <Space>
          <Button icon={<CloseOutlined />} onClick={onClose}>
            Yopish
          </Button>
          {!isPreviewMode && (
            <Button
              icon={<FileWordOutlined />}
              loading={downloading}
              onClick={handleDownloadDocx}
              style={{ borderColor: '#1a5276', color: '#1a5276' }}
            >
              DOCX yuklab olish
            </Button>
          )}
          <Button
            type="primary"
            icon={<PrinterOutlined />}
            onClick={handlePrint}
            style={{ background: '#1a5276' }}
          >
            Chop etish
          </Button>
        </Space>
      }
      title={isPreviewMode ? "Oldindan ko'rish" : "Protokol ko'rish"}
    >
      {loading && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
        </div>
      )}
      {error && <Alert message={error} type="error" showIcon />}
      {!loading && !error && filledHtml && (
        <iframe
          ref={iframeRef}
          srcDoc={filledHtml}
          onLoad={handleIframeLoad}
          style={{
            width: '100%',
            height: iframeHeight,
            border: 'none',
            borderRadius: 4,
            display: 'block',
          }}
          title="Protocol Preview"
        />
      )}
    </Modal>
  );
};

export default ProtocolView;

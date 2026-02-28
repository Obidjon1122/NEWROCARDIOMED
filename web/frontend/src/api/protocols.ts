import api from './axios';
import type { ProtocolDashboardItem, ProtocolFormItem, PaginationResponse } from '../types';

export const getDoctorProtocols = async (): Promise<ProtocolDashboardItem[]> => {
  const res = await api.get('/protocols/doctor');
  return res.data;
};

export const getFormsByClient = async (
  clientId: number,
  page = 1,
  pageSize = 20
): Promise<PaginationResponse<ProtocolFormItem>> => {
  const res = await api.get(`/protocol-forms/client/${clientId}`, {
    params: { page, page_size: pageSize },
  });
  return res.data;
};

export const getFormsByClientAndProtocol = async (
  clientId: number,
  protocolId: number,
  page = 1,
  pageSize = 20,
  date = ''
): Promise<PaginationResponse<ProtocolFormItem>> => {
  const res = await api.get(`/protocol-forms/client/${clientId}/protocol/${protocolId}`, {
    params: { page, page_size: pageSize, date },
  });
  return res.data;
};

export const getFormData = async (
  formId: number,
  clientId: number
): Promise<Record<string, string>> => {
  const res = await api.get(`/protocol-forms/${formId}/data`, {
    params: { client_id: clientId },
  });
  return res.data;
};

export const createProtocolForm = async (
  clientId: number,
  protocolId: number,
  protocolForm: Record<string, unknown>
): Promise<void> => {
  await api.post('/protocol-forms', {
    client_id: clientId,
    protocol_id: protocolId,
    protocol_form: protocolForm,
  });
};

export const downloadProtocolDocx = async (
  formId: number,
  clientId: number,
  filename?: string
): Promise<void> => {
  const res = await api.get(`/protocol-forms/${formId}/download/docx`, {
    params: { client_id: clientId },
    responseType: 'blob',
  });
  const blob = new Blob([res.data], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `protocol_${formId}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

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

export const getFormData = async (
  formId: number,
  clientId: number,
): Promise<Record<string, string>> => {
  const res = await api.get(`/protocol-forms/${formId}/data`, {
    params: { client_id: clientId },
  });
  return res.data;
};

export const getProtocolFormDownloadUrl = (formId: number, clientId: number): string => {
  const base = api.defaults.baseURL ?? '/api';
  return `${base}/protocol-forms/${formId}/download/docx?client_id=${clientId}`;
};

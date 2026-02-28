import api from './axios';
import type { ProtocolTemplate } from '../types';

export const getTemplates = async (): Promise<ProtocolTemplate[]> => {
  const res = await api.get('/templates');
  return res.data;
};

export const getTemplate = async (id: number): Promise<ProtocolTemplate> => {
  const res = await api.get(`/templates/${id}`);
  return res.data;
};

export const createTemplate = async (data: Partial<ProtocolTemplate>): Promise<ProtocolTemplate> => {
  const res = await api.post('/templates', data);
  return res.data;
};

export const updateTemplateHtml = async (id: number, html_template: string): Promise<void> => {
  await api.patch(`/templates/${id}/html`, { html_template });
};

export const deleteTemplate = async (id: number): Promise<void> => {
  await api.delete(`/templates/${id}`);
};

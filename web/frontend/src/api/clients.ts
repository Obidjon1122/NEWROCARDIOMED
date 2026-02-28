import api from './axios';
import type { Client, PaginationResponse } from '../types';

interface ClientParams {
  page?: number;
  page_size?: number;
  search?: string;
  protocol_id?: number;
}

export const getClients = async (params: ClientParams = {}): Promise<PaginationResponse<Client>> => {
  const res = await api.get('/clients', { params });
  return res.data;
};

export const getClient = async (id: number): Promise<Client> => {
  const res = await api.get(`/clients/${id}`);
  return res.data;
};

export const createClient = async (data: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> => {
  const res = await api.post('/clients', data);
  return res.data;
};

export const updateClient = async (id: number, data: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> => {
  const res = await api.put(`/clients/${id}`, data);
  return res.data;
};

export const deleteClient = async (id: number): Promise<void> => {
  await api.delete(`/clients/${id}`);
};

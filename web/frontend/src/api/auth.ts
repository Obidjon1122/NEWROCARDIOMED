import api from './axios';
import type { LoginResponse } from '../types';

export const loginApi = async (phone: string, password: string): Promise<LoginResponse> => {
  const res = await api.post('/auth/login', { phone, password });
  return res.data;
};

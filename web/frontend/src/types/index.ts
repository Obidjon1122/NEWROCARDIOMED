export interface User {
  id: number;
  first_name: string;
  last_name: string;
  patronymic_name: string;
  gender: string;
  phone: string;
  role: 'admin' | 'doctor';
  created_at?: string;
  updated_at?: string;
}

export interface Client {
  id: number;
  first_name: string;
  last_name: string;
  patronymic: string;
  gender: string;
  phone: string;
  birth_date: string;
  region: string;
  created_at?: string;
  updated_at?: string;
}

export interface Protocol {
  id: number;
  title: string;
  doctor_id: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProtocolDashboardItem {
  protocol_id: number;
  protocol_title: string;
}

export interface ProtocolFormItem {
  protocol_form_id: number;
  protocol_id: number;
  protocol_title: string;
  created_at: string;
}

export interface TemplateField {
  id?: number;
  template_id?: number;
  field_name: string;
  field_label: string;
  field_type: 'combobox' | 'text' | 'number' | 'textarea';
  field_order: number;
  default_values?: string[];
  is_required: boolean;
  row_position: number;
  column_position: number;
}

export interface ProtocolTemplate {
  id: number;
  doctor_id: number;
  title: string;
  description?: string;
  html_template?: string;
  fields: TemplateField[];
  created_at?: string;
}

export interface PaginationResponse<T> {
  items: T[];
  total_count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface AuthState {
  token: string | null;
  user: User | null;
}

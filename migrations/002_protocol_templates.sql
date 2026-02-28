-- Protocol Templates - Custom protocol form builder
-- Bu jadval doktorlarga o'z protokol formalarini yaratishga imkon beradi

CREATE TABLE IF NOT EXISTS protocol_templates (
    id SERIAL PRIMARY KEY,
    doctor_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    html_template TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Template Fields - Har bir shablon maydonlari
CREATE TABLE IF NOT EXISTS template_fields (
    id SERIAL PRIMARY KEY,
    template_id BIGINT NOT NULL REFERENCES protocol_templates(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL,
    field_label VARCHAR(255) NOT NULL,
    field_type VARCHAR(50) DEFAULT 'combobox',
    field_order INT DEFAULT 0,
    default_values TEXT[],
    is_required BOOLEAN DEFAULT false,
    row_position INT DEFAULT 0,
    column_position INT DEFAULT 0
);

-- Indekslar
CREATE INDEX IF NOT EXISTS idx_protocol_templates_doctor_id ON protocol_templates(doctor_id);
CREATE INDEX IF NOT EXISTS idx_template_fields_template_id ON template_fields(template_id);
CREATE INDEX IF NOT EXISTS idx_template_fields_order ON template_fields(template_id, field_order);

COMMENT ON TABLE protocol_templates IS 'Doktorlar yaratgan shaxsiy protokol shablonlari';
COMMENT ON TABLE template_fields IS 'Protokol shablonlaridagi maydonlar';
COMMENT ON COLUMN template_fields.field_type IS 'Maydon turi: combobox, text, number, date, textarea';
COMMENT ON COLUMN template_fields.default_values IS 'ComboBox uchun standart qiymatlar massivi';
COMMENT ON COLUMN template_fields.row_position IS 'Formadagi qator pozitsiyasi (0 dan boshlab)';
COMMENT ON COLUMN template_fields.column_position IS 'Formadagi ustun pozitsiyasi (0=chap, 1=o''ng)';

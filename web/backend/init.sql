-- ============================================================
-- NEVROCARDIOMED — Database initialization script
-- Yangi kompyuterda bazani yaratish uchun
-- Ishlatish: psql -U postgres -f init.sql
-- ============================================================

-- 1. Foydalanuvchi va baza yaratish
-- (agar allaqachon mavjud bo'lsa, xato bermaydi)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'turnerko') THEN
        CREATE USER turnerko WITH PASSWORD '2002';
    END IF;
END
$$;

-- Agar baza yo'q bo'lsa quyidagini psql da alohida ishga tushiring:
-- CREATE DATABASE "Nevrocardiomed" OWNER turnerko;
-- \connect "Nevrocardiomed"

-- ============================================================
-- 2. Jadvallar
-- ============================================================

-- Shifokorlar / foydalanuvchilar
CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    first_name  VARCHAR(100) NOT NULL,
    last_name   VARCHAR(100) NOT NULL,
    patronymic  VARCHAR(100) NOT NULL DEFAULT '',
    gender      VARCHAR(10)           DEFAULT 'male',
    password    VARCHAR(255) NOT NULL,
    phone       VARCHAR(20)  UNIQUE NOT NULL,
    role        VARCHAR(20)           DEFAULT 'doctor',
    created_at  TIMESTAMP             DEFAULT NOW(),
    updated_at  TIMESTAMP             DEFAULT NOW()
);

-- Bemorlar
CREATE TABLE IF NOT EXISTS clients (
    id          SERIAL PRIMARY KEY,
    first_name  VARCHAR(100) NOT NULL,
    last_name   VARCHAR(100) NOT NULL,
    patronymic  VARCHAR(100) NOT NULL DEFAULT '',
    gender      VARCHAR(10)           DEFAULT 'male',
    phone       VARCHAR(20)           DEFAULT '',
    birth_date  DATE,
    region      VARCHAR(100)          DEFAULT '',
    created_at  TIMESTAMP             DEFAULT NOW(),
    updated_at  TIMESTAMP             DEFAULT NOW()
);

-- Protokol turlari (UZI pecheni, UZI buyrak, ...)
CREATE TABLE IF NOT EXISTS protocols (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    doctor_id   INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

-- Bemorga to'ldirilgan protokol ma'lumotlari
CREATE TABLE IF NOT EXISTS protocol_forms (
    id              SERIAL PRIMARY KEY,
    client_id       INTEGER REFERENCES clients(id)   ON DELETE CASCADE,
    protocol_id     INTEGER REFERENCES protocols(id)  ON DELETE CASCADE,
    protocol_form   JSONB             DEFAULT '{}',
    created_at      TIMESTAMP         DEFAULT NOW()
);

-- Shablon protokollar (custom, doktor tomonidan yaratiladi)
CREATE TABLE IF NOT EXISTS protocol_templates (
    id            SERIAL PRIMARY KEY,
    doctor_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title         VARCHAR(255) NOT NULL,
    description   TEXT          DEFAULT '',
    html_template TEXT          DEFAULT '',
    created_at    TIMESTAMP     DEFAULT NOW()
);

-- Shablon maydonlari
CREATE TABLE IF NOT EXISTS template_fields (
    id               SERIAL PRIMARY KEY,
    template_id      INTEGER REFERENCES protocol_templates(id) ON DELETE CASCADE,
    field_name       VARCHAR(100) NOT NULL,
    field_label      VARCHAR(255) NOT NULL,
    field_type       VARCHAR(50)   DEFAULT 'text',
    field_order      INTEGER       DEFAULT 0,
    default_values   TEXT[]        DEFAULT '{}',
    is_required      BOOLEAN       DEFAULT FALSE,
    row_position     INTEGER       DEFAULT 0,
    column_position  INTEGER       DEFAULT 0
);

-- ============================================================
-- 3. Ruxsatlar
-- ============================================================
GRANT ALL PRIVILEGES ON ALL TABLES    IN SCHEMA public TO turnerko;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO turnerko;

-- ============================================================
-- 4. Birinchi admin foydalanuvchi
--    Parol: admin123  (telefon: +998000000000)
--    Hash: SHA256("admin123:+998000000000:")
-- ============================================================
INSERT INTO users (first_name, last_name, patronymic, gender, password, phone, role)
VALUES (
    'Admin', 'Admin', '', 'male',
    'f980273119781ab0721f70830b70e4fe4ec67cfdbc1b401ca974d245cf9ed9aa',
    '+998000000000',
    'admin'
)
ON CONFLICT (phone) DO NOTHING;

-- ============================================================
-- 5. Protokol turlari (15 ta standart UZI protokoli)
--    doctor_id=1 → yuqorida yaratilgan Admin foydalanuvchi
-- ============================================================
INSERT INTO protocols (id, title, doctor_id) VALUES
    (1,  'УЗИ печени и желчного пузыря',                   1),
    (2,  'УЗИ почек, мочеточников и мочевого пузыря',      1),
    (3,  'УЗИ щитовидной железы',                          1),
    (4,  'УЗИ поджелудочной железы',                       1),
    (5,  'УЗИ селезёнки',                                  1),
    (6,  'УЗИ предстательной железы и семенных пузырьков', 1),
    (7,  'УЗИ молочных желез',                             1),
    (8,  'УЗИ мочевого пузыря',                            1),
    (9,  'УЗИ органов малого таза',                        1),
    (10, 'УЗИ надпочечников',                              1),
    (11, 'УЗИ коленного сустава',                          1),
    (12, 'УЗИ в I триместре беременности',                 1),
    (13, 'УЗИ плода',                                      1),
    (14, 'Сердцебиение',                                   1),
    (15, 'Фолликулометрия',                                1)
ON CONFLICT (id) DO NOTHING;

-- ID sequence ni to'g'rilash (agar kerak bo'lsa)
SELECT setval('protocols_id_seq', (SELECT MAX(id) FROM protocols));

-- ============================================================
-- Tayyor! Tekshirish:
--   SELECT tablename FROM pg_tables WHERE schemaname = 'public';
--   SELECT id, first_name, phone, role FROM users;
--   SELECT id, title FROM protocols;
-- ============================================================

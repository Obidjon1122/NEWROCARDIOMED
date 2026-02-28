// ============================================================
// 14 ta UZI protokoli uchun maydon konfiguratsiyasi
// Har bir maydon: name (DB kalit), label (ruscha), type
// ============================================================

export type FieldType = 'text' | 'number' | 'textarea' | 'select';

export interface ProtocolField {
  name: string;
  label: string;
  type: FieldType;
  options?: string[];
  unit?: string;
  section?: string;
}

export interface ProtocolConfig {
  id: number;
  title: string;
  fields: ProtocolField[];
}

// ============================================================
// 1. МОШОНКА (Mashonka)
// ============================================================
const mashonkaFields: ProtocolField[] = [
  // Правое яичко
  { section: 'Правое яичко', name: 'yai_pr_topografiya', label: 'Топография', type: 'text' },
  { section: 'Правое яичко', name: 'yai_pr_forma', label: 'Форма', type: 'text' },
  { section: 'Правое яичко', name: 'yai_pr_kontur', label: 'Контур', type: 'text' },
  { section: 'Правое яичко', name: 'yai_pr_kapsula', label: 'Капсула', type: 'text' },
  { section: 'Правое яичко', name: 'yai_pr_dlina', label: 'Длина', type: 'number', unit: 'мм' },
  { section: 'Правое яичко', name: 'yai_pr_tolshina', label: 'Толщина', type: 'number', unit: 'мм' },
  { section: 'Правое яичко', name: 'yai_pr_shirina', label: 'Ширина', type: 'number', unit: 'мм' },
  { section: 'Правое яичко', name: 'yai_pr_obyom', label: 'Объём', type: 'number', unit: 'см³' },
  { section: 'Правое яичко', name: 'yai_pr_exostruktura', label: 'Эхоструктура', type: 'text' },
  { section: 'Правое яичко', name: 'yai_pr_exogennost', label: 'Эхогенность', type: 'text' },
  { section: 'Правое яичко', name: 'yai_pr_vlagalishe', label: 'Влагалищная оболочка', type: 'number', unit: 'мм' },
  { section: 'Правое яичко', name: 'yai_pr_obolochki', label: 'Оболочки', type: 'number', unit: 'мм' },
  { section: 'Правое яичко', name: 'yai_pr_rasshireniya', label: 'Расширения', type: 'number', unit: 'мм' },
  // Левое яичко
  { section: 'Левое яичко', name: 'yai_le_topografiya', label: 'Топография', type: 'text' },
  { section: 'Левое яичко', name: 'yai_le_forma', label: 'Форма', type: 'text' },
  { section: 'Левое яичко', name: 'yai_le_kontur', label: 'Контур', type: 'text' },
  { section: 'Левое яичко', name: 'yai_le_kapsula', label: 'Капсула', type: 'text' },
  { section: 'Левое яичко', name: 'yai_le_dlina', label: 'Длина', type: 'number', unit: 'мм' },
  { section: 'Левое яичко', name: 'yai_le_tolshina', label: 'Толщина', type: 'number', unit: 'мм' },
  { section: 'Левое яичко', name: 'yai_le_shirina', label: 'Ширина', type: 'number', unit: 'мм' },
  { section: 'Левое яичко', name: 'yai_le_obyom', label: 'Объём', type: 'number', unit: 'см³' },
  { section: 'Левое яичко', name: 'yai_le_exostruktura', label: 'Эхоструктура', type: 'text' },
  { section: 'Левое яичко', name: 'yai_le_exogennost', label: 'Эхогенность', type: 'text' },
  { section: 'Левое яичко', name: 'yai_le_vlagalishe', label: 'Влагалищная оболочка', type: 'number', unit: 'мм' },
  { section: 'Левое яичко', name: 'yai_le_obolochki', label: 'Оболочки', type: 'number', unit: 'мм' },
  { section: 'Левое яичко', name: 'yai_le_rasshireniya', label: 'Расширения', type: 'number', unit: 'мм' },
  // Правый придаток
  { section: 'Правый придаток', name: 'pri_pr_topografiya', label: 'Топография', type: 'text' },
  { section: 'Правый придаток', name: 'pri_pr_kontur', label: 'Контур', type: 'text' },
  { section: 'Правый придаток', name: 'pri_pr_golovki', label: 'Головки', type: 'number', unit: 'мм' },
  { section: 'Правый придаток', name: 'pri_pr_tela', label: 'Тела', type: 'number', unit: 'мм' },
  { section: 'Правый придаток', name: 'pri_pr_exostruktura', label: 'Эхоструктура', type: 'text' },
  { section: 'Правый придаток', name: 'pri_pr_exogennost', label: 'Эхогенность', type: 'text' },
  // Левый придаток
  { section: 'Левый придаток', name: 'pri_le_topografiya', label: 'Топография', type: 'text' },
  { section: 'Левый придаток', name: 'pri_le_kontur', label: 'Контур', type: 'text' },
  { section: 'Левый придаток', name: 'pri_le_golovki', label: 'Головки', type: 'number', unit: 'мм' },
  { section: 'Левый придаток', name: 'pri_le_tela', label: 'Тела', type: 'number', unit: 'мм' },
  { section: 'Левый придаток', name: 'pri_le_exostruktura', label: 'Эхоструктура', type: 'text' },
  { section: 'Левый придаток', name: 'pri_le_exogennost', label: 'Эхогенность', type: 'text' },
  // Заключение
  { section: 'Заключение', name: 'zaklyuchenie', label: 'Заключение', type: 'textarea' },
  { section: 'Заключение', name: 'rekomendatsi', label: 'Рекомендации', type: 'textarea' },
];

// ============================================================
// 2. ЩИТОВИДНАЯ ЖЕЛЕЗА (Shitavitka)
// ============================================================
const shitavitkaFields: ProtocolField[] = [
  { section: 'Правая доля', name: 'dp_topografiya', label: 'Топография', type: 'text' },
  { section: 'Правая доля', name: 'dp_forma', label: 'Форма', type: 'text' },
  { section: 'Правая доля', name: 'dp_kontur', label: 'Контур', type: 'text' },
  { section: 'Правая доля', name: 'dp_ehogennost', label: 'Эхогенность', type: 'text' },
  { section: 'Правая доля', name: 'dp_ehostruktura', label: 'Эхоструктура', type: 'text' },
  { section: 'Правая доля', name: 'dp_elastichnost', label: 'Эластичность', type: 'text' },
  { section: 'Правая доля', name: 'dp_podvijnost', label: 'Подвижность', type: 'text' },
  { section: 'Правая доля', name: 'dp_dlina', label: 'Длина', type: 'number', unit: 'мм' },
  { section: 'Правая доля', name: 'dp_tolshina', label: 'Толщина', type: 'number', unit: 'мм' },
  { section: 'Правая доля', name: 'dp_shirina', label: 'Ширина', type: 'number', unit: 'мм' },
  { section: 'Левая доля', name: 'dl_topografiya', label: 'Топография', type: 'text' },
  { section: 'Левая доля', name: 'dl_forma', label: 'Форма', type: 'text' },
  { section: 'Левая доля', name: 'dl_kontur', label: 'Контур', type: 'text' },
  { section: 'Левая доля', name: 'dl_ehogennost', label: 'Эхогенность', type: 'text' },
  { section: 'Левая доля', name: 'dl_ehostruktura', label: 'Эхоструктура', type: 'text' },
  { section: 'Левая доля', name: 'dl_elastichnost', label: 'Эластичность', type: 'text' },
  { section: 'Левая доля', name: 'dl_podvijnost', label: 'Подвижность', type: 'text' },
  { section: 'Левая доля', name: 'dl_dlina', label: 'Длина', type: 'number', unit: 'мм' },
  { section: 'Левая доля', name: 'dl_tolshina', label: 'Толщина', type: 'number', unit: 'мм' },
  { section: 'Левая доля', name: 'dl_shirina', label: 'Ширина', type: 'number', unit: 'мм' },
  { section: 'Перешеек', name: 'p_topografiya', label: 'Топография', type: 'text' },
  { section: 'Перешеек', name: 'p_kontur', label: 'Контур', type: 'text' },
  { section: 'Перешеек', name: 'p_ehogennost', label: 'Эхогенность', type: 'text' },
  { section: 'Перешеек', name: 'p_ehostruktura', label: 'Эхоструктура', type: 'text' },
  { section: 'Перешеек', name: 'p_elastichnost', label: 'Эластичность', type: 'text' },
  { section: 'Перешеек', name: 'p_podvijnost', label: 'Подвижность', type: 'text' },
  { section: 'Перешеек', name: 'p_razmer', label: 'Размер', type: 'number', unit: 'мм' },
  { section: 'Суммарные данные', name: 'kg', label: 'КГ', type: 'text' },
  { section: 'Суммарные данные', name: 'sm', label: 'СМ', type: 'text' },
  { section: 'Суммарные данные', name: 'summarniy', label: 'Суммарный объём', type: 'number', unit: 'см³' },
  { section: 'Заключение', name: 'zaklyuchenie_sh', label: 'Заключение', type: 'textarea' },
  { section: 'Заключение', name: 'rekomendatsi_sh', label: 'Рекомендации', type: 'textarea' },
];

// ============================================================
// 3. СЕЛЕЗЁНКА (Selezenka)
// ============================================================
const selezenkaFields: ProtocolField[] = [
  { section: 'Данные', name: 'p_dannie_selezenki', label: 'Данные', type: 'text' },
  { section: 'Данные', name: 'p_topografiya_selezenki', label: 'Топография', type: 'text' },
  { section: 'Данные', name: 'p_forma_selezenki', label: 'Форма', type: 'text' },
  { section: 'Данные', name: 'p_kontur_selezenki', label: 'Контур', type: 'text' },
  { section: 'Данные', name: 'p_ehogennost_selezenki', label: 'Эхогенность', type: 'text' },
  { section: 'Данные', name: 'p_ehostruktura_selezenki', label: 'Эхоструктура', type: 'text' },
  { section: 'Данные', name: 'p_arxitektonika_selezenki', label: 'Архитектоника', type: 'text' },
  { section: 'Данные', name: 'p_zvuk_selezenki', label: 'Звукопроводимость', type: 'text' },
  { section: 'Размеры', name: 'p_dlina_selezenki', label: 'Длина', type: 'number', unit: 'мм' },
  { section: 'Размеры', name: 'p_tolshina_selezenki', label: 'Толщина', type: 'number', unit: 'мм' },
  { section: 'Размеры', name: 'p_shirina_selezenki', label: 'Ширина', type: 'number', unit: 'мм' },
  { section: 'Размеры', name: 'p_obyom_selezenki', label: 'Объём', type: 'number', unit: 'см³' },
  { section: 'Размеры', name: 'p_index_selezenki', label: 'Индекс', type: 'text' },
  { section: 'Заключение', name: 'zaklyuchenie_selezenki', label: 'Заключение', type: 'textarea' },
  { section: 'Заключение', name: 'rekomendatsi_selezenki', label: 'Рекомендации', type: 'textarea' },
];

// ============================================================
// 4. КОЛЕННЫЙ СУСТАВ
// ============================================================
const kolenniySustavFields: ProtocolField[] = [
  { section: 'Суставная щель правая', name: 'sjp_sheli', label: 'Суставная щель', type: 'number', unit: 'мм' },
  { section: 'Суставная щель правая', name: 'sjp_ehogennost', label: 'Эхогенность', type: 'text' },
  { section: 'Суставная щель правая', name: 'sjp_tolshina', label: 'Толщина', type: 'number', unit: 'мм' },
  { section: 'Суставная щель левая', name: 'sjl_sheli', label: 'Суставная щель', type: 'number', unit: 'мм' },
  { section: 'Суставная щель левая', name: 'sjl_ehogennost', label: 'Эхогенность', type: 'text' },
  { section: 'Суставная щель левая', name: 'sjl_tolshina', label: 'Толщина', type: 'number', unit: 'мм' },
  { section: 'Гиалиновый хрящ', name: 'gx_tolshina', label: 'Толщина', type: 'number', unit: 'мм' },
  { section: 'Гиалиновый хрящ', name: 'gx_kontur', label: 'Контур', type: 'text' },
  { section: 'Гиалиновый хрящ', name: 'gx_ehogennost', label: 'Эхогенность', type: 'text' },
  { section: 'Гиалиновый хрящ', name: 'gx_ehostruktura', label: 'Эхоструктура', type: 'text' },
  { section: 'Мягкие ткани', name: 'mt_mishtsi', label: 'Мышцы', type: 'text' },
  { section: 'Мягкие ткани', name: 'mt_prostranstvo', label: 'Пространство', type: 'text' },
  { section: 'Мягкие ткани', name: 'mt_ehogennost', label: 'Эхогенность', type: 'text' },
  { section: 'Мягкие ткани', name: 'mt_ehostruktura', label: 'Эхоструктура', type: 'text' },
  { section: 'Мягкие ткани', name: 'mt_kontur', label: 'Контур', type: 'text' },
  { section: 'Мягкие ткани', name: 'mt_tolshina', label: 'Толщина', type: 'number', unit: 'мм' },
  { section: 'Мягкие ткани', name: 'mt_lateralnaya', label: 'Латеральная', type: 'text' },
  { section: 'Мягкие ткани', name: 'mt_medilnaya', label: 'Медиальная', type: 'text' },
  { section: 'Размеры', name: 'ks_bedrennaya', label: 'Бедренная', type: 'text' },
  { section: 'Размеры', name: 'ks_bolsheber', label: 'Большеберцовая', type: 'text' },
  { section: 'Размеры', name: 'ks_nadkolennik', label: 'Надколенник', type: 'text' },
  // Мениски правые
  { section: 'Мениск медиальный правый', name: 'mmp_forma', label: 'Форма', type: 'text' },
  { section: 'Мениск медиальный правый', name: 'mmp_kontur', label: 'Контур', type: 'text' },
  { section: 'Мениск медиальный правый', name: 'mmp_ehogennost', label: 'Эхогенность', type: 'text' },
  { section: 'Мениск медиальный правый', name: 'mmp_ehostruktura', label: 'Эхоструктура', type: 'text' },
  { section: 'Мениск латеральный правый', name: 'mlp_forma', label: 'Форма', type: 'text' },
  { section: 'Мениск латеральный правый', name: 'mlp_kontur', label: 'Контур', type: 'text' },
  { section: 'Мениск латеральный правый', name: 'mlp_ehogennost', label: 'Эхогенность', type: 'text' },
  { section: 'Мениск латеральный правый', name: 'mlp_ehostruktura', label: 'Эхоструктура', type: 'text' },
  // Мениски левые
  { section: 'Мениск медиальный левый', name: 'mmz_forma', label: 'Форма', type: 'text' },
  { section: 'Мениск медиальный левый', name: 'mmz_kontur', label: 'Контур', type: 'text' },
  { section: 'Мениск медиальный левый', name: 'mmz_ehogennost', label: 'Эхогенность', type: 'text' },
  { section: 'Мениск медиальный левый', name: 'mmz_ehostruktura', label: 'Эхоструктура', type: 'text' },
  { section: 'Мениск латеральный левый', name: 'mlz_forma', label: 'Форма', type: 'text' },
  { section: 'Мениск латеральный левый', name: 'mlz_kontur', label: 'Контур', type: 'text' },
  { section: 'Мениск латеральный левый', name: 'mlz_ehogennost', label: 'Эхогенность', type: 'text' },
  { section: 'Мениск латеральный левый', name: 'mlz_ehostruktura', label: 'Эхоструктура', type: 'text' },
  { section: 'Заключение', name: 'zaklyuchenie_kolenni_sustav', label: 'Заключение', type: 'textarea' },
  { section: 'Заключение', name: 'rekomendatsi_kolenni_sustav', label: 'Рекомендации', type: 'textarea' },
];

// ============================================================
// 5. НАДПОЧЕЧНИКИ
// ============================================================
const nadpochechnikiFields: ProtocolField[] = [
  { section: 'Правый надпочечник', name: 'pr_topografiya_nadpochechniki', label: 'Топография', type: 'text' },
  { section: 'Правый надпочечник', name: 'pr_forma_nadpochechniki', label: 'Форма', type: 'text' },
  { section: 'Правый надпочечник', name: 'pr_exogennost_nadpochechniki', label: 'Эхогенность', type: 'text' },
  { section: 'Правый надпочечник', name: 'pr_struktura_nadpochechniki', label: 'Структура', type: 'text' },
  { section: 'Правый надпочечник', name: 'pr_prodolniy_nadpochechniki', label: 'Продольный размер', type: 'number', unit: 'мм' },
  { section: 'Правый надпочечник', name: 'pr_poperechniy_nadpochechniki', label: 'Поперечный размер', type: 'number', unit: 'мм' },
  { section: 'Правый надпочечник', name: 'pr_tolshina_nadpochechniki', label: 'Толщина', type: 'number', unit: 'мм' },
  { section: 'Правый надпочечник', name: 'pr_ploshad_nadpochechniki', label: 'Площадь', type: 'number', unit: 'см²' },
  { section: 'Правый надпочечник', name: 'pr_index_nadpochechniki', label: 'Индекс', type: 'text' },
  { section: 'Левый надпочечник', name: 'lv_topografiya_nadpochechniki', label: 'Топография', type: 'text' },
  { section: 'Левый надпочечник', name: 'lv_forma_nadpochechniki', label: 'Форма', type: 'text' },
  { section: 'Левый надпочечник', name: 'lv_exogennost_nadpochechniki', label: 'Эхогенность', type: 'text' },
  { section: 'Левый надпочечник', name: 'lv_struktura_nadpochechniki', label: 'Структура', type: 'text' },
  { section: 'Левый надпочечник', name: 'lv_prodolniy_nadpochechniki', label: 'Продольный размер', type: 'number', unit: 'мм' },
  { section: 'Левый надпочечник', name: 'lv_poperechniy_nadpochechniki', label: 'Поперечный размер', type: 'number', unit: 'мм' },
  { section: 'Левый надпочечник', name: 'lv_tolshina_nadpochechniki', label: 'Толщина', type: 'number', unit: 'мм' },
  { section: 'Левый надпочечник', name: 'lv_ploshad_nadpochechniki', label: 'Площадь', type: 'number', unit: 'см²' },
  { section: 'Левый надпочечник', name: 'lv_index_nadpochechniki', label: 'Индекс', type: 'text' },
  { section: 'Заключение', name: 'zaklyuchenie_nadpochechniki', label: 'Заключение', type: 'textarea' },
  { section: 'Заключение', name: 'rekomendatsi_nadpochechniki', label: 'Рекомендации', type: 'textarea' },
];

// ============================================================
// 6. ПЕРВЫЙ ТРИМЕСТР
// ============================================================
const perviyTrimestrFields: ProtocolField[] = [
  { section: 'Плодное яйцо', name: 'py_topografiya_tri_ber', label: 'Топография', type: 'text' },
  { section: 'Плодное яйцо', name: 'py_forma_tri_ber', label: 'Форма', type: 'text' },
  { section: 'Плодное яйцо', name: 'py_kolichestvo_tri_ber', label: 'Количество', type: 'text' },
  { section: 'Плодное яйцо', name: 'py_diametr_tri_ber', label: 'Диаметр', type: 'number', unit: 'мм' },
  { section: 'Плодное яйцо', name: 'py_ned_tri_ber', label: 'Недели', type: 'text' },
  { section: 'Плодное яйцо', name: 'py_dnya_tri_ber', label: 'Дни', type: 'text' },
  { section: 'Желточный мешочек', name: 'jm_meshochek_tri_ber', label: 'Желточный мешочек', type: 'text' },
  { section: 'Желточный мешочек', name: 'jm_diametr_tri_ber', label: 'Диаметр', type: 'number', unit: 'мм' },
  { section: 'Эмбрион', name: 'em_embrion_tri_ber', label: 'Эмбрион', type: 'text' },
  { section: 'Эмбрион', name: 'em_kolichestvo_tri_ber', label: 'Количество', type: 'text' },
  { section: 'Эмбрион', name: 'em_tolshina_tri_ber', label: 'КТР', type: 'number', unit: 'мм' },
  { section: 'Эмбрион', name: 'em_ned_tri_ber', label: 'Недели', type: 'text' },
  { section: 'Эмбрион', name: 'em_dnya_tri_ber', label: 'Дни', type: 'text' },
  { section: 'Эмбрион', name: 'em_serdtse_tri_ber', label: 'Сердцебиение', type: 'text' },
  { section: 'Эмбрион', name: 'em_udar_tri_ber', label: 'Ударов/мин', type: 'number', unit: 'уд/мин' },
  { section: 'Матка', name: 'mt_dlina_tri_ber', label: 'Длина', type: 'number', unit: 'мм' },
  { section: 'Матка', name: 'mt_shirina_tri_ber', label: 'Ширина', type: 'number', unit: 'мм' },
  { section: 'Матка', name: 'mt_tolshina_tri_ber', label: 'Толщина', type: 'number', unit: 'мм' },
  { section: 'Матка', name: 'mt_kontur_tri_ber', label: 'Контур', type: 'text' },
  { section: 'Матка', name: 'mt_ehostruktura_tri_ber', label: 'Эхоструктура', type: 'text' },
  { section: 'Матка', name: 'mt_osobennosti_tri_ber', label: 'Особенности', type: 'text' },
  { section: 'Хорион', name: 'uh_lokalizatsiya_tri_ber', label: 'Локализация', type: 'text' },
  { section: 'Хорион', name: 'uh_tolshina_tri_ber', label: 'Толщина', type: 'number', unit: 'мм' },
  { section: 'Хорион', name: 'uh_osobennosti_tri_ber', label: 'Особенности', type: 'text' },
  { section: 'Прогноз', name: 'pr_razmer_tri_ber', label: 'Размер', type: 'text' },
  { section: 'Прогноз', name: 'pr_ned_tri_ber', label: 'Срок (нед)', type: 'text' },
  { section: 'Прогноз', name: 'pr_dnya_tri_ber', label: 'Срок (дн)', type: 'text' },
  { section: 'Прогноз', name: 'pr_datapervogo_tri_ber', label: 'Дата первого дня', type: 'text' },
  { section: 'Прогноз', name: 'pr_datarodov_tri_ber', label: 'Дата родов', type: 'text' },
  { section: 'Заключение', name: 'zaklyuchenie_tri_ber', label: 'Заключение', type: 'textarea' },
  { section: 'Заключение', name: 'rekomendatsi_tri_ber', label: 'Рекомендации', type: 'textarea' },
];

// ============================================================
// 7. ФОЛЛИКУЛОМЕТРИЯ
// ============================================================
const follikulometriyaFields: ProtocolField[] = [
  { section: 'Правый яичник', name: 'p_mm1_follik', label: 'Фолликул 1', type: 'number', unit: 'мм' },
  { section: 'Правый яичник', name: 'p_mm2_follik', label: 'Фолликул 2', type: 'number', unit: 'мм' },
  { section: 'Правый яичник', name: 'p_mm3_follik', label: 'Фолликул 3', type: 'number', unit: 'мм' },
  { section: 'Левый яичник', name: 'l_mm1_follik', label: 'Фолликул 1', type: 'number', unit: 'мм' },
  { section: 'Левый яичник', name: 'l_mm2_follik', label: 'Фолликул 2', type: 'number', unit: 'мм' },
  { section: 'Левый яичник', name: 'l_mm3_follik', label: 'Фолликул 3', type: 'number', unit: 'мм' },
  { section: 'Матка', name: 'f_tolshina_follik', label: 'Толщина эндометрия', type: 'number', unit: 'мм' },
  { section: 'Матка', name: 'jidkost_follik', label: 'Жидкость', type: 'text' },
  { section: 'Заключение', name: 'zaklyuchenie_follik', label: 'Заключение', type: 'textarea' },
  { section: 'Заключение', name: 'rekomendatsi_follik', label: 'Рекомендации', type: 'textarea' },
];

// ============================================================
// 8. ПЕЧЕНЬ БЛАНК
// ============================================================
const pechenBlankFields: ProtocolField[] = [
  { section: 'Печень', name: 'p_topografiya_pechen_blank', label: 'Топография', type: 'text' },
  { section: 'Печень', name: 'p_kontur_pechen_blank', label: 'Контур', type: 'text' },
  { section: 'Печень', name: 'p_ehogennost_pechen_blank', label: 'Эхогенность', type: 'text' },
  { section: 'Печень', name: 'p_ehostruktura_pechen_blank', label: 'Эхоструктура', type: 'text' },
  { section: 'Печень', name: 'p_zvuk_pechen_blank', label: 'Звукопроводимость', type: 'text' },
  { section: 'Размеры печени', name: 'p_pzrpravoy_pechen_blank', label: 'ПЗР правой доли', type: 'number', unit: 'мм' },
  { section: 'Размеры печени', name: 'p_pzrlevoy_pechen_blank', label: 'ПЗР левой доли', type: 'number', unit: 'мм' },
  { section: 'Размеры печени', name: 'p_pzrhvostatoy_pechen_blank', label: 'ПЗР хвостатой доли', type: 'number', unit: 'мм' },
  { section: 'Размеры печени', name: 'p_kkrpravoy_pechen_blank', label: 'ККР правой доли', type: 'number', unit: 'мм' },
  { section: 'Размеры печени', name: 'p_kkrlevoy_pechen_blank', label: 'ККР левой доли', type: 'number', unit: 'мм' },
  { section: 'Размеры печени', name: 'p_kvrpravoy_pechen_blank', label: 'КВР правой доли', type: 'number', unit: 'мм' },
  { section: 'Размеры печени', name: 'p_nijniypr_pechen_blank', label: 'Нижний угол правой', type: 'text' },
  { section: 'Размеры печени', name: 'p_nijniylv_pechen_blank', label: 'Нижний угол левой', type: 'text' },
  { section: 'Размеры печени', name: 'p_massa_pechen_blank', label: 'Масса', type: 'number', unit: 'г' },
  { section: 'Размеры печени', name: 'p_obyom_pechen_blank', label: 'Объём', type: 'number', unit: 'см³' },
  { section: 'Сосуды', name: 's_portalnaya_pechen_blank', label: 'Портальная вена', type: 'number', unit: 'мм' },
  { section: 'Сосуды', name: 's_dolevie_pechen_blank', label: 'Долевые вены', type: 'text' },
  { section: 'Сосуды', name: 's_diametr_pechen_blank', label: 'Диаметр', type: 'number', unit: 'мм' },
  { section: 'Сосуды', name: 's_nijnyaya_pechen_blank', label: 'Нижняя полая вена', type: 'text' },
  { section: 'Желчные протоки', name: 'jpr_vnutr_pechen_blank', label: 'Внутрипечёночные', type: 'text' },
  { section: 'Желчный пузырь', name: 'jpu_topografiya_pechen_blank', label: 'Топография', type: 'text' },
  { section: 'Желчный пузырь', name: 'jpu_forma_pechen_blank', label: 'Форма', type: 'text' },
  { section: 'Желчный пузырь', name: 'jpu_kontur_pechen_blank', label: 'Контур', type: 'text' },
  { section: 'Желчный пузырь', name: 'jpu_dlina_pechen_blank', label: 'Длина', type: 'number', unit: 'мм' },
  { section: 'Желчный пузырь', name: 'jpu_shirina_pechen_blank', label: 'Ширина', type: 'number', unit: 'мм' },
  { section: 'Желчный пузырь', name: 'jpu_tolshina_pechen_blank', label: 'Толщина стенки', type: 'number', unit: 'мм' },
  { section: 'Желчный пузырь', name: 'jpu_stenki_pechen_blank', label: 'Стенки', type: 'text' },
  { section: 'Желчный пузырь', name: 'jpu_soderjimoe_pechen_blank', label: 'Содержимое', type: 'text' },
  { section: 'Желчный пузырь', name: 'jpu_obyom_pechen_blank', label: 'Объём', type: 'number', unit: 'мл' },
  { section: 'Желчный пузырь', name: 'jpu_ploshad_pechen_blank', label: 'Площадь', type: 'number', unit: 'см²' },
  { section: 'Желчный пузырь', name: 'jpu_protok_pechen_blank', label: 'Проток', type: 'text' },
  { section: 'Желчный пузырь', name: 'jpr_jelchniy_pechen_blank', label: 'Общий желчный проток', type: 'text' },
  { section: 'Заключение', name: 'zaklyuchenie_pechen_blank', label: 'Заключение', type: 'textarea' },
  { section: 'Заключение', name: 'rekomendatsi_pechen_blank', label: 'Рекомендации', type: 'textarea' },
];

// ============================================================
// 9. ПОЧКИ БЛАНК
// ============================================================
const pochkiBlankFields: ProtocolField[] = [
  { section: 'Правая почка', name: 'pp_topografiya_pochki_blank', label: 'Топография', type: 'text' },
  { section: 'Правая почка', name: 'pp_forma_pochki_blank', label: 'Форма', type: 'text' },
  { section: 'Правая почка', name: 'pp_kontur_pochki_blank', label: 'Контур', type: 'text' },
  { section: 'Правая почка', name: 'pp_ehogennost_pochki_blank', label: 'Эхогенность', type: 'text' },
  { section: 'Правая почка', name: 'pp_ehostruktura_pochki_blank', label: 'Эхоструктура', type: 'text' },
  { section: 'Правая почка', name: 'pp_dlina_pochki_blank', label: 'Длина', type: 'number', unit: 'мм' },
  { section: 'Правая почка', name: 'pp_shirina_pochki_blank', label: 'Ширина', type: 'number', unit: 'мм' },
  { section: 'Правая почка', name: 'pp_tolshina_pochki_blank', label: 'Толщина', type: 'number', unit: 'мм' },
  { section: 'Правая почка', name: 'pp_obyom_pochki_blank', label: 'Объём', type: 'number', unit: 'см³' },
  { section: 'Правая почка', name: 'pp_parenhimi_pochki_blank', label: 'Паренхима', type: 'number', unit: 'мм' },
  { section: 'Правая почка', name: 'pp_kortiko_pochki_blank', label: 'Корково-мозговой индекс', type: 'text' },
  { section: 'Правая почка', name: 'pp_fibroznaya_pochki_blank', label: 'Фиброзная капсула', type: 'text' },
  { section: 'Правая почка', name: 'pp_jirovaya_pochki_blank', label: 'Жировая капсула', type: 'text' },
  { section: 'Правая почка', name: 'pp_podjivnost_pochki_blank', label: 'Подвижность', type: 'text' },
  { section: 'Правая почка', name: 'pp_sostoyanie_pochki_blank', label: 'Состояние паренхимы', type: 'text' },
  { section: 'Правая почка', name: 'pp_chls_pochki_blank', label: 'ЧЛС', type: 'text' },
  { section: 'Правая почка', name: 'pp_mm_pochki_blank', label: 'Размер ЧЛС', type: 'number', unit: 'мм' },
  { section: 'Правая почка', name: 'pp_mochetochnik_pochki_blank', label: 'Мочеточник', type: 'text' },
  { section: 'Левая почка', name: 'pl_topografiya_pochki_blank', label: 'Топография', type: 'text' },
  { section: 'Левая почка', name: 'pl_forma_pochki_blank', label: 'Форма', type: 'text' },
  { section: 'Левая почка', name: 'pl_kontur_pochki_blank', label: 'Контур', type: 'text' },
  { section: 'Левая почка', name: 'pl_ehogennost_pochki_blank', label: 'Эхогенность', type: 'text' },
  { section: 'Левая почка', name: 'pl_ehostruktura_pochki_blank', label: 'Эхоструктура', type: 'text' },
  { section: 'Левая почка', name: 'pl_dlina_pochki_blank', label: 'Длина', type: 'number', unit: 'мм' },
  { section: 'Левая почка', name: 'pl_shirina_pochki_blank', label: 'Ширина', type: 'number', unit: 'мм' },
  { section: 'Левая почка', name: 'pl_tolshina_pochki_blank', label: 'Толщина', type: 'number', unit: 'мм' },
  { section: 'Левая почка', name: 'pl_obyom_pochki_blank', label: 'Объём', type: 'number', unit: 'см³' },
  { section: 'Левая почка', name: 'pl_parenhimi_pochki_blank', label: 'Паренхима', type: 'number', unit: 'мм' },
  { section: 'Левая почка', name: 'pl_kortiko_pochki_blank', label: 'Корково-мозговой индекс', type: 'text' },
  { section: 'Левая почка', name: 'pl_fibroznaya_pochki_blank', label: 'Фиброзная капсула', type: 'text' },
  { section: 'Левая почка', name: 'pl_jirovaya_pochki_blank', label: 'Жировая капсула', type: 'text' },
  { section: 'Левая почка', name: 'pl_podjivnost_pochki_blank', label: 'Подвижность', type: 'text' },
  { section: 'Левая почка', name: 'pl_sostoyanie_pochki_blank', label: 'Состояние паренхимы', type: 'text' },
  { section: 'Левая почка', name: 'pl_chls_pochki_blank', label: 'ЧЛС', type: 'text' },
  { section: 'Левая почка', name: 'pl_mm_pochki_blank', label: 'Размер ЧЛС', type: 'number', unit: 'мм' },
  { section: 'Левая почка', name: 'pl_mochetochnik_pochki_blank', label: 'Мочеточник', type: 'text' },
  { section: 'Мочевой пузырь', name: 'mp_chastota_pochki_blank', label: 'Частота', type: 'text' },
  { section: 'Мочевой пузырь', name: 'mp_dannie_pochki_blank', label: 'Данные', type: 'text' },
  { section: 'Мочевой пузырь', name: 'mp_forma_pochki_blank', label: 'Форма', type: 'text' },
  { section: 'Мочевой пузырь', name: 'mp_lokalizatsiya_pochki_blank', label: 'Локализация', type: 'text' },
  { section: 'Мочевой пузырь', name: 'mp_narujniy_pochki_blank', label: 'Наружный контур', type: 'text' },
  { section: 'Мочевой пузырь', name: 'mp_vnutrenniy_pochki_blank', label: 'Внутренний контур', type: 'text' },
  { section: 'Мочевой пузырь', name: 'mp_sheyk_pochki_blank', label: 'Шейка', type: 'text' },
  { section: 'Мочевой пузырь', name: 'mp_soderjimoe_pochki_blank', label: 'Содержимое', type: 'text' },
  { section: 'Мочевой пузырь', name: 'mp_nalichie_pochki_blank', label: 'Наличие', type: 'text' },
  { section: 'Мочевой пузырь', name: 'mp_mm1_pochki_blank', label: 'Размер 1', type: 'number', unit: 'мм' },
  { section: 'Мочевой пузырь', name: 'mp_mm2_pochki_blank', label: 'Размер 2', type: 'number', unit: 'мм' },
  { section: 'Мочевой пузырь', name: 'mp_obyom_pochki_blank', label: 'Объём', type: 'number', unit: 'мл' },
  { section: 'Мочевой пузырь', name: 'mp_obyom2_pochki_blank', label: 'Остаточный объём', type: 'number', unit: 'мл' },
  { section: 'Заключение', name: 'zaklyuchenie_pochki_blank', label: 'Заключение', type: 'textarea' },
  { section: 'Заключение', name: 'rekomendatsi_pochki_blank', label: 'Рекомендации', type: 'textarea' },
];

// ============================================================
// 10. МАЛЫЙ ТАЗ БЛАНК
// ============================================================
const maliyTazBlankFields: ProtocolField[] = [
  { section: 'Данные', name: 'p_data_mal_taz', label: 'Дата последних месячных', type: 'text' },
  { section: 'Данные', name: 'p_data2_mal_taz', label: 'Дата менструации', type: 'text' },
  { section: 'Данные', name: 'p_menopauza_mal_taz', label: 'Менопауза', type: 'text' },
  { section: 'Матка', name: 'm_polojeniye_mal_taz', label: 'Положение', type: 'text' },
  { section: 'Матка', name: 'm_pozitsiya_mal_taz', label: 'Позиция', type: 'text' },
  { section: 'Матка', name: 'm_forma_mal_taz', label: 'Форма', type: 'text' },
  { section: 'Матка', name: 'm_kontur_mal_taz', label: 'Контур', type: 'text' },
  { section: 'Матка', name: 'm_ehogennost_mal_taz', label: 'Эхогенность', type: 'text' },
  { section: 'Матка', name: 'm_ehostruktura_mal_taz', label: 'Эхоструктура', type: 'text' },
  { section: 'Матка', name: 'm_dlina_mal_taz', label: 'Длина', type: 'number', unit: 'мм' },
  { section: 'Матка', name: 'm_shirina_mal_taz', label: 'Ширина', type: 'number', unit: 'мм' },
  { section: 'Матка', name: 'm_tolshina_mal_taz', label: 'Толщина', type: 'number', unit: 'мм' },
  { section: 'Матка', name: 'm_obyom_mal_taz', label: 'Объём', type: 'number', unit: 'см³' },
  { section: 'Матка', name: 'm_peredney_mal_taz', label: 'Передняя стенка', type: 'number', unit: 'мм' },
  { section: 'Матка', name: 'm_zadney_mal_taz', label: 'Задняя стенка', type: 'number', unit: 'мм' },
  { section: 'Матка', name: 'm_sootnosheniye_mal_taz', label: 'Соотношение', type: 'text' },
  { section: 'Матка', name: 'm_polost_mal_taz', label: 'Полость', type: 'text' },
  { section: 'Эндометрий', name: 'm_endometriya_mal_taz', label: 'Толщина эндометрия', type: 'number', unit: 'мм' },
  { section: 'Эндометрий', name: 'm_endometriya2_mal_taz', label: 'Эхоструктура эндометрия', type: 'text' },
  { section: 'Шейка матки', name: 'shm_dlina_mal_taz', label: 'Длина', type: 'number', unit: 'мм' },
  { section: 'Шейка матки', name: 'shm_shirina_mal_taz', label: 'Ширина', type: 'number', unit: 'мм' },
  { section: 'Шейка матки', name: 'shm_tolshina_mal_taz', label: 'Толщина', type: 'number', unit: 'мм' },
  { section: 'Шейка матки', name: 'shm_kontur_mal_taz', label: 'Контур', type: 'text' },
  { section: 'Шейка матки', name: 'shm_ehogennost_mal_taz', label: 'Эхогенность', type: 'text' },
  { section: 'Шейка матки', name: 'shm_ehostruktura_mal_taz', label: 'Эхоструктура', type: 'text' },
  { section: 'Шейка матки', name: 'shm_polost_mal_taz', label: 'Полость', type: 'text' },
  { section: 'Шейка матки', name: 'shm_endotserviks_mal_taz', label: 'Эндоцервикс', type: 'number', unit: 'мм' },
  { section: 'Шейка матки', name: 'shm_endotserviks2_mal_taz', label: 'Эхоструктура эндоцервикса', type: 'text' },
  { section: 'Трубы', name: 'mtp_trubi_mal_taz', label: 'Правая труба', type: 'text' },
  { section: 'Трубы', name: 'mtl_trubi_mal_taz', label: 'Левая труба', type: 'text' },
  { section: 'Правый яичник', name: 'yp_topografiya_mal_taz', label: 'Топография', type: 'text' },
  { section: 'Правый яичник', name: 'yp_forma_mal_taz', label: 'Форма', type: 'text' },
  { section: 'Правый яичник', name: 'yp_kontur_mal_taz', label: 'Контур', type: 'text' },
  { section: 'Правый яичник', name: 'yp_ehogennost_mal_taz', label: 'Эхогенность', type: 'text' },
  { section: 'Правый яичник', name: 'yp_ehostruktura_mal_taz', label: 'Эхоструктура', type: 'text' },
  { section: 'Правый яичник', name: 'yp_dlina_mal_taz', label: 'Длина', type: 'number', unit: 'мм' },
  { section: 'Правый яичник', name: 'yp_shirina_mal_taz', label: 'Ширина', type: 'number', unit: 'мм' },
  { section: 'Правый яичник', name: 'yp_tolshina_mal_taz', label: 'Толщина', type: 'number', unit: 'мм' },
  { section: 'Правый яичник', name: 'yp_obyom_mal_taz', label: 'Объём', type: 'number', unit: 'см³' },
  { section: 'Правый яичник', name: 'yp_follikul_mal_taz', label: 'Фолликулы', type: 'text' },
  { section: 'Левый яичник', name: 'yl_topografiya_mal_taz', label: 'Топография', type: 'text' },
  { section: 'Левый яичник', name: 'yl_forma_mal_taz', label: 'Форма', type: 'text' },
  { section: 'Левый яичник', name: 'yl_kontur_mal_taz', label: 'Контур', type: 'text' },
  { section: 'Левый яичник', name: 'yl_ehogennost_mal_taz', label: 'Эхогенность', type: 'text' },
  { section: 'Левый яичник', name: 'yl_ehostruktura_mal_taz', label: 'Эхоструктура', type: 'text' },
  { section: 'Левый яичник', name: 'yl_dlina_mal_taz', label: 'Длина', type: 'number', unit: 'мм' },
  { section: 'Левый яичник', name: 'yl_shirina_mal_taz', label: 'Ширина', type: 'number', unit: 'мм' },
  { section: 'Левый яичник', name: 'yl_tolshina_mal_taz', label: 'Толщина', type: 'number', unit: 'мм' },
  { section: 'Левый яичник', name: 'yl_obyom_mal_taz', label: 'Объём', type: 'number', unit: 'см³' },
  { section: 'Левый яичник', name: 'yl_follikul_mal_taz', label: 'Фолликулы', type: 'text' },
  { section: 'Дуглас', name: 'duglasovo_mal_taz', label: 'Дугласово пространство', type: 'text' },
  { section: 'Заключение', name: 'zaklyuchenie_mal_taz', label: 'Заключение', type: 'textarea' },
  { section: 'Заключение', name: 'rekomendatsi_mal_taz', label: 'Рекомендации', type: 'textarea' },
];

// ============================================================
// 11. МОЛОЧНЫЕ ЖЕЛЕЗЫ БЛАНК
// ============================================================
const molochniyeJelezyFields: ProtocolField[] = [
  { section: 'Правая молочная железа', name: 'pp_topografiya_malochniy_jel', label: 'Топография', type: 'text' },
  { section: 'Правая молочная железа', name: 'pp_tkan_malochniy_jel', label: 'Тип ткани', type: 'text' },
  { section: 'Правая молочная железа', name: 'pp_tolshina_malochniy_jel', label: 'Толщина ткани', type: 'number', unit: 'мм' },
  { section: 'Правая молочная железа', name: 'pp_ehogennost_malochniy_jel', label: 'Эхогенность', type: 'text' },
  { section: 'Правая молочная железа', name: 'pp_ehostruktura_malochniy_jel', label: 'Эхоструктура', type: 'text' },
  { section: 'Правая молочная железа', name: 'pp_kontur_malochniy_jel', label: 'Контур', type: 'text' },
  { section: 'Правая молочная железа', name: 'pp_ehogennost2_malochniy_jel', label: 'Эхогенность (образование)', type: 'text' },
  { section: 'Правая молочная железа', name: 'pp_ehostruktura2_malochniy_jel', label: 'Эхоструктура (образование)', type: 'text' },
  { section: 'Правая молочная железа', name: 'pp_kontur2_malochniy_jel', label: 'Контур (образование)', type: 'text' },
  { section: 'Правая молочная железа', name: 'ip_intrama_malochniy_jel', label: 'Интрамаммарные л/у', type: 'text' },
  { section: 'Правая молочная железа', name: 'rp_retroma_malochniy_jel', label: 'Ретромаммарное пространство', type: 'text' },
  { section: 'Правая молочная железа', name: 'lsp_limfa_malochniy_jel', label: 'Регионарные л/у', type: 'text' },
  { section: 'Правая железистая ткань', name: 'jtp_tolshina_malochniy_jel', label: 'Толщина', type: 'number', unit: 'мм' },
  { section: 'Правая железистая ткань', name: 'jtp_ehogennost_malochniy_jel', label: 'Эхогенность', type: 'text' },
  { section: 'Правая железистая ткань', name: 'jtp_ehostruktura_malochniy_jel', label: 'Эхоструктура', type: 'text' },
  { section: 'Правая железистая ткань', name: 'jtp_galaktofori_malochniy_jel', label: 'Галактофоры', type: 'text' },
  { section: 'Правая железистая ткань', name: 'jtp_kontur_malochniy_jel', label: 'Контур', type: 'text' },
  { section: 'Левая молочная железа', name: 'pl_topografiya_malochniy_jel', label: 'Топография', type: 'text' },
  { section: 'Левая молочная железа', name: 'pl_tkan_malochniy_jel', label: 'Тип ткани', type: 'text' },
  { section: 'Левая молочная железа', name: 'pl_tolshina_malochniy_jel', label: 'Толщина ткани', type: 'number', unit: 'мм' },
  { section: 'Левая молочная железа', name: 'pl_ehogennost_malochniy_jel', label: 'Эхогенность', type: 'text' },
  { section: 'Левая молочная железа', name: 'pl_ehostruktura_malochniy_jel', label: 'Эхоструктура', type: 'text' },
  { section: 'Левая молочная железа', name: 'pl_kontur_malochniy_jel', label: 'Контур', type: 'text' },
  { section: 'Левая молочная железа', name: 'pl_ehogennost2_malochniy_jel', label: 'Эхогенность (образование)', type: 'text' },
  { section: 'Левая молочная железа', name: 'pl_ehostruktura2_malochniy_jel', label: 'Эхоструктура (образование)', type: 'text' },
  { section: 'Левая молочная железа', name: 'pl_kontur2_malochniy_jel', label: 'Контур (образование)', type: 'text' },
  { section: 'Левая молочная железа', name: 'il_intrama_malochniy_jel', label: 'Интрамаммарные л/у', type: 'text' },
  { section: 'Левая молочная железа', name: 'rl_retroma_malochniy_jel', label: 'Ретромаммарное пространство', type: 'text' },
  { section: 'Левая молочная железа', name: 'lsl_limfa_malochniy_jel', label: 'Регионарные л/у', type: 'text' },
  { section: 'Левая железистая ткань', name: 'jtl_tolshina_malochniy_jel', label: 'Толщина', type: 'number', unit: 'мм' },
  { section: 'Левая железистая ткань', name: 'jtl_ehogennost_malochniy_jel', label: 'Эхогенность', type: 'text' },
  { section: 'Левая железистая ткань', name: 'jtl_ehostruktura_malochniy_jel', label: 'Эхоструктура', type: 'text' },
  { section: 'Левая железистая ткань', name: 'jtl_galaktofori_malochniy_jel', label: 'Галактофоры', type: 'text' },
  { section: 'Левая железистая ткань', name: 'jtl_kontur_malochniy_jel', label: 'Контур', type: 'text' },
  { section: 'Заключение', name: 'zaklyuchenie_malochniy_jel', label: 'Заключение', type: 'textarea' },
  { section: 'Заключение', name: 'rekomendatsi_malochniy_jel', label: 'Рекомендации', type: 'textarea' },
];

// ============================================================
// 12. ПЛОД БЛАНК
// ============================================================
const plodBlankFields: ProtocolField[] = [
  { section: 'Плацента', name: 'pl_lokalizatsiya', label: 'Локализация', type: 'text' },
  { section: 'Плацента', name: 'pl_tolshina', label: 'Толщина', type: 'number', unit: 'мм' },
  { section: 'Плацента', name: 'pl_zrelost', label: 'Степень зрелости', type: 'text' },
  { section: 'Плацента', name: 'pl_ehogennost', label: 'Эхогенность', type: 'text' },
  { section: 'Плацента', name: 'pl_ehostruktura', label: 'Эхоструктура', type: 'text' },
  { section: 'Плацента', name: 'pl_iaj', label: 'ИАЖ', type: 'number', unit: 'мм' },
  { section: 'Плацента', name: 'pl_normovodie', label: 'Многоводие/маловодие', type: 'text' },
  { section: 'Плацента', name: 'pl_yaichniki', label: 'Яичники', type: 'text' },
  { section: 'Матка', name: 'm_kontur', label: 'Контур матки', type: 'text' },
  { section: 'Матка', name: 'm_ehostruktura', label: 'Эхоструктура', type: 'text' },
  { section: 'Матка', name: 'm_osobennosti', label: 'Особенности', type: 'text' },
  { section: 'Прогноз', name: 'pr_razmer', label: 'Размер', type: 'text' },
  { section: 'Прогноз', name: 'pr_ned', label: 'Недели', type: 'text' },
  { section: 'Прогноз', name: 'pr_dnya', label: 'Дни', type: 'text' },
  { section: 'Прогноз', name: 'pr_datapervogo', label: 'Дата первого дня', type: 'text' },
  { section: 'Прогноз', name: 'pr_datarodov', label: 'Предполагаемая дата родов', type: 'text' },
  { section: 'Плод', name: 'p_polojeniye', label: 'Положение', type: 'text' },
  { section: 'Плод', name: 'p_kolichestvo', label: 'Количество плодов', type: 'text' },
  { section: 'Плод', name: 'p_osobennosti', label: 'Особенности', type: 'text' },
  { section: 'Плод', name: 'p_serdtse', label: 'Сердцебиение', type: 'text' },
  { section: 'Плод', name: 'p_udar', label: 'Удары/мин', type: 'number', unit: 'уд/мин' },
  { section: 'Плод', name: 'p_dvijeniya', label: 'Движения', type: 'text' },
  { section: 'Плод', name: 'p_sosatel', label: 'Сосательные движения', type: 'text' },
  { section: 'Плод', name: 'p_glotatel', label: 'Глотательные движения', type: 'text' },
  { section: 'Плод', name: 'p_konechnost', label: 'Конечности', type: 'text' },
  { section: 'Плод', name: 'p_pupovina', label: 'Пуповина', type: 'text' },
  { section: 'Плод', name: 'p_index', label: 'Индекс', type: 'text' },
  { section: 'Плод', name: 'p_massa', label: 'Предполагаемая масса', type: 'number', unit: 'г' },
  { section: 'Размеры плода 1', name: 'p_diametr1', label: 'Диаметр 1', type: 'number', unit: 'мм' },
  { section: 'Размеры плода 1', name: 'p_ned1', label: 'Недели 1', type: 'text' },
  { section: 'Размеры плода 1', name: 'p_dnya1', label: 'Дни 1', type: 'text' },
  { section: 'Размеры плода 2', name: 'p_diametr2', label: 'Диаметр 2', type: 'number', unit: 'мм' },
  { section: 'Размеры плода 2', name: 'p_ned2', label: 'Недели 2', type: 'text' },
  { section: 'Размеры плода 2', name: 'p_dnya2', label: 'Дни 2', type: 'text' },
  { section: 'Размеры плода 3', name: 'p_diametr3', label: 'Диаметр 3', type: 'number', unit: 'мм' },
  { section: 'Размеры плода 3', name: 'p_ned3', label: 'Недели 3', type: 'text' },
  { section: 'Размеры плода 3', name: 'p_dnya3', label: 'Дни 3', type: 'text' },
  { section: 'Размеры плода 4', name: 'p_diametr4', label: 'Диаметр 4', type: 'number', unit: 'мм' },
  { section: 'Размеры плода 4', name: 'p_ned4', label: 'Недели 4', type: 'text' },
  { section: 'Размеры плода 4', name: 'p_dnya4', label: 'Дни 4', type: 'text' },
  { section: 'Размеры плода 5', name: 'p_diametr5', label: 'Диаметр 5', type: 'number', unit: 'мм' },
  { section: 'Размеры плода 5', name: 'p_ned5', label: 'Недели 5', type: 'text' },
  { section: 'Размеры плода 5', name: 'p_dnya5', label: 'Дни 5', type: 'text' },
  { section: 'Заключение', name: 'zaklyuchenie_kolenni_sustav', label: 'Заключение', type: 'textarea' },
  { section: 'Заключение', name: 'rekomendatsi_kolenni_sustav', label: 'Рекомендации', type: 'textarea' },
];

// ============================================================
// 13. ПОДЖЕЛУДОЧНАЯ ЖЕЛЕЗА
// ============================================================
const podjeludochnayaFields: ProtocolField[] = [
  { section: 'Поджелудочная железа', name: 'p_topografiya_padjeludoch', label: 'Топография', type: 'text' },
  { section: 'Поджелудочная железа', name: 'p_forma_padjeludoch', label: 'Форма', type: 'text' },
  { section: 'Поджелудочная железа', name: 'p_kontur_padjeludoch', label: 'Контур', type: 'text' },
  { section: 'Поджелудочная железа', name: 'p_ehogennost_padjeludoch', label: 'Эхогенность', type: 'text' },
  { section: 'Поджелудочная железа', name: 'p_ehostruktura_padjeludoch', label: 'Эхоструктура', type: 'text' },
  { section: 'Поджелудочная железа', name: 'p_zvuk_padjeludoch', label: 'Звукопроводимость', type: 'text' },
  { section: 'Размеры', name: 'p_golovki_padjeludoch', label: 'Головка', type: 'number', unit: 'мм' },
  { section: 'Размеры', name: 'p_golovki2_padjeludoch', label: 'Головка 2', type: 'number', unit: 'мм' },
  { section: 'Размеры', name: 'p_tela_padjeludoch', label: 'Тело', type: 'number', unit: 'мм' },
  { section: 'Размеры', name: 'p_tela2_padjeludoch', label: 'Тело 2', type: 'number', unit: 'мм' },
  { section: 'Размеры', name: 'p_xvost_padjeludoch', label: 'Хвост', type: 'number', unit: 'мм' },
  { section: 'Размеры', name: 'p_dlina_padjeludoch', label: 'Длина', type: 'number', unit: 'мм' },
  { section: 'Заключение', name: 'zaklyuchenie_padjeludoch', label: 'Заключение', type: 'textarea' },
  { section: 'Заключение', name: 'rekomendatsi_padjeludoch', label: 'Рекомендации', type: 'textarea' },
];

// ============================================================
// 14. ПРОСТАТА
// ============================================================
const prostataFields: ProtocolField[] = [
  { section: 'Предстательная железа', name: 'pj_topografiya', label: 'Топография', type: 'text' },
  { section: 'Предстательная железа', name: 'pj_forma', label: 'Форма', type: 'text' },
  { section: 'Предстательная железа', name: 'pj_kontur', label: 'Контур', type: 'text' },
  { section: 'Предстательная железа', name: 'pj_kapsula', label: 'Капсула', type: 'text' },
  { section: 'Предстательная железа', name: 'pj_ehogennost', label: 'Эхогенность', type: 'text' },
  { section: 'Предстательная железа', name: 'pj_ehostruktura', label: 'Эхоструктура', type: 'text' },
  { section: 'Предстательная железа', name: 'pj_prostata', label: 'Простата', type: 'text' },
  { section: 'Размеры железы', name: 'pj_dlina', label: 'Длина', type: 'number', unit: 'мм' },
  { section: 'Размеры железы', name: 'pj_shirina', label: 'Ширина', type: 'number', unit: 'мм' },
  { section: 'Размеры железы', name: 'pj_tolshina', label: 'Толщина', type: 'number', unit: 'мм' },
  { section: 'Размеры железы', name: 'pj_obyom', label: 'Объём', type: 'number', unit: 'см³' },
  { section: 'Размеры железы', name: 'pj_index', label: 'Индекс', type: 'text' },
  { section: 'Мочевой пузырь', name: 'pj_mocha1', label: 'Объём до мочеиспускания', type: 'number', unit: 'мл' },
  { section: 'Мочевой пузырь', name: 'pj_mocha2', label: 'Объём после мочеиспускания', type: 'number', unit: 'мл' },
  { section: 'Левый семенной пузырёк', name: 'sl_topografiya', label: 'Топография', type: 'text' },
  { section: 'Левый семенной пузырёк', name: 'sl_kontur', label: 'Контур', type: 'text' },
  { section: 'Левый семенной пузырёк', name: 'sl_ehogennost', label: 'Эхогенность', type: 'text' },
  { section: 'Левый семенной пузырёк', name: 'sl_dlina', label: 'Длина', type: 'number', unit: 'мм' },
  { section: 'Левый семенной пузырёк', name: 'sl_shirina', label: 'Ширина', type: 'number', unit: 'мм' },
  { section: 'Левый семенной пузырёк', name: 'sl_tolshina', label: 'Толщина', type: 'number', unit: 'мм' },
  { section: 'Левый семенной пузырёк', name: 'sl_danniye', label: 'Данные', type: 'text' },
  { section: 'Левый семенной пузырёк', name: 'sl_do', label: 'Объём до', type: 'number', unit: 'мл' },
  { section: 'Левый семенной пузырёк', name: 'sl_posle', label: 'Объём после', type: 'number', unit: 'мл' },
  { section: 'Правый семенной пузырёк', name: 'sp_topografiya', label: 'Топография', type: 'text' },
  { section: 'Правый семенной пузырёк', name: 'sp_kontur', label: 'Контур', type: 'text' },
  { section: 'Правый семенной пузырёк', name: 'sp_ehogennost', label: 'Эхогенность', type: 'text' },
  { section: 'Правый семенной пузырёк', name: 'sp_dlina', label: 'Длина', type: 'number', unit: 'мм' },
  { section: 'Правый семенной пузырёк', name: 'sp_shirina', label: 'Ширина', type: 'number', unit: 'мм' },
  { section: 'Правый семенной пузырёк', name: 'sp_tolshina', label: 'Толщина', type: 'number', unit: 'мм' },
  { section: 'Правый семенной пузырёк', name: 'sp_danniye', label: 'Данные', type: 'text' },
  { section: 'Правый семенной пузырёк', name: 'sp_do', label: 'Объём до', type: 'number', unit: 'мл' },
  { section: 'Правый семенной пузырёк', name: 'sp_posle', label: 'Объём после', type: 'number', unit: 'мл' },
  { section: 'Заключение', name: 'zaklyuchenie_kolenni_sustav', label: 'Заключение', type: 'textarea' },
  { section: 'Заключение', name: 'rekomendatsi_kolenni_sustav', label: 'Рекомендации', type: 'textarea' },
];

// ============================================================
// Barcha protokollar ro'yxati
// ============================================================
// IDs = realniy DB ID'larga mos (protocols jadvalidagi id)
// DB tartib: 1=Мошонка, 2=Щитовидная, 3=Печень, 4=Почки,
//            5=Малый таз, 6=Молочные железы, 7=Селезёнка,
//            8=Коленный сустав, 9=Надпочечники, 10=Первый триместр,
//            11=Фолликулометрия, 12=Плод, 13=Поджелудочная, 14=Простата
export const PROTOCOLS_CONFIG: ProtocolConfig[] = [
  { id: 1,  title: 'Мошонка',             fields: mashonkaFields },
  { id: 2,  title: 'Щитовидная железа',   fields: shitavitkaFields },
  { id: 3,  title: 'Печень бланк',        fields: pechenBlankFields },
  { id: 4,  title: 'Почки бланк',         fields: pochkiBlankFields },
  { id: 5,  title: 'Малый таз бланк',     fields: maliyTazBlankFields },
  { id: 6,  title: 'Молочные железы',     fields: molochniyeJelezyFields },
  { id: 7,  title: 'Селезёнка',           fields: selezenkaFields },
  { id: 8,  title: 'Коленный сустав',     fields: kolenniySustavFields },
  { id: 9,  title: 'Надпочечники',        fields: nadpochechnikiFields },
  { id: 10, title: 'Первый триместр',     fields: perviyTrimestrFields },
  { id: 11, title: 'Фолликулометрия',     fields: follikulometriyaFields },
  { id: 12, title: 'Плод бланк',          fields: plodBlankFields },
  { id: 13, title: 'Поджелудочная железа', fields: podjeludochnayaFields },
  { id: 14, title: 'Простата',            fields: prostataFields },
];

// ID bo'yicha protokol konfiguratsiyasini olish
export function getProtocolConfig(id: number): ProtocolConfig | undefined {
  return PROTOCOLS_CONFIG.find((p) => p.id === id);
}

// Seksiyalar bo'yicha guruhlash
export function getFieldsBySection(fields: ProtocolField[]): Map<string, ProtocolField[]> {
  const map = new Map<string, ProtocolField[]>();
  for (const f of fields) {
    const sec = f.section || 'Основные данные';
    if (!map.has(sec)) map.set(sec, []);
    map.get(sec)!.push(f);
  }
  return map;
}

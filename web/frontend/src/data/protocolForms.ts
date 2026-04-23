export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'combobox' | 'textarea';
  defaultValue?: string;
  unit?: string;
  hint?: string;
  options?: string[];
}

export interface FormSection {
  title: string;
  fields: FormField[];
}

export interface ProtocolFormDef {
  protocolId: number;
  sections: FormSection[];
}

// Common option arrays
const TOPOGR = ['в норме', 'изменена', 'смещена'];
const KONTUR = ['в норме', 'ровный, чёткий', 'неровный', 'нечёткий', 'неровный, нечёткий'];
const KONTURI = ['в норме', 'ровные, чёткие', 'неровные', 'нечёткие'];
const EHOGSTR = ['однородная', 'неоднородная', 'диффузно неоднородная', 'мелкозернистая'];
const EHOGEN_SR = ['средняя', 'повышенная', 'сниженная', 'гиперэхогенная', 'гипоэхогенная'];
const ZVUK = ['сохранена', 'снижена', 'повышена'];
const FORMA_VN = ['в норме', 'изменена', 'деформирована'];
const BEZ_OSB = ['без особенностей', 'с особенностями'];
const NE_VIZ = ['не визуализируется', 'визуализируется', 'расширен'];
const NE_VIZIR = ['не визуализируются', 'визуализируются'];
const ANEHOGEN = ['анэхогенное', 'с взвесью', 'с конкрементами', 'неоднородное'];

// ─── 1. УЗИ печени и желчного пузыря ─────────────────────────────────────────
const pechenProtocol: ProtocolFormDef = {
  protocolId: 1,
  sections: [
    {
      title: 'Печень',
      fields: [
        { key: 'pech_topografia', label: 'Топография', type: 'combobox', defaultValue: 'в норме', options: TOPOGR },
        { key: 'pech_konturi', label: 'Контуры', type: 'combobox', defaultValue: 'в норме', options: KONTURI },
        { key: 'pech_pzr_lev', label: 'ПЗР левой доли', type: 'text', unit: 'мм', hint: 'в норме 41–62' },
        { key: 'pech_kkr_lev', label: 'ККР левой доли', type: 'text', unit: 'мм', hint: 'в норме 65–110' },
        { key: 'pech_pzr_hvost', label: 'ПЗР хвостатой доли', type: 'text', unit: 'мм', hint: 'в норме 25–30' },
        { key: 'pech_pzr_prav', label: 'ПЗР правой доли', type: 'text', unit: 'мм', hint: 'в норме 91–140' },
        { key: 'pech_kkr_prav', label: 'ККР правой доли', type: 'text', unit: 'мм', hint: 'в норме до 145' },
        { key: 'pech_kvr', label: 'КВР', type: 'text', unit: 'мм', hint: 'в норме 17–22.2 см' },
        { key: 'pech_lat_razmer', label: 'Латерально-латеральный размер', type: 'text', unit: 'см', hint: 'в норме 17–25' },
        { key: 'pech_ugol_prav', label: 'Нижний угол правой доли', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'тупой (более 75°)'], hint: 'в норме до 75°' },
        { key: 'pech_ugol_lev', label: 'Нижний угол левой доли', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'тупой (более 45°)'], hint: 'в норме до 45°' },
        { key: 'pech_obem', label: 'Объём печени', type: 'text', unit: 'см³', hint: 'в норме 700–2000' },
        { key: 'pech_massa', label: 'Масса печени', type: 'text', unit: 'г' },
        { key: 'pech_exostruktura', label: 'Эхоструктура', type: 'combobox', defaultValue: 'однородная', options: EHOGSTR },
        { key: 'pech_exogennost', label: 'Эхогенность', type: 'combobox', defaultValue: 'средняя', options: EHOGEN_SR },
        { key: 'pech_zvukoprov', label: 'Звукопроводимость', type: 'combobox', defaultValue: 'сохранена', options: ZVUK },
      ],
    },
    {
      title: 'Сосуды',
      fields: [
        { key: 'soud_pech_veny', label: 'Долевые печёночные вены диаметром', type: 'text', unit: 'мм', hint: 'в норме до 9–11' },
        { key: 'soud_sum_diam', label: 'Суммарный диаметр', type: 'text', unit: 'мм', hint: 'в норме 27–31' },
        { key: 'soud_port_vena', label: 'Портальная вена', type: 'text', unit: 'мм', hint: 'в норме до 14' },
        { key: 'soud_nizhnyaya_pv', label: 'Нижняя полая вена', type: 'text', unit: 'мм', hint: 'в норме 20–25' },
      ],
    },
    {
      title: 'Желчные протоки',
      fields: [
        { key: 'zhp_vnutrip', label: 'Внутрипечёночные протоки', type: 'combobox', defaultValue: 'не визуализируются', options: NE_VIZIR },
        { key: 'zhp_obshchiy', label: 'Общий желчный проток', type: 'text', unit: 'мм', hint: 'в норме 4–6' },
      ],
    },
    {
      title: 'Желчный пузырь',
      fields: [
        { key: 'puz_topografia', label: 'Топография', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'смещён', 'аномальная'] },
        { key: 'puz_forma', label: 'Форма', type: 'combobox', defaultValue: 'грушевидная', options: ['грушевидная', 'изменена', 'деформирована'] },
        { key: 'puz_kontur', label: 'Контур', type: 'combobox', defaultValue: 'в норме', options: KONTUR },
        { key: 'puz_dlina', label: 'Длина', type: 'text', unit: 'мм', hint: 'в норме 40–100' },
        { key: 'puz_tolshina', label: 'Толщина', type: 'text', unit: 'мм', hint: 'в норме 10–40' },
        { key: 'puz_shirina', label: 'Ширина', type: 'text', unit: 'мм', hint: 'в норме 20–50' },
        { key: 'puz_obem', label: 'Объём', type: 'text', unit: 'см³', hint: 'в норме 8–42' },
        { key: 'puz_ploshad', label: 'Площадь по длиннику', type: 'text', unit: 'см²', hint: 'в норме 15–18' },
        { key: 'puz_protok', label: 'Пузырный проток', type: 'combobox', defaultValue: 'не визуализируется', options: NE_VIZ },
        { key: 'puz_stenka', label: 'Толщина стенки', type: 'text', unit: 'мм', hint: 'в норме до 3, у перешейка до 4' },
        { key: 'puz_soderzhimoe', label: 'Содержимое', type: 'combobox', defaultValue: 'анэхогенное', options: ANEHOGEN },
      ],
    },
    {
      title: 'Заключение',
      fields: [
        { key: 'zaklyuchenie', label: 'Заключение', type: 'textarea' },
        { key: 'rekomendacii', label: 'Рекомендации', type: 'textarea' },
      ],
    },
  ],
};

// ─── 2. УЗИ почек, мочеточников и мочевого пузыря ─────────────────────────────
const pochkiProtocol: ProtocolFormDef = {
  protocolId: 2,
  sections: [
    {
      title: 'Правая почка',
      fields: [
        { key: 'prav_topografia', label: 'Топография', type: 'combobox', defaultValue: 'в норме', options: TOPOGR, hint: 'в норме на уровне Th12–L3' },
        { key: 'prav_podvizhnost', label: 'Дыхательная подвижность', type: 'combobox', defaultValue: 'сохранена', options: ['сохранена', 'ограничена', 'отсутствует'], hint: 'в норме 20–40 мм' },
        { key: 'prav_zhir_kapsul', label: 'Жировая капсула', type: 'combobox', defaultValue: 'без особенностей', options: BEZ_OSB },
        { key: 'prav_fib_kapsul', label: 'Фиброзная капсула', type: 'combobox', defaultValue: 'без особенностей', options: BEZ_OSB },
        { key: 'prav_konturi', label: 'Контуры', type: 'combobox', defaultValue: 'в норме', options: KONTURI },
        { key: 'prav_dlina', label: 'Длина', type: 'text', unit: 'мм', hint: 'в норме 75–130' },
        { key: 'prav_tolshina', label: 'Толщина', type: 'text', unit: 'мм', hint: 'в норме 35–50' },
        { key: 'prav_shirina', label: 'Ширина', type: 'text', unit: 'мм', hint: 'в норме 45–65' },
        { key: 'prav_obem', label: 'Объём', type: 'text', unit: 'см³', hint: 'в норме до 134' },
        { key: 'prav_parenhima_t', label: 'Толщина паренхимы', type: 'text', unit: 'мм', hint: 'в норме 8–25' },
        { key: 'prav_exogen_par', label: 'Эхогенность паренхимы', type: 'combobox', defaultValue: 'сохранена', options: ['сохранена', 'повышена', 'снижена'] },
        { key: 'prav_exostr_par', label: 'Эхоструктура паренхимы', type: 'combobox', defaultValue: 'без особенностей', options: BEZ_OSB },
        { key: 'prav_chls_tolshina', label: 'Состояние ЧЛС — толщина', type: 'text', unit: 'мм' },
        { key: 'prav_chls_exostr', label: 'Эхоструктура ЧЛС', type: 'combobox', defaultValue: 'без особенностей', options: ['без особенностей', 'расширена', 'с конкрементами'], hint: 'в норме без дилатации' },
        { key: 'prav_kri', label: 'Кортико-ренальный индекс', type: 'text', hint: 'в норме 0.34–0.40' },
        { key: 'prav_konkrement', label: 'Наличие конкрементов в ЧЛС', type: 'combobox', defaultValue: 'не визуализируются', options: NE_VIZIR },
        { key: 'prav_mochetchnik', label: 'Мочеточник', type: 'combobox', defaultValue: 'без особенностей', options: ['без особенностей', 'расширен', 'не визуализируется'] },
      ],
    },
    {
      title: 'Левая почка',
      fields: [
        { key: 'lev_topografia', label: 'Топография', type: 'combobox', defaultValue: 'в норме', options: TOPOGR, hint: 'в норме на уровне Th11–L2' },
        { key: 'lev_podvizhnost', label: 'Дыхательная подвижность', type: 'combobox', defaultValue: 'сохранена', options: ['сохранена', 'ограничена', 'отсутствует'], hint: 'в норме 20–40 мм' },
        { key: 'lev_zhir_kapsul', label: 'Жировая капсула', type: 'combobox', defaultValue: 'без особенностей', options: BEZ_OSB },
        { key: 'lev_fib_kapsul', label: 'Фиброзная капсула', type: 'combobox', defaultValue: 'без особенностей', options: BEZ_OSB },
        { key: 'lev_konturi', label: 'Контуры', type: 'combobox', defaultValue: 'в норме', options: KONTURI },
        { key: 'lev_dlina', label: 'Длина', type: 'text', unit: 'мм', hint: 'в норме 75–130' },
        { key: 'lev_tolshina', label: 'Толщина', type: 'text', unit: 'мм', hint: 'в норме 35–50' },
        { key: 'lev_shirina', label: 'Ширина', type: 'text', unit: 'мм', hint: 'в норме 45–65' },
        { key: 'lev_obem', label: 'Объём', type: 'text', unit: 'см³', hint: 'в норме до 146' },
        { key: 'lev_parenhima_t', label: 'Толщина паренхимы', type: 'text', unit: 'мм', hint: 'в норме 8–25' },
        { key: 'lev_exogen_par', label: 'Эхогенность паренхимы', type: 'combobox', defaultValue: 'сохранена', options: ['сохранена', 'повышена', 'снижена'] },
        { key: 'lev_exostr_par', label: 'Эхоструктура паренхимы', type: 'combobox', defaultValue: 'без особенностей', options: BEZ_OSB },
        { key: 'lev_chls_tolshina', label: 'Состояние ЧЛС — толщина', type: 'text', unit: 'мм' },
        { key: 'lev_chls_exostr', label: 'Эхоструктура ЧЛС', type: 'combobox', defaultValue: 'без особенностей', options: ['без особенностей', 'расширена', 'с конкрементами'], hint: 'в норме без дилатации' },
        { key: 'lev_kri', label: 'Кортико-ренальный индекс', type: 'text', hint: 'в норме 0.34–0.40' },
        { key: 'lev_konkrement', label: 'Наличие конкрементов в ЧЛС', type: 'combobox', defaultValue: 'не визуализируются', options: NE_VIZIR },
        { key: 'lev_mochetchnik', label: 'Мочеточник', type: 'combobox', defaultValue: 'без особенностей', options: ['без особенностей', 'расширен', 'не визуализируется'] },
      ],
    },
    {
      title: 'Мочевой пузырь',
      fields: [
        { key: 'mp_obem', label: 'Объём', type: 'text', unit: 'мл', hint: 'в норме 150–200' },
        { key: 'mp_forma', label: 'Форма', type: 'combobox', defaultValue: 'в норме', options: FORMA_VN },
        { key: 'mp_kontur_naruzh', label: 'Наружный контур', type: 'combobox', defaultValue: 'в норме', options: KONTUR },
        { key: 'mp_kontur_vnutr', label: 'Внутренний контур', type: 'combobox', defaultValue: 'в норме', options: KONTUR },
        { key: 'mp_stenka_do', label: 'Толщина стенки до опорожнения', type: 'text', unit: 'мм', hint: 'в норме 3–6' },
        { key: 'mp_stenka_posle', label: 'Толщина стенки после опорожнения', type: 'text', unit: 'мм', hint: 'в норме до 8' },
        { key: 'mp_soderzhimoe', label: 'Содержимое', type: 'combobox', defaultValue: 'анэхогенное', options: ANEHOGEN },
        { key: 'mp_sheika', label: 'Состояние шейки, зева', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'изменено'] },
        { key: 'mp_ustya', label: 'Локализация устьев мочеточников', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'изменена'], hint: 'в норме на 5 и 7 часах' },
        { key: 'mp_ostatoch', label: 'Объём остаточной мочи', type: 'text', unit: 'мл', hint: 'в норме до 20 мл' },
      ],
    },
    {
      title: 'Заключение',
      fields: [
        { key: 'zaklyuchenie', label: 'Заключение', type: 'textarea' },
      ],
    },
  ],
};

// ─── 3. УЗИ щитовидной железы ────────────────────────────────────────────────
const shchitovidProtocol: ProtocolFormDef = {
  protocolId: 3,
  sections: [
    {
      title: 'Перешеек',
      fields: [
        { key: 'p_topografiya', label: 'Топография', type: 'combobox', defaultValue: 'в норме', options: TOPOGR, hint: 'в норме на уровне 1–2 хрящевых колец трахеи' },
        { key: 'p_kontur', label: 'Контур', type: 'combobox', defaultValue: 'в норме', options: KONTUR },
        { key: 'p_elastichnost', label: 'Эластичность', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'снижена', 'повышена'] },
        { key: 'p_podvijnost', label: 'Глотательная подвижность', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'ограничена', 'отсутствует'] },
        { key: 'p_razmer', label: 'Размер — толщина', type: 'text', unit: 'мм' },
        { key: 'p_ehostruktura', label: 'Эхоструктура', type: 'combobox', defaultValue: 'однородная', options: EHOGSTR },
        { key: 'p_ehogennost', label: 'Эхогенность', type: 'combobox', defaultValue: 'средняя', options: EHOGEN_SR },
      ],
    },
    {
      title: 'Правая доля',
      fields: [
        { key: 'dp_topografiya', label: 'Топография', type: 'combobox', defaultValue: 'в норме', options: TOPOGR },
        { key: 'dp_kontur', label: 'Контур', type: 'combobox', defaultValue: 'в норме', options: KONTUR },
        { key: 'dp_elastichnost', label: 'Эластичность', type: 'combobox', defaultValue: 'сохранена', options: ['сохранена', 'снижена'] },
        { key: 'dp_podvijnost', label: 'Глотательная подвижность', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'ограничена'] },
        { key: 'dp_dlina', label: 'Длина', type: 'text', unit: 'мм' },
        { key: 'dp_tolshina', label: 'Толщина', type: 'text', unit: 'мм' },
        { key: 'dp_shirina', label: 'Ширина', type: 'text', unit: 'мм' },
        { key: 'dp_obem', label: 'Объём', type: 'text', unit: 'см³' },
        { key: 'dp_forma', label: 'Форма', type: 'combobox', defaultValue: 'в норме', options: FORMA_VN, hint: 'в норме треугольная, цилиндрическая' },
        { key: 'dp_ehostruktura', label: 'Эхоструктура', type: 'combobox', defaultValue: 'однородная', options: EHOGSTR },
        { key: 'dp_ehogennost', label: 'Эхогенность', type: 'combobox', defaultValue: 'средняя', options: EHOGEN_SR },
      ],
    },
    {
      title: 'Левая доля',
      fields: [
        { key: 'dl_topografiya', label: 'Топография', type: 'combobox', defaultValue: 'в норме', options: TOPOGR },
        { key: 'dl_kontur', label: 'Контур', type: 'combobox', defaultValue: 'в норме', options: KONTUR },
        { key: 'dl_elastichnost', label: 'Эластичность', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'снижена'] },
        { key: 'dl_podvijnost', label: 'Глотательная подвижность', type: 'combobox', defaultValue: 'сохранена', options: ['сохранена', 'ограничена'] },
        { key: 'dl_dlina', label: 'Длина', type: 'text', unit: 'мм' },
        { key: 'dl_tolshina', label: 'Толщина', type: 'text', unit: 'мм' },
        { key: 'dl_shirina', label: 'Ширина', type: 'text', unit: 'мм' },
        { key: 'dl_obem', label: 'Объём', type: 'text', unit: 'см³' },
        { key: 'dl_forma', label: 'Форма', type: 'combobox', defaultValue: 'в норме', options: FORMA_VN, hint: 'в норме треугольная, цилиндрическая' },
        { key: 'dl_ehostruktura', label: 'Эхоструктура', type: 'combobox', defaultValue: 'однородная', options: EHOGSTR },
        { key: 'dl_ehogennost', label: 'Эхогенность', type: 'combobox', defaultValue: 'средняя', options: EHOGEN_SR },
      ],
    },
    {
      title: 'Суммарный объём',
      fields: [
        { key: 'summarniy', label: 'Суммарный объём', type: 'text', unit: 'см³', hint: 'у мужчин 7.7–25, у женщин 4.4–18' },
        { key: 'kg', label: 'Вес пациента', type: 'text', unit: 'кг' },
        { key: 'sm', label: 'Объём железы в норме у пациента составляет', type: 'text', unit: 'см³' },
      ],
    },
    {
      title: 'Заключение',
      fields: [
        { key: 'zaklyuchenie_sh', label: 'Заключение', type: 'textarea' },
        { key: 'rekomendatsi_sh', label: 'Рекомендации', type: 'textarea' },
      ],
    },
  ],
};

// ─── 4. УЗИ поджелудочной железы ──────────────────────────────────────────────
const podzhProtocol: ProtocolFormDef = {
  protocolId: 4,
  sections: [
    {
      title: 'Поджелудочная железа',
      fields: [
        { key: 'pdj_topografia', label: 'Топография', type: 'combobox', defaultValue: 'в норме', options: TOPOGR, hint: 'в норме расположена над селезёночной веной' },
        { key: 'pdj_forma', label: 'Форма', type: 'combobox', defaultValue: 'в норме', options: FORMA_VN, hint: 'в норме гантелевидная, колбасовидная или в виде головастика' },
        { key: 'pdj_kontur', label: 'Контур', type: 'combobox', defaultValue: 'в норме', options: KONTUR },
        { key: 'pdj_golovka', label: 'Толщина головки', type: 'text', unit: 'мм', hint: 'в норме 11–32' },
        { key: 'pdj_telo', label: 'Толщина тела', type: 'text', unit: 'мм', hint: 'в норме 4–21' },
        { key: 'pdj_hvost', label: 'Толщина хвоста', type: 'text', unit: 'мм', hint: 'в норме 7–35' },
        { key: 'pdj_dlina', label: 'Длина', type: 'text', unit: 'мм', hint: 'в норме 80–125' },
        { key: 'pdj_exostruktura', label: 'Эхоструктура', type: 'combobox', defaultValue: 'однородная', options: EHOGSTR },
        { key: 'pdj_exogennost', label: 'Эхогенность', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'средняя', 'повышенная', 'сниженная'] },
        { key: 'pdj_zvukoprov', label: 'Звукопроводимость', type: 'combobox', defaultValue: 'в норме', options: ZVUK },
        { key: 'pdj_virsungov_g', label: 'Вирсунгов проток — область головки', type: 'text', unit: 'мм', hint: 'в норме 3–4' },
        { key: 'pdj_virsungov_t', label: 'Вирсунгов проток — область тела', type: 'text', unit: 'мм', hint: 'в норме 1–2' },
      ],
    },
    {
      title: 'Заключение',
      fields: [
        { key: 'zaklyuchenie', label: 'Заключение', type: 'textarea' },
        { key: 'rekomendacii', label: 'Рекомендации', type: 'textarea' },
      ],
    },
  ],
};

// ─── 5. УЗИ селезёнки ─────────────────────────────────────────────────────────
const selezenkaProtocol: ProtocolFormDef = {
  protocolId: 5,
  sections: [
    {
      title: 'Селезёнка',
      fields: [
        { key: 'sel_topografia', label: 'Топография', type: 'combobox', defaultValue: 'в норме', options: TOPOGR, hint: 'в норме расположена в левом подреберье' },
        { key: 'sel_forma', label: 'Форма', type: 'combobox', defaultValue: 'не изменена', options: ['не изменена', 'изменена', 'деформирована'], hint: 'в норме полулунная' },
        { key: 'sel_konturi', label: 'Контуры', type: 'combobox', defaultValue: 'в норме', options: KONTURI },
        { key: 'sel_dlina', label: 'Длина', type: 'text', unit: 'мм', hint: 'в норме 90–130' },
        { key: 'sel_tolshina', label: 'Толщина', type: 'text', unit: 'мм', hint: 'в норме 30–50' },
        { key: 'sel_shirina', label: 'Ширина', type: 'text', unit: 'мм', hint: 'в норме 50–80' },
        { key: 'sel_obem', label: 'Объём', type: 'text', unit: 'см³', hint: 'в норме 80–300' },
        { key: 'sel_indeks', label: 'Селезёночный индекс', type: 'text', unit: 'см²', hint: 'в норме 13.5–32.5' },
        { key: 'sel_exostruktura', label: 'Эхоструктура', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'однородная', 'неоднородная'] },
        { key: 'sel_exogennost', label: 'Эхогенность', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'средняя', 'повышенная', 'сниженная'] },
        { key: 'sel_zvukoprov', label: 'Звукопроводимость', type: 'combobox', defaultValue: 'в норме', options: ZVUK },
        { key: 'sel_lienalis', label: 'v. lienalis', type: 'text', unit: 'мм', hint: 'в норме 4–7' },
      ],
    },
    {
      title: 'Заключение',
      fields: [
        { key: 'zaklyuchenie', label: 'Заключение', type: 'textarea' },
        { key: 'rekomendacii', label: 'Рекомендации', type: 'textarea' },
      ],
    },
  ],
};

// ─── 6. УЗИ предстательной железы и семенных пузырьков ────────────────────────
const prostataProtocol: ProtocolFormDef = {
  protocolId: 6,
  sections: [
    {
      title: 'Предстательная железа',
      fields: [
        { key: 'pr_topografia', label: 'Топография', type: 'combobox', defaultValue: 'в норме', options: TOPOGR },
        { key: 'pr_forma', label: 'Форма', type: 'combobox', defaultValue: 'в норме', options: FORMA_VN, hint: 'при продольном срезе треугольная, при поперечном — полулунная' },
        { key: 'pr_kontur', label: 'Контур', type: 'combobox', defaultValue: 'ровный, чёткий', options: KONTUR },
        { key: 'pr_kapsul_t', label: 'Капсула, толщина', type: 'text', unit: 'мм', hint: 'в норме 1–2' },
        { key: 'pr_dlina', label: 'Длина', type: 'text', unit: 'мм', hint: 'в норме 24–41' },
        { key: 'pr_tolshina', label: 'Толщина', type: 'text', unit: 'мм', hint: 'в норме 16–25' },
        { key: 'pr_shirina', label: 'Ширина', type: 'text', unit: 'мм', hint: 'в норме 27–43' },
        { key: 'pr_obem', label: 'Объём', type: 'text', unit: 'см³', hint: 'в норме не более 20–25' },
        { key: 'pr_indeks', label: 'Индекс конфигурации простаты', type: 'text', hint: 'в норме не более 0.829' },
        { key: 'pr_exostruktura', label: 'Эхоструктура', type: 'combobox', defaultValue: 'без особенностей', options: ['без особенностей', 'неоднородная', 'с кальцинатами'] },
        { key: 'pr_exogennost', label: 'Эхогенность', type: 'combobox', defaultValue: 'без особенностей', options: ['без особенностей', 'повышена', 'снижена'] },
        { key: 'pr_urethra', label: 'Простатическая часть мочеиспускательного канала', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'изменена'] },
        { key: 'pr_nach_obem', label: 'Начальный объём мочевого пузыря', type: 'text', unit: 'мл' },
        { key: 'pr_ostatoch', label: 'Остаточная моча', type: 'text', unit: 'мл', hint: 'в норме до 20 мл или не более 10%' },
      ],
    },
    {
      title: 'Семенные пузырьки — Правый',
      fields: [
        { key: 'svp_topografia', label: 'Топография', type: 'combobox', defaultValue: 'в норме', options: TOPOGR },
        { key: 'svp_kontur', label: 'Контур', type: 'combobox', defaultValue: 'в норме', options: KONTUR, hint: 'в норме дольчатый, четкий' },
        { key: 'svp_dlina', label: 'Длина', type: 'text', unit: 'мм', hint: 'в норме до 50' },
        { key: 'svp_tolshina', label: 'Толщина', type: 'text', unit: 'мм', hint: 'в норме до 15' },
        { key: 'svp_shirina', label: 'Ширина', type: 'text', unit: 'мм', hint: 'в норме до 20' },
        { key: 'svp_exostr_do', label: 'Эхоструктура до эякуляции', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'изменена'], hint: 'в норме однородная, ячеистая' },
        { key: 'svp_exostr_posle', label: 'Эхоструктура после эякуляции', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'изменена'], hint: 'в норме однородная, гомогенная' },
        { key: 'svp_exogennost', label: 'Эхогенность', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'гипоэхогенная', 'повышена'] },
      ],
    },
    {
      title: 'Семенные пузырьки — Левый',
      fields: [
        { key: 'svl_topografia', label: 'Топография', type: 'combobox', defaultValue: 'в норме', options: TOPOGR },
        { key: 'svl_kontur', label: 'Контур', type: 'combobox', defaultValue: 'в норме', options: KONTUR, hint: 'в норме дольчатый, четкий' },
        { key: 'svl_dlina', label: 'Длина', type: 'text', unit: 'мм', hint: 'в норме до 50' },
        { key: 'svl_tolshina', label: 'Толщина', type: 'text', unit: 'мм', hint: 'в норме до 15' },
        { key: 'svl_shirina', label: 'Ширина', type: 'text', unit: 'мм', hint: 'в норме до 20' },
        { key: 'svl_exostr_do', label: 'Эхоструктура до эякуляции', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'изменена'], hint: 'в норме однородная, ячеистая' },
        { key: 'svl_exostr_posle', label: 'Эхоструктура после эякуляции', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'изменена'], hint: 'в норме однородная, гомогенная' },
        { key: 'svl_exogennost', label: 'Эхогенность', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'гипоэхогенная', 'повышена'] },
      ],
    },
    {
      title: 'Заключение',
      fields: [
        { key: 'zaklyuchenie', label: 'Заключение', type: 'textarea' },
        { key: 'rekomendacii', label: 'Рекомендации', type: 'textarea' },
      ],
    },
  ],
};

// ─── 7. УЗИ молочных желез ────────────────────────────────────────────────────
const molochProtocol: ProtocolFormDef = {
  protocolId: 7,
  sections: [
    {
      title: 'Правая молочная железа',
      fields: [
        { key: 'prm_topografia', label: 'Топография', type: 'combobox', defaultValue: 'в норме', options: TOPOGR },
        { key: 'prm_kozha_kontur', label: 'Кожа — контур', type: 'combobox', defaultValue: 'в норме', options: KONTUR },
        { key: 'prm_kozha_t', label: 'Кожа — толщина', type: 'text', unit: 'мм', hint: 'в норме до 3' },
        { key: 'prm_kozha_exogen', label: 'Кожа — эхогенность', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'гиперэхогенная', 'сниженная'] },
        { key: 'prm_kozha_exostr', label: 'Кожа — эхоструктура', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'однородная', 'неоднородная'] },
        { key: 'prm_sosok', label: 'Сосок', type: 'combobox', defaultValue: 'без особенностей', options: BEZ_OSB },
        { key: 'prm_podkozh_t', label: 'Подкожная жировая ткань — толщина', type: 'text', unit: 'мм' },
        { key: 'prm_retromam_t', label: 'Ретромаммарная жировая ткань — толщина', type: 'text', unit: 'мм' },
        { key: 'prm_parenhima_kontur', label: 'Паренхима — контур', type: 'combobox', defaultValue: 'в норме', options: KONTUR },
        { key: 'prm_parenhima_t', label: 'Паренхима — толщина', type: 'text', unit: 'мм' },
        { key: 'prm_parenhima_exogen', label: 'Паренхима — эхогенность', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'гипоэхогенная', 'повышена'] },
        { key: 'prm_parenhima_exostr', label: 'Паренхима — эхоструктура', type: 'combobox', defaultValue: 'без особенностей', options: BEZ_OSB },
        { key: 'prm_galaktofori', label: 'Галактофоры', type: 'combobox', defaultValue: 'не визуализируются', options: NE_VIZIR },
        { key: 'prm_osobennosti', label: 'Особенности правой железы', type: 'textarea' },
        { key: 'prm_limfuzli', label: 'Лимфатические узлы', type: 'combobox', defaultValue: 'без особенностей', options: BEZ_OSB },
      ],
    },
    {
      title: 'Левая молочная железа',
      fields: [
        { key: 'levm_topografia', label: 'Топография', type: 'combobox', defaultValue: 'в норме', options: TOPOGR },
        { key: 'levm_kozha_kontur', label: 'Кожа — контур', type: 'combobox', defaultValue: 'в норме', options: KONTUR },
        { key: 'levm_kozha_t', label: 'Кожа — толщина', type: 'text', unit: 'мм', hint: 'в норме до 3' },
        { key: 'levm_kozha_exogen', label: 'Кожа — эхогенность', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'гиперэхогенная', 'сниженная'] },
        { key: 'levm_kozha_exostr', label: 'Кожа — эхоструктура', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'однородная', 'неоднородная'] },
        { key: 'levm_sosok', label: 'Сосок', type: 'combobox', defaultValue: 'без особенностей', options: BEZ_OSB },
        { key: 'levm_podkozh_t', label: 'Подкожная жировая ткань — толщина', type: 'text', unit: 'мм' },
        { key: 'levm_retromam_t', label: 'Ретромаммарная жировая ткань — толщина', type: 'text', unit: 'мм' },
        { key: 'levm_parenhima_kontur', label: 'Паренхима — контур', type: 'combobox', defaultValue: 'в норме', options: KONTUR },
        { key: 'levm_parenhima_t', label: 'Паренхима — толщина', type: 'text', unit: 'мм' },
        { key: 'levm_parenhima_exogen', label: 'Паренхима — эхогенность', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'гипоэхогенная', 'повышена'] },
        { key: 'levm_parenhima_exostr', label: 'Паренхима — эхоструктура', type: 'combobox', defaultValue: 'без особенностей', options: BEZ_OSB },
        { key: 'levm_galaktofori', label: 'Галактофоры', type: 'combobox', defaultValue: 'не визуализируются', options: NE_VIZIR },
        { key: 'levm_osobennosti', label: 'Особенности левой железы', type: 'textarea' },
        { key: 'levm_limfuzli', label: 'Лимфатические узлы', type: 'combobox', defaultValue: 'без особенностей', options: BEZ_OSB },
      ],
    },
    {
      title: 'Заключение',
      fields: [
        { key: 'zaklyuchenie', label: 'Заключение', type: 'textarea' },
        { key: 'rekomendacii', label: 'Рекомендации', type: 'textarea' },
      ],
    },
  ],
};

// ─── 8. УЗИ мочевого пузыря ───────────────────────────────────────────────────
const mochevoyProtocol: ProtocolFormDef = {
  protocolId: 8,
  sections: [
    {
      title: 'Мочевой пузырь',
      fields: [
        { key: 'mp_obem_fiz', label: 'Объём физиологический', type: 'text', unit: 'мл', hint: 'в норме 150–200' },
        { key: 'mp_forma', label: 'Форма', type: 'combobox', defaultValue: 'в норме', options: FORMA_VN, hint: 'грушевидная при продольном, бочкообразная при поперечном срезах' },
        { key: 'mp_kontur_naruzh', label: 'Наружный контур', type: 'combobox', defaultValue: 'в норме', options: KONTUR },
        { key: 'mp_kontur_vnutr', label: 'Внутренний контур', type: 'combobox', defaultValue: 'в норме', options: KONTUR },
        { key: 'mp_stenka_do', label: 'Толщина стенки до опорожнения', type: 'text', unit: 'мм', hint: 'в норме 3–6' },
        { key: 'mp_stenka_posle', label: 'Толщина стенки после опорожнения', type: 'text', unit: 'мм', hint: 'в норме до 8' },
        { key: 'mp_soderzhimoe', label: 'Содержимое', type: 'combobox', defaultValue: 'анэхогенное', options: ANEHOGEN },
        { key: 'mp_sheika', label: 'Состояние шейки, зева', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'изменено'], hint: 'в норме сомкнут' },
        { key: 'mp_ustya', label: 'Локализация устьев мочеточников', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'изменена'], hint: 'в норме на 5–7 часах по циферблату' },
        { key: 'mp_ostatoch', label: 'Объём остаточной мочи', type: 'text', unit: 'мл', hint: 'в норме до 20 мл или до 10% от исходного' },
      ],
    },
    {
      title: 'Заключение',
      fields: [
        { key: 'zaklyuchenie', label: 'Заключение', type: 'textarea' },
        { key: 'rekomendacii', label: 'Рекомендации', type: 'textarea' },
      ],
    },
  ],
};

// ─── 9. УЗИ органов малого таза ────────────────────────────────────────────────
const maliyTazProtocol: ProtocolFormDef = {
  protocolId: 9,
  sections: [
    {
      title: 'Матка',
      fields: [
        { key: 'mat_data_mens', label: 'Дата 1-го дня последней менструации', type: 'text' },
        { key: 'mat_den_cikla', label: 'День менструального цикла', type: 'text' },
        { key: 'mat_menopauza', label: 'Менопауза', type: 'text', unit: 'лет' },
        { key: 'mat_poziciya', label: 'Позиция', type: 'combobox', defaultValue: 'anteversio', options: ['anteversio', 'retroversio'] },
        { key: 'mat_polozhenie', label: 'Положение', type: 'combobox', defaultValue: 'anteflexio', options: ['anteflexio', 'retroflexio'] },
        { key: 'mat_forma', label: 'Форма', type: 'combobox', defaultValue: 'грушевидная', options: ['грушевидная', 'изменена'], hint: 'в норме грушевидная' },
        { key: 'mat_sootn', label: 'Соотношение тела матки к шейке', type: 'combobox', defaultValue: '2:1', options: ['2:1', 'изменено'] },
        { key: 'mat_dlina', label: 'Длина', type: 'text', unit: 'мм', hint: 'в норме 42–70' },
        { key: 'mat_tolshina', label: 'Толщина', type: 'text', unit: 'мм', hint: 'в норме 33–46' },
        { key: 'mat_shirina', label: 'Ширина', type: 'text', unit: 'мм', hint: 'в норме 42–60' },
        { key: 'mat_peredney', label: 'Толщина передней стенки миометрия', type: 'text', unit: 'мм' },
        { key: 'mat_zadney', label: 'Толщина задней стенки миометрия', type: 'text', unit: 'мм' },
        { key: 'mat_obem', label: 'Объём матки', type: 'text', unit: 'см³', hint: 'в норме 30–100' },
        { key: 'mat_kontur', label: 'Контур матки', type: 'combobox', defaultValue: 'без изменений', options: ['без изменений', 'неровный', 'нечёткий'] },
        { key: 'mat_mio_exostr', label: 'Эхоструктура миометрия', type: 'combobox', defaultValue: 'однородная', options: EHOGSTR },
        { key: 'mat_mio_exogen', label: 'Эхогенность миометрия', type: 'combobox', defaultValue: 'средняя', options: EHOGEN_SR },
        { key: 'mat_endo_t', label: 'Толщина эндометрия (М-эхо)', type: 'text', unit: 'мм', hint: 'зависит от дня цикла, не более 18' },
        { key: 'mat_endo_faza', label: 'Соответствует фазе', type: 'combobox', options: ['десквамации', 'регенерации', 'пролиферации', 'овуляции', 'секреции', 'не соответствует фазе менструального цикла', 'при менопаузе более 5 лет – не более 5 мм'] },
        { key: 'mat_endo_exostr', label: 'Эхоструктура эндометрия', type: 'combobox', defaultValue: 'однородная', options: EHOGSTR },
        { key: 'mat_polost', label: 'Полость матки', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'расширена', 'с включениями'] },
      ],
    },
    {
      title: 'Шейка матки',
      fields: [
        { key: 'sheika_dlina', label: 'Длина', type: 'text', unit: 'мм', hint: 'в норме 20–40' },
        { key: 'sheika_tolshina', label: 'Толщина', type: 'text', unit: 'мм', hint: 'в норме 30–35' },
        { key: 'sheika_shirina', label: 'Ширина', type: 'text', unit: 'мм', hint: 'в норме 30–40' },
        { key: 'sheika_kontur', label: 'Контур', type: 'combobox', defaultValue: 'в норме', options: KONTUR },
        { key: 'sheika_exostr', label: 'Эхоструктура стенки', type: 'combobox', defaultValue: 'однородная', options: EHOGSTR },
        { key: 'sheika_exogen', label: 'Эхогенность стенки', type: 'combobox', defaultValue: 'средняя', options: EHOGEN_SR },
        { key: 'sheika_endo_t', label: 'Толщина эндоцервикса', type: 'text', unit: 'мм', hint: 'в норме 2–5' },
        { key: 'sheika_endo_exostr', label: 'Эхоструктура эндоцервикса', type: 'combobox', defaultValue: 'без особенностей', options: BEZ_OSB },
        { key: 'sheika_polost', label: 'Полость шейки (канал)', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'расширена'] },
      ],
    },
    {
      title: 'Правый яичник',
      fields: [
        { key: 'yach_pr_topografia', label: 'Топография', type: 'combobox', defaultValue: 'в норме', options: TOPOGR, hint: 'в норме на расстоянии 20–40 мм от матки' },
        { key: 'yach_pr_forma', label: 'Форма', type: 'combobox', defaultValue: 'в норме', options: FORMA_VN, hint: 'в норме овоидная' },
        { key: 'yach_pr_kontur', label: 'Контур', type: 'combobox', defaultValue: 'в норме', options: KONTUR },
        { key: 'yach_pr_dlina', label: 'Длина', type: 'text', unit: 'мм', hint: 'в норме 20–45' },
        { key: 'yach_pr_tolshina', label: 'Толщина', type: 'text', unit: 'мм', hint: 'в норме 15–25' },
        { key: 'yach_pr_shirina', label: 'Ширина', type: 'text', unit: 'мм', hint: 'в норме 20–30' },
        { key: 'yach_pr_obem', label: 'Объём', type: 'text', unit: 'см³', hint: 'в норме 5–8, до 11' },
        { key: 'yach_pr_exostr', label: 'Эхоструктура (фолликулярный аппарат)', type: 'combobox', defaultValue: 'без особенностей', options: BEZ_OSB },
        { key: 'yach_pr_follikuli', label: 'Фолликулы диаметром', type: 'text' },
        { key: 'yach_pr_exogen', label: 'Эхогенность', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'повышена', 'снижена'] },
      ],
    },
    {
      title: 'Левый яичник',
      fields: [
        { key: 'yach_lev_topografia', label: 'Топография', type: 'combobox', defaultValue: 'в норме', options: TOPOGR, hint: 'в норме на расстоянии 20–40 мм от матки' },
        { key: 'yach_lev_forma', label: 'Форма', type: 'combobox', defaultValue: 'в норме', options: FORMA_VN, hint: 'в норме овоидная' },
        { key: 'yach_lev_kontur', label: 'Контур', type: 'combobox', defaultValue: 'в норме', options: KONTUR },
        { key: 'yach_lev_dlina', label: 'Длина', type: 'text', unit: 'мм', hint: 'в норме 20–45' },
        { key: 'yach_lev_tolshina', label: 'Толщина', type: 'text', unit: 'мм', hint: 'в норме 15–25' },
        { key: 'yach_lev_shirina', label: 'Ширина', type: 'text', unit: 'мм', hint: 'в норме 20–30' },
        { key: 'yach_lev_obem', label: 'Объём', type: 'text', unit: 'см³', hint: 'в норме 5–8, до 11' },
        { key: 'yach_lev_exostr', label: 'Эхоструктура (фолликулярный аппарат)', type: 'combobox', defaultValue: 'без особенностей', options: BEZ_OSB },
        { key: 'yach_lev_follikuli', label: 'Фолликулы диаметром', type: 'text' },
        { key: 'yach_lev_exogen', label: 'Эхогенность', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'повышена', 'снижена'] },
      ],
    },
    {
      title: 'Маточные трубы',
      fields: [
        { key: 'mat_truba_prav', label: 'Правая', type: 'combobox', defaultValue: 'без особенностей', options: ['без особенностей', 'не визуализируется', 'с патологией'], hint: 'в норме не визуализируется' },
        { key: 'mat_truba_lev', label: 'Левая', type: 'combobox', defaultValue: 'без особенностей', options: ['без особенностей', 'не визуализируется', 'с патологией'], hint: 'в норме не визуализируется' },
        { key: 'duglas', label: 'Дугласово пространство', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'свободная жидкость', 'патологическое содержимое'] },
      ],
    },
    {
      title: 'Заключение',
      fields: [
        { key: 'zaklyuchenie', label: 'Заключение', type: 'textarea' },
        { key: 'rekomendacii', label: 'Рекомендации', type: 'textarea' },
      ],
    },
  ],
};

// ─── 10. УЗИ надпочечников ────────────────────────────────────────────────────
const nadpochProtocol: ProtocolFormDef = {
  protocolId: 10,
  sections: [
    {
      title: 'Правый надпочечник',
      fields: [
        { key: 'npr_topografia', label: 'Топография', type: 'combobox', defaultValue: 'в норме', options: TOPOGR },
        { key: 'npr_forma', label: 'Форма', type: 'combobox', defaultValue: 'не изменена', options: ['не изменена', 'изменена'] },
        { key: 'npr_prodolniy', label: 'Продольный размер', type: 'text', unit: 'мм', hint: 'в норме 45' },
        { key: 'npr_poperechniy', label: 'Поперечный размер', type: 'text', unit: 'мм', hint: 'в норме 16–28' },
        { key: 'npr_tolshina', label: 'Толщина', type: 'text', unit: 'мм', hint: 'в норме 5–6' },
        { key: 'npr_ploshad', label: 'Площадь', type: 'text', unit: 'см²', hint: 'в норме до 5.56' },
        { key: 'npr_giper_indeks', label: 'Индекс гиперплазии', type: 'text', hint: 'в норме не более 1.2' },
        { key: 'npr_exostruktura', label: 'Эхоструктура', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'однородная', 'неоднородная'] },
        { key: 'npr_exogennost', label: 'Эхогенность', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'гипоэхогенный', 'повышена'] },
      ],
    },
    {
      title: 'Левый надпочечник',
      fields: [
        { key: 'nlev_topografia', label: 'Топография', type: 'combobox', defaultValue: 'в норме', options: TOPOGR },
        { key: 'nlev_forma', label: 'Форма', type: 'combobox', defaultValue: 'не изменена', options: ['не изменена', 'изменена'] },
        { key: 'nlev_prodolniy', label: 'Продольный размер', type: 'text', unit: 'мм', hint: 'в норме 45' },
        { key: 'nlev_poperechniy', label: 'Поперечный размер', type: 'text', unit: 'мм', hint: 'в норме 16–28' },
        { key: 'nlev_tolshina', label: 'Толщина', type: 'text', unit: 'мм', hint: 'в норме 5–6' },
        { key: 'nlev_ploshad', label: 'Площадь', type: 'text', unit: 'см²', hint: 'в норме до 6.17' },
        { key: 'nlev_giper_indeks', label: 'Индекс гиперплазии', type: 'text', hint: 'в норме не более 1.4' },
        { key: 'nlev_exostruktura', label: 'Структура', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'однородная', 'неоднородная'] },
        { key: 'nlev_exogennost', label: 'Эхогенность', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'гипоэхогенный', 'повышена'] },
      ],
    },
    {
      title: 'Заключение',
      fields: [
        { key: 'zaklyuchenie', label: 'Заключение', type: 'textarea' },
        { key: 'rekomendacii', label: 'Рекомендации', type: 'textarea' },
      ],
    },
  ],
};

// ─── 11. УЗИ коленного сустава ────────────────────────────────────────────────
const kolenniyProtocol: ProtocolFormDef = {
  protocolId: 11,
  sections: [
    {
      title: 'Общие данные',
      fields: [
        { key: 'kol_storona', label: 'Сустав', type: 'combobox', defaultValue: 'правый', options: ['правый', 'левый', 'правый и левый'] },
      ],
    },
    {
      title: 'Собственная связка надколенника',
      fields: [
        { key: 'kol_svyaz_kontur', label: 'Контур', type: 'combobox', defaultValue: 'в норме', options: KONTUR, hint: 'в норме четкий, ровный' },
        { key: 'kol_svyaz_tolshina', label: 'Толщина', type: 'text', unit: 'мм', hint: 'в норме не более 6' },
        { key: 'kol_svyaz_exostr', label: 'Эхоструктура', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'однородная', 'неоднородная'], hint: 'в норме однородная' },
        { key: 'kol_svyaz_exogen', label: 'Эхогенность', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'средняя', 'повышена', 'снижена'], hint: 'в норме средняя' },
      ],
    },
    {
      title: 'Связки и мягкие ткани',
      fields: [
        { key: 'kol_med_svyaz', label: 'Медиальная связка', type: 'combobox', defaultValue: 'без особенностей', options: BEZ_OSB },
        { key: 'kol_lat_svyaz', label: 'Латеральная связка', type: 'combobox', defaultValue: 'без особенностей', options: BEZ_OSB },
        { key: 'kol_goffa', label: 'Пространство Гоффа', type: 'combobox', defaultValue: 'без особенностей', options: BEZ_OSB },
        { key: 'kol_mishci', label: 'Мышцы, суставные сумки, связки', type: 'combobox', defaultValue: 'без особенностей', options: BEZ_OSB },
      ],
    },
    {
      title: 'Суставная жидкость',
      fields: [
        { key: 'kol_zhidk_tolshina', label: 'Толщина суставной жидкости', type: 'text', unit: 'мм', hint: 'в норме 3–5' },
        { key: 'kol_zhidk_exogen', label: 'Эхогенность суставной жидкости', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'анэхогенная', 'с взвесью'], hint: 'в норме анэхогенная' },
        { key: 'kol_sus_shel', label: 'Толщина суставной щели', type: 'text', unit: 'мм', hint: 'в норме не менее 3.5' },
      ],
    },
    {
      title: 'Гиалиновый хрящ',
      fields: [
        { key: 'kol_hyalin_kontur', label: 'Контур', type: 'combobox', defaultValue: 'в норме', options: KONTUR, hint: 'в норме четкий, ровный' },
        { key: 'kol_hyalin_tolshina', label: 'Толщина', type: 'text', unit: 'мм' },
        { key: 'kol_hyalin_exostr', label: 'Эхоструктура', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'однородная', 'неоднородная'] },
        { key: 'kol_hyalin_exogen', label: 'Эхогенность', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'гипоэхогенная', 'повышена'] },
      ],
    },
    {
      title: 'Медиальный мениск — Передний рог',
      fields: [
        { key: 'kol_med_per_forma', label: 'Форма', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'треугольная', 'изменена'], hint: 'в норме треугольная' },
        { key: 'kol_med_per_kontur', label: 'Контур', type: 'combobox', defaultValue: 'в норме', options: KONTUR },
        { key: 'kol_med_per_exostr', label: 'Эхоструктура', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'однородная', 'неоднородная'] },
        { key: 'kol_med_per_exogen', label: 'Эхогенность', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'изо- или гиперэхогенная', 'повышена', 'снижена'] },
      ],
    },
    {
      title: 'Медиальный мениск — Задний рог',
      fields: [
        { key: 'kol_med_zad_forma', label: 'Форма', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'треугольная', 'изменена'], hint: 'в норме треугольная' },
        { key: 'kol_med_zad_kontur', label: 'Контур', type: 'combobox', defaultValue: 'в норме', options: KONTUR },
        { key: 'kol_med_zad_exostr', label: 'Эхоструктура', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'однородная', 'неоднородная'] },
        { key: 'kol_med_zad_exogen', label: 'Эхогенность', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'изо- или гиперэхогенная', 'повышена', 'снижена'] },
      ],
    },
    {
      title: 'Латеральный мениск — Передний рог',
      fields: [
        { key: 'kol_lat_per_forma', label: 'Форма', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'треугольная', 'изменена'], hint: 'в норме треугольная' },
        { key: 'kol_lat_per_kontur', label: 'Контур', type: 'combobox', defaultValue: 'в норме', options: KONTUR },
        { key: 'kol_lat_per_exostr', label: 'Эхоструктура', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'однородная', 'неоднородная'] },
        { key: 'kol_lat_per_exogen', label: 'Эхогенность', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'изо- или гиперэхогенная', 'повышена', 'снижена'] },
      ],
    },
    {
      title: 'Латеральный мениск — Задний рог',
      fields: [
        { key: 'kol_lat_zad_forma', label: 'Форма', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'треугольная', 'изменена'], hint: 'в норме треугольная' },
        { key: 'kol_lat_zad_kontur', label: 'Контур', type: 'combobox', defaultValue: 'в норме', options: KONTUR },
        { key: 'kol_lat_zad_exostr', label: 'Эхоструктура', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'однородная', 'неоднородная'] },
        { key: 'kol_lat_zad_exogen', label: 'Эхогенность', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'изо- или гиперэхогенная', 'повышена', 'снижена'] },
      ],
    },
    {
      title: 'Костные структуры',
      fields: [
        { key: 'kol_bedro', label: 'Бедренная кость', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'изменена'] },
        { key: 'kol_bolshebert', label: 'Большеберцовая кость', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'изменена'] },
        { key: 'kol_nadkolenn', label: 'Надколенник', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'изменен'] },
      ],
    },
    {
      title: 'Заключение',
      fields: [
        { key: 'zaklyuchenie', label: 'Заключение', type: 'textarea' },
        { key: 'rekomendacii', label: 'Рекомендации', type: 'textarea' },
      ],
    },
  ],
};

// ─── 12. УЗИ в I триместре беременности ───────────────────────────────────────
const tri1Protocol: ProtocolFormDef = {
  protocolId: 12,
  sections: [
    {
      title: 'Общие данные',
      fields: [
        { key: 'tri1_data_mens', label: 'Дата первого дня последней менструации', type: 'text' },
        { key: 'tri1_srok_mens', label: 'Соответствует сроку беременности (по менструации)', type: 'text', hint: 'нед. дней' },
        { key: 'tri1_data_rodov_mens', label: 'Дата предполагаемых родов по менструации', type: 'text' },
        { key: 'tri1_data_rodov_razm', label: 'Дата предполагаемых родов по размерам', type: 'text' },
      ],
    },
    {
      title: 'Матка',
      fields: [
        { key: 'tri1_mat_kontur', label: 'Контур матки', type: 'combobox', defaultValue: 'в норме', options: KONTUR },
        { key: 'tri1_mat_exostr', label: 'Эхоструктура миометрия', type: 'combobox', defaultValue: 'без особенностей', options: BEZ_OSB },
        { key: 'tri1_mat_dlina', label: 'Длина матки', type: 'text', unit: 'мм' },
        { key: 'tri1_mat_tolshina', label: 'Толщина матки', type: 'text', unit: 'мм' },
        { key: 'tri1_mat_shirina', label: 'Ширина матки', type: 'text', unit: 'мм' },
        { key: 'tri1_mat_osoben', label: 'Особенности матки', type: 'combobox', defaultValue: 'без особенностей', options: BEZ_OSB },
      ],
    },
    {
      title: 'Плодное яйцо',
      fields: [
        { key: 'tri1_plod_kol', label: 'Количество плодных яиц', type: 'combobox', defaultValue: '1', options: ['1', '2', '3'] },
        { key: 'tri1_plod_topogr', label: 'Топография плодного яйца', type: 'combobox', defaultValue: 'в норме', options: TOPOGR, hint: 'в норме — дно матки' },
        { key: 'tri1_plod_forma', label: 'Форма плодного яйца', type: 'combobox', defaultValue: 'округлая', options: ['округлая', 'овоидная', 'изменена'] },
        { key: 'tri1_plod_diam', label: 'Средний диаметр плодного яйца', type: 'text', unit: 'мм' },
        { key: 'tri1_plod_srok', label: 'Плодное яйцо соответствует сроку', type: 'text', hint: 'нед. дней' },
      ],
    },
    {
      title: 'Эмбрион',
      fields: [
        { key: 'tri1_emb_kol', label: 'Количество эмбрионов', type: 'combobox', defaultValue: '1', options: ['1', '2', '3'] },
        { key: 'tri1_emb_ktr', label: 'КТР эмбриона', type: 'text', unit: 'мм' },
        { key: 'tri1_emb_ktr_srok', label: 'КТР соответствует сроку', type: 'text', hint: 'нед. дней' },
        { key: 'tri1_emb_serd', label: 'Сердцебиение', type: 'combobox', defaultValue: 'определяется, ритмичное', options: ['определяется, ритмичное', 'не определяется', 'аритмичное'] },
        { key: 'tri1_emb_chss', label: 'ЧСС', type: 'text', unit: 'уд/мин', hint: 'в норме 6–8 нед.: 110–130, 9–10 нед.: до 200' },
        { key: 'tri1_emb_vp', label: 'Толщина воротникового пространства', type: 'text', unit: 'мм', hint: 'в норме до 3' },
        { key: 'tri1_emb_zhel', label: 'Желточный мешочек', type: 'combobox', defaultValue: 'визуализируется', options: ['визуализируется', 'не визуализируется'], hint: 'в норме с 5 по 12 неделю' },
        { key: 'tri1_emb_zhel_diam', label: 'Диаметр желточного мешочка', type: 'text', unit: 'мм' },
      ],
    },
    {
      title: 'Хорион',
      fields: [
        { key: 'tri1_hor_lok', label: 'Локализация хориона', type: 'text' },
        { key: 'tri1_hor_t', label: 'Толщина хориона', type: 'text', unit: 'мм', hint: 'в норме соответствует сроку в неделях' },
      ],
    },
    {
      title: 'Яичники',
      fields: [
        { key: 'tri1_yachniki', label: 'Яичники', type: 'combobox', defaultValue: 'без особенностей', options: BEZ_OSB },
      ],
    },
    {
      title: 'Заключение',
      fields: [
        { key: 'zaklyuchenie', label: 'Заключение', type: 'textarea' },
        { key: 'rekomendacii', label: 'Рекомендации', type: 'textarea' },
      ],
    },
  ],
};

// ─── 13. УЗИ плода ────────────────────────────────────────────────────────────
const plodProtocol: ProtocolFormDef = {
  protocolId: 13,
  sections: [
    {
      title: 'Общие данные',
      fields: [
        { key: 'plod_data_mens', label: 'Дата первого дня последней менструации', type: 'text' },
        { key: 'plod_srok', label: 'Срок беременности', type: 'text', hint: 'нед. дней' },
        { key: 'plod_data_rodov_mens', label: 'Дата предполагаемых родов по менструации', type: 'text' },
        { key: 'plod_data_rodov_razm', label: 'Дата предполагаемых родов по размерам', type: 'text' },
      ],
    },
    {
      title: 'Матка',
      fields: [
        { key: 'plod_mat_kontur', label: 'Контур матки', type: 'combobox', defaultValue: 'в норме', options: KONTUR },
        { key: 'plod_mat_exostr', label: 'Эхоструктура миометрия', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'однородная', 'неоднородная'] },
        { key: 'plod_mat_osob', label: 'Особенности матки', type: 'combobox', defaultValue: 'без особенностей', options: BEZ_OSB },
      ],
    },
    {
      title: 'Плод',
      fields: [
        { key: 'plod_kol', label: 'Количество плодов', type: 'combobox', defaultValue: '1', options: ['1', '2', '3'] },
        { key: 'plod_polozhenie', label: 'Положение, предлежание', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'продольное, головное', 'поперечное', 'тазовое', 'косое'], hint: 'в норме продольное, головное' },
        { key: 'plod_dvizh_tul', label: 'Движения туловища', type: 'combobox', defaultValue: 'определяются', options: ['определяются', 'не определяются'], hint: 'в норме с 7 недель' },
        { key: 'plod_dvizh_konech', label: 'Движения конечностями', type: 'combobox', defaultValue: 'определяются', options: ['определяются', 'не определяются'], hint: 'в норме с 8 недель' },
        { key: 'plod_dvizh_glotat', label: 'Глотательные движения', type: 'combobox', defaultValue: 'определяются', options: ['определяются', 'не определяются'], hint: 'в норме с 11 недель' },
        { key: 'plod_dvizh_sosat', label: 'Сосательные движения', type: 'combobox', defaultValue: 'определяются', options: ['определяются', 'не определяются'], hint: 'в норме с 18 недель' },
        { key: 'plod_serd', label: 'Сердцебиение', type: 'combobox', defaultValue: 'визуализируется, ритмичное', options: ['визуализируется, ритмичное', 'не визуализируется', 'аритмичное'] },
        { key: 'plod_chss', label: 'ЧСС', type: 'text', unit: 'уд/мин', hint: 'в норме 115–160, до 22 нед. — до 180' },
      ],
    },
    {
      title: 'Фетометрия',
      fields: [
        { key: 'plod_bpd', label: 'Бипариетальный размер (БПР)', type: 'text', unit: 'мм' },
        { key: 'plod_bpd_srok', label: 'БПР соответствует сроку', type: 'text', hint: 'нед. дней' },
        { key: 'plod_lor', label: 'Лобно-затылочный размер (ЛЗР)', type: 'text', unit: 'мм' },
        { key: 'plod_lor_srok', label: 'ЛЗР соответствует сроку', type: 'text', hint: 'нед. дней' },
        { key: 'plod_cefal', label: 'Цефалический индекс', type: 'text', unit: '%', hint: 'в норме 71–87%' },
        { key: 'plod_bedro', label: 'Длина бедренной кости', type: 'text', unit: 'мм' },
        { key: 'plod_bedro_srok', label: 'Бедренная кость соответствует сроку', type: 'text', hint: 'нед. дней' },
        { key: 'plod_okr_golova', label: 'Окружность головки', type: 'text', unit: 'мм' },
        { key: 'plod_okr_golova_srok', label: 'Окружность головки соответствует сроку', type: 'text', hint: 'нед. дней' },
        { key: 'plod_okr_zhivot', label: 'Окружность живота', type: 'text', unit: 'мм' },
        { key: 'plod_okr_zhivot_srok', label: 'Окружность живота соответствует сроку', type: 'text', hint: 'нед. дней' },
        { key: 'plod_osobennosti', label: 'Особенности плода', type: 'combobox', defaultValue: 'без особенностей', options: BEZ_OSB },
        { key: 'plod_pupovina', label: 'Пуповина', type: 'combobox', defaultValue: 'без особенностей', options: BEZ_OSB },
      ],
    },
    {
      title: 'Плацента',
      fields: [
        { key: 'plac_lok', label: 'Локализация плаценты', type: 'text', hint: 'нижний край во 2 тр. не менее 50 мм, в 3 тр. не менее 70 мм от внутреннего зева' },
        { key: 'plac_tolshina', label: 'Толщина плаценты', type: 'text', unit: 'мм', hint: 'в норме 20–40' },
        { key: 'plac_zrelost', label: 'Степень зрелости', type: 'combobox', defaultValue: '0', options: ['0', 'I', 'II', 'III'], hint: 'до 30 нед. — 0, 27–36 нед. — I, 34–39 нед. — II, 37–40 нед. — III' },
        { key: 'plac_exostr', label: 'Эхоструктура плаценты', type: 'combobox', defaultValue: 'без особенностей', options: BEZ_OSB },
      ],
    },
    {
      title: 'Околоплодные воды',
      fields: [
        { key: 'vodi_water', label: 'Околоплодные воды', type: 'text', hint: 'число (мм)' },
        { key: 'vodi_iazh', label: 'ИАЖ', type: 'combobox', defaultValue: 'нормоводие', options: ['нормоводие', 'многоводие', 'маловодие; умеренное', 'маловодие; среднее', 'маловодие; выраженное'] },
        { key: 'vodi_exogen', label: 'Эхогенность вод', type: 'combobox', defaultValue: 'в норме', options: ['в норме', 'анэхогенная', 'с мелкодисперсной взвесью'] },
        { key: 'plod_massa', label: 'Масса плода', type: 'text', unit: 'г' },
        { key: 'plod_yachniki', label: 'Яичники', type: 'combobox', defaultValue: 'не визуализируются', options: NE_VIZIR },
      ],
    },
    {
      title: 'Заключение',
      fields: [
        { key: 'zaklyuchenie', label: 'Заключение', type: 'textarea' },
        { key: 'rekomendacii', label: 'Рекомендации', type: 'textarea' },
      ],
    },
  ],
};

// ─── 14. Сердцебиение ─────────────────────────────────────────────────────────
const serdcebienieProtocol: ProtocolFormDef = {
  protocolId: 14,
  sections: [
    {
      title: 'Параметры',
      fields: [
        { key: 'serd_plod_diam', label: 'Средний диаметр плодного яйца', type: 'text', unit: 'мм' },
        { key: 'serd_plod_srok', label: 'Плодное яйцо соответствует сроку беременности', type: 'text', hint: 'нед. дней' },
        { key: 'serd_ktr', label: 'КТР эмбриона', type: 'text', unit: 'мм' },
        { key: 'serd_ktr_srok', label: 'КТР соответствует сроку беременности', type: 'text', hint: 'нед. дней' },
        { key: 'serd_serdb', label: 'Сердцебиение', type: 'combobox', defaultValue: 'определяется, ритмичное', options: ['определяется, ритмичное', 'не определяется', 'аритмичное'] },
        { key: 'serd_chss', label: 'ЧСС', type: 'text', unit: 'уд/мин' },
        { key: 'serd_zhel_diam', label: 'Желточный мешочек диаметром', type: 'text', unit: 'мм' },
      ],
    },
    {
      title: 'Заключение',
      fields: [
        { key: 'zaklyuchenie', label: 'Заключение', type: 'textarea' },
      ],
    },
  ],
};

// ─── 15. Фолликулометрия ──────────────────────────────────────────────────────
const follikulometriyaProtocol: ProtocolFormDef = {
  protocolId: 15,
  sections: [
    {
      title: 'Параметры',
      fields: [
        { key: 'fol_endo_t', label: 'Толщина эндометрия (М-эхо)', type: 'text', unit: 'мм', hint: 'зависит от дня цикла, не более 18' },
        { key: 'fol_endo_faza', label: 'Эндометрий соответствует фазе', type: 'combobox', options: ['десквамации', 'регенерации', 'пролиферации', 'овуляции', 'секреции', 'не соответствует фазе'] },
      ],
    },
    {
      title: 'Правый яичник',
      fields: [
        { key: 'fol_pr_follikuli', label: 'Фолликулы диаметром (правый)', type: 'text', hint: 'мм' },
      ],
    },
    {
      title: 'Левый яичник',
      fields: [
        { key: 'fol_lev_follikuli', label: 'Фолликулы диаметром (левый)', type: 'text', hint: 'мм' },
      ],
    },
    {
      title: 'Прочее',
      fields: [
        { key: 'fol_svobod_zhid', label: 'Свободная жидкость в заднем Дугласовом пространстве', type: 'combobox', options: ['нет', 'есть'] },
      ],
    },
    {
      title: 'Заключение',
      fields: [
        { key: 'zaklyuchenie', label: 'Заключение', type: 'textarea' },
      ],
    },
  ],
};

// ─── 16. УЗИ органов мошонки ─────────────────────────────────────────────────
const mashonkaProtocol: ProtocolFormDef = {
  protocolId: 16,
  sections: [
    {
      title: 'Правое яичко',
      fields: [
        { key: 'yai_pr_topografiya', label: 'Топография', type: 'combobox', defaultValue: 'в норме', options: TOPOGR },
        { key: 'yai_pr_forma', label: 'Форма', type: 'combobox', defaultValue: 'в норме', options: FORMA_VN },
        { key: 'yai_pr_kontur', label: 'Контур', type: 'combobox', defaultValue: 'в норме', options: KONTUR, hint: 'в норме ровный, четкий' },
        { key: 'yai_pr_kapsula', label: 'Капсула (белочная оболочка)', type: 'combobox', defaultValue: 'без особенностей', options: BEZ_OSB },
        { key: 'yai_pr_dlina', label: 'Длина', type: 'text', unit: 'мм', hint: 'в норме 35–60' },
        { key: 'yai_pr_tolshina', label: 'Толщина', type: 'text', unit: 'мм', hint: 'в норме 15–30' },
        { key: 'yai_pr_shirina', label: 'Ширина', type: 'text', unit: 'мм', hint: 'в норме 15–30' },
        { key: 'yai_pr_obyom', label: 'Объём', type: 'text', unit: 'см³', hint: 'в норме 15' },
        { key: 'yai_pr_exostruktura', label: 'Эхоструктура', type: 'combobox', defaultValue: 'однородная', options: EHOGSTR },
        { key: 'yai_pr_exogennost', label: 'Эхогенность', type: 'combobox', defaultValue: 'средняя', options: EHOGEN_SR },
        { key: 'yai_pr_vlagalishe', label: 'Влагалище, толщина жидкости', type: 'text', unit: 'мм' },
        { key: 'yai_pr_obolochki', label: 'Оболочки, толщина', type: 'text', unit: 'мм', hint: 'в норме 2–7' },
        { key: 'yai_pr_rasshireniya', label: 'Расширение вен семенного канатика', type: 'text', unit: 'мм' },
      ],
    },
    {
      title: 'Левое яичко',
      fields: [
        { key: 'yai_le_topografiya', label: 'Топография', type: 'combobox', defaultValue: 'в норме', options: TOPOGR },
        { key: 'yai_le_forma', label: 'Форма', type: 'combobox', defaultValue: 'в норме', options: FORMA_VN },
        { key: 'yai_le_kontur', label: 'Контур', type: 'combobox', defaultValue: 'в норме', options: KONTUR, hint: 'в норме ровный, четкий' },
        { key: 'yai_le_kapsula', label: 'Капсула (белочная оболочка)', type: 'combobox', defaultValue: 'без особенностей', options: BEZ_OSB },
        { key: 'yai_le_dlina', label: 'Длина', type: 'text', unit: 'мм', hint: 'в норме 35–60' },
        { key: 'yai_le_tolshina', label: 'Толщина', type: 'text', unit: 'мм', hint: 'в норме 15–30' },
        { key: 'yai_le_shirina', label: 'Ширина', type: 'text', unit: 'мм', hint: 'в норме 15–30' },
        { key: 'yai_le_obyom', label: 'Объём', type: 'text', unit: 'см³', hint: 'в норме 15' },
        { key: 'yai_le_exostruktura', label: 'Эхоструктура', type: 'combobox', defaultValue: 'однородная', options: EHOGSTR },
        { key: 'yai_le_exogennost', label: 'Эхогенность', type: 'combobox', defaultValue: 'средняя', options: EHOGEN_SR },
        { key: 'yai_le_vlagalishe', label: 'Влагалище, толщина жидкости', type: 'text', unit: 'мм' },
        { key: 'yai_le_obolochki', label: 'Оболочки, толщина', type: 'text', unit: 'мм', hint: 'в норме 2–7' },
        { key: 'yai_le_rasshireniya', label: 'Расширение вен семенного канатика', type: 'text', unit: 'мм' },
      ],
    },
    {
      title: 'Правый придаток',
      fields: [
        { key: 'pri_pr_topografiya', label: 'Топография', type: 'combobox', defaultValue: 'в норме', options: TOPOGR },
        { key: 'pri_pr_kontur', label: 'Контур', type: 'combobox', defaultValue: 'в норме', options: KONTUR, hint: 'в норме ровный, четкий' },
        { key: 'pri_pr_golovki', label: 'Толщина в области головки', type: 'text', unit: 'мм' },
        { key: 'pri_pr_tela', label: 'Толщина в области тела', type: 'text', unit: 'мм' },
        { key: 'pri_pr_exostruktura', label: 'Эхоструктура', type: 'combobox', defaultValue: 'однородная', options: EHOGSTR },
        { key: 'pri_pr_exogennost', label: 'Эхогенность', type: 'combobox', defaultValue: 'средняя', options: EHOGEN_SR },
      ],
    },
    {
      title: 'Левый придаток',
      fields: [
        { key: 'pri_le_topografiya', label: 'Топография', type: 'combobox', defaultValue: 'в норме', options: TOPOGR },
        { key: 'pri_le_kontur', label: 'Контур', type: 'combobox', defaultValue: 'в норме', options: KONTUR, hint: 'в норме ровный, четкий' },
        { key: 'pri_le_golovki', label: 'Толщина в области головки', type: 'text', unit: 'мм' },
        { key: 'pri_le_tela', label: 'Толщина в области тела', type: 'text', unit: 'мм' },
        { key: 'pri_le_exostruktura', label: 'Эхоструктура', type: 'combobox', defaultValue: 'однородная', options: EHOGSTR },
        { key: 'pri_le_exogennost', label: 'Эхогенность', type: 'combobox', defaultValue: 'средняя', options: EHOGEN_SR },
      ],
    },
    {
      title: 'Заключение',
      fields: [
        { key: 'zaklyuchenie', label: 'Заключение', type: 'textarea' },
        { key: 'rekomendacii', label: 'Рекомендации', type: 'textarea' },
      ],
    },
  ],
};

export const PROTOCOL_FORMS: ProtocolFormDef[] = [
  pechenProtocol,
  pochkiProtocol,
  shchitovidProtocol,
  podzhProtocol,
  selezenkaProtocol,
  prostataProtocol,
  molochProtocol,
  mochevoyProtocol,
  maliyTazProtocol,
  nadpochProtocol,
  kolenniyProtocol,
  tri1Protocol,
  plodProtocol,
  serdcebienieProtocol,
  follikulometriyaProtocol,
  mashonkaProtocol,
];

export const getProtocolForm = (protocolId: number): ProtocolFormDef | undefined =>
  PROTOCOL_FORMS.find((p) => p.protocolId === protocolId);

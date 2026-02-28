"""
DOCX yaratuvchi servis - python-docx orqali tibbiy protokol hujjatini yaratadi
"""
import io
from datetime import datetime
from typing import Any, Dict, Optional

from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement


# Protokol ID → sarlavha (ruscha)
PROTOCOL_TITLES: Dict[int, str] = {
    1: "МОШОНКА",
    2: "ЩИТОВИДНАЯ ЖЕЛЕЗА",
    3: "СЕЛЕЗЁНКА",
    4: "КОЛЕННЫЙ СУСТАВ",
    5: "НАДПОЧЕЧНИКИ",
    6: "ПЕРВЫЙ ТРИМЕСТР",
    7: "ФОЛЛИКУЛОМЕТРИЯ",
    8: "ПЕЧЕНЬ БЛАНК",
    9: "ПОЧКИ БЛАНК",
    10: "МАЛЫЙ ТАЗ БЛАНК",
    11: "МОЛОЧНЫЕ ЖЕЛЕЗЫ БЛАНК",
    12: "ПЛОД БЛАНК",
    13: "ПОДЖЕЛУДОЧНАЯ ЖЕЛЕЗА",
    14: "ПРОСТАТА",
}

# Seksiya sarlavhalari uchun maxsus kalit so'zlar (tartib muhim)
FIELD_SECTIONS: Dict[int, Dict[str, str]] = {
    1: {  # Мошонка
        "yai_pr": "Правое яичко",
        "yai_le": "Левое яичко",
        "pri_pr": "Правый придаток",
        "pri_le": "Левый придаток",
        "zaklyuchenie": "Заключение",
        "rekomendatsi": "Рекомендации",
    },
    2: {  # Щитовидная
        "dp_": "Правая доля",
        "dl_": "Левая доля",
        "p_": "Перешеек",
        "summarniy": "Суммарный объём",
        "zaklyuchenie": "Заключение",
        "rekomendatsi": "Рекомендации",
    },
    3: {  # Селезёнка
        "p_": "Селезёнка",
        "zaklyuchenie": "Заключение",
        "rekomendatsi": "Рекомендации",
    },
    4: {  # Коленный сустав
        "sjp": "Суставная щель правая",
        "sjl": "Суставная щель левая",
        "gx": "Гиалиновый хрящ",
        "mt": "Мягкие ткани",
        "mmp": "Мениск медиальный правый",
        "mlp": "Мениск латеральный правый",
        "mmz": "Мениск медиальный левый",
        "mlz": "Мениск латеральный левый",
        "zaklyuchenie": "Заключение",
        "rekomendatsi": "Рекомендации",
    },
    5: {  # Надпочечники
        "pr_": "Правый надпочечник",
        "lv_": "Левый надпочечник",
        "zaklyuchenie": "Заключение",
        "rekomendatsi": "Рекомендации",
    },
}

# Ruscha maydon nomlari
FIELD_LABELS: Dict[str, str] = {
    "topografiya": "Топография",
    "forma": "Форма",
    "kontur": "Контур",
    "kapsula": "Капсула",
    "dlina": "Длина (мм)",
    "tolshina": "Толщина (мм)",
    "shirina": "Ширина (мм)",
    "obyom": "Объём (см³)",
    "exostruktura": "Эхоструктура",
    "ehostruktura": "Эхоструктура",
    "exogennost": "Эхогенность",
    "ehogennost": "Эхогенность",
    "elastichnost": "Эластичность",
    "podvijnost": "Подвижность",
    "vlagalishe": "Влагалищная оболочка (мм)",
    "obolochki": "Оболочки (мм)",
    "rasshireniya": "Расширения (мм)",
    "golovki": "Головки (мм)",
    "tela": "Тела (мм)",
    "dannie": "Данные",
    "arxitektonika": "Архитектоника",
    "zvuk": "Звукопроводимость",
    "index": "Индекс",
    "ploshad": "Площадь (см²)",
    "struktura": "Структура",
    "prodolniy": "Продольный размер (мм)",
    "poperechniy": "Поперечный размер (мм)",
    "zaklyuchenie": "Заключение",
    "rekomendatsi": "Рекомендации",
    "massa": "Масса (г)",
    "diametr": "Диаметр (мм)",
    "kolichestvo": "Количество",
    "udar": "Ударов/мин",
    "serdtse": "Сердцебиение",
    "mocha1": "Объём до мочеиспускания (мл)",
    "mocha2": "Объём после мочеиспускания (мл)",
    "prostata": "Простата",
    "polojeniye": "Положение",
    "pozitsiya": "Позиция",
    "sootnosheniye": "Соотношение",
    "polost": "Полость",
    "endometriya": "Толщина эндометрия (мм)",
    "endometriya2": "Эхоструктура эндометрия",
    "trubi": "Трубы",
    "follikul": "Фолликулы",
    "duglasovo": "Дугласово пространство",
    "menopauza": "Менопауза",
    "data": "Дата последних месячных",
    "data2": "Дата менструации",
    "tkan": "Тип ткани",
    "galaktofori": "Галактофоры",
    "intrama": "Интрамаммарные л/у",
    "retroma": "Ретромаммарное пространство",
    "limfa": "Регионарные л/у",
    "lokalizatsiya": "Локализация",
    "zrelost": "Степень зрелости",
    "iaj": "ИАЖ (мм)",
    "normovodie": "Многоводие/маловодие",
    "yaichniki": "Яичники",
    "osobennosti": "Особенности",
    "dvijeniya": "Движения",
    "sosatel": "Сосательные движения",
    "glotatel": "Глотательные движения",
    "konechnost": "Конечности",
    "pupovina": "Пуповина",
    "datapervogo": "Дата первого дня",
    "datarodov": "Предполагаемая дата родов",
    "razmer": "Размер",
    "ned": "Недели",
    "dnya": "Дни",
}


def _humanize_key(key: str) -> str:
    """Maydon nomidan ruscha label yaratish"""
    # Oxirgi qismni olish (seksiya prefikslari keyin)
    parts = key.rsplit("_", 1)
    suffix = parts[-1] if parts else key
    return FIELD_LABELS.get(suffix, key.replace("_", " ").capitalize())


def _set_cell_bg(cell, color: str):
    """Jadval katakchasiga fon rangi berish"""
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), color)
    tcPr.append(shd)


def _add_heading(doc: Document, text: str, level: int = 1):
    """Sarlavha qo'shish"""
    h = doc.add_heading(text, level=level)
    h.alignment = WD_ALIGN_PARAGRAPH.LEFT
    run = h.runs[0] if h.runs else h.add_run(text)
    if level == 1:
        run.font.color.rgb = RGBColor(0x1A, 0x52, 0x76)
        run.font.size = Pt(14)
    elif level == 2:
        run.font.color.rgb = RGBColor(0x21, 0x61, 0x8A)
        run.font.size = Pt(11)
    return h


def _add_section_table(doc: Document, fields: list[tuple[str, str]]):
    """Maydonlar jadvali qo'shish (2 ustunli)"""
    if not fields:
        return
    table = doc.add_table(rows=len(fields), cols=2)
    table.style = "Table Grid"
    for i, (label, value) in enumerate(fields):
        row = table.rows[i]
        # Label katakchasi
        label_cell = row.cells[0]
        label_cell.width = Cm(7)
        label_para = label_cell.paragraphs[0]
        label_run = label_para.add_run(label)
        label_run.font.bold = True
        label_run.font.size = Pt(9)
        _set_cell_bg(label_cell, "EBF5FB")
        # Qiymat katakchasi
        val_cell = row.cells[1]
        val_para = val_cell.paragraphs[0]
        val_run = val_para.add_run(value or "")
        val_run.font.size = Pt(9)
    doc.add_paragraph()


def generate_protocol_docx(
    protocol_id: int,
    form_data: Dict[str, Any],
    client: Dict[str, Any],
    doctor: Dict[str, Any],
    created_at: str = "",
    protocol_title: str = "",
) -> bytes:
    """
    Protokol uchun DOCX fayl generatsiyasi.
    Qaytaradi: bytes (DOCX fayl)
    """
    doc = Document()

    # Sahifa o'lchamlari (A4)
    section = doc.sections[0]
    section.page_width = Cm(21)
    section.page_height = Cm(29.7)
    section.left_margin = Cm(2)
    section.right_margin = Cm(1.5)
    section.top_margin = Cm(2)
    section.bottom_margin = Cm(2)

    # Sarlavha: DB'dan olingan title yoki fallback
    if not protocol_title:
        protocol_title = PROTOCOL_TITLES.get(protocol_id, f"ПРОТОКОЛ №{protocol_id}")
    protocol_title = protocol_title.upper()

    title_para = doc.add_paragraph()
    title_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title_run = title_para.add_run("NEVROCARDIOMED")
    title_run.font.bold = True
    title_run.font.size = Pt(16)
    title_run.font.color.rgb = RGBColor(0x1A, 0x52, 0x76)

    subtitle_para = doc.add_paragraph()
    subtitle_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
    subtitle_run = subtitle_para.add_run(protocol_title)
    subtitle_run.font.bold = True
    subtitle_run.font.size = Pt(13)
    subtitle_run.font.color.rgb = RGBColor(0x21, 0x61, 0x8A)

    doc.add_paragraph()

    # Bemor ma'lumotlari jadvali
    info_table = doc.add_table(rows=4, cols=2)
    info_table.style = "Table Grid"

    def set_info_row(idx: int, label: str, value: str):
        row = info_table.rows[idx]
        lc = row.cells[0]
        _set_cell_bg(lc, "D6EAF8")
        lp = lc.paragraphs[0]
        lr = lp.add_run(label)
        lr.font.bold = True
        lr.font.size = Pt(9)
        vc = row.cells[1]
        vp = vc.paragraphs[0]
        vr = vp.add_run(value or "")
        vr.font.size = Pt(9)

    client_name = f"{client.get('last_name', '')} {client.get('first_name', '')}"
    gender_raw = client.get("gender", "")
    gender = "Мужской" if gender_raw == "male" else "Женский"
    birth_date = client.get("birth_date", "")
    doctor_name = f"{doctor.get('last_name', '')} {doctor.get('first_name', '')} {doctor.get('patronymic_name', '')}".strip()
    doctor_phone = doctor.get("phone", "")

    # Sanani formatlash
    date_str = created_at or datetime.now().strftime("%Y-%m-%d")
    try:
        months_ru = [
            "января", "февраля", "марта", "апреля", "мая", "июня",
            "июля", "августа", "сентября", "октября", "ноября", "декабря",
        ]
        y, m, d = date_str.split("-")
        date_ru = f"{int(d)} {months_ru[int(m) - 1]} {y} г."
    except Exception:
        date_ru = date_str

    set_info_row(0, "Пациент", client_name)
    set_info_row(1, f"Пол / Дата рождения", f"{gender} / {birth_date}")
    set_info_row(2, "Дата исследования", date_ru)
    set_info_row(3, "Врач", f"{doctor_name}  тел: {doctor_phone}")

    doc.add_paragraph()

    # Protokol maydonlarini seksiyalarga ajratib yozish
    # Seksiyani aniqlaymiz: maydon nomi prefiksi orqali
    sections_data: Dict[str, list] = {}
    special_fields = {}  # zaklyuchenie va rekomendatsi alohida

    for key, value in form_data.items():
        if not value or str(value).strip() == "":
            continue
        key_lower = key.lower()
        if "zaklyuchenie" in key_lower:
            special_fields.setdefault("Заключение", []).append((_humanize_key(key), str(value)))
            continue
        if "rekomendatsi" in key_lower:
            special_fields.setdefault("Рекомендации", []).append((_humanize_key(key), str(value)))
            continue

        # Seksiya nomini aniqlash
        section_name = _detect_section(key, protocol_id)
        sections_data.setdefault(section_name, []).append((_humanize_key(key), str(value)))

    # Seksiyalarni yoz
    _add_heading(doc, "ДАННЫЕ ИССЛЕДОВАНИЯ", level=1)

    for sec_name, fields in sections_data.items():
        if fields:
            _add_heading(doc, sec_name, level=2)
            _add_section_table(doc, fields)

    # Zaключение
    for special_key in ["Заключение", "Рекомендации"]:
        if special_key in special_fields:
            _add_heading(doc, special_key, level=2)
            for _, val in special_fields[special_key]:
                p = doc.add_paragraph(val)
                p.paragraph_format.left_indent = Cm(0.5)
                for run in p.runs:
                    run.font.size = Pt(9)
            doc.add_paragraph()

    # Imzo
    doc.add_paragraph()
    sig_table = doc.add_table(rows=1, cols=2)
    sig_table.style = "Table Grid"
    left = sig_table.rows[0].cells[0]
    right = sig_table.rows[0].cells[1]
    _set_cell_bg(left, "FDFEFE")
    _set_cell_bg(right, "FDFEFE")
    lp = left.paragraphs[0]
    lp.add_run(f"Врач: {doctor_name}").font.size = Pt(9)
    rp = right.paragraphs[0]
    rp.add_run("Подпись: _________________").font.size = Pt(9)

    # Bytes sifatida qaytarish
    buf = io.BytesIO()
    doc.save(buf)
    buf.seek(0)
    return buf.read()


def _detect_section(key: str, protocol_id: int) -> str:
    """Kalit bo'yicha seksiya nomini aniqlash"""
    k = key.lower()

    # Universal seksiya aniqlash
    if k.startswith("yai_pr"):
        return "Правое яичко"
    if k.startswith("yai_le"):
        return "Левое яичко"
    if k.startswith("pri_pr"):
        return "Правый придаток"
    if k.startswith("pri_le"):
        return "Левый придаток"
    if k.startswith("dp_"):
        return "Правая доля"
    if k.startswith("dl_"):
        return "Левая доля"
    if k.startswith("lv_"):
        return "Левый надпочечник"
    if k.startswith("pr_") and protocol_id == 5:
        return "Правый надпочечник"
    if k.startswith("sjp"):
        return "Суставная щель правая"
    if k.startswith("sjl"):
        return "Суставная щель левая"
    if k.startswith("gx"):
        return "Гиалиновый хрящ"
    if k.startswith("mmp"):
        return "Мениск медиальный правый"
    if k.startswith("mlp"):
        return "Мениск латеральный правый"
    if k.startswith("mmz"):
        return "Мениск медиальный левый"
    if k.startswith("mlz"):
        return "Мениск латеральный левый"
    if k.startswith("mt"):
        return "Мягкие ткани / Матка"
    if k.startswith("py_"):
        return "Плодное яйцо"
    if k.startswith("jm_"):
        return "Желточный мешочек"
    if k.startswith("em_"):
        return "Эмбрион"
    if k.startswith("uh_"):
        return "Хорион"
    if k.startswith("jpu"):
        return "Желчный пузырь"
    if k.startswith("jpr"):
        return "Желчные протоки"
    if k.startswith("s_"):
        return "Сосуды"
    if k.startswith("pp_"):
        return "Правая почка / Правый яичник"
    if k.startswith("pl_"):
        return "Левая почка / Плацента"
    if k.startswith("mp_"):
        return "Мочевой пузырь"
    if k.startswith("m_"):
        return "Матка"
    if k.startswith("shm_"):
        return "Шейка матки"
    if k.startswith("yp_"):
        return "Правый яичник"
    if k.startswith("yl_"):
        return "Левый яичник"
    if k.startswith("mtp") or k.startswith("mtl"):
        return "Трубы"
    if k.startswith("pp_"):
        return "Правая молочная железа"
    if k.startswith("pl_"):
        return "Левая молочная железа"
    if k.startswith("jtp"):
        return "Правая железистая ткань"
    if k.startswith("jtl"):
        return "Левая железистая ткань"
    if k.startswith("pj"):
        return "Предстательная железа"
    if k.startswith("sl_"):
        return "Левый семенной пузырёк"
    if k.startswith("sp_"):
        return "Правый семенной пузырёк"
    if k.startswith("p_") and "follik" in k:
        return "Правый яичник"
    if k.startswith("l_") and "follik" in k:
        return "Левый яичник"
    if k.startswith("f_") and "follik" in k:
        return "Матка"
    if "selezenki" in k:
        return "Селезёнка"
    if "nadpochechniki" in k:
        return "Надпочечники"
    if "pechen_blank" in k:
        return "Печень"
    if "pochki_blank" in k:
        return "Почки"
    if "mal_taz" in k:
        return "Малый таз"
    if "malochniy_jel" in k:
        return "Молочные железы"
    if "padjeludoch" in k:
        return "Поджелудочная железа"
    if "tri_ber" in k:
        return "I Триместр"
    if k.startswith("p_"):
        return "Основные данные"
    return "Данные"

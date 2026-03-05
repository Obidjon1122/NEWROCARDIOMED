"""
DOCX yaratuvchi servis - python-docx orqali tibbiy protokol hujjatini yaratadi
"""
import io
from datetime import datetime
from typing import Any, Dict

from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement


# ─── Protocol sections mapping (mirrors protocolForms.ts) ────────────────────
# protocolId -> list of (section_title, key_prefixes_or_exact_keys)
PROTOCOL_SECTIONS: Dict[int, list] = {
    1: [  # УЗИ печени и желчного пузыря
        ("Печень", ["topografia", "kontury", "pzr_levoy", "kkr_levoy", "pzr_hvost",
                    "pzr_pravoy", "kkr_pravoy", "kvr", "lateral", "ugol_pravoy",
                    "ugol_levoy", "obem", "massa", "ehostruktura", "ehogennost", "zvukoprovodimost"]),
        ("Сосуды", ["pechenochnye_veny", "summ_diametr", "portal_vena", "polaya_vena"]),
        ("Желчные протоки", ["vnutripech", "obshchiy_zhelchny"]),
        ("Желчный пузырь", ["zp_topografia", "zp_forma", "zp_kontur", "zp_dlina",
                            "zp_tolshchina", "zp_shirina", "zp_obem", "zp_ploshchad",
                            "puzyrny_protok", "tolshch_stenko", "soderzhimoe"]),
        ("Заключение", ["zaklyuchenie"]),
        ("Рекомендации", ["rekomendacii"]),
    ],
    2: [  # УЗИ почек
        ("Правая почка", ["pr_topografia", "pr_podvizhnost", "pr_zhir_kapsul", "pr_fibr_kapsul",
                          "pr_kontury", "pr_dlina", "pr_tolshchina", "pr_shirina", "pr_obem",
                          "pr_parenhima", "pr_ehogennost", "pr_chls", "pr_kri",
                          "pr_konkrementy", "pr_mochetchnik"]),
        ("Левая почка", ["lv_topografia", "lv_podvizhnost", "lv_zhir_kapsul", "lv_fibr_kapsul",
                         "lv_kontury", "lv_dlina", "lv_tolshchina", "lv_shirina", "lv_obem",
                         "lv_parenhima", "lv_ehogennost", "lv_chls", "lv_kri",
                         "lv_konkrementy", "lv_mochetchnik"]),
        ("Мочевой пузырь", ["mp_obem", "mp_forma", "mp_narzhn_kontur", "mp_vnutr_kontur",
                            "mp_tolshch_do", "mp_tolshch_posle", "mp_soderzhimoe",
                            "mp_sheyka", "mp_ustya", "mp_ostatochn"]),
        ("Заключение", ["zaklyuchenie"]),
        ("Рекомендации", ["rekomendacii"]),
    ],
    3: [  # УЗИ щитовидной железы
        ("Перешеек", ["per_topografia", "per_kontur", "per_elastichnost", "per_podvizhnost",
                      "per_tolshchina", "per_ehostruktura", "per_ehogennost"]),
        ("Правая доля", ["pr_topografia", "pr_kontur", "pr_elastichnost", "pr_podvizhnost",
                         "pr_dlina", "pr_tolshchina", "pr_shirina", "pr_obem",
                         "pr_forma", "pr_ehostruktura", "pr_ehogennost"]),
        ("Левая доля", ["lv_topografia", "lv_kontur", "lv_elastichnost", "lv_podvizhnost",
                        "lv_dlina", "lv_tolshchina", "lv_shirina", "lv_obem",
                        "lv_forma", "lv_ehostruktura", "lv_ehogennost"]),
        ("Суммарный объём", ["summ_obem", "ves_pacienta", "norma_obem"]),
        ("Заключение", ["zaklyuchenie"]),
        ("Рекомендации", ["rekomendacii"]),
    ],
    4: [  # УЗИ поджелудочной железы
        ("Поджелудочная железа", ["topografia", "forma", "kontur", "tolshch_golovki",
                                   "tolshch_tela", "tolshch_hvosta", "dlina",
                                   "ehostruktura", "ehogennost", "zvukoprovodimost",
                                   "virsungov_golovka", "virsungov_telo"]),
        ("Заключение", ["zaklyuchenie"]),
        ("Рекомендации", ["rekomendacii"]),
    ],
    5: [  # УЗИ селезёнки
        ("Селезёнка", ["topografia", "forma", "kontury", "dlina", "tolshchina",
                       "shirina", "obem", "indeks", "ehostruktura", "ehogennost",
                       "zvukoprovodimost", "v_lienalis"]),
        ("Заключение", ["zaklyuchenie"]),
        ("Рекомендации", ["rekomendacii"]),
    ],
    6: [  # УЗИ предстательной железы
        ("Предстательная железа", ["topografia", "forma", "kontur", "kapsul",
                                    "dlina", "tolshchina", "shirina", "obem", "indeks",
                                    "ehostruktura", "ehogennost", "mocheispusk_kanal",
                                    "nach_obem_mp", "ostatochn_mocha"]),
        ("Семенные пузырьки — Правый", ["pr_sp_topografia", "pr_sp_kontur", "pr_sp_dlina",
                                         "pr_sp_tolshchina", "pr_sp_shirina", "pr_sp_ehogennost"]),
        ("Семенные пузырьки — Левый", ["lv_sp_topografia", "lv_sp_kontur", "lv_sp_dlina",
                                        "lv_sp_tolshchina", "lv_sp_shirina", "lv_sp_ehogennost"]),
        ("Заключение", ["zaklyuchenie"]),
        ("Рекомендации", ["rekomendacii"]),
    ],
    7: [  # УЗИ молочных желез
        ("ПРАВАЯ молочная железа", ["pr_topografia", "pr_kozha_kontur", "pr_kozha_tolshch",
                                     "pr_kozha_ehogen", "pr_kozha_ehostr", "pr_podkozh_zhi",
                                     "pr_retromam_zhi", "pr_parenhima_t", "pr_parenhima_e",
                                     "pr_parenhima_s", "pr_limf_uzly"]),
        ("ЛЕВАЯ молочная железа", ["lv_topografia", "lv_kozha_kontur", "lv_kozha_tolshch",
                                    "lv_kozha_ehogen", "lv_kozha_ehostr", "lv_podkozh_zhi",
                                    "lv_retromam_zhi", "lv_parenhima_t", "lv_parenhima_e",
                                    "lv_parenhima_s", "lv_limf_uzly"]),
        ("Заключение", ["zaklyuchenie"]),
        ("Рекомендации", ["rekomendacii"]),
    ],
    8: [  # УЗИ мочевого пузыря
        ("Мочевой пузырь", ["obem", "forma", "narzhn_kontur", "vnutr_kontur",
                            "tolshch_do", "tolshch_posle", "soderzhimoe",
                            "sheyka", "ustya", "ostatochn_mocha"]),
        ("Заключение", ["zaklyuchenie"]),
        ("Рекомендации", ["rekomendacii"]),
    ],
    9: [  # УЗИ органов малого таза
        ("Матка", ["data_menstr", "den_cikla", "poziciya", "polozhenie", "forma",
                   "dlina", "tolshchina", "shirina", "obem", "kontur",
                   "miometri_ehostr", "miometri_ehogen", "endometri_tolshch",
                   "endometri_faza", "endometri_ehostr", "polost_matki"]),
        ("Шейка матки", ["sheyka_dlina", "sheyka_tolshch", "sheyka_shirina",
                         "endocerviks_tolshch", "sheyka_ehostr", "polost_sheyki"]),
        ("Правый яичник", ["pr_ya_topografia", "pr_ya_forma", "pr_ya_kontur",
                           "pr_ya_dlina", "pr_ya_tolshch", "pr_ya_shirina",
                           "pr_ya_obem", "pr_ya_follik", "pr_ya_ehogennost"]),
        ("Левый яичник", ["lv_ya_topografia", "lv_ya_forma", "lv_ya_kontur",
                          "lv_ya_dlina", "lv_ya_tolshch", "lv_ya_shirina",
                          "lv_ya_obem", "lv_ya_follik", "lv_ya_ehogennost"]),
        ("Маточные трубы и Дугласово пространство", ["pr_truba", "lv_truba", "duglas"]),
        ("Заключение", ["zaklyuchenie"]),
        ("Рекомендации", ["rekomendacii"]),
    ],
    10: [  # УЗИ надпочечников
        ("Правый надпочечник", ["pr_topografia", "pr_forma", "pr_prodolzhn", "pr_poperechn",
                                 "pr_tolshchina", "pr_ploshchad", "pr_indeks",
                                 "pr_ehostruktura", "pr_ehogennost"]),
        ("Левый надпочечник", ["lv_topografia", "lv_forma", "lv_prodolzhn", "lv_poperechn",
                                "lv_tolshchina", "lv_ploshchad", "lv_indeks",
                                "lv_ehostruktura", "lv_ehogennost"]),
        ("Заключение", ["zaklyuchenie"]),
        ("Рекомендации", ["rekomendacii"]),
    ],
    11: [  # УЗИ коленного сустава
        ("Коленный сустав", ["storona"]),
        ("Собственная связка надколенника", ["sv_kontur", "sv_tolshchina",
                                              "sv_ehostruktura", "sv_ehogennost"]),
        ("Связки и пространства", ["med_svyaz", "lat_svyaz", "goffa", "myshcy_sumki"]),
        ("Суставная жидкость и хрящ", ["sust_zhidk_tolshch", "sust_zhidk_ehogen",
                                        "sust_shchel", "hrust_kontur", "hrust_tolshch",
                                        "hrust_ehostr"]),
        ("Мениски — Медиальный", ["med_per_forma", "med_per_kontur", "med_per_ehostr",
                                   "med_zad_forma", "med_zad_kontur", "med_zad_ehostr"]),
        ("Мениски — Латеральный", ["lat_per_forma", "lat_per_kontur", "lat_per_ehostr",
                                    "lat_zad_forma", "lat_zad_kontur", "lat_zad_ehostr"]),
        ("Костные структуры", ["bedro", "bolshebertsov", "nadkolenn"]),
        ("Заключение", ["zaklyuchenie"]),
        ("Рекомендации", ["rekomendacii"]),
    ],
    12: [  # УЗИ в I триместре
        ("Матка", ["kontur", "ehostruktura", "dlina", "tolshchina", "shirina"]),
        ("Плодное яйцо", ["data_posled_menstr", "srok_bere", "data_rodov_menstr",
                          "data_rodov_razmer", "topografia", "forma",
                          "sred_diametr", "sred_diametr_srok"]),
        ("Эмбрион", ["ktr", "ktr_srok", "serdcebienie", "chss", "vp_tolshchina",
                     "zheltochny", "zheltochny_diametr", "horion_lokalizac", "horion_tolshch"]),
        ("Заключение", ["zaklyuchenie"]),
        ("Рекомендации", ["rekomendacii"]),
    ],
    13: [  # УЗИ плода
        ("Беременность", ["data_posled_menstr", "srok_menstr", "data_rodov_menstr",
                          "data_rodov_razmer", "matka_kontur", "matka_ehostr"]),
        ("Плод", ["polozhenie", "dvizheniya", "serdcebienie", "chss"]),
        ("Фетометрия", ["bpr", "bpr_srok", "lzr", "lzr_srok", "cefalich_indeks",
                        "bedro", "bedro_srok", "okr_gol", "okr_gol_srok",
                        "okr_zhiv", "okr_zhiv_srok", "pupovina"]),
        ("Плацента", ["plac_lokalizac", "plac_tolshchina", "plac_zrelost",
                      "plac_ehostr", "okoloplodny_vody", "massa_ploda"]),
        ("Заключение", ["zaklyuchenie"]),
        ("Рекомендации", ["rekomendacii"]),
    ],
    14: [  # Сердцебиение
        ("Сердцебиение", ["sred_diametr", "sred_diametr_srok", "ktr", "ktr_srok",
                          "serdcebienie", "chss", "zheltochny_diametr"]),
        ("Заключение", ["zaklyuchenie"]),
    ],
    15: [  # Фолликулометрия
        ("Данные обследования", ["den_cikla", "data_menstr"]),
        ("Матка", ["dlina", "tolshchina", "shirina", "endometri",
                   "endometri_ehostr", "miometri"]),
        ("Правый яичник", ["pr_dlina", "pr_shirina", "pr_tolshchina", "pr_obem",
                           "pr_follikuly", "pr_dominant"]),
        ("Левый яичник", ["lv_dlina", "lv_shirina", "lv_tolshchina", "lv_obem",
                          "lv_follikuly", "lv_dominant"]),
        ("Заключение", ["zaklyuchenie"]),
        ("Рекомендации", ["rekomendacii"]),
    ],
}

# ─── Field label mapping (key → human-readable label) ─────────────────────────
FIELD_LABELS: Dict[str, str] = {
    # General
    "topografia": "Топография",
    "kontury": "Контуры",
    "kontur": "Контур",
    "forma": "Форма",
    "obem": "Объём (см³)",
    "massa": "Масса (г)",
    "dlina": "Длина (мм)",
    "tolshchina": "Толщина (мм)",
    "shirina": "Ширина (мм)",
    "ehostruktura": "Эхоструктура",
    "ehogennost": "Эхогенность",
    "zvukoprovodimost": "Звукопроводимость",
    "indeks": "Индекс",
    "ploshchad": "Площадь (см²)",
    # Liver
    "pzr_levoy": "ПЗР левой доли (мм)",
    "kkr_levoy": "ККР левой доли (мм)",
    "pzr_hvost": "ПЗР хвостатой доли (мм)",
    "pzr_pravoy": "ПЗР правой доли (мм)",
    "kkr_pravoy": "ККР правой доли (мм)",
    "kvr": "КВР (мм)",
    "lateral": "Латерально-латеральный размер (см)",
    "ugol_pravoy": "Нижний угол правой доли",
    "ugol_levoy": "Нижний угол левой доли",
    "pechenochnye_veny": "Долевые печёночные вены (мм)",
    "summ_diametr": "Суммарный диаметр (мм)",
    "portal_vena": "Портальная вена (мм)",
    "polaya_vena": "Нижняя полая вена (мм)",
    "vnutripech": "Внутрипечёночные протоки",
    "obshchiy_zhelchny": "Общий желчный проток (мм)",
    "zp_topografia": "Желчный пузырь — топография",
    "zp_forma": "Желчный пузырь — форма",
    "zp_kontur": "Желчный пузырь — контур",
    "zp_dlina": "Желчный пузырь — длина (мм)",
    "zp_tolshchina": "Желчный пузырь — толщина (мм)",
    "zp_shirina": "Желчный пузырь — ширина (мм)",
    "zp_obem": "Желчный пузырь — объём (см³)",
    "zp_ploshchad": "Площадь по длиннику (см²)",
    "puzyrny_protok": "Пузырный проток",
    "tolshch_stenko": "Толщина стенки (мм)",
    "soderzhimoe": "Содержимое",
    # Kidneys
    "pr_topografia": "Топография",
    "pr_podvizhnost": "Дыхательная подвижность",
    "pr_zhir_kapsul": "Жировая капсула",
    "pr_fibr_kapsul": "Фиброзная капсула",
    "pr_kontury": "Контуры",
    "pr_dlina": "Длина (мм)",
    "pr_tolshchina": "Толщина (мм)",
    "pr_shirina": "Ширина (мм)",
    "pr_obem": "Объём (см³)",
    "pr_parenhima": "Толщина паренхимы (мм)",
    "pr_ehogennost": "Эхогенность паренхимы",
    "pr_chls": "ЧЛС толщина (мм)",
    "pr_kri": "Кортико-ренальный индекс",
    "pr_konkrementy": "Конкременты в ЧЛС",
    "pr_mochetchnik": "Мочеточник",
    "lv_topografia": "Топография",
    "lv_podvizhnost": "Дыхательная подвижность",
    "lv_zhir_kapsul": "Жировая капсула",
    "lv_fibr_kapsul": "Фиброзная капсула",
    "lv_kontury": "Контуры",
    "lv_dlina": "Длина (мм)",
    "lv_tolshchina": "Толщина (мм)",
    "lv_shirina": "Ширина (мм)",
    "lv_obem": "Объём (см³)",
    "lv_parenhima": "Толщина паренхимы (мм)",
    "lv_ehogennost": "Эхогенность паренхимы",
    "lv_chls": "ЧЛС толщина (мм)",
    "lv_kri": "Кортико-ренальный индекс",
    "lv_konkrementy": "Конкременты в ЧЛС",
    "lv_mochetchnik": "Мочеточник",
    "mp_obem": "Объём (мл)",
    "mp_forma": "Форма",
    "mp_narzhn_kontur": "Наружный контур",
    "mp_vnutr_kontur": "Внутренний контур",
    "mp_tolshch_do": "Толщина стенки до опорожнения (мм)",
    "mp_tolshch_posle": "Толщина стенки после опорожнения (мм)",
    "mp_soderzhimoe": "Содержимое",
    "mp_sheyka": "Состояние шейки, зева",
    "mp_ustya": "Локализация устьев мочеточников",
    "mp_ostatochn": "Объём остаточной мочи (мл)",
    # Thyroid
    "per_topografia": "Топография",
    "per_kontur": "Контур",
    "per_elastichnost": "Эластичность",
    "per_podvizhnost": "Глотательная подвижность",
    "per_tolshchina": "Размер — толщина (мм)",
    "per_ehostruktura": "Эхоструктура",
    "per_ehogennost": "Эхогенность",
    "pr_elastichnost": "Эластичность",
    "pr_podvizhnost": "Глотательная подвижность",
    "pr_forma": "Форма",
    "pr_ehostruktura": "Эхоструктура",
    "lv_kontur": "Контур",
    "lv_elastichnost": "Эластичность",
    "lv_podvizhnost": "Глотательная подвижность",
    "lv_forma": "Форма",
    "lv_ehostruktura": "Эхоструктура",
    "summ_obem": "Суммарный объём (см³)",
    "ves_pacienta": "Вес пациента (кг)",
    "norma_obem": "Норма объёма при данном весе (см³)",
    # Pancreas
    "tolshch_golovki": "Толщина головки (мм)",
    "tolshch_tela": "Толщина тела (мм)",
    "tolshch_hvosta": "Толщина хвоста (мм)",
    "virsungov_golovka": "Вирсунгов проток — головка (мм)",
    "virsungov_telo": "Вирсунгов проток — тело (мм)",
    # Spleen
    "v_lienalis": "v. lienalis (мм)",
    # Prostate
    "kapsul": "Капсула, толщина (мм)",
    "mocheispusk_kanal": "Простатическая часть мочеиспускательного канала",
    "nach_obem_mp": "Начальный объём мочевого пузыря (мл)",
    "ostatochn_mocha": "Остаточная моча (мл)",
    "pr_sp_topografia": "Топография",
    "pr_sp_kontur": "Контур",
    "pr_sp_dlina": "Длина (мм)",
    "pr_sp_tolshchina": "Толщина (мм)",
    "pr_sp_shirina": "Ширина (мм)",
    "pr_sp_ehogennost": "Эхогенность",
    "lv_sp_topografia": "Топография",
    "lv_sp_kontur": "Контур",
    "lv_sp_dlina": "Длина (мм)",
    "lv_sp_tolshchina": "Толщина (мм)",
    "lv_sp_shirina": "Ширина (мм)",
    "lv_sp_ehogennost": "Эхогенность",
    # Breast
    "pr_kozha_kontur": "Кожа — контур",
    "pr_kozha_tolshch": "Кожа — толщина (мм)",
    "pr_kozha_ehogen": "Кожа — эхогенность",
    "pr_kozha_ehostr": "Кожа — эхоструктура",
    "pr_podkozh_zhi": "Подкожная жировая ткань — толщина (мм)",
    "pr_retromam_zhi": "Ретромаммарная жировая ткань — толщина (мм)",
    "pr_parenhima_t": "Паренхима — толщина (мм)",
    "pr_parenhima_e": "Паренхима — эхогенность",
    "pr_parenhima_s": "Паренхима — эхоструктура",
    "pr_limf_uzly": "Лимфатические узлы",
    "lv_kozha_kontur": "Кожа — контур",
    "lv_kozha_tolshch": "Кожа — толщина (мм)",
    "lv_kozha_ehogen": "Кожа — эхогенность",
    "lv_kozha_ehostr": "Кожа — эхоструктура",
    "lv_podkozh_zhi": "Подкожная жировая ткань — толщина (мм)",
    "lv_retromam_zhi": "Ретромаммарная жировая ткань — толщина (мм)",
    "lv_parenhima_t": "Паренхима — толщина (мм)",
    "lv_parenhima_e": "Паренхима — эхогенность",
    "lv_parenhima_s": "Паренхима — эхоструктура",
    "lv_limf_uzly": "Лимфатические узлы",
    # Bladder
    "narzhn_kontur": "Наружный контур",
    "vnutr_kontur": "Внутренний контур",
    "tolshch_do": "Толщина стенки до опорожнения (мм)",
    "tolshch_posle": "Толщина стенки после опорожнения (мм)",
    "sheyka": "Состояние шейки, зева",
    "ustya": "Локализация устьев мочеточников",
    # Uterus / small pelvis
    "data_menstr": "Дата 1-го дня последней менструации",
    "den_cikla": "День менструального цикла",
    "poziciya": "Позиция",
    "polozhenie": "Положение",
    "miometri_ehostr": "Эхоструктура миометрия",
    "miometri_ehogen": "Эхогенность миометрия",
    "endometri_tolshch": "Толщина эндометрия — М-эхо (мм)",
    "endometri_faza": "Соответствует фазе",
    "endometri_ehostr": "Эхоструктура эндометрия",
    "polost_matki": "Полость матки",
    "sheyka_dlina": "Длина (мм)",
    "sheyka_tolshch": "Толщина (мм)",
    "sheyka_shirina": "Ширина (мм)",
    "endocerviks_tolshch": "Толщина эндоцервикса (мм)",
    "sheyka_ehostr": "Эхоструктура стенки",
    "polost_sheyki": "Полость шейки (канал)",
    "pr_ya_topografia": "Топография",
    "pr_ya_forma": "Форма",
    "pr_ya_kontur": "Контур",
    "pr_ya_dlina": "Длина (мм)",
    "pr_ya_tolshch": "Толщина (мм)",
    "pr_ya_shirina": "Ширина (мм)",
    "pr_ya_obem": "Объём (см³)",
    "pr_ya_follik": "Фолликулы диаметром",
    "pr_ya_ehogennost": "Эхогенность",
    "lv_ya_topografia": "Топография",
    "lv_ya_forma": "Форма",
    "lv_ya_kontur": "Контур",
    "lv_ya_dlina": "Длина (мм)",
    "lv_ya_tolshch": "Толщина (мм)",
    "lv_ya_shirina": "Ширина (мм)",
    "lv_ya_obem": "Объём (см³)",
    "lv_ya_follik": "Фолликулы диаметром",
    "lv_ya_ehogennost": "Эхогенность",
    "pr_truba": "Правая маточная труба",
    "lv_truba": "Левая маточная труба",
    "duglas": "Дугласово пространство",
    # Adrenal
    "pr_prodolzhn": "Продольный размер (мм)",
    "pr_poperechn": "Поперечный размер (мм)",
    "pr_ploshchad": "Площадь (см²)",
    "pr_indeks": "Индекс гиперплазии",
    "pr_ehostruktura": "Эхоструктура",
    "lv_prodolzhn": "Продольный размер (мм)",
    "lv_poperechn": "Поперечный размер (мм)",
    "lv_ploshchad": "Площадь (см²)",
    "lv_indeks": "Индекс гиперплазии",
    # Knee
    "storona": "Сустав",
    "sv_kontur": "Контур",
    "sv_tolshchina": "Толщина (мм)",
    "sv_ehostruktura": "Эхоструктура",
    "sv_ehogennost": "Эхогенность",
    "med_svyaz": "Медиальная связка",
    "lat_svyaz": "Латеральная связка",
    "goffa": "Пространство Гоффа",
    "myshcy_sumki": "Мышцы, суставные сумки, связки",
    "sust_zhidk_tolshch": "Суставная жидкость — толщина (мм)",
    "sust_zhidk_ehogen": "Эхогенность жидкости",
    "sust_shchel": "Толщина суставной щели (мм)",
    "hrust_kontur": "Гиалиновый хрящ — контур",
    "hrust_tolshch": "Гиалиновый хрящ — толщина (мм)",
    "hrust_ehostr": "Гиалиновый хрящ — эхоструктура",
    "med_per_forma": "Передний рог — форма",
    "med_per_kontur": "Передний рог — контур",
    "med_per_ehostr": "Передний рог — эхоструктура",
    "med_zad_forma": "Задний рог — форма",
    "med_zad_kontur": "Задний рог — контур",
    "med_zad_ehostr": "Задний рог — эхоструктура",
    "lat_per_forma": "Передний рог — форма",
    "lat_per_kontur": "Передний рог — контур",
    "lat_per_ehostr": "Передний рог — эхоструктура",
    "lat_zad_forma": "Задний рог — форма",
    "lat_zad_kontur": "Задний рог — контур",
    "lat_zad_ehostr": "Задний рог — эхоструктура",
    "bedro": "Бедренная кость / Длина бедренной кости (мм)",
    "bolshebertsov": "Большеберцовая кость",
    "nadkolenn": "Надколенник",
    # Pregnancy
    "data_posled_menstr": "Дата 1-го дня последней менструации",
    "srok_bere": "Соответствует сроку беременности",
    "data_rodov_menstr": "Дата предполагаемых родов (по менструации)",
    "data_rodov_razmer": "Дата предполагаемых родов (по размерам)",
    "sred_diametr": "Средний диаметр плодного яйца (мм)",
    "sred_diametr_srok": "Соответствует сроку",
    "ktr": "КТР эмбриона (мм)",
    "ktr_srok": "КТР соответствует сроку",
    "serdcebienie": "Сердцебиение",
    "chss": "ЧСС (уд/мин)",
    "vp_tolshchina": "Толщина воротникового пространства (мм)",
    "zheltochny": "Желточный мешочек",
    "zheltochny_diametr": "Диаметр желточного мешочка (мм)",
    "horion_lokalizac": "Утолщение хориона — локализация",
    "horion_tolshch": "Толщина хориона (мм)",
    # Fetus
    "srok_menstr": "Соответствует сроку беременности",
    "matka_kontur": "Матка — контур",
    "matka_ehostr": "Матка — эхоструктура миометрия",
    "dvizheniya": "Движения",
    "bpr": "Бипариетальный размер БПР (мм)",
    "bpr_srok": "БПР соответствует сроку",
    "lzr": "Лобно-затылочный размер ЛЗР (мм)",
    "lzr_srok": "ЛЗР соответствует сроку",
    "cefalich_indeks": "Цефалический индекс (%)",
    "bedro_srok": "Бедро соответствует сроку",
    "okr_gol": "Окружность головки плода (мм)",
    "okr_gol_srok": "ОГ соответствует сроку",
    "okr_zhiv": "Окружность живота (мм)",
    "okr_zhiv_srok": "ОЖ соответствует сроку",
    "pupovina": "Пуповина",
    "plac_lokalizac": "Локализация плаценты",
    "plac_tolshchina": "Толщина плаценты (мм)",
    "plac_zrelost": "Степень зрелости плаценты",
    "plac_ehostr": "Эхоструктура плаценты",
    "okoloplodny_vody": "Околоплодные воды, ИАЖ",
    "massa_ploda": "Масса плода (г)",
    # Folliculometry
    "endometri": "Эндометрий М-эхо (мм)",
    "endometri_ehostr": "Эхоструктура эндометрия",
    "miometri": "Миометрий",
    "pr_follikuly": "Фолликулы (количество, диаметры)",
    "pr_dominant": "Доминантный фолликул",
    "lv_follikuly": "Фолликулы (количество, диаметры)",
    "lv_dominant": "Доминантный фолликул",
    # Conclusion
    "zaklyuchenie": "Заключение",
    "rekomendacii": "Рекомендации",
}


def _get_label(key: str) -> str:
    return FIELD_LABELS.get(key, key.replace("_", " ").capitalize())


def _set_cell_bg(cell, color: str):
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), color)
    tcPr.append(shd)


def _add_heading(doc: Document, text: str, level: int = 1):
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


def _add_section_table(doc: Document, fields: list):
    if not fields:
        return
    table = doc.add_table(rows=len(fields), cols=2)
    table.style = "Table Grid"
    for i, (label, value) in enumerate(fields):
        row = table.rows[i]
        label_cell = row.cells[0]
        label_cell.width = Cm(8)
        lp = label_cell.paragraphs[0]
        lr = lp.add_run(label)
        lr.font.bold = True
        lr.font.size = Pt(9)
        _set_cell_bg(label_cell, "EBF5FB")
        val_cell = row.cells[1]
        vp = val_cell.paragraphs[0]
        vr = vp.add_run(str(value) if value is not None else "")
        vr.font.size = Pt(9)
    doc.add_paragraph()


def generate_protocol_docx(
    protocol_id: int,
    form_data: Dict[str, Any],
    client: Dict[str, Any],
    doctor: Dict[str, Any],
    created_at: str = "",
    protocol_title: str = "",
) -> bytes:
    doc = Document()

    section = doc.sections[0]
    section.page_width = Cm(21)
    section.page_height = Cm(29.7)
    section.left_margin = Cm(2)
    section.right_margin = Cm(1.5)
    section.top_margin = Cm(2)
    section.bottom_margin = Cm(2)

    protocol_title_upper = (protocol_title or f"ПРОТОКОЛ №{protocol_id}").upper()

    title_para = doc.add_paragraph()
    title_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
    tr = title_para.add_run("Медицинский центр «NEVROCARDIOMED»")
    tr.font.bold = True
    tr.font.size = Pt(14)
    tr.font.color.rgb = RGBColor(0x1A, 0x52, 0x76)

    sub_para = doc.add_paragraph()
    sub_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
    sr = sub_para.add_run("ПРОТОКОЛ")
    sr.font.bold = True
    sr.font.size = Pt(12)
    sr.font.color.rgb = RGBColor(0x21, 0x61, 0x8A)

    sub2_para = doc.add_paragraph()
    sub2_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
    s2r = sub2_para.add_run(protocol_title_upper)
    s2r.font.bold = True
    s2r.font.size = Pt(11)
    s2r.font.color.rgb = RGBColor(0x21, 0x61, 0x8A)

    doc.add_paragraph()

    # Patient info
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

    client_name = f"{client.get('last_name', '')} {client.get('first_name', '')}".strip()
    gender_raw = client.get("gender", "")
    gender = "Мужской" if gender_raw == "male" else "Женский" if gender_raw == "female" else ""
    birth_date = str(client.get("birth_date", "") or "")
    doctor_name = f"{doctor.get('last_name', '')} {doctor.get('first_name', '')} {doctor.get('patronymic_name', '')}".strip()

    date_str = created_at or datetime.now().strftime("%Y-%m-%d")
    try:
        months_ru = ["января", "февраля", "марта", "апреля", "мая", "июня",
                     "июля", "августа", "сентября", "октября", "ноября", "декабря"]
        y, m, d = date_str.split("-")
        date_ru = f"{int(d)} {months_ru[int(m) - 1]} {y} г."
    except Exception:
        date_ru = date_str

    set_info_row(0, "Ф.И.О. пациента", client_name)
    set_info_row(1, "Пол / Дата рождения", f"{gender} / {birth_date}")
    set_info_row(2, "Дата исследования", date_ru)
    set_info_row(3, "Врач", doctor_name)

    doc.add_paragraph()
    _add_heading(doc, "ДАННЫЕ ИССЛЕДОВАНИЯ", level=1)

    sections = PROTOCOL_SECTIONS.get(protocol_id, [])

    if sections:
        for sec_title, keys in sections:
            is_conclusion = sec_title in ("Заключение", "Рекомендации")
            fields_to_show = []
            for key in keys:
                val = form_data.get(key)
                if val is not None and str(val).strip():
                    fields_to_show.append((_get_label(key), str(val)))

            if not fields_to_show:
                continue

            _add_heading(doc, sec_title, level=2)

            if is_conclusion:
                for _, val in fields_to_show:
                    p = doc.add_paragraph(val)
                    p.paragraph_format.left_indent = Cm(0.5)
                    for run in p.runs:
                        run.font.size = Pt(9)
                doc.add_paragraph()
            else:
                _add_section_table(doc, fields_to_show)
    else:
        # Fallback: show all fields in one table
        all_fields = [(k, str(v)) for k, v in form_data.items()
                      if v is not None and str(v).strip() and k not in ("date",)]
        if all_fields:
            _add_section_table(doc, all_fields)

    # Signature
    doc.add_paragraph()
    sig_table = doc.add_table(rows=1, cols=2)
    sig_table.style = "Table Grid"
    left = sig_table.rows[0].cells[0]
    right = sig_table.rows[0].cells[1]
    _set_cell_bg(left, "FDFEFE")
    _set_cell_bg(right, "FDFEFE")
    left.paragraphs[0].add_run(f"Врач: {doctor_name}").font.size = Pt(9)
    right.paragraphs[0].add_run("Подпись: _________________").font.size = Pt(9)

    buf = io.BytesIO()
    doc.save(buf)
    buf.seek(0)
    return buf.read()

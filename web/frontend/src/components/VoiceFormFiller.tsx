import React, { useState, useRef } from 'react';
import { Button, Tag, notification } from 'antd';
import { AudioOutlined, StopOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd';
import type { ProtocolField } from '../data/protocolFields';
import { saveFieldHistory } from '../utils/fieldHistory';

/**
 * Bitta mikrofon bilan butun forma ovoz orqali to'ldiriladi.
 *
 * Qanday ishlaydi:
 *  1. Doktor bo'lim nomini aytadi → kontekst o'rnatiladi (💙 tag ko'rinadi)
 *  2. Keyin doktor "maydon_nomi qiymat" deydi → qizil ko'rsatgich o'sha maydonga sakraydi
 *  3. Agar "bo'lim + maydon + qiymat" birga aytilsa → ham kontekst, ham qiymat to'ldiriladi
 *  4. "to'xtat" / "стоп" desa — to'xtaydi
 *  5. Bo'sh qolgan maydonlar muammo emas — ular bo'sh holda saqlanadi
 *
 * Bir xil nomli maydonlar (masalan "Форма" bir nechta bo'limda) kontekst yordamida ajratiladi.
 */

// ── Konstantalar ─────────────────────────────────────────────────────────────

const STOP_WORDS = ["to'xtat", 'стоп', 'остановить', 'stop', 'хватит'];

interface Props {
  form: FormInstance;
  fields: ProtocolField[];
  onActiveField: (fieldName: string | null) => void;
}

// ── Yordamchi funksiyalar ──────────────────────────────────────────────────

/**
 * Matni taqqoslash uchun normallashtiradi:
 * kichik harf, ё→е, keraksiz tinish belgilari, qo'shimcha bo'shliqlar
 */
function norm(text: string): string {
  return text
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[«»"„""''.,!?;:—\-–\/\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Bo'lim nomlarini tartib bilan qaytaradi (takrorlanmasdan) */
function getSections(fields: ProtocolField[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const f of fields) {
    const s = f.section ?? '';
    if (s && !seen.has(s)) {
      seen.add(s);
      result.push(s);
    }
  }
  return result;
}

/**
 * Nutq matnida bo'lim nomi bor-yo'qligini tekshiradi.
 * Eng uzun mos kelgan bo'lim nomini qaytaradi.
 */
function matchSection(speech: string, sections: string[]): string | null {
  const s = norm(speech);
  let best: string | null = null;
  let bestLen = 0;
  for (const section of sections) {
    const sn = norm(section);
    if (sn.length < 3) continue;
    if (s.includes(sn) && sn.length > bestLen) {
      best = section;
      bestLen = sn.length;
    }
  }
  return best;
}

/**
 * Berilgan maydonlar ro'yxati ichida 3 ta strategiya bilan qidiradi:
 *  ① Boshdan aniq prefix: "форма нормальная"
 *  ② Maydon nomi nutq ichida: "вот форма нормальная"
 *  ③ So'z-so'z qisman moslik (fuzzy): "Формa" ≈ "Форма"
 */
function matchInFields(
  sOrig: string,
  s: string,
  subset: ProtocolField[],
): { field: ProtocolField | null; value: string } {
  // ① Boshdan aniq prefix
  {
    let bestField: ProtocolField | null = null;
    let bestLen = 0;
    for (const f of subset) {
      const label = norm(f.label);
      if (label.length < 2) continue;
      if (s.startsWith(label) && label.length > bestLen) {
        bestField = f;
        bestLen = label.length;
      }
    }
    if (bestField) {
      const value = sOrig.slice(bestLen).replace(/^[\s—\-:,]+/, '').trim();
      return { field: bestField, value };
    }
  }

  // ② Maydon nomi istalgan joyda
  {
    let bestField: ProtocolField | null = null;
    let bestLen = 0;
    let bestValue = '';
    for (const f of subset) {
      const label = norm(f.label);
      if (label.length < 3) continue;
      const idx = s.indexOf(label);
      if (idx !== -1 && label.length > bestLen) {
        bestField = f;
        bestLen = label.length;
        const before = sOrig.slice(0, idx).replace(/[\s—\-:,]+$/, '').trim();
        const after = sOrig.slice(idx + label.length).replace(/^[\s—\-:,]+/, '').trim();
        bestValue = [before, after].filter(Boolean).join(' ');
      }
    }
    if (bestField) return { field: bestField, value: bestValue };
  }

  // ③ Fuzzy word-by-word
  {
    const speechWords = s.split(' ').filter(Boolean);
    let bestField: ProtocolField | null = null;
    let bestScore = 0;
    let bestValue = sOrig;
    for (const f of subset) {
      const labelWords = norm(f.label).split(' ').filter(Boolean);
      if (labelWords.length === 0) continue;
      for (let i = 0; i <= speechWords.length - labelWords.length; i++) {
        let match = true;
        let score = 0;
        for (let j = 0; j < labelWords.length; j++) {
          const sw = speechWords[i + j];
          const lw = labelWords[j];
          const minLen = Math.min(sw.length, lw.length, 3);
          if (sw.slice(0, minLen) === lw.slice(0, minLen)) {
            score += minLen;
          } else {
            match = false;
            break;
          }
        }
        if (match && score > bestScore) {
          bestScore = score;
          bestField = f;
          const before = speechWords.slice(0, i).join(' ');
          const after = speechWords.slice(i + labelWords.length).join(' ');
          bestValue = [before, after].filter(Boolean).join(' ');
        }
      }
    }
    if (bestField && bestScore >= 3) return { field: bestField, value: bestValue };
  }

  return { field: null, value: sOrig };
}

/**
 * Bo'lim + maydon nomi birgalikda moslashadi (yuqori prioritet).
 * Masalan: "правое яичко форма нормальная" → bo'lim "Правое яичко" + maydon "Форма"
 */
function parseWithCompound(
  sOrig: string,
  s: string,
  fields: ProtocolField[],
): { field: ProtocolField | null; value: string } {
  // Prefix moslik
  {
    let bestField: ProtocolField | null = null;
    let bestLen = 0;
    for (const f of fields) {
      if (!f.section) continue;
      const compound = norm(f.section) + ' ' + norm(f.label);
      if (compound.length < 5) continue;
      if (s.startsWith(compound) && compound.length > bestLen) {
        bestField = f;
        bestLen = compound.length;
      }
    }
    if (bestField) {
      const value = sOrig.slice(bestLen).replace(/^[\s—\-:,]+/, '').trim();
      return { field: bestField, value };
    }
  }

  // Substring moslik
  {
    let bestField: ProtocolField | null = null;
    let bestLen = 0;
    let bestValue = '';
    for (const f of fields) {
      if (!f.section) continue;
      const compound = norm(f.section) + ' ' + norm(f.label);
      if (compound.length < 5) continue;
      const idx = s.indexOf(compound);
      if (idx !== -1 && compound.length > bestLen) {
        bestField = f;
        bestLen = compound.length;
        const after = sOrig.slice(idx + compound.length).replace(/^[\s—\-:,]+/, '').trim();
        bestValue = after;
      }
    }
    if (bestField) return { field: bestField, value: bestValue };
  }

  return { field: null, value: sOrig };
}

/**
 * Yakuniy nutq matnini tahlil qiladi va maydon + qiymatni ajratib oladi.
 *
 * Strategiyalar tartibi:
 *  ⓪ Bo'lim + maydon nomini birgalikda qidiradi (eng aniq)
 *  ① Joriy bo'lim konteksti ichida maydon nomini qidiradi
 *  ② Barcha maydonlar ichida qidiradi (fallback)
 */
function parseUtterance(
  speech: string,
  fields: ProtocolField[],
  currentSection: string | null,
): { field: ProtocolField | null; value: string } {
  const sOrig = speech.trim();
  const s = norm(sOrig);

  // ⓪ Bo'lim + maydon birgalikda
  const compound = parseWithCompound(sOrig, s, fields);
  if (compound.field) return compound;

  // ① Joriy bo'lim konteksti
  if (currentSection) {
    const sectionFields = fields.filter((f) => f.section === currentSection);
    const r = matchInFields(sOrig, s, sectionFields);
    if (r.field) return r;
  }

  // ② Barcha maydonlar
  return matchInFields(sOrig, s, fields);
}

/**
 * Qisman (interim) nutqdan qaysi maydonga yo'nalayotganini taxmin qiladi.
 * Joriy bo'lim kontekstidagi maydonlarga ustunlik beriladi.
 */
function guessField(
  interimSpeech: string,
  fields: ProtocolField[],
  currentSection: string | null,
): ProtocolField | null {
  const s = norm(interimSpeech);
  if (s.length < 3) return null;

  let bestField: ProtocolField | null = null;
  let bestScore = 0;

  for (const f of fields) {
    const label = norm(f.label);
    if (label.length < 3) continue;

    let matchLen = 0;
    const checkLen = Math.min(label.length, s.length);
    for (let i = 0; i < checkLen; i++) {
      if (label[i] === s[i]) matchLen++;
      else break;
    }

    // Joriy bo'limdagi maydonlarga +1 bonus
    const bonus = currentSection && f.section === currentSection ? 1 : 0;
    const score = matchLen + bonus;

    if (matchLen >= 3 && score > bestScore) {
      bestField = f;
      bestScore = score;
    }
  }

  return bestField;
}

// ── Komponent ────────────────────────────────────────────────────────────────

const VoiceFormFiller: React.FC<Props> = ({ form, fields, onActiveField }) => {
  const [running, setRunning] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [lastMatched, setLastMatched] = useState('');
  const [currentSection, setCurrentSection] = useState<string | null>(null);
  /** Oxirgi yakuniy transkript — mos topilmasa debug uchun ko'rsatiladi */
  const [lastTranscript, setLastTranscript] = useState('');
  const [noMatch, setNoMatch] = useState(false);
  const recognitionRef = useRef<unknown>(null);
  const stoppedRef = useRef(false);
  // Ref for use inside recognition callbacks (state is stale in closures)
  const currentSectionRef = useRef<string | null>(null);

  const sections = getSections(fields);

  const isSupported = (): boolean => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      notification.warning({
        message: "Brauzer ovoz tanishni qo'llab-quvvatlamaydi",
        description: 'Iltimos Chrome yoki Microsoft Edge ishlating',
        duration: 4,
      });
      return false;
    }
    return true;
  };

  const start = () => {
    if (!isSupported() || fields.length === 0) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    stoppedRef.current = false;
    currentSectionRef.current = null;
    setRunning(true);
    setLastMatched('');
    setCurrentSection(null);

    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = 'ru-RU';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const idx = event.resultIndex;
      const result = event.results[idx];
      const transcript: string = result[0].transcript;

      if (!result.isFinal) {
        // Qisman natija — ko'rsatgich oldindan bashorat qiladi
        setInterimText(transcript);
        const guessed = guessField(transcript, fields, currentSectionRef.current);
        if (guessed) onActiveField(guessed.name);
        return;
      }

      // Yakuniy natija
      setInterimText('');
      setLastTranscript(transcript);
      setNoMatch(false);

      // To'xtatish so'zi
      if (STOP_WORDS.some((w) => norm(transcript).includes(w))) {
        recognition.stop();
        return;
      }

      // Avval maydon + qiymat qidiriladi
      const { field, value } = parseUtterance(transcript, fields, currentSectionRef.current);

      console.log('[Voice] transcript:', JSON.stringify(transcript), '| norm:', norm(transcript));
      console.log('[Voice] matched field:', field?.name ?? 'null', '| value:', value);

      if (field) {
        // Maydon topildi — bo'lim kontekstini yangilaymiz
        if (field.section) {
          setCurrentSection(field.section);
          currentSectionRef.current = field.section;
        }
        onActiveField(field.name);
        setLastMatched(field.label);
        setNoMatch(false);
        if (value) {
          form.setFieldValue(field.name, value);
          saveFieldHistory(field.label, value);
        }
        return;
      }

      // Maydon topilmadi — bo'lim nomi aytilganmi?
      const namedSection = matchSection(transcript, sections);
      if (namedSection) {
        setCurrentSection(namedSection);
        currentSectionRef.current = namedSection;
        setLastMatched(`📌 ${namedSection}`);
        setNoMatch(false);
        // Bo'limning birinchi maydoniga ko'rsatgichni olib boramiz
        const firstField = fields.find((f) => f.section === namedSection);
        if (firstField) onActiveField(firstField.name);
        return;
      }

      // Hech narsa topilmadi — foydalanuvchiga ko'rsatamiz
      setNoMatch(true);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      console.error('SpeechRecognition error:', event.error);
    };

    recognition.onend = () => {
      // Chrome ba'zan o'z-o'zidan to'xtaydi — qayta ishga tushuramiz
      if (!stoppedRef.current) {
        try { recognition.start(); } catch { /* already running */ }
      }
    };

    recognition.start();
  };

  const stop = () => {
    stoppedRef.current = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (recognitionRef.current as any)?.stop();
    setRunning(false);
    setInterimText('');
    setLastMatched('');
    setLastTranscript('');
    setNoMatch(false);
    setCurrentSection(null);
    currentSectionRef.current = null;
    onActiveField(null);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 12px',
        background: running ? '#fff1f0' : '#f0f7ff',
        border: `1px solid ${running ? '#ffa39e' : '#91caff'}`,
        borderRadius: 8,
        marginBottom: 14,
        flexWrap: 'wrap',
        transition: 'background 0.3s, border-color 0.3s',
      }}
    >
      {!running ? (
        <>
          <Button
            icon={<AudioOutlined />}
            onClick={start}
            style={{ borderColor: '#1a5276', color: '#1a5276', background: '#e6f4ff', fontWeight: 600 }}
          >
            🎙 Ovoz bilan to'ldirish
          </Button>
          <span style={{ fontSize: 11, color: '#888', lineHeight: 1.4 }}>
            <b>Bo'lim nomi</b> ayting → kontekst o'rnatiladi &nbsp;·&nbsp;
            <b>Maydon nomi + qiymat</b> ayting → to'ldiriladi &nbsp;·&nbsp;
            <b>"to'xtat"</b> — to'xtatish
          </span>
        </>
      ) : (
        <>
          <Button danger icon={<StopOutlined />} onClick={stop} size="small">
            To'xtatish
          </Button>

          {/* Joriy bo'lim konteksti */}
          {currentSection && (
            <Tag color="blue" style={{ fontSize: 11 }}>
              📌 {currentSection}
            </Tag>
          )}

          {/* Qisman natija (tinglash jarayonida) */}
          {interimText && (
            <Tag
              color="red"
              style={{
                fontSize: 12,
                maxWidth: 340,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              🎤 {interimText}
            </Tag>
          )}

          {/* Oxirgi muvaffaqiyatli topilgan maydon */}
          {lastMatched && !interimText && (
            <Tag color="success" style={{ fontSize: 12 }}>
              ✓ {lastMatched}
            </Tag>
          )}

          {/* Tinglash holati */}
          {!interimText && !lastMatched && !noMatch && (
            <Tag color="processing" style={{ fontSize: 12 }}>
              🎤 Tinglanyapti...
            </Tag>
          )}

          {/* Mos topilmadi — oxirgi eshitilgan transkript ko'rsatiladi */}
          {noMatch && lastTranscript && !interimText && (
            <Tag
              color="orange"
              style={{ fontSize: 11, maxWidth: 360, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              title={`Eshitildi: "${lastTranscript}" — maydon topilmadi`}
            >
              ⚠ Topilmadi: «{lastTranscript}»
            </Tag>
          )}
        </>
      )}
    </div>
  );
};

export default VoiceFormFiller;

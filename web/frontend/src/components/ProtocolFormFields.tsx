import React, { useState, useRef, useEffect } from 'react';
import { Form, Input, AutoComplete, Divider } from 'antd';
import type { FormInstance } from 'antd';
import type { ProtocolConfig, ProtocolField } from '../data/protocolFields';
import { getFieldsBySection } from '../data/protocolFields';
import { getFieldHistory, saveFieldHistory } from '../utils/fieldHistory';
import VoiceFormFiller from './VoiceFormFiller';

const { TextArea } = Input;

interface Props {
  form: FormInstance;
  config: ProtocolConfig;
}

const ProtocolFormFields: React.FC<Props> = ({ form, config }) => {
  const sectionMap = getFieldsBySection(config.fields);
  const [activeField, setActiveField] = useState<string | null>(null);
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Faol maydon o'zgarganda avtomatik scroll
  useEffect(() => {
    if (!activeField) return;
    const wrapper = fieldRefs.current[activeField];
    if (wrapper) {
      wrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeField]);

  /** AutoComplete uchun variantlar — oldingi yozuvlardan */
  const historyOptions = (label: string) =>
    getFieldHistory(label).map((v) => ({ value: v, label: v }));

  /** Maydon blur bo'lganda yoki tanlaganda tarixga saqlash */
  const onSave = (fieldName: string, label: string) => {
    const val = form.getFieldValue(fieldName);
    if (val !== undefined && val !== null && String(val).trim()) {
      saveFieldHistory(label, String(val).trim());
    }
  };

  return (
    <>
      <VoiceFormFiller
        form={form}
        fields={config.fields}
        onActiveField={setActiveField}
      />

      <Form form={form} layout="vertical" size="middle">
        {Array.from(sectionMap.entries()).map(([sectionName, fields]) => (
          <div key={sectionName}>
            <Divider
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#1a5276',
                borderColor: '#AED6F1',
                margin: '12px 0 8px',
              }}
            >
              {sectionName}
            </Divider>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
                gap: '4px 14px',
              }}
            >
              {fields.map((field: ProtocolField) => (
                <div
                  key={field.name}
                  ref={(el) => { fieldRefs.current[field.name] = el; }}
                  className={activeField === field.name ? 'voice-active-field' : ''}
                >
                  <Form.Item
                    name={field.name}
                    label={
                      <span
                        style={{
                          fontSize: 12,
                          color: activeField === field.name ? '#c0392b' : '#555',
                          fontWeight: activeField === field.name ? 700 : 400,
                        }}
                      >
                        {field.label}
                        {field.unit && (
                          <span style={{ color: '#aaa', marginLeft: 3 }}>
                            ({field.unit})
                          </span>
                        )}
                      </span>
                    }
                    style={{ marginBottom: 6 }}
                  >
                    {field.type === 'textarea' ? (
                      <TextArea
                        rows={3}
                        placeholder={field.label}
                        style={{ fontSize: 13 }}
                        onBlur={() => onSave(field.name, field.label)}
                      />
                    ) : field.type === 'text' ? (
                      /* Text maydoni — tarix bilan AutoComplete */
                      <AutoComplete
                        options={historyOptions(field.label)}
                        placeholder={field.label}
                        style={{ width: '100%', fontSize: 13 }}
                        onSelect={(val) => saveFieldHistory(field.label, val as string)}
                        onBlur={() => onSave(field.name, field.label)}
                      />
                    ) : (
                      /* Number maydoni — oddiy Input */
                      <Input
                        placeholder={field.label}
                        style={{ fontSize: 13 }}
                        onBlur={() => onSave(field.name, field.label)}
                      />
                    )}
                  </Form.Item>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Form>
    </>
  );
};

export default ProtocolFormFields;

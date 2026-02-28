import React, { useState } from 'react';
import { Input, notification } from 'antd';
import { AudioOutlined, LoadingOutlined } from '@ant-design/icons';
import type { InputProps } from 'antd';

// Ovoz bilan to'ldirish: har bir input uchun mikrofon tugmasi
// Web Speech API (Chrome / Edge qo'llab-quvvatlaydi)

type VoiceInputProps = Omit<InputProps, 'suffix'> & {
  lang?: string; // default: ru-RU
};

const VoiceInput: React.FC<VoiceInputProps> = ({
  lang = 'ru-RU',
  onChange,
  style,
  ...props
}) => {
  const [listening, setListening] = useState(false);

  const handleMic = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      notification.warning({
        message: 'Brauzer ovoz tanishni qo\'llab-quvvatlamaydi',
        description: 'Chrome yoki Microsoft Edge ishlating',
        duration: 3,
      });
      return;
    }

    if (listening) return;

    const recognition = new SR();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const text: string = event.results[0][0].transcript;
      // Ant Design Form.Item tomonidan qabul qilinishi uchun synthetic event
      onChange?.({
        target: { value: text },
      } as React.ChangeEvent<HTMLInputElement>);
    };

    recognition.start();
  };

  return (
    <Input
      {...props}
      onChange={onChange}
      style={{ fontSize: 12, paddingRight: 28, ...style }}
      suffix={
        <span
          onMouseDown={handleMic}
          title={listening ? 'Tinglanyapti...' : 'Ovoz bilan to\'ldirish'}
          style={{
            cursor: listening ? 'default' : 'pointer',
            color: listening ? '#ff4d4f' : '#bfbfbf',
            fontSize: 13,
            lineHeight: 1,
            transition: 'color 0.2s',
            userSelect: 'none',
          }}
        >
          {listening ? (
            <LoadingOutlined spin style={{ color: '#ff4d4f' }} />
          ) : (
            <AudioOutlined />
          )}
        </span>
      }
    />
  );
};

export default VoiceInput;

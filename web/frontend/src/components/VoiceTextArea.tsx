import React, { useState } from 'react';
import { Input, notification } from 'antd';
import { AudioOutlined, LoadingOutlined } from '@ant-design/icons';
import type { TextAreaProps } from 'antd/es/input/TextArea';

// Ovoz bilan to'ldirish: TextArea uchun mikrofon tugmasi (pozitsiya: o'ng yuqori burchak)

type VoiceTextAreaProps = TextAreaProps & {
  lang?: string;
};

const { TextArea } = Input;

const VoiceTextArea: React.FC<VoiceTextAreaProps> = ({
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
      onChange?.({
        target: { value: text },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    };

    recognition.start();
  };

  return (
    <div style={{ position: 'relative' }}>
      <TextArea
        {...props}
        onChange={onChange}
        style={{ fontSize: 12, paddingRight: 28, ...style }}
      />
      <span
        onMouseDown={handleMic}
        title={listening ? 'Tinglanyapti...' : 'Ovoz bilan to\'ldirish'}
        style={{
          position: 'absolute',
          top: 6,
          right: 8,
          cursor: listening ? 'default' : 'pointer',
          color: listening ? '#ff4d4f' : '#bfbfbf',
          fontSize: 13,
          zIndex: 1,
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
    </div>
  );
};

export default VoiceTextArea;

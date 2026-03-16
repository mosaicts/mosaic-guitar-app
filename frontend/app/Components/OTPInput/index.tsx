import { useNavigation } from 'react-router';
import { useState, useRef } from 'react';
import './index.css';

interface InputTypes {
  length?: number;
  onComplete: (pin: string) => void;
}

const OTPInput = ({ length = 4, onComplete }: InputTypes) => {
  const inputRef = useRef<HTMLInputElement[]>(Array(length).fill(null));

  // if you're not using Typescript, do useState()
  const [OTP, setOTP] = useState<string[]>(Array(length).fill(''));
  const navigation = useNavigation();
  const isSubmitting = navigation.state !== 'idle';

  const checkAndHandleComplete = (pin: string[]) => {
    // only grab first lengh digits
    pin = pin.filter((_, i) => i <= length - 1);

    // if the user has entered all the digits, grab the digits and set as an argument to the onComplete function.
    if (pin.every((digit) => digit !== '')) {
      onComplete(pin.join(''));
    }
  };

  const handleTextChange = (input: string, index: number) => {
    const newPin = [...OTP];

    if (input.match(/[0-9]/)) {
      newPin[index] = input;
      // check if the user has entered the first digit, if yes, automatically focus on the next input field and so on.

      if (input.length === 1 && index < length - 1) {
        inputRef.current[index + 1]?.focus();
      }

      setOTP(newPin);
    }

    checkAndHandleComplete(newPin);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    const newPin = [...OTP];
    const input = e.key;

    if (input === 'Backspace') {
      if (newPin[index].length === 1) {
        newPin[index] = '';
      } else if (newPin[index].length === 0) {
        newPin[index - 1] = '';
        if (index > 0) {
          inputRef.current[index - 1]?.focus();
        }
      }
      setOTP(newPin);
    } else if (input.match(/[0-9]/)) {
      // handle overwrite
      if (newPin[index].length === 1) {
        handleTextChange(input, index);
        e.preventDefault();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    const input = e.clipboardData?.getData('text') || '';

    const newPin = [...OTP];

    if (/[0-9]+/.test(input)) {
      input.split('').forEach((value, i) => {
        newPin[index + i] = value;
      });

      setOTP(newPin);
      inputRef.current[Math.min(index + input.length, length - 1)]?.focus();
    }

    checkAndHandleComplete(newPin);
    e.preventDefault();
  };

  return (
    <div
      className="otp block"
      style={{
        gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))`
      }}
    >
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          type="text"
          maxLength={1}
          value={OTP[index]}
          onChange={(e) => handleTextChange(e.target.value, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={(e) => handlePaste(e, index)}
          ref={(ref) => {
            inputRef.current[index] = ref as HTMLInputElement;
          }}
          // className={`border border-solid border-border-slate-500 focus:border-blue-600 p-5 outline-none`}
          className={isSubmitting ? ' progress' : ''}
          style={{ marginRight: index === length - 1 ? '0' : '10px' }}
          disabled={isSubmitting}
        />
      ))}
    </div>
  );
};

export default OTPInput;

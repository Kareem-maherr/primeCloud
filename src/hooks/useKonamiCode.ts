import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'KeyB',
  'KeyA'
];

export const useKonamiCode = () => {
  const [input, setInput] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyUp = (e: KeyboardEvent) => {
      // Get the key code
      const key = e.code;
      
      // Add the new key to the input array
      setInput(prev => {
        const newInput = [...prev, key];
        // Only keep the last 10 keys
        return newInput.slice(-KONAMI_CODE.length);
      });
    };

    // Add event listener
    window.addEventListener('keyup', handleKeyUp);

    // Cleanup
    return () => {
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    // Check if the input matches the Konami code
    if (input.length === KONAMI_CODE.length) {
      let isMatch = true;
      for (let i = 0; i < KONAMI_CODE.length; i++) {
        if (input[i] !== KONAMI_CODE[i]) {
          isMatch = false;
          break;
        }
      }
      
      if (isMatch) {
        // Navigate to the Easter egg page
        navigate('/onepiece-secret');
      }
    }
  }, [input, navigate]);
};

'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface TypingEffectProps {
  text: string;
  onComplete?: () => void;
  onUpdate?: () => void;
  speed?: number;
  className?: string;
}

export function TypingEffect({ text, onComplete, onUpdate, speed = 25, className }: TypingEffectProps) {
  const [displayedText, setDisplayedText] = useState('');
  const onCompleteRef = useRef(onComplete);
  const onUpdateRef = useRef(onUpdate);

  // Use a ref to hold the latest callbacks without re-triggering the effect
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onUpdateRef.current = onUpdate;
  }, [onComplete, onUpdate]);

  useEffect(() => {
    setDisplayedText(''); // Reset when text changes
  }, [text]);

  useEffect(() => {
    if (!text) return;

    if (displayedText.length < text.length) {
      const timeoutId = setTimeout(() => {
        const newText = text.slice(0, displayedText.length + 1);
        setDisplayedText(newText);
        if (onUpdateRef.current) {
          onUpdateRef.current();
        }
      }, speed);
      return () => clearTimeout(timeoutId);
    } else {
      // Typing is complete
      if (onCompleteRef.current) {
        onCompleteRef.current();
      }
    }
  }, [displayedText, text, speed]);

  return <span className={cn(className)}>{displayedText}</span>;
}

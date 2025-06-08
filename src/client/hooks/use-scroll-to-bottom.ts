import { useEffect, useRef } from 'react';

export function useScrollToBottom(messages: Array<{ id: string; [key: string]: any }>) {
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(scrollToBottom, 100);
    }
  }, [messages]);

  return {
    containerRef,
    scrollToBottom
  };
} 
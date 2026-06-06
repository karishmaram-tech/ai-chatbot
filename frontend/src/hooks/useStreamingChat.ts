import { useState, useCallback } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export function useStreamingChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (userMessage: string) => {
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    // Add empty assistant message that will be filled
    setMessages(prev => [...prev, { role: 'assistant', content: '', isStreaming: true }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/chat/stream', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ message: userMessage, session_id: currentSessionId }),
      });

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            if (!data.done) {
              // Append chunk to the last message
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1].content += data.chunk;
                return updated;
              });
            }
          }
        }
      }
    } finally {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1].isStreaming = false;
        return updated;
      });
      setIsLoading(false);
    }
  }, []);

  return { messages, sendMessage, isLoading };
}
'use client';
import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  tokens?: number;
  cost?: number;
  ragUsed?: boolean;
}

export default function Chat({ token }: { token: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>();
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setLoading(true);

    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      let fullContent = '';
      for await (const data of api.chat.stream(userMsg, token, conversationId)) {
        if (data.type === 'chunk') {
          fullContent += data.content;
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: 'assistant', content: fullContent };
            return updated;
          });
        } else if (data.type === 'done') {
          setConversationId(data.conversation_id);
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: 'assistant',
              content: fullContent,
              tokens: data.tokens,
              cost: data.cost_usd,
              ragUsed: data.rag_used,
            };
            return updated;
          });
        } else if (data.type === 'error') {
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: 'assistant', content: 'Error: ' + data.message };
            return updated;
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg('');
    try {
      const result = await api.documents.upload(file, token);
      setUploadMsg('Uploaded! ' + result.chunks_indexed + ' chunks indexed.');
    } catch {
      setUploadMsg('Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-white font-bold text-lg">AI Chatbot</h1>
          <p className="text-gray-400 text-xs">Powered by Gemini + RAG</p>
        </div>
        <div className="flex items-center gap-3">
          {uploadMsg && <span className="text-green-400 text-xs">{uploadMsg}</span>}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm transition-all"
          >
            {uploading ? 'Uploading...' : 'Upload PDF'}
          </button>
          <input ref={fileRef} type="file" accept=".pdf,.txt" onChange={handleUpload} className="hidden" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            <p className="text-4xl mb-4">🤖</p>
            <p className="text-lg">Start a conversation!</p>
            <p className="text-sm mt-2">Upload a PDF to ask questions about it.</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === 'user' ? "flex justify-end" : "flex justify-start"}>
            <div className={msg.role === 'user' ? "max-w-2xl rounded-2xl px-4 py-3 bg-blue-600 text-white" : "max-w-2xl rounded-2xl px-4 py-3 bg-gray-800 text-gray-100"}>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {msg.content || (loading && i === messages.length - 1 ? '...' : '')}
              </p>
              {msg.tokens && (
                <p className="text-xs mt-2 opacity-50">
                  {msg.tokens} tokens •  {msg.ragUsed ? '• RAG' : ''}
                </p>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="bg-gray-900 border-t border-gray-800 p-4">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={loading}
            className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-blue-500 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-all"
          >
            {loading ? '...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}

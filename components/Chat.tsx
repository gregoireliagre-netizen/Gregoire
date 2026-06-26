'use client';

import { FormEvent, useRef, useEffect, useState } from 'react';

// Interface inchangée
interface Message { id: string; role: 'user' | 'assistant'; content: string; }

export function Chat() {
  const [isOpen, setIsOpen] = useState(false); // État pour ouvrir/fermer
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messages.concat(userMessage).map((m) => ({ role: m.role, content: m.content })) }),
      });
      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      if (data.text) {
        setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'assistant', content: data.text }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'assistant', content: "Désolé, je rencontre des difficultés techniques." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Fenêtre de Chat */}
      {isOpen && (
        <div className="mb-4 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden transition-all animate-in slide-in-from-bottom-10">
          <div className="p-4 bg-blue-600 text-white font-bold flex justify-between">
            <span>Assistant Grégoire</span>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white border shadow-sm text-black'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="border-t p-3 bg-white flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Question..."
              className="flex-1 px-3 py-1 text-sm border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" disabled={isLoading} className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm">
              {isLoading ? '...' : 'Envoyer'}
            </button>
          </form>
        </div>
      )}

      {/* Bouton Bulle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg hover:scale-105 transition-transform flex items-center justify-center text-2xl"
      >
        {isOpen ? '✕' : '💬'}
      </button>
    </div>
  );
}
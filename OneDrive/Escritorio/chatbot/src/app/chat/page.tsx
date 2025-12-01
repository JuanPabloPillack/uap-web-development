// src/app/chat/page.tsx

'use client';

import { Send, Loader2, AlertCircle, BookOpen, Trash2 } from 'lucide-react';
import { FormEvent, useRef, useEffect, useState } from 'react';
import DOMPurify from 'dompurify';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolsUsed?: string[];
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cargar historial del localStorage
  useEffect(() => {
    const saved = localStorage.getItem('book-advisor-messages');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load chat history');
      }
    }
  }, []);

  // Guardar historial en localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('book-advisor-messages', JSON.stringify(messages));
    }
  }, [messages]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await sendMessage(input);
  };

  const sendMessage = async (text: string) => {
    setErrorMessage(null);

    const sanitizedInput = DOMPurify.sanitize(text.trim());

    if (!sanitizedInput || sanitizedInput.length === 0) {
      setErrorMessage('Por favor, escribe un mensaje válido.');
      return;
    }

    if (sanitizedInput.length > 2000) {
      setErrorMessage('El mensaje es demasiado largo. Máximo 2000 caracteres.');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: sanitizedInput,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      const data = await response.json();

      if (data.error) {
        setErrorMessage(data.error);
        return;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        toolsUsed: data.toolsUsed || [],
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      setErrorMessage('Hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const sanitizeMessage = (content: string) => {
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: ['href'],
    });
  };

  const clearHistory = () => {
    if (confirm('¿Estás seguro de que quieres borrar todo el historial?')) {
      setMessages([]);
      localStorage.removeItem('book-advisor-messages');
    }
  };

  const toolIcons: Record<string, string> = {
    searchBooks: '🔍',
    getBookDetails: '📖',
    addToReadingList: '➕',
    getReadingList: '📚',
    markAsRead: '✅',
    getReadingStats: '📊',
  };

  const toolNames: Record<string, string> = {
    searchBooks: 'Buscar libros',
    getBookDetails: 'Detalles del libro',
    addToReadingList: 'Agregar a lista',
    getReadingList: 'Ver lista',
    markAsRead: 'Marcar como leído',
    getReadingStats: 'Ver estadísticas',
  };

  const quickActions = [
    { text: 'Recomiéndame libros de ciencia ficción', icon: '🚀' },
    { text: 'Muéstrame mi lista de lectura', icon: '📚' },
    { text: '¿Cuáles son mis estadísticas de lectura?', icon: '📊' },
    { text: 'Busca libros sobre inteligencia artificial', icon: '🤖' },
  ];

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <header className="bg-white border-b border-amber-200 px-6 py-5 shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-amber-600" />
              <h1 className="text-2xl font-semibold text-slate-800">AI Book Advisor</h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">Tu asistente personal de lectura</p>
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearHistory}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-600 transition"
            >
              <Trash2 className="w-4 h-4" />
              Limpiar historial
            </button>
          )}
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Empty State */}
          {messages.length === 0 && (
            <div className="text-center mt-20">
              <div className="inline-block p-4 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full mb-6">
                <BookOpen className="w-12 h-12 text-amber-600" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-800 mb-2">¡Hola, amante de los libros!</h2>
              <p className="text-slate-600 mb-6">¿En qué puedo ayudarte hoy?</p>
              
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(action.text)}
                    className="p-4 bg-white rounded-xl border border-amber-200 hover:border-amber-400 hover:shadow-md transition text-left"
                  >
                    <div className="text-2xl mb-2">{action.icon}</div>
                    <div className="text-sm text-slate-700">{action.text}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
                  isUser
                    ? 'bg-amber-600 text-white'
                    : 'bg-white border-2 border-amber-200'
                }`}>
                  {isUser ? '👤' : <BookOpen className="w-5 h-5 text-amber-600" />}
                </div>
                
                {/* Message Content */}
                <div className={`flex-1 max-w-2xl ${isUser ? 'flex justify-end' : ''}`}>
                  <div className="space-y-2">
                    {/* Message Bubble */}
                    <div
                      className={`inline-block px-4 py-3 rounded-2xl shadow-sm ${
                        isUser
                          ? 'bg-amber-600 text-white'
                          : 'bg-white text-slate-800 border border-amber-200'
                      }`}
                    >
                      <div
                        dangerouslySetInnerHTML={{ __html: sanitizeMessage(m.content) }}
                      />
                    </div>
                    
                    {/* Tools Used */}
                    {m.toolsUsed && m.toolsUsed.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {m.toolsUsed.map((tool, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full flex items-center gap-1"
                            title={toolNames[tool]}
                          >
                            <span>{toolIcons[tool] || '🔧'}</span>
                            <span>{toolNames[tool] || tool}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Error Message */}
          {errorMessage && (
            <div className="flex justify-center">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 max-w-md shadow-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white border-2 border-amber-200 flex items-center justify-center shadow-sm">
                <BookOpen className="w-5 h-5 text-amber-600" />
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-amber-200">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={onSubmit} className="border-t border-amber-200 bg-white px-4 py-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex gap-3 items-end">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Pregúntame sobre libros, pide recomendaciones, o gestiona tu lista..."
            className="flex-1 px-4 py-3 border border-amber-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition bg-amber-50 text-slate-800 placeholder-slate-400"
            disabled={isLoading}
            maxLength={2000}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-slate-300 disabled:to-slate-400 text-white p-3 rounded-2xl transition shadow-lg disabled:shadow-none flex items-center justify-center flex-shrink-0 w-12 h-12"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </form>
    </div>
  );
}
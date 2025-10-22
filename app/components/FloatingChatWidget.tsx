// components/FloatingChatWidget.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { X, MessageCircle, Minimize2 } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export default function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hi! I'm FitAI, your personal training assistant! 😊 I can help you with workout ideas, answer fitness questions, or help you book a consultation. What would you like to achieve?"
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage,
          conversationHistory: messages
        }),
      });

      const data = await response.json();
      
      if (data.response) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        throw new Error(data.error || 'No response from AI');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Sorry, I'm having trouble connecting. Please try again or contact us directly at hello@trainer.com" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
    
    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const toggleChat = () => {
    if (isOpen && isMinimized) {
      setIsMinimized(false);
    } else if (isOpen) {
      setIsOpen(false);
      setIsMinimized(false);
    } else {
      setIsOpen(true);
      setIsMinimized(false);
    }
  };

  const minimizeChat = () => {
    setIsMinimized(true);
  };

  const resetChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Hi! I'm FitAI, your personal training assistant! 😊 I can help you with workout ideas, answer fitness questions, or help you book a consultation. What would you like to achieve?"
      }
    ]);
  };

  if (!isOpen) {
    return (
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
        aria-label="Open chat"
      >
        <MessageCircle size={24} />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && !isMinimized && (
        <div 
          className="fixed inset-0 bg-opacity-20 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Chat Widget */}
      <div className={`
        fixed z-50 transition-all duration-300 ease-in-out
        ${isMinimized 
          ? 'bottom-6 right-6 w-16 h-16 rounded-full' 
          : 'bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-3rem)] rounded-xl'
        }
        bg-white shadow-2xl border border-gray-200
      `}>
        {!isMinimized ? (
          // Expanded State
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-xl flex justify-between items-center">
              <div>
                <h3 className="font-bold">FitAI Assistant</h3>
                <p className="text-blue-100 text-xs">Online • Ready to help</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={minimizeChat}
                  className="text-white hover:text-blue-200 transition-colors"
                  aria-label="Minimize chat"
                >
                  <Minimize2 size={18} />
                </button>
                <button
                  onClick={toggleChat}
                  className="text-white hover:text-blue-200 transition-colors"
                  aria-label="Close chat"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : message.role === 'system'
                        ? 'bg-green-100 border border-green-300 text-green-800'
                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-lg rounded-bl-none p-3 shadow-sm">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t bg-white p-4">
              <form onSubmit={handleSend} className="space-y-3">
                <div className="flex gap-2">
                  <textarea
                    ref={textareaRef}
                    value={inputMessage}
                    onChange={handleTextareaChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about workouts, nutrition, or booking..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[44px] max-h-[120px]"
                    disabled={isLoading}
                    rows={1}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !inputMessage.trim()}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg transition-colors self-end"
                  >
                    Send
                  </button>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <button
                    type="button"
                    onClick={resetChat}
                    className="hover:text-blue-500 transition-colors"
                  >
                    Reset chat
                  </button>
                  <span>Press Enter to send</span>
                </div>
              </form>
            </div>
          </div>
        ) : (
          // Minimized State
          <button
            onClick={toggleChat}
            className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            aria-label="Open chat"
          >
            <MessageCircle size={24} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </button>
        )}
      </div>
    </>
  );
}
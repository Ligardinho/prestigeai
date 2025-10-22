// components/FloatingChatWidget.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { X, MessageCircle, Minimize2, Smartphone } from 'lucide-react';

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
      content: "👋 **Welcome to FitAI!** \n\nYour personal training assistant! I can help with:\n\n💪 Workout plans & ideas\n🥗 Nutrition guidance\n🎯 Goal setting\n📅 Booking consultations\n\nWhat would you like to achieve today?"
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
        setMessages(prev => [...prev, { role: 'assistant', content: formatAIResponse(data.response) }]);
      } else {
        throw new Error(data.error || 'No response from AI');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "❌ **Connection Issue** \n\nSorry, I'm having trouble connecting. Please try again or contact us directly at hello@trainer.com" 
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
    if (isMobile) {
      setIsOpen(false);
    } else {
      setIsMinimized(true);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: "👋 **Welcome to FitAI!** \n\nYour personal training assistant! I can help with:\n\n💪 Workout plans & ideas\n🥗 Nutrition guidance\n🎯 Goal setting\n📅 Booking consultations\n\nWhat would you like to achieve today?"
      }
    ]);
  };

  // Format AI responses with Streamline styling
  const formatAIResponse = (content: string): string => {
    // Add emojis and formatting to make responses more engaging
    const formatted = content
      .replace(/\b(workout|exercise|training)\b/gi, '💪 $1')
      .replace(/\b(nutrition|diet|food|meal)\b/gi, '🥗 $1')
      .replace(/\b(weight loss|fat loss|lose weight)\b/gi, '🔥 $1')
      .replace(/\b(muscle|strength|build)\b/gi, '🏋️ $1')
      .replace(/\b(beginner|start|new)\b/gi, '🎯 $1')
      .replace(/\b(price|cost|investment)\b/gi, '💰 $1')
      .replace(/\b(consultation|session|booking)\b/gi, '📅 $1')
      .replace(/\b(goal|target|objective)\b/gi, '🎯 $1')
      .replace(/\b(help|assist|support)\b/gi, '⚡ $1');
    
    return formatted;
  };

  // Format message content for display with enhanced styling
  const formatMessageDisplay = (content: string) => {
    const parts = content.split(/(\*\*.*?\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Bold text with emoji support
        const boldContent = part.slice(2, -2);
        return (
          <strong key={index} className="font-semibold text-blue-800">
            {boldContent}
          </strong>
        );
      }
      
      // Regular text with emoji animation
      const textWithEmojis = part.split(/([\u{1F300}-\u{1F9FF}])/gu).map((text, i) => {
        if (text.match(/[\u{1F300}-\u{1F9FF}]/u)) {
          return (
            <span key={i} className="inline-block animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>
              {text}
            </span>
          );
        }
        return text;
      });
      
      return <span key={index}>{textWithEmojis}</span>;
    });
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
        {isMobile && (
          <div className="absolute -bottom-1 -left-1 bg-blue-400 rounded-full p-1">
            <Smartphone size={12} />
          </div>
        )}
      </button>
    );
  }

  return (
    <>
      {/* Backdrop - Only show on mobile when expanded */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Chat Widget */}
      <div className={`
        fixed z-50 transition-all duration-300 ease-in-out
        ${isMinimized 
          ? 'bottom-6 right-6 w-16 h-16 rounded-full' 
          : isMobile
          ? 'inset-0 w-full h-full rounded-none'
          : 'bottom-6 right-6 w-96 h-[600px] rounded-xl'
        }
        bg-white shadow-2xl border border-gray-200
        ${isMobile ? 'm-0' : 'max-w-[calc(100vw-3rem)] max-h-[calc(100vh-3rem)]'}
      `}>
        {!isMinimized ? (
          // Expanded State
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-xl flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <div>
                  <h3 className="font-bold text-lg">FitAI Assistant</h3>
                  <p className="text-blue-100 text-sm">Powered by Prestige AI • Online</p>
                </div>
              </div>
              <div className="flex gap-3">
                {isMobile && (
                  <span className="text-blue-200 text-sm flex items-center gap-1 bg-blue-600 px-2 py-1 rounded-full">
                    <Smartphone size={14} />
                    Mobile
                  </span>
                )}
                <button
                  onClick={minimizeChat}
                  className="text-white hover:text-blue-200 transition-colors p-2 bg-black bg-opacity-20 rounded-lg"
                  aria-label={isMobile ? "Close chat" : "Minimize chat"}
                >
                  {isMobile ? <X size={18} /> : <Minimize2 size={18} />}
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  } ${isMobile ? 'px-1' : ''}`}
                >
                  <div
                    className={`
                      rounded-2xl p-4 max-w-[90%] transition-all duration-300 transform hover:scale-[1.02]
                      ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-none shadow-2xl'
                          : message.role === 'system'
                          ? 'bg-gradient-to-br from-green-100 to-green-50 border-2 border-green-300 text-green-800 shadow-lg'
                          : 'bg-gradient-to-br from-white to-gray-50 border-2 border-blue-200 text-gray-800 rounded-bl-none shadow-2xl'
                      }
                      ${isMobile ? 'text-base' : 'text-lg'}
                    `}
                  >
                    <div className={`leading-relaxed whitespace-pre-wrap ${isMobile ? 'text-[16px]' : 'text-[17px]'}`}>
                      {formatMessageDisplay(message.content)}
                    </div>
                    
                    {/* Enhanced emoji reactions for assistant messages */}
                    {message.role === 'assistant' && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-opacity-20 border-current">
                        {['💪', '🔥', '⚡', '🎯', '🏋️', '🥗'].map((emoji, i) => (
                          <span 
                            key={i} 
                            className="text-sm opacity-80 hover:opacity-100 transition-all duration-200 hover:scale-125 cursor-default transform"
                            title="Fitness Power!"
                          >
                            {emoji}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Enhanced Loading Animation */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200 rounded-2xl rounded-bl-none p-4 shadow-2xl">
                    <div className="flex items-center gap-4">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-blue-800">FitAI is thinking...</span>
                        <span className="text-xs text-gray-600">Powered by Prestige AI</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t bg-white p-4 flex-shrink-0 shadow-lg">
              <form onSubmit={handleSend} className="space-y-3">
                <div className="flex gap-3 items-end">
                  <div className="flex-1 relative">
                    <textarea
                      ref={textareaRef}
                      value={inputMessage}
                      onChange={handleTextareaChange}
                      onKeyPress={handleKeyPress}
                      placeholder={isMobile ? "Ask about fitness goals... 💭" : "Ask about workouts, nutrition, or booking... 💪"}
                      className="w-full border-2 border-gray-300 rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[60px] max-h-[120px] bg-gray-50 text-gray-800 placeholder-gray-500 transition-all duration-200 text-lg"
                      disabled={isLoading}
                      rows={1}
                    />
                    {isMobile && inputMessage.length > 0 && (
                      <div className="absolute bottom-2 right-3 text-xs text-gray-400 bg-white px-2 py-1 rounded-full">
                        {inputMessage.length}
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || !inputMessage.trim()}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-4 rounded-2xl transition-all duration-200 font-semibold disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:shadow-none min-w-[70px] flex items-center justify-center transform hover:scale-105 disabled:hover:scale-100"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : isMobile ? (
                      '🚀'
                    ) : (
                      'Send'
                    )}
                  </button>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600 px-2">
                  <button
                    type="button"
                    onClick={resetChat}
                    className="hover:text-blue-500 transition-colors flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full"
                  >
                    <span>🔄</span>
                    <span>New Chat</span>
                  </button>
                  <div className="flex items-center gap-3">
                    {!isMobile && <span className="text-xs">Press Enter to send</span>}
                    <span className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                      <span className="text-lg">⚡</span>
                      <span className="font-medium">Prestige AI</span>
                    </span>
                  </div>
                </div>
              </form>
            </div>
          </div>
        ) : (
          // Minimized State (Desktop only)
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
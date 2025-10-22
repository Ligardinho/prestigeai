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
      content: "👋 **Welcome to FitAI!** \n\nYour personal training assistant! I can help with:\n\n💪 Workout plans\n🥗 Nutrition guidance\n🎯 Goal setting\n📅 Booking consultations\n\nWhat would you like to achieve?"
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      
      // Check if keyboard is likely visible (on mobile when height is reduced)
      const isKeyboardVisible = window.innerHeight < 500;
      setKeyboardVisible(isKeyboardVisible);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, keyboardVisible]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && textareaRef.current && !isMinimized) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 300);
    }
  }, [isOpen, isMinimized]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: "smooth",
      block: "end"
    });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    // Reset textarea height
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
        content: "❌ **Connection Issue** \n\nSorry, I'm having trouble connecting. Please try again or contact us directly." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
    
    // Auto-resize textarea (max 4 lines)
    e.target.style.height = 'auto';
    const newHeight = Math.min(e.target.scrollHeight, 120);
    e.target.style.height = newHeight + 'px';
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
        content: "👋 **Welcome to FitAI!** \n\nYour personal training assistant! I can help with:\n\n💪 Workout plans\n🥗 Nutrition guidance\n🎯 Goal setting\n📅 Booking consultations\n\nWhat would you like to achieve?"
      }
    ]);
  };

  // Format AI responses
  const formatAIResponse = (content: string): string => {
    return content;
  };

  // Format message content for display
  const formatMessageDisplay = (content: string) => {
    const parts = content.split(/(\*\*.*?\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldContent = part.slice(2, -2);
        return (
          <strong key={index} className="font-semibold text-blue-800">
            {boldContent}
          </strong>
        );
      }
      
      return <span key={index}>{part}</span>;
    });
  };

  // Calculate dynamic heights for mobile with keyboard
  const getContainerStyles = () => {
    if (!isMobile) {
      return {};
    }

    if (keyboardVisible) {
      return {
        height: '100vh',
        position: 'fixed' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 0,
      };
    }

    return {
      height: '80vh',
      maxHeight: '600px',
    };
  };

  if (!isOpen) {
    return (
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        aria-label="Open chat"
      >
        <MessageCircle size={24} />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
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
      <div 
        className={`
          fixed z-50 transition-all duration-300 ease-in-out
          ${isMinimized 
            ? 'bottom-6 right-6 w-16 h-16 rounded-full' 
            : isMobile
            ? 'bottom-0 right-0 left-0 rounded-t-2xl'
            : 'bottom-6 right-6 w-96 h-[500px] rounded-xl'
          }
          bg-white shadow-2xl border border-gray-200
          flex flex-col
        `}
        style={getContainerStyles()}
      >
        {!isMinimized ? (
          // Expanded State - WhatsApp-like layout
          <div className="flex flex-col h-full">
            {/* Compact Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-t-2xl flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <div>
                  <h3 className="font-bold text-sm">FitAI</h3>
                  <p className="text-blue-100 text-xs">Online • Gemini AI</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={minimizeChat}
                  className="text-white hover:text-blue-200 transition-colors p-1"
                  aria-label={isMobile ? "Close chat" : "Minimize chat"}
                >
                  {isMobile ? <X size={16} /> : <Minimize2 size={16} />}
                </button>
              </div>
            </div>

            {/* Messages Area - Takes most space */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-3 space-y-3 bg-gradient-to-b from-gray-50 to-blue-50"
              style={{
                // Ensure messages area is scrollable and takes available space
                minHeight: 0,
                ...(isMobile && keyboardVisible ? {
                  maxHeight: 'calc(100vh - 140px)',
                } : {})
              }}
            >
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`
                      rounded-2xl p-3 max-w-[85%] transition-all duration-200
                      ${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white rounded-br-none shadow-md'
                          : message.role === 'system'
                          ? 'bg-green-100 border border-green-200 text-green-800'
                          : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-md'
                      }
                      ${isMobile ? 'text-sm' : 'text-sm'}
                    `}
                  >
                    <div className="leading-relaxed whitespace-pre-wrap">
                      {formatMessageDisplay(message.content)}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none p-3 shadow-md">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-xs text-gray-600">FitAI is typing...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area - Compact and always visible */}
            <div className="border-t bg-white p-3 flex-shrink-0">
              <form onSubmit={handleSend} className="flex gap-2 items-end">
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={inputMessage}
                    onChange={handleTextareaChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="w-full border border-gray-300 rounded-2xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none min-h-[40px] max-h-[80px] bg-gray-50 text-gray-800 placeholder-gray-500 text-sm transition-all duration-200"
                    disabled={isLoading}
                    rows={1}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !inputMessage.trim()}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white p-2 rounded-xl transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center min-w-[40px] h-[40px]"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                  )}
                </button>
              </form>
              
              {/* Minimal footer */}
              <div className="flex justify-between items-center text-xs text-gray-500 mt-2 px-1">
                <button
                  type="button"
                  onClick={resetChat}
                  className="hover:text-blue-500 transition-colors"
                >
                  New chat
                </button>
                <span className="text-gray-400">•</span>
                <span className="text-gray-400">FitAI Assistant</span>
              </div>
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
// components/FloatingChatWidget.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { X, MessageCircle, Minimize2, Calendar } from 'lucide-react';

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
      content: "👋 **Welcome to FitAI!** \n\nI'm here to help you achieve your fitness goals and see if our training program is the right fit for you!\n\nWhat would you like to accomplish with your fitness journey?"
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showQuickOptions, setShowQuickOptions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Quick options for common fitness goals
  const quickOptions = [
    { label: '💪 Strength Training', value: 'I want to build strength and get stronger' },
    { label: '🏋️ Muscle Building', value: 'I want to build muscle and gain size' },
    { label: '🔥 Weight Loss', value: 'I want to lose weight and burn fat' },
    { label: '🎯 General Fitness', value: 'I want to improve my overall fitness' },
    { label: '⚡ Sports Performance', value: 'I want to improve my sports performance' },
    { label: '🔄 Toning', value: 'I want to tone and define my muscles' }
  ];

  // Check if mobile on mount and handle resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Prevent zoom on focus for mobile devices
  useEffect(() => {
    const preventZoom = (e: Event) => {
      // Prevent default zoom behavior on focus
      e.preventDefault();
    };

    const textarea = textareaRef.current;
    if (textarea && isMobile) {
      textarea.addEventListener('focus', preventZoom);
      textarea.addEventListener('touchstart', preventZoom);
      
      return () => {
        textarea.removeEventListener('focus', preventZoom);
        textarea.removeEventListener('touchstart', preventZoom);
      };
    }
  }, [isMobile]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && textareaRef.current && !isMinimized) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isOpen, isMinimized]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: "smooth",
        block: "end"
      });
    }, 100);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setShowQuickOptions(false);
    setIsLoading(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.fontSize = '16px'; // Prevent zoom on iOS
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
        content: "❌ **Connection Issue** \n\nSorry, I'm having trouble connecting. Please try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickOptionClick = (optionValue: string) => {
    setInputMessage(optionValue);
    setTimeout(() => {
      const mockEvent = { preventDefault: () => {} } as React.FormEvent;
      handleSend(mockEvent);
    }, 100);
  };

  const handleBookConsultation = () => {
    const bookingMessage = "I'd like to book a consultation";
    setInputMessage(bookingMessage);
    setTimeout(() => {
      const mockEvent = { preventDefault: () => {} } as React.FormEvent;
      handleSend(mockEvent);
    }, 100);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
    
    // Auto-resize textarea without allowing excessive expansion
    e.target.style.height = 'auto';
    const newHeight = Math.min(e.target.scrollHeight, 80); // Limit max height
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
        content: "👋 **Welcome to FitAI!** \n\nI'm here to help you achieve your fitness goals and see if our training program is the right fit for you!\n\nWhat would you like to accomplish with your fitness journey?"
      }
    ]);
    setShowQuickOptions(true);
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
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Chat Widget - Full screen on mobile */}
      <div 
        className={`
          fixed z-50 bg-white shadow-2xl border border-gray-200
          flex flex-col transition-all duration-300
          ${isMinimized 
            ? 'bottom-6 right-6 w-16 h-16 rounded-full' 
            : isMobile
            ? 'inset-0 rounded-none' // Full screen on mobile
            : 'bottom-6 right-6 w-96 h-[600px] rounded-xl'
          }
        `}
      >
        {!isMinimized ? (
          <div className="flex flex-col h-full w-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <div>
                  <h3 className="font-bold text-sm">FitAI Assistant</h3>
                  <p className="text-blue-100 text-xs">Online • Powered by Prestige AI</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={minimizeChat}
                  className="text-white hover:text-blue-200 transition-colors"
                  aria-label={isMobile ? "Close chat" : "Minimize chat"}
                >
                  {isMobile ? <X size={18} /> : <Minimize2 size={18} />}
                </button>
              </div>
            </div>

            {/* Messages Area - Takes most of the space */}
            <div 
              className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-blue-50"
              style={{ 
                minHeight: 0,
                // Ensure messages area takes available space
                height: isMobile ? 'calc(100vh - 140px)' : 'auto'
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
                      rounded-2xl p-3 max-w-[85%] break-words
                      ${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white rounded-br-none shadow-md'
                          : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-md'
                      }
                    `}
                  >
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {formatMessageDisplay(message.content)}
                    </div>
                  </div>
                </div>
              ))}

              {/* Quick Options */}
              {showQuickOptions && messages.length === 1 && (
                <div className="space-y-3">
                  <div className="text-center text-gray-600 text-sm mb-2">
                    Or choose a common goal:
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {quickOptions.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickOptionClick(option.value)}
                        className="bg-white border border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-800 px-3 py-2 rounded-xl text-sm transition-all duration-200 hover:shadow-md flex items-center justify-center text-center h-14"
                      >
                        <span className="text-xs font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

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
                      <span className="text-xs text-gray-600">FitAI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area - Fixed height */}
            <div className="border-t bg-white p-3 flex-shrink-0">
              <form onSubmit={handleSend} className="space-y-2">
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <textarea
                      ref={textareaRef}
                      value={inputMessage}
                      onChange={handleTextareaChange}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message or fitness goal..."
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none min-h-[44px] max-h-[80px] bg-gray-50 text-gray-800 placeholder-gray-500 text-base" // Increased font size to prevent zoom
                      disabled={isLoading}
                      rows={1}
                      style={{ 
                        fontSize: '16px', // Prevents zoom on iOS
                        lineHeight: '1.4'
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || !inputMessage.trim()}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white p-2 rounded-xl transition-colors disabled:cursor-not-allowed flex items-center justify-center min-w-[44px] h-[44px]" // Minimum touch target size
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                      </svg>
                    )}
                  </button>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500 px-1">
                  <button
                    type="button"
                    onClick={resetChat}
                    className="hover:text-blue-500 transition-colors py-1 px-2" // Added padding for better touch
                  >
                    New chat
                  </button>
                  
                  {/* Book Consultation Button */}
                  <button
                    type="button"
                    onClick={handleBookConsultation}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-full text-xs font-medium transition-colors flex items-center gap-1" // Increased padding
                  >
                    <Calendar size={12} />
                    Book Consultation
                  </button>
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
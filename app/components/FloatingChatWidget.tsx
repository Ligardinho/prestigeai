'use client';
import { useState, useEffect, useRef } from 'react';
import { X, MessageCircle, Calendar, RotateCcw } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface UserData {
  goal?: string;
  experience?: string;
  frequency?: string;
  timeline?: string;
  name?: string;
  email?: string;
}

const QUALIFICATION_STEPS = [
  { key: 'goal', question: "What's your main fitness goal?", options: ["💪 Strength Training", "🏋️ Muscle Building", "🔥 Weight Loss", "🎯 General Fitness", "⚡ Sports Performance", "🔄 Toning"] },
  { key: 'experience', question: "What's your current experience level?", options: ["🚀 Beginner (0-6 months)", "📈 Intermediate (6 months - 2 years)", "🏆 Advanced (2+ years)"] },
  { key: 'frequency', question: "How many days per week can you train?", options: ["2-3 days per week", "4-5 days per week"] },
  { key: 'timeline', question: "When would you like to get started?", options: ["💨 ASAP - Ready to start now", "📅 Within 2 weeks", "🗓️ Within a month"] },
  { key: 'name', question: "Great! What's your name?", options: null },
  { key: 'email', question: "Perfect! What's the best email to reach you?", options: null }
];

export default function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "👋 **Welcome to FitAI!** \n\nI'm here to help you achieve your fitness goals!\n\nWhat would you like to accomplish with your fitness journey?" }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickOptions, setShowQuickOptions] = useState(false);
  const [dynamicOptions, setDynamicOptions] = useState<string[]>([]);
  const [readyForBooking, setReadyForBooking] = useState(false);
  const [userData, setUserData] = useState<UserData>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [showThinking, setShowThinking] = useState(false);
  const [hasSentCalendly, setHasSentCalendly] = useState(false);
  const [conversationComplete, setConversationComplete] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // Tablet portrait and below
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, showThinking]);

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  // Simulate human-like delay
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || inputMessage.trim();
    if (!textToSend || isLoading) return;

    if (!messageText) {
      setInputMessage('');
    }

    // Add user message
    const userMessage: ChatMessage = { role: 'user', content: textToSend };
    const newMessages: ChatMessage[] = [...messages, userMessage];
    
    setMessages(newMessages);
    setShowQuickOptions(false);
    setIsLoading(true);
    setShowThinking(true);

    try {
      // If conversation is complete (after Calendly sent), just respond normally
      if (conversationComplete) {
        await delay(1000 + Math.random() * 2000);
        
        // Create encouraging responses that nudge toward booking
        const encouragingResponses = [
          "I'm really excited to work with you! Have you had a chance to check the booking link? Spots are filling up fast this week! 🚀",
          "Just a friendly reminder - the consultation is completely free and we can get started right away. Did the booking link work for you?",
          "I noticed you're still here! If you're having any trouble with the booking link or have questions, let me know. Otherwise, I'd grab a spot soon! ⏰",
          "The best time to start your fitness journey is now! Have you picked a consultation time yet? I'm excited to help you achieve your goals! 💪",
          "Don't wait too long to book - motivation is highest right after making the decision! Need help with the booking process?",
          "I'm here if you have any questions about the consultation! Otherwise, I'd recommend booking soon to secure your preferred time. 📅"
        ];
        
        const randomResponse = encouragingResponses[Math.floor(Math.random() * encouragingResponses.length)];
        const assistantMessage: ChatMessage = { 
          role: 'assistant', 
          content: randomResponse 
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
        setShowThinking(false);
        return;
      }

      // If we're at the booking stage and user says yes/sure/etc, send Calendly link
      if (readyForBooking && !hasSentCalendly && isPositiveResponse(textToSend)) {
        await delay(1000);
        setShowThinking(false);
        
        const calendlyLink = "https://calendly.com/your-username/fitai-consultation";
        const bookingMessage: ChatMessage = { 
          role: 'assistant', 
          content: `✅ **Perfect! Let's get you scheduled!**\n\nHere's my Calendly link to book your free consultation:\n\n📅 **Book Your Session:** ${calendlyLink}\n\nI recommend booking soon as spots fill up quickly! Once you've picked a time, you'll get a confirmation email with all the details.\n\n**Pro tip:** Book now while you're motivated! I'm excited to help you achieve your fitness goals! 🏋️‍♂️` 
        };
        
        setMessages(prev => [...prev, bookingMessage]);
        setHasSentCalendly(true);
        setConversationComplete(true); // Mark conversation as complete
        
        // Auto-open Calendly in a new tab after a brief delay
        setTimeout(() => {
          window.open(calendlyLink, '_blank', 'noopener,noreferrer');
        }, 2000);
        
        setIsLoading(false);
        return;
      }

      // Update user data based on current step
      const stepKey = QUALIFICATION_STEPS[currentStep].key as keyof UserData;
      const updatedUserData = { ...userData, [stepKey]: textToSend };
      setUserData(updatedUserData);

      // Simulate AI thinking time (1-3 seconds for realism)
      await delay(1000 + Math.random() * 2000);

      // Move to next step if there are more
      if (currentStep < QUALIFICATION_STEPS.length - 1) {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        
        const nextQuestion = QUALIFICATION_STEPS[nextStep];
        const assistantMessage: ChatMessage = { 
          role: 'assistant', 
          content: nextQuestion.question 
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        if (nextQuestion.options) {
          setDynamicOptions(nextQuestion.options);
          setShowQuickOptions(true);
        } else {
          setDynamicOptions([]);
          setShowQuickOptions(false);
        }
      } else {
        // All steps completed - show summary with a bit longer delay for the final response
        await delay(1500);
        
        const summary = `
**Perfect! Here's your fitness profile:**

🎯 **Goal:** ${updatedUserData.goal}
💪 **Experience:** ${updatedUserData.experience}  
📅 **Availability:** ${updatedUserData.frequency}
🚀 **Timeline:** ${updatedUserData.timeline}
👤 **Name:** ${updatedUserData.name}
📧 **Email:** ${updatedUserData.email}

Based on your goals, you're a great fit for our program! **Ready to book your free consultation?**
        `.trim();

        const assistantMessage: ChatMessage = { 
          role: 'assistant', 
          content: summary 
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        setReadyForBooking(true);
      }

    } catch (error) {
      console.error('Error:', error);
      await delay(1000);
      const errorMessage: ChatMessage = { 
        role: 'assistant', 
        content: "❌ **Connection Issue** \n\nPlease try again." 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setShowThinking(false);
    }
  };

  // Check if user response is positive for booking
  const isPositiveResponse = (text: string): boolean => {
    const positiveWords = ['yes', 'sure', 'ready', 'book', 'schedule', 'consult', 'lets go', "let's go", 'ok', 'okay', 'yeah', 'yep', 'yup', 'absolutely', 'definitely'];
    return positiveWords.some(word => text.toLowerCase().includes(word));
  };

  // Handle form submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  // Handle quick option click - AUTO-SENDS immediately
  const handleQuickOptionClick = (optionValue: string) => {
    handleSend(optionValue);
  };

  const handleBookConsult = async () => {
    const calendlyLink = "https://calendly.com/your-username/fitai-consultation";
    
    // Show brief thinking before confirmation
    setShowThinking(true);
    await delay(800);
    setShowThinking(false);
    
    const bookingMessage: ChatMessage = { 
      role: 'assistant', 
      content: `✅ **Let's get you scheduled!**\n\nHere's my Calendly link to book your free consultation:\n\n📅 **Book Your Session:** ${calendlyLink}\n\nI recommend booking soon as spots fill up quickly! I'm excited to help you achieve:\n• ${userData.goal}\n• ${userData.experience} level training\n• ${userData.frequency}\n\n**Don't wait** - the best time to start is now! 🏋️‍♂️` 
    };
    
    setMessages(prev => [...prev, bookingMessage]);
    setHasSentCalendly(true);
    setConversationComplete(true); // Mark conversation as complete
    
    // Auto-open Calendly in a new tab after a brief delay
    setTimeout(() => {
      window.open(calendlyLink, '_blank', 'noopener,noreferrer');
    }, 1500);
  };

  // Reset chat to initial state
  const handleNewChat = () => {
    setMessages([
      { role: 'assistant', content: "👋 **Welcome to FitAI!** \n\nI'm here to help you achieve your fitness goals!\n\nWhat would you like to accomplish with your fitness journey?" }
    ]);
    setInputMessage('');
    setShowQuickOptions(false);
    setDynamicOptions([]);
    setReadyForBooking(false);
    setUserData({});
    setCurrentStep(0);
    setHasSentCalendly(false);
    setConversationComplete(false);
  };

  const formatMessage = (content: string) => {
    return content.split('\n').map((line, index) => (
      <div key={index} className={line.startsWith('**') && line.endsWith('**') ? 'font-semibold text-blue-800' : ''}>
        {line.replace(/\*\*/g, '')}
      </div>
    ));
  };

  // Thinking indicator component
  const ThinkingIndicator = () => (
    <div className="flex justify-start">
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-md max-w-[85%]">
        <div className="flex items-center gap-3">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-700">FitAI is thinking</span>
            <span className="text-xs text-gray-500">Crafting your personalized response...</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-all"
      >
        <MessageCircle size={24} />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
      </button>
    );
  }

  return (
    <div className={`
      fixed z-50 bg-white shadow-2xl flex flex-col
      ${isMobile 
        ? 'inset-0 rounded-none' 
        : 'bottom-6 right-6 w-96 h-[600px] rounded-xl'
      }
    `}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div>
            <h3 className="font-bold text-sm">FitAI Assistant</h3>
            <p className="text-blue-100 text-xs">Online • Powered by Prestige AI</p>
          </div>
        </div>
        <div className="flex gap-2">
          {readyForBooking && !hasSentCalendly && (
            <button
              onClick={handleBookConsult}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
            >
              <Calendar size={12} />
              {isMobile ? 'Book' : 'Book Consult'}
            </button>
          )}
          <button 
            onClick={() => setIsOpen(false)} 
            className="text-white hover:text-blue-200"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-blue-50">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`
              rounded-2xl p-3 shadow-md
              ${message.role === 'user'
                ? 'bg-blue-500 text-white rounded-br-none max-w-[85%]'
                : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none max-w-[85%]'
              }
              ${isMobile ? 'max-w-[90%]' : 'max-w-[85%]'}
            `}>
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {formatMessage(message.content)}
              </div>
            </div>
          </div>
        ))}

        {/* Show thinking indicator when AI is processing */}
        {showThinking && <ThinkingIndicator />}

        {/* Initial Quick Options */}
        {messages.length === 1 && !showThinking && !conversationComplete && (
          <div className="space-y-3 mt-2">
            <div className="text-center text-gray-600 text-sm mb-2">Choose a common goal:</div>
            <div className={`grid gap-2 ${isMobile ? 'grid-cols-2' : 'grid-cols-2'}`}>
              {QUALIFICATION_STEPS[0].options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickOptionClick(option)}
                  disabled={isLoading}
                  className="bg-white border border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-800 px-3 py-2 rounded-xl text-sm flex items-center justify-center h-14 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-xs font-medium text-center">{option}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Quick Options */}
        {showQuickOptions && dynamicOptions.length > 0 && !showThinking && !conversationComplete && (
          <div className="space-y-3 mt-2">
            <div className="text-center text-gray-600 text-sm mb-2">Choose an option:</div>
            <div className={`grid gap-2 ${isMobile ? 'grid-cols-2' : 'grid-cols-2'}`}>
              {dynamicOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickOptionClick(option)}
                  disabled={isLoading}
                  className="bg-white border border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-800 px-3 py-2 rounded-xl text-sm flex items-center justify-center h-14 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-xs font-medium text-center">{option}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-300 bg-white">
        {/* New Chat Button - Light gray at bottom */}
        <div className="px-3 pt-2">
          <button
            onClick={handleNewChat}
            className="w-full text-gray-400 hover:text-gray-600 text-xs py-2 flex items-center justify-center gap-1 transition-all hover:bg-gray-50 rounded-lg"
          >
            <RotateCcw size={12} />
            New Chat
          </button>
        </div>
        
        {/* Input Form */}
        <form onSubmit={handleFormSubmit} className="p-3 flex-shrink-0 flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={isLoading ? "FitAI is thinking..." : "Type your message..."}
            className="flex-1 border border-gray-300 rounded-xl px-3 py-2 focus:ring-1 focus:ring-blue-500 text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
            disabled={isLoading}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white p-2 rounded-xl flex items-center justify-center transition-all disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
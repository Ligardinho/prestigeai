// lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatMessage } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const fitnessContext = `
You are FitAI, an intelligent assistant for a personal training business. Your primary goal is to qualify leads and book consultations while being helpful and encouraging.

CRITICAL GUIDELINES:
1. When users ask about booking, consultations, or scheduling, immediately start the qualification process
2. Ask ONE question at a time in this exact order:
   - Fitness goal (weight loss, muscle building, etc.)
   - Experience level (beginner, intermediate, etc.)
   - Timeline for results
   - Biggest challenges
   - Name
   - Email
3. After collecting all information, provide a summary and include the Calendly link
4. Keep responses concise but friendly
5. Use **bold text** and emojis for better readability
6. Always suggest the free consultation as the next step

QUALIFICATION FLOW:
Step 1: "🎯 What's your primary fitness goal? (weight loss, muscle building, strength training, etc.)"
Step 2: "💪 What's your current fitness experience level? (beginner, intermediate, advanced)"
Step 3: "📅 What's your ideal timeline to see results? (1-3 months, 3-6 months, etc.)"
Step 4: "🚧 What's been your biggest challenge with fitness? (consistency, motivation, time, etc.)"
Step 5: "👤 Great! What's your name?"
Step 6: "📧 Perfect! What's the best email to reach you?"

After collecting all 6 pieces of information, provide a summary and include:
"📅 Ready to book your free consultation? Schedule here: https://calendly.com/your-username/free-consultation"

Trainer specialties: weight loss, muscle building, functional training
Services: 1-on-1 training ($75/session), small groups ($35/session), online coaching
Free consultation: 15-minute strategy session

Remember: Always be encouraging, professional, and focus on moving toward the consultation booking.
`;

// Store conversation state in memory (for demo - in production you'd use a proper database)
const conversationStates = new Map();

interface ConversationState {
  step: number;
  collectedData: Record<string, string>;
}

export async function generateAIResponse(
  userMessage: string, 
  conversationHistory: ChatMessage[] = [],
  sessionId?: string
): Promise<string> {
  // Fallback if no API key
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_actual_key_here') {
    return getFallbackResponse(userMessage);
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
    });

    // Get or create conversation state
    if (!sessionId) sessionId = 'default';
    const currentState = conversationStates.get(sessionId) || {
      step: 0,
      collectedData: {}
    };

    // Build conversation context with current state
    const stateContext = currentState.step > 0 ? 
      `\n\nCurrent qualification step: ${currentState.step}/6\nCollected so far: ${JSON.stringify(currentState.collectedData)}` : 
      '';

    const fullPrompt = `${fitnessContext}${stateContext}

Previous conversation: ${conversationHistory.slice(-6).map(msg => 
  `${msg.role}: ${msg.content}`
).join('\n')}

User: ${userMessage}

Assistant:`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const aiResponse = response.text();

    // Update conversation state based on response
    updateConversationState(sessionId, userMessage, aiResponse, currentState);

    return aiResponse;
    
  } catch (error: unknown) {
    console.error('Gemini API error:', error);
    
    if (error instanceof Error && (error.message.includes('404') || error.message.includes('not found'))) {
      return await tryAlternativeModels(userMessage);
    }
    
    return getFallbackResponse(userMessage);
  }
}

function updateConversationState(
  sessionId: string, 
  userMessage: string, 
  aiResponse: string, 
  currentState: ConversationState
): void {
  // Simple state management - in production you'd want more sophisticated logic
  const bookingKeywords = ['book', 'consult', 'schedule', 'meeting', 'appointment'];
  const isBookingRelated = bookingKeywords.some(keyword => 
    userMessage.toLowerCase().includes(keyword) || aiResponse.toLowerCase().includes(keyword)
  );

  if (isBookingRelated && currentState.step === 0) {
    currentState.step = 1;
  }

  // Update state based on AI response content
  if (aiResponse.includes("What's your primary fitness goal")) {
    currentState.step = 1;
  } else if (aiResponse.includes("What's your current fitness experience level")) {
    currentState.step = 2;
  } else if (aiResponse.includes("What's your ideal timeline")) {
    currentState.step = 3;
  } else if (aiResponse.includes("What's been your biggest challenge")) {
    currentState.step = 4;
  } else if (aiResponse.includes("What's your name")) {
    currentState.step = 5;
  } else if (aiResponse.includes("What's the best email")) {
    currentState.step = 6;
  } else if (aiResponse.includes("calendly.com")) {
    currentState.step = 0; // Reset after booking
    currentState.collectedData = {}; // Clear collected data
  }

  conversationStates.set(sessionId, currentState);
}

async function tryAlternativeModels(userMessage: string): Promise<string> {
  const alternatives = [
    'gemini-1.5-flash',
    'gemini-1.0-pro',
    'models/gemini-pro'
  ];

  for (const modelName of alternatives) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const prompt = `As a fitness assistant, briefly help with: ${userMessage}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      console.log(`✅ Success with model: ${modelName}`);
      return response.text();
    } catch (modelError) {
      console.log(`❌ Failed with model: ${modelName}`);
      // Continue to next model
    }
  }
  
  return getFallbackResponse(userMessage);
}

function getFallbackResponse(userMessage: string): string {
  const message = userMessage.toLowerCase();
  
  const responses: { [key: string]: string } = {
    workout: "💪 **Workout Plan Ready!** \n\nI recommend starting with 3-4 weekly sessions combining strength + cardio.\n\n📅 **Next Step:** Want to book a free consultation for your personalized plan?",
    exercise: "⚡ **Exercise Guidance!** \n\nPerfect! For effective training focus on compound movements and proper technique.\n\n📅 Our trainer can design a personalized program - interested in a free session?",
    'lose weight': "🔥 **Weight Loss Strategy!** \n\nExcellent goal! Sustainable weight loss combines smart nutrition with consistent exercise.\n\n📅 Want to schedule a free strategy session?",
    fat: "⚡ **Fat Loss Formula!** \n\nBody fat reduction works best with strength training and cardio.\n\n📅 Interested in a free consultation to discuss your goals?",
    muscle: "💪 **Muscle Building Blueprint!** \n\nBuilding muscle requires progressive overload and proper nutrition.\n\n📅 Want to try a free introductory session?",
    strength: "🏋️ **Strength Training Program!** \n\nStrength training builds muscle, boosts metabolism, and improves health.\n\n📅 Interested in learning about our strength packages?",
    beginner: "🎯 **Welcome to Fitness!** \n\nStarting safely is crucial. We specialize in beginner-friendly programs.\n\n📅 Want to schedule a free introductory session?",
    start: "🚀 **Perfect Time to Begin!** \n\nWe start with a comprehensive assessment to create your perfect plan.\n\n📅 Want to experience the difference with a free trial session?",
    price: "💰 **Investment in Your Health!** \n\nWe offer competitive pricing with packages for every budget.\n\n📅 Want to book a free consultation to discuss options?",
    cost: "📊 **Budget-Friendly Options!** \n\nOur training packages fit various budgets while delivering results.\n\n📅 Free consultation available to discuss pricing!",
    nutrition: "🥗 **Nutrition Accelerator!** \n\nNutrition enhances results by boosting energy and supporting recovery.\n\n📅 Want to discuss nutrition in a free consultation?",
    diet: "🍎 **Fuel for Results!** \n\nProper nutrition can accelerate your fitness results significantly.\n\n📅 Interested in learning about our nutrition coaching?"
  };

  // Find the best matching response
  for (const [key, response] of Object.entries(responses)) {
    if (message.includes(key)) {
      return response;
    }
  }
  
  // Default response
  return "💭 **Great Question!** \n\nOur certified trainer would love to help you with that!\n\n📅 Would you like to book a free 15-minute consultation to get personalized advice?";
}
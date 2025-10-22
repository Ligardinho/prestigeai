// lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatMessage } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const fitnessContext = `
You are FitAI, an intelligent assistant for a personal training business. Be helpful, encouraging, and focus on qualifying leads for the trainer.

Key guidelines:
- Provide brief, helpful fitness advice (2-3 sentences max)
- Always suggest booking a free consultation
- Be professional but friendly
- Never give medical advice
- Focus on qualifying leads for the personal trainer

Trainer specialties: weight loss, muscle building, functional training
Services: 1-on-1 training ($75/session), small groups ($35/session), online coaching
Free consultation: 15-minute strategy session
`;

export async function generateAIResponse(
  userMessage: string, 
  conversationHistory: ChatMessage[] = []
): Promise<string> {
  // Fallback if no API key or for demo purposes
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_actual_key_here') {
    return getFallbackResponse(userMessage);
  }

  try {
    // Use the correct model configuration
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
    });

    // Build the full prompt with context
    const fullPrompt = `${fitnessContext}

Previous conversation: ${conversationHistory.slice(-3).map(msg => 
  `${msg.role}: ${msg.content}`
).join('\n')}

User: ${userMessage}

Assistant:`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
    
  } catch (error: unknown) {
    console.error('Gemini API error:', error);
    
    // Try alternative model names
    if (error instanceof Error && (error.message.includes('404') || error.message.includes('not found'))) {
      console.log('Trying alternative model names...');
      return await tryAlternativeModels(userMessage);
    }
    
    return getFallbackResponse(userMessage);
  }
}

// Function to try different model names
async function tryAlternativeModels(userMessage: string): Promise<string> {
  const alternatives = [
    'gemini-1.0-pro',
    'gemini-1.0-pro-001',
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
    } catch (error) {
      console.log(`❌ Failed with model: ${modelName}`);
      // Continue to next model
    }
  }
  
  return getFallbackResponse(userMessage);
}

function getFallbackResponse(userMessage: string): string {
  const message = userMessage.toLowerCase();
  
  const responses: { [key: string]: string } = {
    workout: "I'd recommend starting with 3-4 weekly workouts combining strength training and cardio. Our trainer can create a personalized plan for your specific goals - want to book a free consultation?",
    exercise: "Great question! For beginners, I suggest bodyweight exercises like squats, push-ups, and planks. Our trainer can show you proper form and create a customized routine - interested in a free session?",
    'lose weight': "Awesome goal! Weight loss success comes from consistent exercise and proper nutrition. Our trainer has helped many clients achieve lasting results - want to learn about our personalized programs?",
    fat: "Body fat reduction works best with a combination of strength training and cardio. Our trainer develops customized plans that actually work - interested in a free strategy session?",
    muscle: "Building muscle requires progressive overload and proper nutrition. Our strength training specialists can guide you safely - want to try a free introductory workout?",
    strength: "Strength training is fantastic for overall health! Our trainer focuses on proper form and effective programming - interested in learning about our strength packages?",
    beginner: "Welcome to your fitness journey! Starting safely is crucial. Our trainer specializes in beginner-friendly programs that build confidence - want to schedule a free introductory session?",
    start: "Perfect time to start! We begin with an assessment to create the right plan for you. Our trainer offers a risk-free trial session - want to try one?",
    price: "We offer competitive pricing! 1-on-1 training starts at $75/session, small groups at $35/session. Let me help you book a free consultation to discuss the best options for your goals!",
    cost: "Our packages are designed for different budgets. The best way to get accurate pricing is through a free consultation where we assess your goals - want to schedule one?",
    nutrition: "Nutrition is key! While I can't give specific diet advice, our trainer provides general guidance and can refer you to nutrition specialists. Want to discuss your nutrition goals in a free consultation?",
    diet: "Nutrition plays a huge role in fitness results! Our trainer offers general food guidance as part of all training programs. Interested in learning more during a free session?"
  };

  // Find the best matching response
  for (const [key, response] of Object.entries(responses)) {
    if (message.includes(key)) {
      return response;
    }
  }
  
  // Default response for anything else
  return "Thanks for your message! I'd love to help you reach your fitness goals. Our certified trainer offers free 15-minute consultations to create your personalized plan - interested in booking one?";
}
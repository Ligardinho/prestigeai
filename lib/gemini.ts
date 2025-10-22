// lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatMessage } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const fitnessContext = `
You are FitAI, an intelligent assistant for a personal training business. Be helpful, encouraging, and focus on qualifying leads for the trainer.

IMPORTANT FORMATTING RULES:
- Use **bold text** for key points and section headers
- Use line breaks to separate different sections
- Include relevant emojis to make the response engaging (💪, 🏋️, 🔥, ⚡, 🎯, 🥗, 📅, 💰, 👋)
- Keep responses concise but informative (3-5 sentences max)
- Always end by suggesting booking a free consultation

Key guidelines:
- Provide brief, helpful fitness advice with emojis
- Always suggest booking a free consultation with 📅 emoji
- Be professional but friendly and motivational
- Never give medical advice
- Focus on qualifying leads for the personal trainer
- If asked about topics not related to fitness politely redirect them back to fitness advice

Trainer specialties: weight loss, muscle building, functional training
Services: 1-on-1 training ($75/session), small groups ($35/session), online coaching
Free consultation: 15-minute strategy session

Example response format:
**Great question!** 💭

I recommend starting with 3-4 weekly workouts combining strength + cardio.

🏋️ **Key Focus:**
• Compound exercises
• Proper form
• Consistency

📅 **Next Step:**
Want to book a free consultation to create your personalized plan?
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
    
    // Apply final formatting to the AI response
    return formatAIResponse(response.text());
    
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
    'gemini-1.5-flash',
    'gemini-1.0-pro',
    'gemini-1.0-pro-001',
    'models/gemini-pro'
  ];

  for (const modelName of alternatives) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const prompt = `As a fitness assistant, provide brief, engaging advice with emojis about: ${userMessage}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      console.log(`✅ Success with model: ${modelName}`);
      return formatAIResponse(response.text());
    } catch (error) {
      console.log(`❌ Failed with model: ${modelName}`);
      // Continue to next model
    }
  }
  
  return getFallbackResponse(userMessage);
}

// Enhanced formatting for AI responses
function formatAIResponse(response: string): string {
  // Clean up any markdown artifacts and ensure proper formatting
  let formatted = response
    .replace(/```/g, '') // Remove code blocks
    .replace(/\*\*(.*?)\*\*/g, '**$1**') // Ensure bold formatting
    .trim();

  // Add emoji mapping for common fitness terms
  const emojiMap: { [key: string]: string } = {
    'workout': '💪',
    'exercise': '🏋️',
    'nutrition': '🥗',
    'diet': '🍎',
    'weight loss': '🔥',
    'muscle': '💪',
    'strength': '🏋️',
    'beginner': '🎯',
    'consultation': '📅',
    'session': '⏱️',
    'price': '💰',
    'goal': '🎯',
    'help': '⚡',
    'plan': '📊'
  };

  // Add relevant emojis to the response
  Object.entries(emojiMap).forEach(([term, emoji]) => {
    if (formatted.toLowerCase().includes(term.toLowerCase()) && !formatted.includes(emoji)) {
      formatted = formatted.replace(new RegExp(`\\b${term}\\b`, 'gi'), `${emoji} ${term}`);
    }
  });

  // Ensure it ends with a consultation call-to-action if not already present
  if (!formatted.includes('consultation') && !formatted.includes('📅')) {
    formatted += '\n\n📅 **Ready to start?**\nBook a free consultation to create your personalized plan!';
  }

  return formatted;
}

function getFallbackResponse(userMessage: string): string {
  const message = userMessage.toLowerCase();
  
  const responses: { [key: string]: string } = {
    workout: "💪 **Workout Plan Ready!** \n\nI recommend starting with 3-4 weekly sessions combining strength + cardio.\n\n🏋️ **Sample Routine:**\n• Full body workouts\n• Progressive overload\n• Proper form focus\n\n📅 Want to book a free consultation for your personalized plan?",
    
    exercise: "⚡ **Exercise Guidance!** \n\nPerfect! For effective training:\n\n🎯 **Key Principles:**\n• Compound movements\n• Proper technique\n• Consistency over intensity\n\n🏋️ Our trainer can design a personalized program - interested in a free session?",
    
    'lose weight': "🔥 **Weight Loss Strategy!** \n\nExcellent goal! Sustainable weight loss combines:\n\n🥗 Smart nutrition\n💪 Regular exercise\n📊 Consistent habits\n\n🎯 Most clients see results in 4-6 weeks! Want to schedule a free strategy session?",
    
    fat: "⚡ **Fat Loss Formula!** \n\nEffective fat reduction requires:\n\n💪 Strength training (metabolism boost)\n🏃 Cardio sessions\n🥗 Calorie management\n\n📅 Our trainer creates customized programs - interested in a consultation?",
    
    muscle: "💪 **Muscle Building Blueprint!** \n\nBuilding muscle requires:\n\n🏋️ Progressive overload\n🥗 Protein focus\n😴 Proper recovery\n\n🎯 Want to try a free introductory session with our strength specialists?",
    
    strength: "🏋️ **Strength Training Program!** \n\nStrength training builds:\n\n💪 Muscle mass\n⚡ Metabolism\n🛡️ Joint protection\n\n🔥 Interested in learning about our strength packages during a free consultation?",
    
    beginner: "🎯 **Welcome to Fitness!** \n\nStarting safely is crucial! Our beginner program includes:\n\n✅ Form instruction\n✅ Gradual progression\n✅ Confidence building\n\n😊 Want to schedule a free introductory session?",
    
    start: "🚀 **Perfect Time to Begin!** \n\nWe start with a comprehensive assessment:\n\n📊 Fitness evaluation\n🎯 Goal setting\n💪 Custom program design\n\n📅 Want to experience the difference with a free trial session?",
    
    price: "💰 **Investment in Your Health!** \n\nWe offer competitive pricing:\n\n💎 1-on-1: $75/session\n👥 Groups: $35/session\n📦 Packages: Save 15-20%\n\n🎯 Want to book a free consultation to discuss options?",
    
    cost: "📊 **Budget-Friendly Options!** \n\nOur packages fit various budgets:\n\n💎 Personal training\n👥 Small groups\n🌐 Online coaching\n\n🔥 Package deals offer the best value. Free consultation available!",
    
    nutrition: "🥗 **Nutrition Accelerator!** \n\nNutrition enhances results by:\n\n⚡ Boosting energy\n💪 Supporting recovery\n🔥 Enhancing fat loss\n\n🍎 Want to discuss nutrition in a free consultation?",
    
    diet: "🍎 **Fuel for Results!** \n\nProper nutrition accelerates fitness results!\n\n🥗 Meal timing\n💪 Protein optimization\n🎯 Nutrient density\n\n📊 Free consultation includes nutrition guidance!"
  };

  // Find the best matching response
  for (const [key, response] of Object.entries(responses)) {
    if (message.includes(key)) {
      return response;
    }
  }
  
  // Default response with Streamline formatting
  return "💭 **Great Question!** \n\nOur certified trainer would love to provide personalized advice!\n\n🎯 **Free consultation includes:**\n• Goal assessment\n• Custom plan outline\n• Pricing options\n\n📅 Would you like to book a session?";
}
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Define the qualification steps
const QUALIFICATION_STEPS = [
  {
    key: "goal",
    question: "What's your main fitness goal?",
    options: ["💪 Strength Training", "🏋️ Muscle Building", "🔥 Weight Loss", "🎯 General Fitness", "⚡ Sports Performance", "🔄 Toning"]
  },
  {
    key: "experience", 
    question: "What's your current experience level?",
    options: ["🚀 Beginner (0-6 months)", "📈 Intermediate (6 months - 2 years)", "🏆 Advanced (2+ years)"]
  },
  {
    key: "frequency",
    question: "How many days per week can you train?",
    options: ["2-3 days per week", "4-5 days per week"]
  },
  {
    key: "timeline",
    question: "When would you like to get started?",
    options: ["💨 ASAP - Ready to start now", "📅 Within 2 weeks", "🗓️ Within a month"]
  },
  {
    key: "name",
    question: "Great! What's your name?",
    options: null
  },
  {
    key: "email", 
    question: "Perfect! What's the best email to reach you?",
    options: null
  }
];

interface ConversationMessage {
  role: string;
  content: string;
}

interface AIResponse {
  response: string;
  options?: string[];
  readyForBooking?: boolean;
  userData?: Record<string, string>;
}

export async function generateAIResponse(message: string, conversationHistory: ConversationMessage[]): Promise<AIResponse> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Build conversation context
    const historyText = conversationHistory
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join("\n");

    const prompt = `
You are FitAI, a friendly personal trainer assistant. You're qualifying users for a fitness consultation.

Keep responses very short and focused. After each user response, just ask the next logical question in this order:
1. Fitness goal
2. Experience level  
3. Availability (days per week)
4. Timeline to start
5. Their name
6. Their email

After getting all information, provide a brief summary and indicate they can book a consultation.

Respond conversationally but very briefly.

Current conversation:
${historyText}

User: ${message}

Assistant:`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    return { response: text };

  } catch (error) {
    console.error("Gemini error:", error);
    return { 
      response: "Sorry, I had trouble understanding that. Could you rephrase?" 
    };
  }
}
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateAIResponse(message: string, conversationHistory: any[]) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}

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
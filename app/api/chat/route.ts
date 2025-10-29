// app/api/chat/route.ts
import { generateAIResponse } from '@/lib/gemini';
import { NextResponse } from 'next/server';

interface RequestBody {
  message: string;
  conversationHistory: Array<{
    role: string;
    content: string;
  }>;
}

export async function POST(request: Request) {
  try {
    const { message, conversationHistory }: RequestBody = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const aiResponse = await generateAIResponse(message, conversationHistory);
    
    return NextResponse.json(aiResponse);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse } from '@/lib/gemini';
import { ChatRequest, ApiResponse } from "@/types/index";

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const { message, conversationHistory = [] }: ChatRequest = await request.json();

    if (!message || message.trim() === '') {
      return NextResponse.json(
        { error: 'Message is required' }, 
        { status: 400 }
      );
    }

    if (message.length > 500) {
      return NextResponse.json(
        { error: 'Message too long' }, 
        { status: 400 }
      );
    }

    const aiResponse = await generateAIResponse(message, conversationHistory);

    return NextResponse.json({ 
      response: aiResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        error: 'Unable to process your message at the moment.',
        fallback: "In the meantime, you can contact the trainer directly at hello@trainer.com or call (555) 123-4567."
      },
      { status: 500 }
    );
  }
}
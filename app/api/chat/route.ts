// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse } from '@/lib/gemini'; // Use simple version for now
import { ChatRequest, ApiResponse } from '@/types';

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const { message, conversationHistory = [] }: ChatRequest = await request.json();

    if (!message || message.trim() === '') {
      return NextResponse.json(
        { error: 'Message is required' }, 
        { status: 400 }
      );
    }

    // Limit message length
    if (message.length > 1000) {
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
    
    return NextResponse.json(
      { 
        response: "I'd love to help you reach your fitness goals! Our trainer offers free consultations to create your personalized plan - want to book one?"
      },
      { status: 200 } // Still return 200 so frontend works
    );
  }
}
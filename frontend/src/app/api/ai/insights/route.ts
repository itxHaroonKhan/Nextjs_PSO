import { NextResponse } from 'next/server';
import { ai } from '@/ai/genkit';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Using the genkit setup provided by you
    const response = await ai.generate(prompt);
    
    return NextResponse.json({ text: response.text });
  } catch (error: any) {
    console.error('❌ AI API Route Error:', error);
    
    // Fallback in case gemini-2.5-flash is not available yet in the SDK
    return NextResponse.json({ 
      error: 'AI Insight failed', 
      details: error.message 
    }, { status: 500 });
  }
}

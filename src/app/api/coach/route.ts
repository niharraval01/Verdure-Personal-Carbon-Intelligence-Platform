/**
 * AI Carbon Coach — DEMO MODE (no DB, no auth check)
 * Still calls OpenRouter for real AI responses.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { coachMessageSchema } from "@/lib/validation/onboarding";

const SYSTEM_PROMPT = `You are Verdure's Carbon Coach — a friendly, knowledgeable sustainability advisor.

RULES:
1. Only answer questions about carbon footprint, sustainability, environmental impact, and eco-friendly living.
2. Politely decline off-topic questions with: "I'm focused on sustainability topics. Could you ask me something about reducing your carbon footprint?"
3. Keep responses concise (under 300 words) and actionable.
4. Use specific numbers and facts when possible.
5. Be encouraging — celebrate user progress, no guilt-tripping.

USER'S CARBON DATA:
- Total: 5.8 tonnes CO₂e/year
- Score: 62/100 (average)
- Transport: 2,400 kg/yr
- Energy: 1,800 kg/yr
- Lifestyle: 1,640 kg/yr`;

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const parseResult = coachMessageSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    const { message } = parseResult.data;

    const openRouterResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
          "X-Title": "Verdure Carbon Coach",
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL ?? "nvidia/llama-3.1-nemotron-ultra-253b-v1:free",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: message },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      }
    );

    if (!openRouterResponse.ok) {
      return NextResponse.json(
        { error: "AI service temporarily unavailable. Please try again." },
        { status: 502 }
      );
    }

    const data = await openRouterResponse.json();
    const assistantMessage =
      data.choices?.[0]?.message?.content ??
      "I'm sorry, I couldn't generate a response. Please try again.";

    return NextResponse.json({ message: assistantMessage, remaining: 9 });
  } catch (error) {
    console.error("Coach error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

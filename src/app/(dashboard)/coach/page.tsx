/**
 * Coach Page — DEMO MODE (mock messages, no DB)
 */
import { CoachPanel } from "@/features/coach/components/coach-panel";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verdure — AI Carbon Coach",
  description: "Get personalized sustainability advice from your AI Carbon Coach.",
};

const MOCK_MESSAGES = [
  {
    id: "msg-1",
    role: "assistant" as const,
    content: "Hi Nihar! 👋 I'm your AI Carbon Coach. Your current footprint of **5,840 kg CO₂e/year** is close to the global average. Let's work together to bring it down. What area would you like to focus on — transport, energy, or lifestyle?",
    timestamp: new Date("2024-06-01T10:00:00Z"),
  },
];

export default async function CoachPage() {
  return (
    <div className="page-container page-container--coach">
      <CoachPanel initialMessages={MOCK_MESSAGES} />
    </div>
  );
}

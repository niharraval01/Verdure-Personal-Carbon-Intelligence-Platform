/**
 * Coach Page
 */
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CoachPanel } from "@/features/coach/components/coach-panel";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verdure — AI Carbon Coach",
  description: "Get personalized sustainability advice from your AI Carbon Coach.",
};

export default async function CoachPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const messages = await prisma.coachMessage.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  const formattedMessages = messages.map((msg) => ({
    id: msg.id,
    role: msg.role as "user" | "assistant",
    content: msg.content,
    timestamp: msg.createdAt,
  }));

  return (
    <div className="page-container page-container--coach">
      <CoachPanel initialMessages={formattedMessages} />
    </div>
  );
}

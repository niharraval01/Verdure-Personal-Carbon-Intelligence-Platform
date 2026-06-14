"use client";

/**
 * Coach Chat Panel
 *
 * Chat interface for the AI Carbon Coach.
 * Uses semantic <aside> landmark.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface CoachPanelProps {
  initialMessages: Message[];
}

export function CoachPanel({ initialMessages }: CoachPanelProps) {
  const shouldReduceMotion = useReducedMotion();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: shouldReduceMotion ? "auto" : "smooth" });
  }, [shouldReduceMotion]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      if (data.remaining !== undefined) {
        setRemaining(data.remaining);
      }
    } catch {
      setError("Failed to connect. Please check your internet connection.");
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <aside className="coach" aria-label="AI Carbon Coach">
      <div className="coach__header">
        <h2 className="coach__title">🤖 Carbon Coach</h2>
        <p className="coach__subtitle">
          Ask me anything about reducing your carbon footprint
        </p>
        {remaining !== null && (
          <p className="coach__remaining">
            {remaining} message{remaining !== 1 ? "s" : ""} remaining this hour
          </p>
        )}
      </div>

      <div className="coach__messages" role="log" aria-label="Chat messages" aria-live="polite">
        {messages.length === 0 && (
          <div className="coach__empty">
            <p>👋 Hi! I&apos;m your Carbon Coach.</p>
            <p>Try asking:</p>
            <ul>
              <li>&quot;How can I reduce my transport emissions?&quot;</li>
              <li>&quot;What&apos;s the impact of switching to an EV?&quot;</li>
              <li>&quot;Tips for reducing my electricity bill&quot;</li>
            </ul>
          </div>
        )}

        {messages.map((msg, index) => (
          <motion.div
            key={msg.id}
            className={`coach__message coach__message--${msg.role}`}
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index === messages.length - 1 ? 0.1 : 0 }}
          >
            <div className="coach__message-avatar" aria-hidden="true">
              {msg.role === "user" ? "👤" : "🌱"}
            </div>
            <div className="coach__message-content">
              <p className="coach__message-text">{msg.content}</p>
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <div className="coach__message coach__message--assistant coach__message--loading">
            <div className="coach__message-avatar" aria-hidden="true">🌱</div>
            <div className="coach__message-content">
              <div className="coach__typing" aria-label="Coach is typing">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="coach__error" role="alert">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="coach__input-area">
        <textarea
          ref={inputRef}
          className="coach__input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your carbon footprint…"
          maxLength={500}
          rows={2}
          disabled={isLoading}
          aria-label="Type your message to the Carbon Coach"
        />
        <button
          className="btn btn--primary coach__send"
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          aria-label="Send message"
        >
          {isLoading ? "…" : "Send"}
        </button>
      </div>
    </aside>
  );
}

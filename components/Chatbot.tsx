"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { detectIntent } from "@/lib/chatbotEngine";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Message {
  id: number;
  from: "user" | "bot";
  text: string;
  action?: { label: string; href: string };
}

// ── Suggested quick-reply chips ───────────────────────────────────────────────
const SUGGESTIONS = [
  "I need blood",
  "How to donate?",
  "Am I eligible?",
  "Find a donor",
  "Contact support",
];

// ── Render bot text with basic markdown (bold + newlines) ─────────────────────
function BotText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <span>
      {lines.map((line, i) => {
        // Bold: **text**
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <span key={i}>
            {parts.map((part, j) =>
              j % 2 === 1 ? <strong key={j}>{part}</strong> : part
            )}
            {i < lines.length - 1 && <br />}
          </span>
        );
      })}
    </span>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Chatbot() {
  const router = useRouter();
  const [open, setOpen]         = useState(false);
  const [input, setInput]       = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      from: "bot",
      text: "Hi! 👋 I'm RedBot, your blood donation assistant. How can I help you today?",
    },
  ]);
  const [typing, setTyping]     = useState(false);
  const bottomRef               = useRef<HTMLDivElement>(null);
  const inputRef                = useRef<HTMLInputElement>(null);
  const nextIdRef               = useRef(1);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Focus input when chat opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const addMessage = useCallback((msg: Omit<Message, "id">) => {
    const id = nextIdRef.current++;
    setMessages((prev) => [...prev, { ...msg, id }]);
  }, []);

  const isSendingRef = useRef(false);

  const handleSend = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isSendingRef.current) return;
      isSendingRef.current = true;

      // Add user message
      addMessage({ from: "user", text: trimmed });
      setInput("");
      setTyping(true);

      // Simulate typing delay
      setTimeout(() => {
        const response = detectIntent(trimmed);
        setTyping(false);
        addMessage({
          from: "bot",
          text: response.reply,
          action: response.action,
        });
        isSendingRef.current = false;
      }, 600);
    },
    [addMessage]
  );

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend(input);
  };

  const INITIAL_MESSAGE: Message = {
    id: 0,
    from: "bot",
    text: "Hi! 👋 I'm RedBot, your blood donation assistant. How can I help you today?",
  };

  const handleReset = () => {
    nextIdRef.current = 1;
    setMessages([INITIAL_MESSAGE]);
    setTyping(false);
    setInput("");
    isSendingRef.current = false;
  };

  return (
    <>
      {/* ── Floating button ─────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open chatbot"
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          open
            ? "bg-gray-700 rotate-45 scale-95"
            : "bg-red-600 hover:bg-red-700 hover:scale-110"
        }`}
      >
        {open ? (
          /* Close / X icon */
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          /* Chat bubble icon */
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M21 16c0 1.1-.9 2-2 2H7l-4 4V6a2 2 0 012-2h14a2 2 0 012 2v10z"
            />
          </svg>
        )}
      </button>

      {/* ── Chat window ─────────────────────────────────────────────────── */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-80 sm:w-96 flex flex-col rounded-2xl shadow-2xl border border-gray-200 bg-white overflow-hidden transition-all duration-300 origin-bottom-right ${
          open ? "scale-100 opacity-100 pointer-events-auto" : "scale-90 opacity-0 pointer-events-none"
        }`}
        style={{ maxHeight: "520px" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-red-600 text-white shrink-0">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg">
            🤖
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm leading-tight">RedBot</p>
            <p className="text-xs text-red-200">Blood Donation Assistant</p>
          </div>
          {/* Online dot + clear button */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="flex items-center gap-1 text-xs text-red-200">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
              Online
            </span>
            <button
              onClick={handleReset}
              title="Clear chat"
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
            >
              <svg className="w-4 h-4 text-red-200 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-gray-50" style={{ minHeight: 0 }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.from === "bot" && (
                <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center text-sm mr-2 shrink-0 mt-0.5">
                  🤖
                </div>
              )}
              <div className={`max-w-[78%] ${msg.from === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                <div
                  className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.from === "user"
                      ? "bg-red-600 text-white rounded-br-sm"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm"
                  }`}
                >
                  {msg.from === "bot" ? <BotText text={msg.text} /> : msg.text}
                </div>
                {/* Action button */}
                {msg.action && (
                  <button
                    onClick={() => { router.push(msg.action!.href); setOpen(false); }}
                    className="text-xs text-red-600 font-semibold hover:underline self-start ml-1"
                  >
                    {msg.action.label}
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {typing && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center text-sm mr-2 shrink-0">
                🤖
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center h-4">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick suggestions — only show when no user message yet */}
        {messages.length <= 1 && (
          <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex gap-2 overflow-x-auto shrink-0">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                className="shrink-0 text-xs px-3 py-1.5 rounded-full border border-red-300 text-red-600 bg-white hover:bg-red-50 transition-colors whitespace-nowrap"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex items-center gap-2 px-3 py-3 border-t border-gray-200 bg-white shrink-0">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type a message…"
            className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || typing}
            className="w-9 h-9 rounded-full bg-red-600 hover:bg-red-700 disabled:opacity-40 flex items-center justify-center transition-colors shrink-0"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}

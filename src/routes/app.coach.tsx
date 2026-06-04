import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/Primitives";
import { Sparkles, Send, Plus } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getChatThreads, getThreadMessages, sendChatMessage } from "@/functions/chat.functions";

export const Route = createFileRoute("/app/coach")({
  component: Coach,
});

type Msg = { role: "user" | "ai"; text: string };

function Coach() {
  const queryClient = useQueryClient();
  const [currentThreadId, setCurrentThreadId] = useState("thread-" + Date.now().toString(36));
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch threads
  const { data: threadsData } = useQuery({
    queryKey: ["chat-threads"],
    queryFn: () => getChatThreads(),
  });

  const threads = threadsData?.data ?? [];

  // Load thread messages when switching
  const loadThread = async (threadId: string) => {
    setCurrentThreadId(threadId);
    try {
      const result = await getThreadMessages({ data: { threadId } });
      if (result.success && result.data) {
        setMessages(
          result.data.map((m: any) => ({
            role: m.role as "user" | "ai",
            text: m.message,
          }))
        );
      }
    } catch {
      // If loading fails, start fresh
      setMessages([]);
    }
  };

  // Load initial thread (most recent)
  useEffect(() => {
    if (threads.length > 0) {
      const latest = threads[0];
      loadThread(latest.threadId);
    }
  }, [threads.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMut = useMutation({
    mutationFn: (data: { threadId: string; message: string; threadTitle?: string }) =>
      sendChatMessage({ data }),
    onSuccess: (result: any) => {
      if (result.success && result.data) {
        setMessages((m) => [...m, { role: "ai", text: result.data.aiResponse }]);
        setIsTyping(false);
        queryClient.invalidateQueries({ queryKey: ["chat-threads"] });
      }
    },
    onError: () => {
      setIsTyping(false);
      setMessages((m) => [
        ...m,
        { role: "ai", text: "Sorry, something went wrong. Please try again." },
      ]);
    },
  });

  const send = () => {
    if (!input.trim() || isTyping) return;
    const msg = input.trim();
    setMessages((m) => [...m, { role: "user", text: msg }]);
    setInput("");
    setIsTyping(true);

    // Auto-generate thread title from first message
    const threadTitle =
      messages.length === 0
        ? msg.length > 40
          ? msg.slice(0, 40) + "…"
          : msg
        : undefined;

    sendMut.mutate({
      threadId: currentThreadId,
      message: msg,
      threadTitle,
    });
  };

  const startNewThread = () => {
    const newId = "thread-" + Date.now().toString(36);
    setCurrentThreadId(newId);
    setMessages([]);
  };

  return (
    <div className="flex h-[calc(100vh-0px)] flex-col">
      <PageHeader title="AI Coach" subtitle="Your senior analyst, available 24/7" />
      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-64 shrink-0 border-r border-border p-4 md:block">
          <button
            onClick={startNewThread}
            className="flex w-full items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> New conversation
          </button>
          <div className="mt-4 text-[10px] uppercase tracking-wider text-muted-foreground">Recent</div>
          <ul className="mt-2 space-y-1">
            {threads.length === 0 ? (
              <li className="px-2.5 py-2 text-xs text-muted-foreground">No conversations yet</li>
            ) : (
              threads.map((t) => (
                <li key={t.threadId}>
                  <button
                    onClick={() => loadThread(t.threadId)}
                    className={`w-full rounded-lg px-2.5 py-2 text-left text-sm ${
                      currentThreadId === t.threadId ? "bg-secondary" : "hover:bg-secondary/60"
                    }`}
                  >
                    <div className="truncate text-xs font-medium">
                      {t.threadTitle ?? "Conversation"}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : ""}
                    </div>
                  </button>
                </li>
              ))
            )}
          </ul>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
            {messages.length === 0 && (
              <div className="flex h-full items-center justify-center">
                <div className="max-w-md text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="mt-4 text-lg font-medium">How can I help you today?</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Ask about stocks, setups, risk management, or anything trading-related.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {[
                      "What setups look strongest?",
                      "Analyze my portfolio risk",
                      "Explain RSI divergence",
                    ].map((q) => (
                      <button
                        key={q}
                        onClick={() => {
                          setInput(q);
                        }}
                        className="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs hover:bg-card"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={m.role === "user" ? "flex justify-end" : "flex items-start gap-3"}
              >
                {m.role === "ai" && (
                  <div className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
                    <Sparkles className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[70%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground"
                      : "max-w-[75%] rounded-2xl rounded-bl-md border border-border bg-card px-4 py-2.5 text-sm leading-relaxed"
                  }
                >
                  {m.text}
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-border bg-card px-4 py-3">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" style={{ animationDelay: "0.2s" }} />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>
            )}
          </div>
          <div className="border-t border-border p-4">
            <div className="mx-auto max-w-3xl">
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Ask anything about markets, stocks, or your portfolio…"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  disabled={isTyping}
                />
                <button
                  onClick={send}
                  disabled={isTyping || !input.trim()}
                  className="rounded-lg bg-primary p-1.5 text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2 text-center text-[10px] text-muted-foreground">
                TradeOS AI may produce inaccurate information. Not investment advice.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getApiBaseUrl } from "@/lib/api-url";
import { toast } from "sonner";

type ChatMessage = {
    role: "user" | "assistant";
    content: string;
};

export default function ChatbotPage() {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: "assistant",
            content: "Hi! I am your SkillBridge AI assistant. Ask me about tutors, bookings, profiles, or dashboard workflows.",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [providerWarning, setProviderWarning] = useState("");

    const handleSend = async () => {
        const prompt = input.trim();
        if (!prompt || loading) return;

        const nextMessages: ChatMessage[] = [...messages, { role: "user", content: prompt }];
        setMessages(nextMessages);
        setInput("");
        setLoading(true);

        try {
            const base = getApiBaseUrl();
            const url = base.endsWith("/api") ? `${base}/ai/chat` : `${base}/api/ai/chat`;

            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ messages: nextMessages }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data?.success) {
                throw new Error(data?.message || "Failed to get response from AI assistant.");
            }

            if (data?.warning) {
                setProviderWarning(String(data.warning));
                toast.warning("AI provider issue detected. Showing fallback response.");
            } else {
                setProviderWarning("");
            }

            setMessages((prev) => [...prev, { role: "assistant", content: data.data.reply }]);
        } catch (error: any) {
            toast.error(error.message || "Failed to contact AI assistant.");
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "I could not complete that request right now. Please try again.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="sb-page">
            <div className="sb-container max-w-4xl space-y-6">
                <section className="rounded-2xl border bg-linear-to-r from-primary/15 via-secondary/15 to-accent/15 p-6">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">AI Workspace</p>
                    <h1 className="text-3xl font-bold">SkillBridge AI Chatbot</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Ask platform questions, get booking guidance, and receive quick tutor workflow support.
                    </p>
                </section>

                <Card className="border-border/80 bg-card/95">
                    <CardHeader>
                        <CardTitle>Conversation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {providerWarning && (
                            <div className="mb-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                                {providerWarning}
                            </div>
                        )}
                        <div className="h-[420px] space-y-3 overflow-y-auto rounded-lg border bg-muted/20 p-4">
                            {messages.map((message, index) => (
                                <div
                                    key={`${message.role}-${index}`}
                                    className={`max-w-[88%] rounded-lg px-3 py-2 text-sm ${message.role === "user"
                                            ? "ml-auto bg-primary text-primary-foreground"
                                            : "bg-card border"
                                        }`}
                                >
                                    {message.content}
                                </div>
                            ))}
                            {loading && (
                                <div className="max-w-[88%] rounded-lg border bg-card px-3 py-2 text-sm text-muted-foreground">
                                    Thinking...
                                </div>
                            )}
                        </div>

                        <div className="mt-4 flex gap-2">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask anything about SkillBridge..."
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                            />
                            <Button type="button" onClick={handleSend} disabled={loading || !input.trim()}>
                                Send
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

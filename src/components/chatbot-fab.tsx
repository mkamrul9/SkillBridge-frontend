"use client";

import Link from "next/link";
import { MessageCircleMore } from "lucide-react";
import { useUser } from "@/lib/user-context";
import { usePathname } from "next/navigation";

export default function ChatbotFab() {
  const { user } = useUser();
  const pathname = usePathname();

  if (pathname === "/dashboard/chatbot") {
    return null;
  }

  const href = user ? "/dashboard/chatbot" : "/login?next=%2Fdashboard%2Fchatbot";

  return (
    <div className="pointer-events-none fixed bottom-5 right-4 z-50 sm:bottom-6 sm:right-6">
      <Link
        href={href}
        className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-primary/30 bg-card px-4 py-2 text-sm font-medium text-foreground shadow-lg backdrop-blur transition hover:-translate-y-0.5 hover:bg-primary hover:text-primary-foreground"
        aria-label="Open AI chatbot"
      >
        <MessageCircleMore className="h-4 w-4" />
        I am here to help you
      </Link>
    </div>
  );
}

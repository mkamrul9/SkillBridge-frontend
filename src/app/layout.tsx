import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import { UserProvider } from "@/lib/user-context";
import ResponsiveContainer from "@/components/ResponsiveContainer";
import { ThemeProvider } from "@/components/theme-provider";
import { ConfirmProvider } from "@/components/confirm-provider";
import ChatbotFab from "@/components/chatbot-fab";

export const metadata: Metadata = {
  title: "SkillBridge",
  description: "Connect tutors with students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <ThemeProvider>
          <ConfirmProvider>
            <UserProvider>
              <Navbar />
              <ResponsiveContainer className="sb-shell">
                {children}
              </ResponsiveContainer>
              <ChatbotFab />
              <Footer />
            </UserProvider>
          </ConfirmProvider>
        </ThemeProvider>
        <Toaster
          richColors
          closeButton
          position="top-right"
          toastOptions={{
            duration: 3200,
            className: "rounded-xl border border-border/70 bg-card text-card-foreground shadow-[0_14px_32px_-18px_rgba(15,23,42,0.55)]",
            descriptionClassName: "text-muted-foreground",
          }}
        />
      </body>
    </html>
  );
}

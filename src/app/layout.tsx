import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import { UserProvider } from "@/lib/user-context";
import ResponsiveContainer from "@/components/ResponsiveContainer";
import { ThemeProvider } from "@/components/theme-provider";

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
      <body>
        <ThemeProvider>
          <UserProvider>
            <Navbar />
            <ResponsiveContainer>
              {children}
            </ResponsiveContainer>
            <Footer />
          </UserProvider>
        </ThemeProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}

import { Sidebar } from "@/components/sidebar";

export default function ReviewsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background md:flex">
      <Sidebar />
      <main className="flex-1 flex justify-center">
        <div className="w-full max-w-4xl px-4 py-8">{children}</div>
      </main>
    </div>
  );
}

import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background md:flex">
      <Sidebar />
      <main className="flex-1">
        <div className="w-full px-4 py-8 md:px-6">{children}</div>
      </main>
    </div>
  );
}

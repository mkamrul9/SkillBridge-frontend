import { Sidebar } from "@/components/sidebar";

export default function BookingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background md:flex">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}

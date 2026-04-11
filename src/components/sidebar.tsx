"use client";
import Link from "next/link";
import { useUser } from "@/lib/user-context";
import { useState, type ComponentType } from "react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import {
  BookOpenCheck,
  Briefcase,
  Grid3X3,
  LayoutDashboard,
  Menu,
  Shield,
  User,
  Users,
} from "lucide-react";

type NavItem = { href: string; label: string; icon: ComponentType<{ className?: string }> };
type NavSection = { title: string; items: NavItem[] };

const getSectionsByRole = (role?: string): NavSection[] => {
  if (role === "ADMIN") {
    return [
      {
        title: "Admin",
        items: [
          { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
          { href: "/admin/users", label: "Manage Users", icon: Users },
          { href: "/categories", label: "Categories", icon: Grid3X3 },
          { href: "/reviews/all", label: "All Reviews", icon: BookOpenCheck },
          { href: "/bookings/all", label: "All Bookings", icon: Briefcase },
        ],
      },
      {
        title: "Account",
        items: [{ href: "/profile", label: "Profile", icon: User }],
      },
    ];
  }

  if (role === "TUTOR") {
    return [
      {
        title: "Tutor",
        items: [
          { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { href: "/bookings", label: "My Bookings", icon: Briefcase },
          { href: "/reviews", label: "My Reviews", icon: BookOpenCheck },
        ],
      },
      {
        title: "Account",
        items: [{ href: "/profile", label: "Profile", icon: User }],
      },
    ];
  }

  return [
    {
      title: "Student",
      items: [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/bookings", label: "My Bookings", icon: Briefcase },
        { href: "/reviews", label: "My Reviews", icon: BookOpenCheck },
        { href: "/tutors/become-tutor", label: "Become a Tutor", icon: Shield },
      ],
    },
    {
      title: "Account",
      items: [{ href: "/profile", label: "Profile", icon: User }],
    },
  ];
};

export function Sidebar() {
  const { user } = useUser();
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const sections = getSectionsByRole(user?.role);
  const seenHrefs = new Set<string>();
  const normalizedSections = sections.map((section) => ({
    ...section,
    items: section.items.filter((item) => {
      if (seenHrefs.has(item.href)) return false;
      seenHrefs.add(item.href);
      return true;
    }),
  }));

  if (!visible) {
    return (
      <button
        className="fixed left-4 top-4 z-50 rounded-md border bg-card p-2 shadow"
        onClick={() => setVisible(true)}
        aria-label="Show sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>
    );
  }
  return (
    <>
      <div className="sticky top-0 z-30 border-b bg-card/90 px-3 py-3 backdrop-blur md:hidden">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-bold">{user?.role || "Student"} Tabs</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {normalizedSections.flatMap((section) => section.items).map((link) => {
            const active = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={`mobile-${link.href}`}
                href={link.href}
                className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${active
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-background text-muted-foreground"
                  }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>

      <aside className="sticky top-0 hidden min-h-screen w-64 flex-col gap-4 border-r bg-card/80 px-3 py-5 backdrop-blur md:flex">
        <div className="mb-6 flex items-center justify-between">
          <span className="font-bold text-sm sm:text-lg">SkillBridge</span>
          <Button size="sm" variant="ghost" onClick={() => setVisible(false)} title="Hide Sidebar" aria-label="Hide sidebar">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
        <nav className="flex flex-col gap-4">
          {normalizedSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <p className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {section.title}
              </p>
              {section.items.map((link) => {
                const active = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors ${active
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}

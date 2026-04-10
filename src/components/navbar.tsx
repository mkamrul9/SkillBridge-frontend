"use client";
import Link from "next/link";
import { useUser } from "@/lib/user-context";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

const navConfig = {
  common: [
    { href: "/", label: "Home" },
    { href: "/tutors", label: "Tutors" },
  ],
  student: [
    { href: "/bookings", label: "My Bookings" },
    { href: "/reviews", label: "My Reviews" },
    { href: "/profile", label: "Profile" },
    { href: "/tutors/become-tutor", label: "Become a Tutor" },
  ],
  tutor: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/profile", label: "Profile" },
    { href: "/reviews", label: "My Reviews" },
    { href: "/tutors", label: "All Tutors" },
    { href: "/bookings", label: "My Bookings" },
  ],
  admin: [
    { href: "/admin/dashboard", label: "Admin Dashboard" },
    { href: "/admin/users", label: "Manage Users" },
    { href: "/categories", label: "Categories" },
    { href: "/reviews", label: "All Reviews" },
    { href: "/bookings/all", label: "All Bookings" },
    { href: "/profile", label: "Profile" },
  ],
};

export function Navbar() {
  const { user, setUser } = useUser();
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = (theme || resolvedTheme) === "dark";

  const handleSignOut = async () => {
    try {
      await authClient.signOut({ fetchOptions: { credentials: "include" } });
    } catch (e: any) {
      console.error("Sign out error:", e);
    }
    setUser(null);
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  let links = [...navConfig.common];
  if (user) {
    if (user.role === "ADMIN") links = [...links, ...navConfig.admin];
    else if (user.role === "TUTOR") links = [...links, ...navConfig.tutor];
    else if (user.role === "STUDENT") links = [...links, ...navConfig.student];
  }

  // Remove duplicates by href
  const uniqueLinks = Array.from(new Map(links.map(l => [l.href, l])).values());

  return (
    <nav className="w-full bg-background border-b sticky top-0 z-40">
      <div className="max-w-5xl mx-auto flex items-center gap-4 px-4 py-2">
        <span className="font-bold text-lg tracking-tight flex-1">SkillBridge</span>
        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-3">
          {uniqueLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button variant={pathname === link.href ? "secondary" : "ghost"} size="sm">
                {link.label}
              </Button>
            </Link>
          ))}
        </div>

        {/* User info / avatar for desktop */}
        <div className="hidden sm:flex items-center gap-2 ml-4">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            aria-label="Toggle theme"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            disabled={!mounted}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          {user ? (
            <DesktopUserMenu user={user} onSignOut={handleSignOut} />
          ) : null}
        </div>

        {/* Mobile menu button */}
        <div className="sm:hidden ml-auto flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            aria-label="Toggle theme"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            disabled={!mounted}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <MobileMenu
            uniqueLinks={uniqueLinks}
            pathname={pathname}
            user={user}
            onSignOut={handleSignOut}
          />
        </div>
      </div>
    </nav>
  );
}

function DesktopUserMenu({ user, onSignOut }: any) {
  const [open, setOpen] = useState(false);

  const quickLinks =
    user.role === "ADMIN"
      ? [
          { href: "/admin/dashboard", label: "Admin Dashboard" },
          { href: "/profile", label: "My Profile" },
        ]
      : user.role === "TUTOR"
        ? [
            { href: "/dashboard", label: "Dashboard" },
            { href: "/profile", label: "My Profile" },
          ]
        : [
            { href: "/bookings", label: "My Bookings" },
            { href: "/profile", label: "My Profile" },
          ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-md border bg-card px-3 py-1.5 text-sm hover:bg-muted"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          {user.name?.[0]?.toUpperCase() || "U"}
        </span>
        <span className="max-w-35 truncate text-left">
          <span className="block text-xs text-muted-foreground">{user.role}</span>
          <span className="block font-medium text-foreground">{user.name}</span>
        </span>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-52 rounded-md border bg-card p-2 shadow-xl">
          <div className="border-b px-2 py-2 text-xs text-muted-foreground">
            Signed in as {user.email}
          </div>
          <div className="py-1">
            {quickLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded px-2 py-2 text-sm hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <button
            type="button"
            onClick={async () => {
              setOpen(false);
              await onSignOut();
            }}
            className="mt-1 w-full rounded px-2 py-2 text-left text-sm text-destructive hover:bg-muted"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

function MobileMenu({ uniqueLinks, pathname, user, onSignOut }: any) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        aria-label="Toggle menu"
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-md border border-border bg-card"
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 5h14a1 1 0 010 2H3a1 1 0 110-2zm0 4h14a1 1 0 010 2H3a1 1 0 110-2zm0 4h14a1 1 0 010 2H3a1 1 0 110-2z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-card rounded-md shadow-lg z-50">
          <div className="flex flex-col p-2">
            {uniqueLinks.map((link: any) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`block px-3 py-2 rounded text-left ${pathname === link.href ? 'font-semibold' : ''}`}
              >
                {link.label}
              </Link>
            ))}
              {user ? (
                <>
                  <div className="mt-2 px-3 py-2 border-t text-sm">
                    <div className="font-semibold">{user.name}</div>
                    <div className="text-muted-foreground">{user.role}</div>
                  </div>
                  <button
                    className="w-full text-left px-3 py-2 text-sm text-destructive"
                    onClick={async () => {
                      setOpen(false);
                      await onSignOut();
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

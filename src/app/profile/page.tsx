"use client";

import { useUser } from "@/lib/user-context";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getApiBaseUrl } from "@/lib/api-url";

export default function ProfilePage() {
  const { user, setUser } = useUser();
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center">Not logged in</div>;
  }

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        credentials: "include",
      },
    });
    setUser(null);
    window.location.href = "/";
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("Current and new password are required.");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }

    setChangingPassword(true);
    try {
      const client = authClient as any;
      if (typeof client.changePassword === "function") {
        const result = await client.changePassword({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          revokeOtherSessions: true,
          fetchOptions: { credentials: "include" },
        });
        if (result?.error) throw new Error(result.error.message || "Unable to change password");
      } else {
        const base = getApiBaseUrl();
        const authBase = base.endsWith("/api") ? base : `${base}/api`;
        const res = await fetch(`${authBase}/auth/change-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword,
            revokeOtherSessions: true,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data?.error) {
          throw new Error(data?.message || data?.error || "Unable to change password");
        }
      }

      toast.success("Password changed successfully.");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e: any) {
      toast.error(e.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="sb-page">
      <div className="sb-container max-w-5xl space-y-6">
        <div className="sb-header">
          <h1 className="sb-title">My Profile</h1>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Link href="/profile/edit" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">Edit Name and Basic Info</Button>
            </Link>
            {user.role === "TUTOR" && (
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto">Edit Tutor Bio</Button>
              </Link>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="shrink-0">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="h-24 w-24 sm:h-32 sm:w-32 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-muted" />
                )}
              </div>
              <div className="w-full">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p>{user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p>{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p>{user.phone || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Role</p>
                    <p className="capitalize">{user.role?.toLowerCase()}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <Input
                type="password"
                placeholder="Current password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
              />
              <Input
                type="password"
                placeholder="New password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
              />
              <Input
                type="password"
                placeholder="Confirm new password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">Use at least 8 characters with a strong combination.</p>
              <Button onClick={handleChangePassword} disabled={changingPassword} className="w-full sm:w-auto">
                {changingPassword ? "Updating..." : "Change Password"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center sm:justify-end">
          <Button variant="outline" className="w-full sm:w-auto" onClick={handleLogout}>Logout</Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useUser } from "@/lib/user-context";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useEffect, useState } from "react";
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
  const [profileForm, setProfileForm] = useState({ name: "", phone: "" });
  const [tutorBio, setTutorBio] = useState("");
  const [preferences, setPreferences] = useState({
    bookingReminders: true,
    productUpdates: true,
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingBio, setSavingBio] = useState(false);
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

  useEffect(() => {
    if (!user) return;
    setProfileForm({ name: user.name || "", phone: user.phone || "" });
    if (user.role === "TUTOR") {
      const base = getApiBaseUrl();
      const url = base.endsWith("/api") ? `${base}/user/me` : `${base}/api/user/me`;
      fetch(url, { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          if (data?.success) {
            setTutorBio(data.data?.tutorProfile?.bio || "");
          }
        })
        .catch(() => {
          setTutorBio("");
        });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!profileForm.name.trim()) {
      toast.error("Name is required.");
      return;
    }
    setSavingProfile(true);
    try {
      const base = getApiBaseUrl();
      const url = base.endsWith("/api") ? `${base}/students/profile` : `${base}/api/students/profile`;
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: profileForm.name.trim(),
          phone: profileForm.phone.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to update profile");
      }
      setUser({
        ...user,
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim(),
      });
      toast.success("Profile updated successfully.");
    } catch (e: any) {
      toast.error(e.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveBio = async () => {
    if (user.role !== "TUTOR") return;
    setSavingBio(true);
    try {
      const base = getApiBaseUrl();
      const url = base.endsWith("/api") ? `${base}/tutors/profile` : `${base}/api/tutors/profile`;
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ bio: tutorBio.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to update bio");
      }
      toast.success("Tutor bio updated.");
    } catch (e: any) {
      toast.error(e.message || "Failed to update bio");
    } finally {
      setSavingBio(false);
    }
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

        <Card className="border-border/80 bg-card/95 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Profile Information</span>
              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">Editable</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-xl border bg-muted/30 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="shrink-0">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      className="h-24 w-24 rounded-full border-2 border-primary/20 object-cover sm:h-28 sm:w-28"
                    />
                  ) : (
                    <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-muted" />
                  )}
                </div>
                <div className="w-full">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <Input
                        value={profileForm.name}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="rounded-md bg-background px-3 py-2 text-sm">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <Input
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Role</p>
                      <p className="rounded-md bg-background px-3 py-2 text-sm capitalize">{user.role?.toLowerCase()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSaveProfile} disabled={savingProfile} className="w-full sm:w-auto">
                {savingProfile ? "Saving..." : "Save Name and Phone"}
              </Button>
            </div>

            {user.role === "TUTOR" && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Tutor Bio</p>
                <textarea
                  value={tutorBio}
                  onChange={(e) => setTutorBio(e.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Tell students about your teaching style and experience"
                />
                <div className="flex justify-end">
                  <Button variant="outline" onClick={handleSaveBio} disabled={savingBio} className="w-full sm:w-auto">
                    {savingBio ? "Updating..." : "Save Bio"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/95 shadow-sm">
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

        <Card className="border-border/80 bg-card/95 shadow-sm">
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-sm">
              <span>Booking reminders</span>
              <input
                type="checkbox"
                checked={preferences.bookingReminders}
                onChange={(e) => setPreferences((prev) => ({ ...prev, bookingReminders: e.target.checked }))}
              />
            </label>
            <label className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-sm">
              <span>Product updates</span>
              <input
                type="checkbox"
                checked={preferences.productUpdates}
                onChange={(e) => setPreferences((prev) => ({ ...prev, productUpdates: e.target.checked }))}
              />
            </label>
            <p className="text-xs text-muted-foreground">These preferences are stored on this device for now.</p>
          </CardContent>
        </Card>

        <div className="flex justify-center sm:justify-end">
          <Button variant="outline" className="w-full sm:w-auto" onClick={handleLogout}>Logout</Button>
        </div>
      </div>
    </div>
  );
}

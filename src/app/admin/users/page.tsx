"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LoadingButton from "@/components/LoadingButton";
import { toast } from "sonner";
import Link from "next/link";
import { getApiBaseUrl } from "@/lib/api-url";
import { useConfirm } from "@/components/confirm-provider";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const { confirm } = useConfirm();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const base = getApiBaseUrl();
    const url = base.endsWith("/api") ? `${base}/admin/users` : `${base}/api/admin/users`;
    fetch(url, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setUsers(data.data);
        else toast.error("Failed to load users");
      })
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false));
  };

  const updateStatus = async (userId: string, status: string) => {
    const base = getApiBaseUrl();
    const url = base.endsWith("/api") ? `${base}/admin/users/${userId}/ban-status` : `${base}/api/admin/users/${userId}/ban-status`;
    const response = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    const data = await response.json();

    if (data.success) {
      toast.success(`User ${status === "BANNED" ? "banned" : "activated"}`);
      loadUsers();
    } else {
      toast.error(data.message || "Failed to update status");
    }
  };

  const updateRole = async (userId: string, role: string) => {
    const base = getApiBaseUrl();
    const url = base.endsWith("/api") ? `${base}/admin/users/${userId}` : `${base}/api/admin/users/${userId}`;
    const response = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ role }),
    });
    const data = await response.json();

    if (data.success) {
      toast.success("Role updated");
      loadUsers();
    } else {
      toast.error("Failed to update role");
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;

  const filteredUsers = users.filter((entry) => {
    const searchValue = search.trim().toLowerCase();
    const bySearch =
      !searchValue ||
      String(entry.name || "").toLowerCase().includes(searchValue) ||
      String(entry.email || "").toLowerCase().includes(searchValue);
    const byRole = roleFilter === "all" || String(entry.role || "").toUpperCase() === roleFilter;
    const normalizedStatus = String(entry.status || "ACTIVE").toUpperCase();
    const byStatus = statusFilter === "all" || normalizedStatus === statusFilter;
    return bySearch && byRole && byStatus;
  });

  const totalUsers = users.length;
  const totalAdmins = users.filter((u) => u.role === "ADMIN").length;
  const totalTutors = users.filter((u) => u.role === "TUTOR").length;
  const totalBanned = users.filter((u) => String(u.status || "ACTIVE") === "BANNED").length;

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedUsers = filteredUsers.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="sb-page">
      <div className="sb-container">
        <div className="sb-header">
          <h1 className="sb-title">Manage Users</h1>
          <Link href="/admin/dashboard">
            <Button variant="outline" className="w-full sm:w-auto">Back to Dashboard</Button>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card/95">
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold text-primary">{totalUsers}</p>
            </CardContent>
          </Card>
          <Card className="bg-card/95">
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Admins</p>
              <p className="text-2xl font-bold">{totalAdmins}</p>
            </CardContent>
          </Card>
          <Card className="bg-card/95">
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Tutors</p>
              <p className="text-2xl font-bold text-emerald-600">{totalTutors}</p>
            </CardContent>
          </Card>
          <Card className="bg-card/95">
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Banned</p>
              <p className="text-2xl font-bold text-rose-600">{totalBanned}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/80 bg-card/95">
          <CardContent className="grid gap-3 pt-6 md:grid-cols-4">
            <input
              type="text"
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              className="h-10 rounded-md border bg-background px-3 text-sm"
            />
            <select
              value={roleFilter}
              onChange={(e) => {
                setPage(1);
                setRoleFilter(e.target.value);
              }}
              className="h-10 rounded-md border bg-background px-3 text-sm"
            >
              <option value="all">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="TUTOR">Tutor</option>
              <option value="STUDENT">Student</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => {
                setPage(1);
                setStatusFilter(e.target.value);
              }}
              className="h-10 rounded-md border bg-background px-3 text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="BANNED">Banned</option>
            </select>
            <Button
              variant="outline"
              onClick={() => {
                setPage(1);
                setSearch("");
                setRoleFilter("all");
                setStatusFilter("all");
              }}
            >
              Reset Filters
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {pagedUsers.map((user) => (
            <Card key={user.id} className="border-border/80 bg-card/95">
              <CardHeader>
                <CardTitle className="text-lg">{user.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">ID {String(user.id).slice(0, 8)}</span>
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">{user.role}</span>
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${String(user.status || "ACTIVE") === "BANNED" ? "bg-rose-500/15 text-rose-700" : "bg-emerald-500/15 text-emerald-700"}`}>
                      {String(user.status || "ACTIVE")}
                    </span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p>{user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Role</p>
                      <p className="capitalize">{user.role.toLowerCase()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="capitalize">{user.status?.toLowerCase() || "Active"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Verified</p>
                      <p>{user.emailVerified ? "Yes" : "No"}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    {user.status !== "BANNED" ? (
                      <LoadingButton
                        size="sm"
                        variant="destructive"
                        className="w-full sm:w-auto"
                        onClick={async () => {
                          const approved = await confirm({
                            title: "Ban user",
                            message: "Are you sure you want to ban this user?",
                            confirmText: "Ban user",
                            variant: "destructive",
                          });
                          if (!approved) return;
                          await updateStatus(user.id, "BANNED");
                        }}
                      >
                        Ban User
                      </LoadingButton>
                    ) : (
                      <LoadingButton
                        size="sm"
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={async () => {
                          const approved = await confirm({
                            title: "Unban user",
                            message: "Are you sure you want to reactivate this user account?",
                            confirmText: "Unban user",
                          });
                          if (!approved) return;
                          await updateStatus(user.id, "ACTIVE");
                        }}
                      >
                        Unban User
                      </LoadingButton>
                    )}

                    {user.role !== "TUTOR" && (
                      <LoadingButton
                        size="sm"
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={async () => {
                          const approved = await confirm({
                            title: "Promote user",
                            message: "Promote this user to Tutor role?",
                            confirmText: "Promote",
                          });
                          if (!approved) return;
                          await updateRole(user.id, "TUTOR");
                        }}
                      >
                        Make Tutor
                      </LoadingButton>
                    )}

                    {user.role !== "STUDENT" && (
                      <LoadingButton
                        size="sm"
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={async () => {
                          const approved = await confirm({
                            title: "Demote user",
                            message: "Change this user role to Student?",
                            confirmText: "Change role",
                          });
                          if (!approved) return;
                          await updateRole(user.id, "STUDENT");
                        }}
                      >
                        Make Student
                      </LoadingButton>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex flex-col items-center justify-between gap-3 rounded-xl border bg-card/80 px-4 py-3 sm:flex-row">
          <p className="text-sm text-muted-foreground">Showing {pagedUsers.length} of {filteredUsers.length} users • Page {safePage} of {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
            <Button variant="outline" size="sm" disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

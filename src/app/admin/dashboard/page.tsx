"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { getApiBaseUrl } from "@/lib/api-url";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CHART_COLORS = ["#0ea5e9", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"];

function AdminDashboardSkeleton() {
  return (
    <div className="sb-page">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Card key={`stat-skeleton-${idx}`}>
              <CardHeader>
                <Skeleton className="h-5 w-28" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-9 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");
  const [recentUsersPage, setRecentUsersPage] = useState(1);
  const [recentBookingsPage, setRecentBookingsPage] = useState(1);
  const pageSize = 5;

  const exportRecentBookingsCsv = (rows: any[]) => {
    const header = ["student", "tutor", "status", "createdAt"];
    const dataRows = rows.map((booking) => [
      booking.student?.name || "N/A",
      booking.tutor?.user?.name || "N/A",
      booking.status || "unknown",
      booking.createdAt ? new Date(booking.createdAt).toISOString() : "N/A",
    ]);

    const csv = [header, ...dataRows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "recent-bookings.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const apiUrl = getApiBaseUrl();
    fetch(`${apiUrl}/api/admin/dashboard`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStats(data.data);
        else toast.error("Failed to load dashboard");
      })
      .catch(() => toast.error("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminDashboardSkeleton />;
  if (!stats) return <div className="flex min-h-screen items-center justify-center">No data</div>;

  const usersByRoleChartData = (stats.usersByRole || []).map((item: any) => ({
    role: item.role,
    count: item._count.role,
  }));

  const bookingsByStatusChartData = (stats.bookingsByStatus || []).map((item: any) => ({
    status: item.status,
    count: item._count.status,
  }));

  const trendData = bookingsByStatusChartData.map((item: any, index: number) => ({
    label: `${index + 1}. ${item.status}`,
    value: item.count,
  }));

  const filteredRecentBookings = (stats.recentBookings || []).filter((booking: any) => {
    const studentName = booking.student?.name?.toLowerCase() || "";
    const tutorName = booking.tutor?.user?.name?.toLowerCase() || "";
    const status = booking.status?.toLowerCase() || "";
    const search = bookingSearch.trim().toLowerCase();

    const matchesSearch = !search || studentName.includes(search) || tutorName.includes(search);
    const matchesStatus = bookingStatusFilter === "all" || status === bookingStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const bookingStatusOptions: string[] = Array.from(
    new Set<string>((stats.recentBookings || []).map((b: any) => String(b.status || "unknown").toLowerCase())),
  );

  const totalRecentUsersPages = Math.max(1, Math.ceil((stats.recentUsers || []).length / pageSize));
  const safeRecentUsersPage = Math.min(recentUsersPage, totalRecentUsersPages);
  const pagedRecentUsers = (stats.recentUsers || []).slice((safeRecentUsersPage - 1) * pageSize, safeRecentUsersPage * pageSize);

  const totalRecentBookingsPages = Math.max(1, Math.ceil(filteredRecentBookings.length / pageSize));
  const safeRecentBookingsPage = Math.min(recentBookingsPage, totalRecentBookingsPages);
  const pagedRecentBookings = filteredRecentBookings.slice((safeRecentBookingsPage - 1) * pageSize, safeRecentBookingsPage * pageSize);

  return (
    <div className="sb-page">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-2xl border bg-linear-to-r from-primary/15 via-secondary/15 to-accent/15 p-6 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Command Center</p>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-muted-foreground">Monitor users, bookings, categories, and quality metrics in one place.</p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => exportRecentBookingsCsv(filteredRecentBookings)}>
                Export CSV
              </Button>
              <Link href="/admin/users">
                <Button className="w-full sm:w-auto">Manage Users</Button>
              </Link>
            </div>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-border/80 bg-card/95 shadow-sm"><CardHeader><CardTitle>Total Users</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-primary">{stats.totals.users}</p></CardContent></Card>
          <Card className="border-border/80 bg-card/95 shadow-sm"><CardHeader><CardTitle>Total Tutors</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-emerald-600">{stats.totals.tutors}</p></CardContent></Card>
          <Card className="border-border/80 bg-card/95 shadow-sm"><CardHeader><CardTitle>Total Bookings</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-cyan-700">{stats.totals.bookings}</p></CardContent></Card>
          <Card className="border-border/80 bg-card/95 shadow-sm"><CardHeader><CardTitle>Categories</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stats.totals.categories}</p></CardContent></Card>
          <Card className="border-border/80 bg-card/95 shadow-sm"><CardHeader><CardTitle>Reviews</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-amber-600">{stats.totals.reviews}</p></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Users by Role (Bar)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usersByRoleChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="role" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Users" radius={[6, 6, 0, 0]}>
                    {usersByRoleChartData.map((_: any, index: number) => (
                      <Cell key={`users-bar-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Users</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left"><th className="py-2 pr-3 font-medium">Name</th><th className="py-2 pr-3 font-medium">Email</th><th className="py-2 pr-3 font-medium">Role</th><th className="py-2 pr-3 font-medium">Joined</th></tr></thead>
                <tbody>
                  {pagedRecentUsers.map((user: any) => (
                    <tr key={user.id} className="border-b last:border-0">
                      <td className="py-2 pr-3">{user.name || "N/A"}</td>
                      <td className="py-2 pr-3">{user.email || "N/A"}</td>
                      <td className="py-2 pr-3"><span className="rounded-full bg-primary/10 px-2 py-1 text-xs">{user.role || "unknown"}</span></td>
                      <td className="py-2 pr-3">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!stats.recentUsers || stats.recentUsers.length === 0) && <p className="py-4 text-center text-muted-foreground">No recent users found.</p>}
            </div>
            <div className="mt-4 flex flex-col items-center justify-between gap-3 rounded-xl border bg-card/80 px-4 py-3 sm:flex-row">
              <p className="text-sm text-muted-foreground">Recent users page {safeRecentUsersPage} of {totalRecentUsersPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={safeRecentUsersPage <= 1} onClick={() => setRecentUsersPage((p) => Math.max(1, p - 1))}>Previous</Button>
                <Button variant="outline" size="sm" disabled={safeRecentUsersPage >= totalRecentUsersPages} onClick={() => setRecentUsersPage((p) => Math.min(totalRecentUsersPages, p + 1))}>Next</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Bookings by Status (Pie)</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={bookingsByStatusChartData} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={100} label>
                      {bookingsByStatusChartData.map((_: any, index: number) => (
                        <Cell key={`booking-pie-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Booking Status Trend (Line)</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" name="Bookings" stroke="#0ea5e9" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Recent Bookings (Dynamic Table)</CardTitle></CardHeader>
          <CardContent>
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                value={bookingSearch}
                onChange={(e) => {
                  setRecentBookingsPage(1);
                  setBookingSearch(e.target.value);
                }}
                placeholder="Search by student or tutor"
                className="h-10 rounded-md border bg-background px-3 text-sm"
                aria-label="Search recent bookings"
              />
              <select
                value={bookingStatusFilter}
                onChange={(e) => {
                  setRecentBookingsPage(1);
                  setBookingStatusFilter(e.target.value);
                }}
                className="h-10 rounded-md border bg-background px-3 text-sm"
                aria-label="Filter recent bookings by status"
              >
                <option value="all">All statuses</option>
                {bookingStatusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left"><th className="py-2 pr-3 font-medium">Student</th><th className="py-2 pr-3 font-medium">Tutor</th><th className="py-2 pr-3 font-medium">Status</th><th className="py-2 pr-3 font-medium">Created</th></tr></thead>
                <tbody>
                  {pagedRecentBookings.map((booking: any) => (
                    <tr key={booking.id} className="border-b last:border-0">
                      <td className="py-2 pr-3">{booking.student?.name || "N/A"}</td>
                      <td className="py-2 pr-3">{booking.tutor?.user?.name || "N/A"}</td>
                      <td className="py-2 pr-3"><span className="rounded-full bg-primary/10 px-2 py-1 text-xs capitalize">{booking.status || "unknown"}</span></td>
                      <td className="py-2 pr-3">{booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredRecentBookings.length === 0 && <p className="py-4 text-center text-muted-foreground">No recent bookings match the selected filters.</p>}
            </div>
            <div className="mt-4 flex flex-col items-center justify-between gap-3 rounded-xl border bg-card/80 px-4 py-3 sm:flex-row">
              <p className="text-sm text-muted-foreground">Recent bookings page {safeRecentBookingsPage} of {totalRecentBookingsPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={safeRecentBookingsPage <= 1} onClick={() => setRecentBookingsPage((p) => Math.max(1, p - 1))}>Previous</Button>
                <Button variant="outline" size="sm" disabled={safeRecentBookingsPage >= totalRecentBookingsPages} onClick={() => setRecentBookingsPage((p) => Math.min(totalRecentBookingsPages, p + 1))}>Next</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

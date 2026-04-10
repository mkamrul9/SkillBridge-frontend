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
    <div className="min-h-screen bg-background px-4 sm:px-6 py-16">
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

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-36" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={`role-skeleton-${idx}`} className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-8" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={`booking-skeleton-${idx}`} className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-8" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");

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

  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 py-16">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Link href="/admin/users">
            <Button className="w-full sm:w-auto">Manage Users</Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totals.users}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Tutors</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totals.tutors}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totals.bookings}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totals.categories}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totals.reviews}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Users by Role (Bar)</CardTitle>
          </CardHeader>
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

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Bookings by Status (Pie)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={bookingsByStatusChartData}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
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
            <CardHeader>
              <CardTitle>Booking Status Trend (Line)</CardTitle>
            </CardHeader>
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
          <CardHeader>
            <CardTitle>Recent Bookings (Dynamic Table)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                placeholder="Search by student or tutor"
                className="h-10 rounded-md border bg-background px-3 text-sm"
                aria-label="Search recent bookings"
              />
              <select
                value={bookingStatusFilter}
                onChange={(e) => setBookingStatusFilter(e.target.value)}
                className="h-10 rounded-md border bg-background px-3 text-sm"
                aria-label="Filter recent bookings by status"
              >
                <option value="all">All statuses</option>
                {Array.from(new Set((stats.recentBookings || []).map((b: any) => String(b.status || "unknown").toLowerCase()))).map((status: string) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 pr-3 font-medium">Student</th>
                    <th className="py-2 pr-3 font-medium">Tutor</th>
                    <th className="py-2 pr-3 font-medium">Status</th>
                    <th className="py-2 pr-3 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecentBookings.map((booking: any) => (
                    <tr key={booking.id} className="border-b last:border-0">
                      <td className="py-2 pr-3">{booking.student?.name || "N/A"}</td>
                      <td className="py-2 pr-3">{booking.tutor?.user?.name || "N/A"}</td>
                      <td className="py-2 pr-3">
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs capitalize">
                          {booking.status || "unknown"}
                        </span>
                      </td>
                      <td className="py-2 pr-3">
                        {booking.createdAt
                          ? new Date(booking.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredRecentBookings.length === 0 && (
                <p className="py-4 text-center text-muted-foreground">No recent bookings match the selected filters.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

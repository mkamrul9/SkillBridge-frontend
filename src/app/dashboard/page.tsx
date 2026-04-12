"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CalendarClock, CheckCircle2, Clock3, GraduationCap, Star } from "lucide-react";
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

import { getApiBaseUrl } from "@/lib/api-url";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CHART_COLORS = ["#0ea5e9", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"];

export default function DashboardPage() {
    const [profile, setProfile] = useState<any>(null);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [editingTutor, setEditingTutor] = useState(false);
    const [bio, setBio] = useState("");
    const [availability, setAvailability] = useState("");
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
    const [bookingSearch, setBookingSearch] = useState("");
    const [bookingStatusFilter, setBookingStatusFilter] = useState("all");

    const router = useRouter();

    useEffect(() => {
        let mounted = true;
        const apiUrl = getApiBaseUrl();

        const loadDashboard = async () => {
            try {
                const [profileRes, categoriesRes, bookingsRes] = await Promise.all([
                    fetch(`${apiUrl}/api/user/me`, { credentials: "include" }),
                    fetch(`${apiUrl}/api/categories`, { credentials: "include" }),
                    fetch(`${apiUrl}/api/bookings`, { credentials: "include" }),
                ]);

                if (profileRes.status === 401) {
                    router.push("/login");
                    return;
                }

                const profileData = await profileRes.json();
                const categoryData = await categoriesRes.json().catch(() => ({ success: false }));
                const bookingsData = await bookingsRes.json().catch(() => ({ success: false, data: [] }));

                if (!mounted) return;

                if (!profileData.success) {
                    toast.error("Failed to load dashboard");
                    setLoading(false);
                    return;
                }

                setProfile(profileData.data);

                if (profileData.data?.tutorProfile) {
                    setBio(profileData.data.tutorProfile.bio || "");
                    setAvailability(profileData.data.tutorProfile.availability || "");
                    setSelectedCategoryIds((profileData.data.tutorProfile.categories || []).map((c: any) => c.id));
                }

                if (categoryData.success) {
                    setCategories(categoryData.data || []);
                }

                if (bookingsData.success) {
                    setBookings(bookingsData.data || []);
                }
            } catch {
                if (!mounted) return;
                toast.error("Failed to load dashboard");
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadDashboard();

        return () => {
            mounted = false;
        };
    }, [router]);

    const averageRating = useMemo(() => {
        if (!profile?.tutorProfile?.reviews?.length) return null;
        const total = profile.tutorProfile.reviews.reduce((sum: number, review: any) => sum + review.rating, 0);
        return total / profile.tutorProfile.reviews.length;
    }, [profile]);

    const studentStats = useMemo(() => {
        const now = Date.now();
        const oneWeekLater = now + 1000 * 60 * 60 * 24 * 7;

        const upcoming = bookings.filter((booking) => new Date(booking.startTime).getTime() > now);
        const completed = bookings.filter((booking) => String(booking.status).toLowerCase() === "completed");
        const thisWeek = bookings.filter((booking) => {
            const start = new Date(booking.startTime).getTime();
            return start >= now && start <= oneWeekLater;
        });

        return {
            total: bookings.length,
            upcoming: upcoming.length,
            completed: completed.length,
            thisWeek: thisWeek.length,
            recent: [...bookings]
                .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                .slice(0, 3),
        };
    }, [bookings]);

    const studentBookingsByStatus = useMemo(() => {
        const counter = new Map<string, number>();

        bookings.forEach((booking) => {
            const status = String(booking.status || "unknown").toLowerCase();
            counter.set(status, (counter.get(status) || 0) + 1);
        });

        return Array.from(counter.entries()).map(([status, count]) => ({ status, count }));
    }, [bookings]);

    const studentBookingTrend = useMemo(() => {
        const dayMap: Record<string, number> = {};
        const now = new Date();

        for (let i = 6; i >= 0; i -= 1) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            dayMap[key] = 0;
        }

        bookings.forEach((booking) => {
            const start = new Date(booking.startTime);
            const key = start.toISOString().slice(0, 10);
            if (Object.prototype.hasOwnProperty.call(dayMap, key)) {
                dayMap[key] += 1;
            }
        });

        return Object.entries(dayMap).map(([date, count]) => ({
            date: new Date(date).toLocaleDateString(undefined, { weekday: "short" }),
            count,
        }));
    }, [bookings]);

    const studentBookingsByCategory = useMemo(() => {
        const counter = new Map<string, number>();

        bookings.forEach((booking) => {
            const names: string[] = booking.tutor?.categories?.map((cat: any) => cat.name) || [];
            if (names.length === 0) {
                counter.set("Uncategorized", (counter.get("Uncategorized") || 0) + 1);
                return;
            }

            names.forEach((name) => {
                counter.set(name, (counter.get(name) || 0) + 1);
            });
        });

        return Array.from(counter.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6);
    }, [bookings]);

    const filteredBookings = useMemo(() => {
        const search = bookingSearch.trim().toLowerCase();

        return bookings.filter((booking) => {
            const tutorName = String(booking.tutor?.user?.name || "").toLowerCase();
            const status = String(booking.status || "").toLowerCase();
            const matchesSearch = !search || tutorName.includes(search);
            const matchesStatus = bookingStatusFilter === "all" || status === bookingStatusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [bookings, bookingSearch, bookingStatusFilter]);

    const handleUpdateTutorProfile = async () => {
        const apiUrl = getApiBaseUrl();
        const url = apiUrl.endsWith("/api") ? `${apiUrl}/tutors/profile` : `${apiUrl}/api/tutors/profile`;

        const res = await fetch(url, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                bio,
                availability,
                categoryIds: selectedCategoryIds,
            }),
        });

        const data = await res.json();
        if (data.success) {
            toast.success("Profile updated successfully");
            setEditingTutor(false);

            const refreshRes = await fetch(`${apiUrl}/api/user/me`, { credentials: "include" });
            const refreshData = await refreshRes.json();
            if (refreshData.success) {
                setProfile(refreshData.data);
            }
            return;
        }

        toast.error(data.message || "Failed to update profile");
    };

    if (loading) {
        return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
    }

    return (
        <div className="sb-page">
            <main>
                <div className="sb-container space-y-8">
                    <section className="rounded-2xl border bg-linear-to-r from-primary/15 via-secondary/15 to-accent/15 p-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Personal Workspace</p>
                                <h1 className="mt-1 text-3xl font-bold">Dashboard</h1>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {profile?.role === "TUTOR"
                                        ? "Manage your tutoring profile, categories, and availability."
                                        : "Track your bookings, progress, and next learning milestones."}
                                </p>
                            </div>
                            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                                {profile?.role === "STUDENT" && (
                                    <Link href="/tutors" className="w-full sm:w-auto">
                                        <Button className="w-full sm:w-auto">Find Tutors</Button>
                                    </Link>
                                )}
                                <Link href="/bookings" className="w-full sm:w-auto">
                                    <Button variant="outline" className="w-full sm:w-auto">My Bookings</Button>
                                </Link>
                            </div>
                        </div>
                    </section>

                    {profile && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Account Snapshot</CardTitle>
                                    {profile.role === "TUTOR" && !editingTutor && (
                                        <Button size="sm" onClick={() => setEditingTutor(true)}>Edit Tutor Details</Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Name</p>
                                        <p className="font-medium">{profile.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium">{profile.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Phone</p>
                                        <p className="font-medium">{profile.phone || "Not provided"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Role</p>
                                        <p className="font-medium capitalize">{profile.role?.toLowerCase()}</p>
                                    </div>
                                    {profile.role === "TUTOR" && averageRating !== null && (
                                        <div className="sm:col-span-2 lg:col-span-4">
                                            <p className="text-sm text-muted-foreground">Average Rating</p>
                                            <p className="font-medium">{averageRating.toFixed(1)} / 5 ({profile.tutorProfile.reviews?.length || 0} reviews)</p>
                                        </div>
                                    )}
                                </div>

                                {profile.role === "TUTOR" && profile.tutorProfile && (
                                    <div className="mt-6 grid gap-4">
                                        <div>
                                            <p className="mb-2 text-sm text-muted-foreground">Bio</p>
                                            {editingTutor ? (
                                                <textarea
                                                    value={bio}
                                                    onChange={(e) => setBio(e.target.value)}
                                                    className="w-full rounded-md border px-3 py-2"
                                                    rows={3}
                                                />
                                            ) : (
                                                <p className="font-medium">{profile.tutorProfile.bio}</p>
                                            )}
                                        </div>

                                        <div>
                                            <p className="mb-2 text-sm text-muted-foreground">Availability</p>
                                            {editingTutor ? (
                                                <>
                                                    <textarea
                                                        value={availability}
                                                        onChange={(e) => setAvailability(e.target.value)}
                                                        className="w-full rounded-md border px-3 py-2"
                                                        rows={2}
                                                        placeholder="e.g., Mon-Fri 9AM-5PM"
                                                    />
                                                    <p className="mt-1 text-xs text-muted-foreground">Describe your available hours in plain text.</p>
                                                </>
                                            ) : (
                                                <p className="font-medium">{profile.tutorProfile.availability || "Not set"}</p>
                                            )}
                                        </div>

                                        <div>
                                            <p className="mb-2 text-sm text-muted-foreground">Categories</p>
                                            {editingTutor ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {categories.map((category) => (
                                                        <label
                                                            key={category.id}
                                                            className={`cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors ${selectedCategoryIds.includes(category.id)
                                                                    ? "border-primary bg-primary text-primary-foreground"
                                                                    : "border-input bg-background hover:bg-muted"
                                                                }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                className="hidden"
                                                                checked={selectedCategoryIds.includes(category.id)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setSelectedCategoryIds([...selectedCategoryIds, category.id]);
                                                                    } else {
                                                                        setSelectedCategoryIds(selectedCategoryIds.filter((id) => id !== category.id));
                                                                    }
                                                                }}
                                                            />
                                                            {category.name}
                                                        </label>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="font-medium">
                                                    {profile.tutorProfile.categories?.length
                                                        ? profile.tutorProfile.categories.map((c: any) => c.name).join(", ")
                                                        : "No categories selected"}
                                                </p>
                                            )}
                                        </div>

                                        {editingTutor && (
                                            <div className="flex flex-col gap-2 sm:flex-row">
                                                <Button onClick={handleUpdateTutorProfile} className="w-full sm:w-auto">Save Changes</Button>
                                                <Button
                                                    variant="outline"
                                                    className="w-full sm:w-auto"
                                                    onClick={() => {
                                                        setEditingTutor(false);
                                                        setBio(profile.tutorProfile.bio || "");
                                                        setAvailability(profile.tutorProfile.availability || "");
                                                        setSelectedCategoryIds(profile.tutorProfile.categories?.map((c: any) => c.id) || []);
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {profile?.role === "STUDENT" && (
                        <>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <Card className="border-border/80 bg-card/95">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-muted-foreground">Total Sessions</p>
                                            <CalendarClock className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <p className="mt-2 text-2xl font-bold">{studentStats.total}</p>
                                    </CardContent>
                                </Card>
                                <Card className="border-border/80 bg-card/95">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-muted-foreground">Upcoming</p>
                                            <Clock3 className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <p className="mt-2 text-2xl font-bold text-blue-600">{studentStats.upcoming}</p>
                                    </CardContent>
                                </Card>
                                <Card className="border-border/80 bg-card/95">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-muted-foreground">Completed</p>
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                        </div>
                                        <p className="mt-2 text-2xl font-bold text-emerald-600">{studentStats.completed}</p>
                                    </CardContent>
                                </Card>
                                <Card className="border-border/80 bg-card/95">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-muted-foreground">Next 7 Days</p>
                                            <Star className="h-4 w-4 text-amber-500" />
                                        </div>
                                        <p className="mt-2 text-2xl font-bold text-amber-500">{studentStats.thisWeek}</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-3">
                                <Card className="lg:col-span-2">
                                    <CardHeader>
                                        <CardTitle>Upcoming Session Preview</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {studentStats.recent.length === 0 ? (
                                            <p className="text-sm text-muted-foreground">No sessions yet. Explore tutors and book your first lesson.</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {studentStats.recent.map((booking) => (
                                                    <div key={booking.id} className="rounded-xl border bg-muted/30 p-4">
                                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                            <div>
                                                                <p className="font-semibold">{booking.tutor?.user?.name || "Tutor"}</p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleTimeString()}
                                                                </p>
                                                            </div>
                                                            <span className="inline-flex rounded-full border px-3 py-1 text-xs font-medium capitalize">
                                                                {booking.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Grow Faster</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3 text-sm text-muted-foreground">
                                        <p>Keep momentum by booking weekly sessions and leaving reviews after completed lessons.</p>
                                        <Link href="/tutors" className="block">
                                            <Button className="w-full">Explore Tutors</Button>
                                        </Link>
                                        <Link href="/tutors/become-tutor" className="block">
                                            <Button variant="outline" className="w-full">
                                                <GraduationCap className="mr-2 h-4 w-4" />
                                                Become a Tutor
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Bookings by Status</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-72 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={studentBookingsByStatus}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="status" />
                                                    <YAxis allowDecimals={false} />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Bar dataKey="count" name="Sessions" radius={[6, 6, 0, 0]}>
                                                        {studentBookingsByStatus.map((_, index) => (
                                                            <Cell key={`student-status-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Last 7 Days Activity</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-72 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={studentBookingTrend}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="date" />
                                                    <YAxis allowDecimals={false} />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Line type="monotone" dataKey="count" name="Sessions" stroke="#0ea5e9" strokeWidth={3} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Category Mix</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-80 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={studentBookingsByCategory}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={110}
                                                    label
                                                >
                                                    {studentBookingsByCategory.map((_, index) => (
                                                        <Cell key={`student-cat-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
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
                                    <CardTitle>Bookings Table</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-4 grid gap-3 sm:grid-cols-2">
                                        <input
                                            type="text"
                                            value={bookingSearch}
                                            onChange={(e) => setBookingSearch(e.target.value)}
                                            placeholder="Search by tutor name"
                                            className="h-10 rounded-md border bg-background px-3 text-sm"
                                            aria-label="Search bookings by tutor name"
                                        />
                                        <select
                                            value={bookingStatusFilter}
                                            onChange={(e) => setBookingStatusFilter(e.target.value)}
                                            className="h-10 rounded-md border bg-background px-3 text-sm"
                                            aria-label="Filter bookings by status"
                                        >
                                            <option value="all">All statuses</option>
                                            {Array.from(new Set(bookings.map((booking) => String(booking.status || "unknown").toLowerCase()))).map((status) => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b text-left">
                                                    <th className="py-2 pr-3 font-medium">Tutor</th>
                                                    <th className="py-2 pr-3 font-medium">Start</th>
                                                    <th className="py-2 pr-3 font-medium">End</th>
                                                    <th className="py-2 pr-3 font-medium">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredBookings.slice(0, 8).map((booking) => (
                                                    <tr key={booking.id} className="border-b last:border-0">
                                                        <td className="py-2 pr-3">{booking.tutor?.user?.name || "Tutor"}</td>
                                                        <td className="py-2 pr-3">{new Date(booking.startTime).toLocaleString()}</td>
                                                        <td className="py-2 pr-3">{new Date(booking.endTime).toLocaleString()}</td>
                                                        <td className="py-2 pr-3">
                                                            <span className="rounded-full border px-2 py-1 text-xs capitalize">{String(booking.status || "unknown").toLowerCase()}</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {filteredBookings.length === 0 && (
                                            <p className="py-4 text-center text-muted-foreground">No bookings match your current filter.</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}

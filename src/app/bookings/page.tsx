"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUser } from "@/lib/user-context";
import { getApiBaseUrl } from "@/lib/api-url";
import { Skeleton } from "@/components/ui/skeleton";

function BookingsPageSkeleton() {
  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-8 w-72" />
        {Array.from({ length: 3 }).map((_, idx) => (
          <Card key={`booking-skeleton-${idx}`}>
            <CardHeader>
              <Skeleton className="h-6 w-64" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2 md:col-span-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-56" />
                  <Skeleton className="h-4 w-56" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useUser();

  useEffect(() => {
    const base = getApiBaseUrl();
    const url = base.endsWith("/api") ? `${base}/bookings` : `${base}/api/bookings`;
    fetch(url, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setBookings(data.data);
        else toast.error("Failed to load bookings");
      })
      .catch(() => toast.error("Failed to load bookings"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;
    const base = getApiBaseUrl();
    const url = base.endsWith("/api") ? `${base}/bookings/${id}` : `${base}/api/bookings/${id}`;
    const res = await fetch(url, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Booking deleted");
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } else {
      toast.error("Failed to delete booking");
    }
  };

  if (loading) return <BookingsPageSkeleton />;

  const now = new Date();
  const upcomingBookings = bookings.filter(b => new Date(b.startTime) > now);
  const pastBookings = bookings.filter(b => new Date(b.startTime) <= now);
  const completedBookings = bookings.filter((b) => b.status === "completed");

  const search = searchQuery.trim().toLowerCase();
  const filteredUpcomingBookings = upcomingBookings.filter((booking) => {
    if (!search) return true;
    const otherParty = (
      booking.tutor?.user?.name ||
      booking.student?.name ||
      booking.tutor?.user?.email ||
      booking.student?.email ||
      ""
    ).toLowerCase();
    const status = String(booking.status || "").toLowerCase();
    return otherParty.includes(search) || status.includes(search);
  });
  const filteredPastBookings = pastBookings.filter((booking) => {
    if (!search) return true;
    const otherParty = (
      booking.tutor?.user?.name ||
      booking.student?.name ||
      booking.tutor?.user?.email ||
      booking.student?.email ||
      ""
    ).toLowerCase();
    const status = String(booking.status || "").toLowerCase();
    return otherParty.includes(search) || status.includes(search);
  });

  const getStatusBadgeClass = (status: string) => {
    const normalized = String(status || "").toLowerCase();
    if (normalized === "completed") return "bg-emerald-100 text-emerald-700 border-emerald-300";
    if (normalized === "confirmed") return "bg-blue-100 text-blue-700 border-blue-300";
    if (normalized === "pending") return "bg-amber-100 text-amber-700 border-amber-300";
    if (normalized === "cancelled") return "bg-rose-100 text-rose-700 border-rose-300";
    return "bg-muted text-muted-foreground border-border";
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold">My Bookings</h1>

        <div className="rounded-lg border p-4">
          <label htmlFor="booking-search" className="mb-2 block text-sm font-medium">
            Search bookings
          </label>
          <input
            id="booking-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by person name, email, or status"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{bookings.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Upcoming</p>
              <p className="text-2xl font-bold text-blue-600">{upcomingBookings.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Past</p>
              <p className="text-2xl font-bold text-amber-600">{pastBookings.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-emerald-600">{completedBookings.length}</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Upcoming Bookings */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-primary">📅 Upcoming Bookings ({filteredUpcomingBookings.length})</h2>
          {filteredUpcomingBookings.length === 0 ? (
            <p className="text-muted-foreground">No upcoming bookings</p>
          ) : (
            filteredUpcomingBookings.map((booking) => {
              const otherParty = booking.tutor?.user?.name || booking.student?.name || booking.tutor?.user?.email || booking.student?.email;
              // Admin can delete any booking
              const canDelete = user?.role === "ADMIN";
              // Student can review completed bookings if not already reviewed
              const canReview = user?.role === "STUDENT" && booking.status === "completed" && !booking.reviewedByStudent;
                return (
                  <Card key={booking.id}>
                    <CardHeader>
                      <CardTitle>Booking with {otherParty}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                        <div className="md:col-span-2 flex flex-col gap-2">
                          <div>
                            <span className="font-medium">Status:</span>{" "}
                            <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${getStatusBadgeClass(booking.status)}`}>
                              {booking.status}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">Start:</span> {new Date(booking.startTime).toLocaleString()}
                          </div>
                          <div>
                            <span className="font-medium">End:</span> {new Date(booking.endTime).toLocaleString()}
                          </div>
                        </div>
                        <div className="md:col-span-1 flex flex-col gap-2 items-stretch">
                          <a href={`/bookings/${booking.id}`}>
                            <Button size="sm" variant="outline" className="w-full md:w-auto">View Details</Button>
                          </a>
                          {canReview && (
                            <a href={`/reviews/create?tutorId=${booking.tutorId}`}>
                              <Button size="sm" variant="default" className="w-full md:w-auto">Give Review</Button>
                            </a>
                          )}
                          {canDelete && (
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(booking.id)} className="w-full md:w-auto">
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
            })
          )}
        </div>

        {/* Past Bookings */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-muted-foreground">📋 Past Bookings ({filteredPastBookings.length})</h2>
          {filteredPastBookings.length === 0 ? (
            <p className="text-muted-foreground">No past bookings</p>
          ) : (
            filteredPastBookings.map((booking) => {
              const otherParty = booking.tutor?.user?.name || booking.student?.name || booking.tutor?.user?.email || booking.student?.email;
              const canDelete = user?.role === "ADMIN";
              const canReview = user?.role === "STUDENT" && booking.status === "completed" && !booking.reviewedByStudent;
                return (
                  <Card key={booking.id} className="bg-muted/30">
                    <CardHeader>
                      <CardTitle>Booking with {otherParty}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                        <div className="md:col-span-2 flex flex-col gap-2">
                          <div>
                            <span className="font-medium">Status:</span>{" "}
                            <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${getStatusBadgeClass(booking.status)}`}>
                              {booking.status}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">Start:</span> {new Date(booking.startTime).toLocaleString()}
                          </div>
                          <div>
                            <span className="font-medium">End:</span> {new Date(booking.endTime).toLocaleString()}
                          </div>
                        </div>
                        <div className="md:col-span-1 flex flex-col gap-2 items-stretch">
                          <a href={`/bookings/${booking.id}`}>
                            <Button size="sm" variant="outline" className="w-full md:w-auto">View Details</Button>
                          </a>
                          {canReview && (
                            <a href={`/reviews/create?tutorId=${booking.tutorId}`}>
                              <Button size="sm" variant="default" className="w-full md:w-auto">Give Review</Button>
                            </a>
                          )}
                          {canDelete && (
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(booking.id)} className="w-full md:w-auto">
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
            })
          )}
        </div>
      </div>
    </div>
  );
}

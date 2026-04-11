"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUser } from "@/lib/user-context";
import { getApiBaseUrl } from "@/lib/api-url";
import { useConfirm } from "@/components/confirm-provider";

export default function AllBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const { user } = useUser();
  const { confirm } = useConfirm();

  const fetchBookings = () => {
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
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId: string) => {
    const approved = await confirm({
      title: "Cancel booking",
      message: "Are you sure you want to cancel this booking?",
      confirmText: "Yes, cancel",
      variant: "destructive",
    });
    if (!approved) return;
    setCancelling(bookingId);
    const base = getApiBaseUrl();
    const url = base.endsWith("/api") ? `${base}/bookings/${bookingId}/status` : `${base}/api/bookings/${bookingId}/status`;

    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status: "cancelled" }),
    });

    const data = await res.json();
    if (data.success) {
      toast.success("Booking cancelled");
      fetchBookings();
    } else {
      toast.error(data.message || "Failed to cancel booking");
    }
    setCancelling(null);
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;

  const getStatusTone = (status: string) => {
    const normalized = String(status || "").toLowerCase();
    if (normalized === "confirmed") return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300";
    if (normalized === "pending") return "bg-amber-500/15 text-amber-700 dark:text-amber-300";
    if (normalized === "cancelled") return "bg-rose-500/15 text-rose-700 dark:text-rose-300";
    return "bg-primary/10 text-primary";
  };

  return (
    <div className="sb-page">
      <div className="sb-container">
        <section className="sb-hero">
          <span className="sb-pill">Operations</span>
          <h1 className="sb-title mt-2">All Bookings</h1>
          <p className="sb-subtle">Monitor booking lifecycle and handle administrative actions quickly.</p>
        </section>
        {bookings.length === 0 ? (
          <div className="text-muted-foreground">No bookings found.</div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="border-border/80 bg-card/95">
                <CardHeader>
                  <CardTitle className="text-xl">
                    {booking.student?.name || "Student"} booked {booking.tutor?.user?.name || "Tutor"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                    <span>Start: {new Date(booking.startTime).toLocaleString()}</span>
                    <span>End: {new Date(booking.endTime).toLocaleString()}</span>
                    <span>
                      Status:{" "}
                      <span className={`rounded-full px-2 py-0.5 capitalize ${getStatusTone(booking.status)}`}>
                        {booking.status.toLowerCase()}
                      </span>
                    </span>
                  </div>
                  <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="text-sm text-muted-foreground">Booking ID: {booking.id}</div>
                    {user?.role === "ADMIN" && booking.status === "confirmed" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancelling === booking.id}
                      >
                        {cancelling === booking.id ? "Cancelling..." : "Cancel Booking"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

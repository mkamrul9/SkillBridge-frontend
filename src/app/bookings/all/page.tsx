"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUser } from "@/lib/user-context";
import { getApiBaseUrl } from "@/lib/api-url";

export default function AllBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const { user } = useUser();

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
    if (!confirm("Are you sure you want to cancel this booking?")) return;
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

  return (
    <div className="sb-page">
      <div className="sb-container">
        <h1 className="sb-title">All Bookings</h1>
        {bookings.length === 0 ? (
          <div className="text-muted-foreground">No bookings found.</div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="border-border/80 bg-card/95">
                <CardHeader>
                  <CardTitle>
                    {booking.student?.name || "Student"} booked {booking.tutor?.user?.name || "Tutor"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-2 text-sm text-muted-foreground">
                    <span>Start: {new Date(booking.startTime).toLocaleString()}</span>
                    <span className="ml-4">End: {new Date(booking.endTime).toLocaleString()}</span>
                    <span className="ml-4">Status: <span className="rounded-full bg-primary/10 px-2 py-0.5 capitalize">{booking.status.toLowerCase()}</span></span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-base">Booking ID: {booking.id}</div>
                    {user?.role === "ADMIN" && booking.status === "confirmed" && (
                      <Button
                        variant="destructive"
                        size="sm"
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

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getApiBaseUrl } from "@/lib/api-url";

export default function TutorBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const base = getApiBaseUrl();
    const url = base.endsWith("/api") ? `${base}/bookings/tutor` : `${base}/api/bookings/tutor`;
    fetch(url, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          console.error("API error:", res.status, text);
          toast.error(`Failed to load bookings: ${res.status}`);
          return { success: false };
        }
        return res.json();
      })
      .then((data) => {
        if (data.success) setBookings(data.data);
        else toast.error("Failed to load bookings");
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        toast.error("Failed to load bookings");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;

  const now = new Date();
  const upcomingBookings = bookings.filter(b => new Date(b.startTime) > now);
  const pastBookings = bookings.filter(b => new Date(b.startTime) <= now);

  return (
    <div className="sb-page">
      <div className="sb-container max-w-5xl space-y-6">
        <h1 className="text-3xl font-bold">My Tutor Bookings</h1>
        
        {/* Upcoming Bookings */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-primary">Upcoming Sessions ({upcomingBookings.length})</h2>
          {upcomingBookings.length === 0 ? (
            <p className="text-muted-foreground">No upcoming bookings</p>
          ) : (
            upcomingBookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <CardTitle>
                    Booking with {booking.student?.name || booking.student?.email}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    <div>
                      <span className="font-medium">Status:</span> {booking.status}
                    </div>
                    <div>
                      <span className="font-medium">Start:</span> {new Date(booking.startTime).toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">End:</span> {new Date(booking.endTime).toLocaleString()}
                    </div>
                    <a href={`/bookings/${booking.id}`}>
                      <Button size="sm" variant="outline">View Details</Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Past Bookings */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-muted-foreground">Past Sessions ({pastBookings.length})</h2>
          {pastBookings.length === 0 ? (
            <p className="text-muted-foreground">No past bookings</p>
          ) : (
            pastBookings.map((booking) => (
              <Card key={booking.id} className="bg-muted/30">
                <CardHeader>
                  <CardTitle>
                    Booking with {booking.student?.name || booking.student?.email}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    <div>
                      <span className="font-medium">Status:</span> {booking.status}
                    </div>
                    <div>
                      <span className="font-medium">Start:</span> {new Date(booking.startTime).toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">End:</span> {new Date(booking.endTime).toLocaleString()}
                    </div>
                    <a href={`/bookings/${booking.id}`}>
                      <Button size="sm" variant="outline">View Details</Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

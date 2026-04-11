"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { getApiBaseUrl } from "@/lib/api-url";

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  // Only use booking.status from backend, no local status state
  const [updating, setUpdating] = useState(false);

  const fetchBooking = async () => {
    setLoading(true);
    try {
      const base = getApiBaseUrl();
      const url = base.endsWith("/api") ? `${base}/bookings/${params.id}` : `${base}/api/bookings/${params.id}`;
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setBooking(data.data);
      } else {
        toast.error("Failed to load booking");
      }
    } catch {
      toast.error("Failed to load booking");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this booking?")) return;
    const base = getApiBaseUrl();
    const url = base.endsWith("/api") ? `${base}/bookings/${params.id}` : `${base}/api/bookings/${params.id}`;
    const res = await fetch(url, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Booking deleted");
      router.push("/bookings");
    } else {
      toast.error("Failed to delete booking");
    }
  };


  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  if (!booking) return <div className="flex min-h-screen items-center justify-center">Booking not found</div>;

  const handleComplete = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUpdating(true);
    const base = getApiBaseUrl();
    const url = base.endsWith("/api") ? `${base}/bookings/${params.id}/status` : `${base}/api/bookings/${params.id}/status`;
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status: "completed" }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Status updated");
      await fetchBooking();
    } else {
      toast.error(data.message || "Failed to update status");
    }
    setUpdating(false);
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setUpdating(true);
    const base = getApiBaseUrl();
    const url = base.endsWith("/api") ? `${base}/bookings/${params.id}/status` : `${base}/api/bookings/${params.id}/status`;
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status: "cancelled" }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Booking cancelled");
      await fetchBooking();
    } else {
      toast.error(data.message || "Failed to cancel booking");
    }
    setUpdating(false);
  };

  // Determine user role for status update
  const user = booking.currentUser || {};
  const isStudent = user.id === booking.student?.id && user.role === "STUDENT";
  const isTutor = user.id === booking.tutor?.user?.id && user.role === "TUTOR";
  const canCancel = isStudent && booking.status === "confirmed";
  const canComplete = isTutor && booking.status === "confirmed";

  return (
    <div className="sb-page">
      <div className="sb-container max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {canCancel && (
                <div className="mb-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={updating}
                    onClick={handleCancel}
                  >
                    {updating ? "Cancelling..." : "Cancel Booking"}
                  </Button>
                </div>
              )}
              {canComplete && (
                <form onSubmit={handleComplete} className="mb-2 flex items-center gap-2">
                  <Button size="sm" type="submit" className="w-full sm:w-auto" disabled={updating}>
                    {updating ? "Updating..." : "Mark as Completed"}
                  </Button>
                </form>
              )}
              <div><span className="font-medium">Status:</span> {booking.status}</div>
              <div><span className="font-medium">Start:</span> {new Date(booking.startTime).toLocaleString()}</div>
              <div><span className="font-medium">End:</span> {new Date(booking.endTime).toLocaleString()}</div>
              <div><span className="font-medium">Tutor:</span> {booking.tutor?.user?.name}</div>
              <div><span className="font-medium">Student:</span> {booking.student?.name}</div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" className="w-full sm:w-auto" onClick={() => router.push("/bookings")}>Back</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


"use client";
import { useEffect, useState } from "react";
import { getAllReviews, deleteReview } from "@/lib/review-api";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/lib/user-context";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ReviewEntryPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const { user } = useUser();
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    setDeleting(id);
    try {
      await deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (e: any) {
      alert(e.message || "Failed to delete review");
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
    getAllReviews()
      .then((res) => {
        if (Array.isArray(res)) setReviews(res);
        else if (res && Array.isArray(res.data)) setReviews(res.data);
        else setReviews([]);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex min-h-50 items-center justify-center">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">Error: {error}</div>;

  return (
    <div className="sb-page">
      <div className="sb-container max-w-5xl">
      <h1 className="sb-title mb-4">{user?.role === "ADMIN" ? "All Reviews" : "My Reviews"}</h1>

      {reviews.length === 0 ? (
        <div className="text-muted-foreground">No reviews found.</div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="bg-card/95">
              <CardContent className="py-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{review.student?.name || "Student"}</span>
                    <span className="text-yellow-500 text-sm">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                  </div>

                  <div className="mt-1 sm:mt-0 sm:ml-4 text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</div>

                  <div className="mt-1 sm:mt-0 sm:ml-4 text-sm text-muted-foreground">Tutor: {review.tutor?.user?.name || "Tutor"}</div>

                  {user?.role === "ADMIN" && (
                    <div className="mt-2 sm:mt-0 sm:ml-auto">
                      <Button
                        size="sm"
                        variant="destructive"
                        className="w-full sm:w-auto"
                        disabled={deleting === review.id}
                        onClick={() => handleDelete(review.id)}
                      >
                        {deleting === review.id ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  )}
                </div>
                <div className="text-base">{review.comment || <span className="text-muted-foreground">No comment</span>}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}

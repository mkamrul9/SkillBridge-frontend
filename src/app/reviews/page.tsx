
"use client";
import { useEffect, useState } from "react";
import { getAllReviews, deleteReview } from "@/lib/review-api";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/lib/user-context";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useConfirm } from "@/components/confirm-provider";

export default function ReviewEntryPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const { user } = useUser();
  const { confirm } = useConfirm();
  const handleDelete = async (id: string) => {
    const approved = await confirm({
      title: "Delete review",
      message: "Are you sure you want to delete this review?",
      confirmText: "Delete",
      variant: "destructive",
    });
    if (!approved) return;
    setDeleting(id);
    try {
      await deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (e: any) {
      toast.error(e.message || "Failed to delete review");
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

  const totalPages = Math.max(1, Math.ceil(reviews.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedReviews = reviews.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="sb-page">
      <div className="sb-container max-w-5xl">
        <h1 className="sb-title mb-4">{user?.role === "ADMIN" ? "All Reviews" : "My Reviews"}</h1>

        {reviews.length === 0 ? (
          <div className="text-muted-foreground">No reviews found.</div>
        ) : (
          <div className="space-y-4">
            {pagedReviews.map((review) => (
              <Card key={review.id} className="border-border/80 bg-card/95 shadow-sm">
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
                  <div className="rounded-md bg-muted/40 p-3 text-base">{review.comment || <span className="text-muted-foreground">No comment</span>}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <div className="mt-4 flex flex-col items-center justify-between gap-3 rounded-xl border bg-card/80 px-4 py-3 sm:flex-row">
          <p className="text-sm text-muted-foreground">Page {safePage} of {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
            <Button variant="outline" size="sm" disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { getAllReviews } from "@/lib/review-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/lib/user-context";
import { Button } from "@/components/ui/button";

export default function AllReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const { user } = useUser();

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
        <section className="sb-hero">
          <span className="sb-pill">Quality Insights</span>
          <h1 className="sb-title mt-2">{user?.role === "ADMIN" ? "All Reviews" : "My Reviews"}</h1>
          <p className="sb-subtle">Track learner feedback and tutor performance from one polished view.</p>
        </section>
        {reviews.length === 0 ? (
          <div className="text-muted-foreground">No reviews found.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {pagedReviews.map((review) => (
              <Card key={review.id} className="border-border/80 bg-card/95 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">{review.student?.name || "Student"}</CardTitle>
                  <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-yellow-500">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                    <span className="text-xs text-muted-foreground">Tutor: {review.tutor?.user?.name || "Tutor"}</span>
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

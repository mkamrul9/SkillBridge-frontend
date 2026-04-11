"use client";
import { useEffect, useState } from "react";
import { getAllReviews } from "@/lib/review-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/lib/user-context";

export default function AllReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
            {reviews.map((review) => (
              <Card key={review.id} className="border-border/80 bg-card/95">
                <CardHeader>
                  <CardTitle className="text-lg">{review.student?.name || "Student"}</CardTitle>
                  <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-yellow-500">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                    <span className="text-xs text-muted-foreground">Tutor: {review.tutor?.user?.name || "Tutor"}</span>
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

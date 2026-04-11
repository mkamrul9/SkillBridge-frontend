"use client";
import { getReviewsByTutorId, deleteReview } from "@/lib/review-api";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/user-context";

export default function TutorReviewsPage({ params }: { params: { tutorId: string } }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useUser();

  const loadReviews = () => {
    setLoading(true);
    getReviewsByTutorId(params.tutorId)
      .then((res) => {
        if (Array.isArray(res)) setReviews(res);
        else if (res && Array.isArray(res.data)) setReviews(res.data);
        else setReviews([]);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    loadReviews();
  }, [params.tutorId]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      await deleteReview(id);
      loadReviews();
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (loading) return <div className="flex min-h-50 items-center justify-center">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">Error: {error}</div>;

  return (
    <div className="sb-page">
      <div className="sb-container max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="text-muted-foreground">No reviews found.</div>
          ) : (
            <ul className="space-y-2">
              {reviews.map((review) => (
                <li key={review.id} className="flex flex-col justify-between gap-3 border-b py-2 text-base last:border-b-0 sm:flex-row sm:items-center">
                  <div>
                    <div className="font-medium">Rating: {review.rating}</div>
                    <div className="text-sm text-muted-foreground">{review.comment}</div>
                  </div>
                  {(user?.role === "ADMIN" || user?.id === review.studentId) && (
                    <Button size="sm" variant="destructive" className="w-full sm:w-auto" onClick={() => handleDelete(review.id)}>Delete</Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

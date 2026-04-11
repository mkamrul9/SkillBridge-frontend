"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createReview } from "@/lib/review-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CreateReviewForm({ tutorId }: { tutorId: string }) {
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [success, setSuccess] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await createReview({ tutorId, rating: Number(rating), comment });
      setSuccess(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sb-page">
      <div className="sb-container max-w-2xl">
        <div className="mx-auto w-full max-w-md">
          {success ? (
            <div className="space-y-4 text-center">
              <h2 className="text-xl font-bold">Review submitted!</h2>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-xl font-bold">Create Review</h2>
              <Input
                type="number"
                min="1"
                max="5"
                placeholder="Rating (1-5)"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                required
              />
              <Input
                placeholder="Comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              />
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Submitting..." : "Submit Review"}
              </Button>
            </form>
          )}
          <div className="mt-6 text-center">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => router.back()}>Back</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

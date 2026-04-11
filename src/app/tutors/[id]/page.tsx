"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/lib/user-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { useConfirm } from "@/components/confirm-provider";
import { getApiBaseUrl } from "@/lib/api-url";
import Link from "next/link";
import Image from "next/image";
import { DEFAULT_AVATAR } from "@/lib/default-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Facebook, Link2, Linkedin, Mail, MessageCircle, Share2, Twitter } from "lucide-react";

function TutorDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-background px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex gap-3">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-40" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-[140px,1fr]">
              <Skeleton className="h-30 w-30 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={`tutor-stat-skeleton-${idx}`} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-32" />
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-5/6" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function TutorDetailsPage() {
  const { user } = useUser();
  const params = useParams();
  const [tutor, setTutor] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [relatedTutors, setRelatedTutors] = useState<any[]>([]);
  const [imageFailed, setImageFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewSortBy, setReviewSortBy] = useState<"newest" | "highest">("newest");
  const { confirm } = useConfirm();

  const copyProfileLink = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      toast.success("Tutor profile link copied");
    } catch {
      toast.error("Failed to copy profile link");
    }
  };

  const openShare = async (platform: "whatsapp" | "facebook" | "linkedin" | "x" | "email" | "native") => {
    const url = window.location.href;
    const text = `Check out tutor ${tutor?.user?.name || "profile"} on SkillBridge`;
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(text);

    if (platform === "native" && navigator.share) {
      try {
        await navigator.share({ title: tutor?.user?.name || "Tutor Profile", text, url });
        return;
      } catch {
        return;
      }
    }

    const shareMap: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      x: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      email: `mailto:?subject=${encodedText}&body=${encodedText}%0A${encodedUrl}`,
    };

    const shareUrl = shareMap[platform];
    if (shareUrl) {
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    }
  };

  useEffect(() => {
    const base = getApiBaseUrl();
    const tutorUrl = base.endsWith("/api") ? `${base}/tutors/${params.id}` : `${base}/api/tutors/${params.id}`;

    // Fetch tutor details
    fetch(tutorUrl, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTutor(data.data);

          const firstCategoryId = data.data?.categories?.[0]?.id;
          if (firstCategoryId) {
            const relatedUrl = base.endsWith("/api")
              ? `${base}/tutors?categoryId=${firstCategoryId}&limit=4&sortBy=rating&sortOrder=desc`
              : `${base}/api/tutors?categoryId=${firstCategoryId}&limit=4&sortBy=rating&sortOrder=desc`;

            fetch(relatedUrl, { credentials: "include" })
              .then((res) => res.json())
              .then((relatedData) => {
                if (relatedData?.success) {
                  const filtered = (relatedData.data || []).filter(
                    (item: any) => item.id !== data.data.id,
                  );
                  setRelatedTutors(filtered.slice(0, 3));
                }
              })
              .catch(() => {
                setRelatedTutors([]);
              });
          }

          // Fetch tutor bookings
          const bookingsUrl = base.endsWith("/api") ? `${base}/bookings/tutor/${params.id}` : `${base}/api/bookings/tutor/${params.id}`;
          return fetch(bookingsUrl, { credentials: "include" });
        } else {
          toast.error("Failed to load tutor");
        }
      })
      .then((res) => res?.json())
      .then((data) => {
        if (data?.success) setBookings(data.data || []);
      })
      .catch(() => toast.error("Failed to load tutor"))
      .finally(() => setLoading(false));
  }, [params.id]);

  const deleteReview = async (reviewId: string | number) => {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const url = base.endsWith("/api") ? `${base}/reviews/${reviewId}` : `${base}/api/reviews/${reviewId}`;
    const res = await fetch(url, {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.success) throw new Error(data?.message || "Failed to delete review");
    return data;
  };

  if (loading) return <TutorDetailsSkeleton />;
  if (!tutor) return <div className="flex min-h-screen items-center justify-center">Tutor not found</div>;

  const avgRating = tutor.reviews?.length
    ? (tutor.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / tutor.reviews.length).toFixed(1)
    : "N/A";

  // Calculate booking statistics
  const now = new Date();
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending');
  const upcomingBookings = confirmedBookings.filter(b => new Date(b.startTime) > now);
  const totalBookedHours = upcomingBookings.reduce((sum, b) => {
    const duration = (new Date(b.endTime).getTime() - new Date(b.startTime).getTime()) / (1000 * 60 * 60);
    return sum + duration;
  }, 0);
  const totalBookedDays = Math.ceil(totalBookedHours / 24);
  const sortedReviews = [...(tutor.reviews || [])].sort((a: any, b: any) => {
    if (reviewSortBy === "highest") return b.rating - a.rating;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="sb-page">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-2xl border bg-linear-to-r from-primary/10 via-secondary/10 to-accent/10 p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Tutor Profile</p>
              <h1 className="text-2xl font-bold">{tutor.user.name}</h1>
              <p className="text-sm text-muted-foreground">Share this tutor with students and guardians across platforms.</p>
            </div>
            <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:grid-cols-3">
              <button type="button" className="inline-flex items-center justify-center gap-1 rounded-md border bg-card px-3 py-2 text-sm hover:bg-muted" onClick={() => openShare("whatsapp")}><MessageCircle className="h-4 w-4" />WhatsApp</button>
              <button type="button" className="inline-flex items-center justify-center gap-1 rounded-md border bg-card px-3 py-2 text-sm hover:bg-muted" onClick={() => openShare("facebook")}><Facebook className="h-4 w-4" />Facebook</button>
              <button type="button" className="inline-flex items-center justify-center gap-1 rounded-md border bg-card px-3 py-2 text-sm hover:bg-muted" onClick={() => openShare("linkedin")}><Linkedin className="h-4 w-4" />LinkedIn</button>
              <button type="button" className="inline-flex items-center justify-center gap-1 rounded-md border bg-card px-3 py-2 text-sm hover:bg-muted" onClick={() => openShare("x")}><Twitter className="h-4 w-4" />X</button>
              <button type="button" className="inline-flex items-center justify-center gap-1 rounded-md border bg-card px-3 py-2 text-sm hover:bg-muted" onClick={() => openShare("email")}><Mail className="h-4 w-4" />Email</button>
              <button type="button" className="inline-flex items-center justify-center gap-1 rounded-md border bg-card px-3 py-2 text-sm hover:bg-muted" onClick={copyProfileLink}><Link2 className="h-4 w-4" />Copy Link</button>
            </div>
          </div>
        </section>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-1">
          <button
            className="w-full sm:w-auto px-4 py-2 rounded bg-muted hover:bg-muted/70 border border-border text-base text-center"
            type="button"
            aria-label="Go back to previous page"
            onClick={() => window.history.back()}
          >
            Back
          </button>
          <button
            className="inline-flex w-full items-center justify-center gap-2 rounded border border-border px-4 py-2 text-base hover:bg-muted sm:w-auto"
            type="button"
            aria-label="Copy tutor profile link"
            onClick={copyProfileLink}
          >
            <Share2 className="h-4 w-4" />
            Copy Profile Link
          </button>
          {(user as any)?.role === "STUDENT" && (
            <a
              href={`/bookings/create?tutorId=${params.id}`}
              className="w-full sm:w-auto px-4 py-2 rounded bg-primary text-white hover:bg-primary/90 border border-primary text-base text-center"
            >
              Create Booking
            </a>
          )}
          {!user && (
            <div
              role="alert"
              aria-live="polite"
              className="w-full sm:w-auto mt-2 sm:mt-0 rounded border border-amber-300 bg-amber-50 px-4 py-2 text-center text-sm font-medium text-amber-900"
            >
              Please <a href='/login' className="underline">log in</a> to create a new booking.
            </div>
          )}
        </div>
        <Card className="overflow-hidden border-border/80 bg-card/95 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl">{tutor.user.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 rounded-lg border bg-muted/40 p-4 sm:grid-cols-[140px,1fr]">
                <div className="flex justify-center sm:justify-start">
                  <Image
                    src={
                      imageFailed
                        ? DEFAULT_AVATAR
                        : tutor.user?.image || DEFAULT_AVATAR
                    }
                    alt={`${tutor.user?.name || "Tutor"} profile photo`}
                    width={120}
                    height={120}
                    loading="lazy"
                    onError={() => setImageFailed(true)}
                    className="h-30 w-30 rounded-xl border object-cover"
                  />
                </div>
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-foreground">Tutor Media</p>
                  <p className="text-muted-foreground">
                    Profile photo and teaching summary for quick identification before booking.
                  </p>
                  <p className="text-muted-foreground">
                    Verified profile status: <span className="font-medium text-foreground">Active</span>
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Hourly Rate</p>
                  <p className="text-xl font-semibold">${tutor.hourlyRate}/hour</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Experience</p>
                  <p className="text-xl font-semibold">{tutor.experience} years</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="text-xl font-semibold">{avgRating} / 5</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reviews</p>
                  <p className="text-xl font-semibold">{tutor.reviews?.length || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming Bookings</p>
                  <p className="text-xl font-semibold text-orange-600">{upcomingBookings.length} sessions</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Booked Hours</p>
                  <p className="text-xl font-semibold text-blue-600">{totalBookedHours.toFixed(1)} hrs ({totalBookedDays} days)</p>
                </div>
              </div>


              {/* Bio and Subjects */}
              <div>
                <p className="text-sm text-muted-foreground">Bio</p>
                <p className="mt-1">{tutor.bio || "No bio available"}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {tutor.categories?.map((category: any) => (
                    <span key={category.id} className="rounded-full bg-primary/10 px-3 py-1 text-sm">
                      {category.name}
                    </span>
                  ))}
                  {(!tutor.categories || tutor.categories.length === 0) && (
                    <span className="text-sm text-muted-foreground">No categories selected</span>
                  )}
                </div>
              </div>

              {tutor.availability && (
                <div>
                  <p className="text-sm text-muted-foreground">Availability</p>
                  <p className="mt-1 font-medium text-green-600">{tutor.availability}</p>
                  <p className="text-xs text-muted-foreground mt-1">Please book within these hours</p>
                </div>
              )}

              {/* Reviews */}
              {tutor.reviews && tutor.reviews.length > 0 && (
                <div className="mt-8">
                  <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-lg font-bold">Reviews</h3>
                    <button
                      type="button"
                      className="rounded border px-3 py-1 text-sm hover:bg-muted"
                      onClick={() =>
                        setReviewSortBy((prev) => (prev === "newest" ? "highest" : "newest"))
                      }
                    >
                      Sort: {reviewSortBy === "newest" ? "Newest" : "Highest rating"}
                    </button>
                  </div>
                  <div className="space-y-4">
                    {sortedReviews.map((review: any) => {
                      const canDelete = user && (((user as any).role === "ADMIN") || ((user as any).id === review.studentId));
                      return (
                        <Card key={review.id} className="bg-muted">
                          <CardContent className="py-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-1">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold truncate">{review.student?.name || "Student"}</span>
                                  <span className="text-yellow-500 text-sm shrink-0">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                                  <span className="ml-2 whitespace-nowrap text-xs text-muted-foreground shrink-0">{new Date(review.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                              {canDelete && (
                                <div className="w-full sm:w-auto">
                                  <button
                                    className="mt-2 sm:mt-0 ml-0 sm:ml-4 px-2 py-1 rounded bg-destructive text-white text-xs hover:bg-destructive/80 w-full sm:w-auto"
                                    onClick={async () => {
                                      const approved = await confirm({
                                        title: "Delete review",
                                        message: "Are you sure you want to delete this review?",
                                        confirmText: "Delete",
                                        variant: "destructive",
                                      });
                                      if (!approved) return;
                                      try {
                                        await deleteReview(review.id);
                                        toast.success("Review deleted");
                                        // Remove review from UI
                                        setTutor((prev: any) => ({
                                          ...prev,
                                          reviews: prev.reviews.filter((r: any) => r.id !== review.id),
                                        }));
                                      } catch (e: any) {
                                        toast.error(e.message || "Failed to delete review");
                                      }
                                    }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                            <div className="text-base">{review.comment || <span className="text-muted-foreground">No comment</span>}</div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          </CardContent>
        </Card>

        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Suggested Tutors</h3>
            <Link href="/tutors" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>

          {relatedTutors.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedTutors.map((item: any) => {
                const relatedAvgRating = item.reviews?.length
                  ? (
                    item.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
                    item.reviews.length
                  ).toFixed(1)
                  : "N/A";

                return (
                  <Card key={item.id} className="h-full">
                    <CardHeader>
                      <CardTitle className="text-lg">{item.user?.name || "Tutor"}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="line-clamp-2 text-sm text-muted-foreground">{item.bio || "No bio provided"}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">${item.hourlyRate}/hr</span>
                        <span>Rating: {relatedAvgRating}</span>
                      </div>
                      <div className="pt-1">
                        <Link href={`/tutors/${item.id}`}>
                          <button className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                            View Details
                          </button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-6 text-sm text-muted-foreground">
                No suggested tutors available right now.
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}

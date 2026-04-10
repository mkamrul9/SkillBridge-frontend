"use client";
import { useEffect, useState } from "react";
import { getFeaturedTutors } from "@/lib/tutor-api";
import { DEFAULT_AVATAR } from "@/lib/default-avatar";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeaturedTutorsSection() {
  const [tutors, setTutors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getFeaturedTutors()
      .then((res) => {
        if (!mounted) return;
        setTutors(res.data || res || []);
      })
      .catch((err) => setError("Failed to load tutors"))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  return (
    <section className="w-full py-20 bg-white flex flex-col items-center justify-center text-center border-t border-border">
      <h2 className="text-3xl sm:text-4xl font-bold mb-10 text-primary">Featured Tutors</h2>
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl w-full px-4">
        {loading &&
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={`featured-skeleton-${idx}`} className="flex flex-col items-center bg-gray-50 rounded-lg shadow p-6">
              <Skeleton className="w-20 h-20 rounded-full mb-4" />
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-4 w-48 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}

        {tutors.map((tutor: any) => (
          <div key={tutor.id} className="flex flex-col items-center bg-gray-50 rounded-lg shadow p-6">
            <img
              src={tutor.user?.image || DEFAULT_AVATAR}
              alt={tutor.user?.name || "Tutor"}
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR; }}
              className="w-20 h-20 rounded-full mb-4 object-cover border-2 border-primary"
            />
            <h3 className="font-semibold text-lg mb-1">{tutor.user?.name || "Tutor"}</h3>
            <p className="text-muted-foreground text-sm mb-2">{(tutor.categories || []).map((cat:any) => cat.name).join(", ")}</p>
            <p className="text-gray-600 text-sm mb-2">{tutor.bio || "No bio available."}</p>
            <span className="text-primary font-semibold">{(tutor.reviews || []).length || 0} Reviews</span>
          </div>
        ))}
      </div>
    </section>
  );
}

"use client";
import { useEffect, useState } from "react";
import { getFeaturedTutors } from "@/lib/tutor-api";
import { DEFAULT_AVATAR } from "@/lib/default-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FeaturedTutorsSection() {
  const [tutors, setTutors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [failedImageIds, setFailedImageIds] = useState<Record<string, boolean>>({});

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
      <div className="grid w-full max-w-6xl grid-cols-1 gap-6 px-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading &&
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={`featured-skeleton-${idx}`} className="flex flex-col items-center bg-gray-50 rounded-lg shadow p-6">
              <Skeleton className="w-20 h-20 rounded-full mb-4" />
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-4 w-48 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-4 h-9 w-full" />
            </div>
          ))}

        {tutors.map((tutor: any) => (
          <div key={tutor.id} className="flex h-full flex-col items-center rounded-lg bg-gray-50 p-6 shadow">
            <Image
              src={
                failedImageIds[tutor.id]
                  ? DEFAULT_AVATAR
                  : tutor.user?.image || DEFAULT_AVATAR
              }
              alt={tutor.user?.name || "Tutor"}
              width={80}
              height={80}
              loading="lazy"
              onError={() =>
                setFailedImageIds((prev) => ({
                  ...prev,
                  [tutor.id]: true,
                }))
              }
              className="mb-4 h-20 w-20 rounded-full border-2 border-primary object-cover"
            />
            <h3 className="font-semibold text-lg mb-1">{tutor.user?.name || "Tutor"}</h3>
            <p className="text-muted-foreground text-sm mb-2">{(tutor.categories || []).map((cat: any) => cat.name).join(", ")}</p>
            <p className="mb-2 line-clamp-3 text-sm text-gray-600">{tutor.bio || "No bio available."}</p>
            <span className="font-semibold text-primary">{(tutor.reviews || []).length || 0} Reviews</span>
            <Link href={`/tutors/${tutor.id}`} className="mt-4 w-full">
              <Button className="w-full">View Details</Button>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

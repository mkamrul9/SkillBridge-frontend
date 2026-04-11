import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OffersPage() {
  return (
    <div className="sb-page">
      <div className="sb-container max-w-5xl space-y-8">
        <section className="sb-hero text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">All Offers</h1>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Explore current and upcoming promotional campaigns available for learners and tutors.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <article className="rounded-xl border bg-card p-6">
            <h2 className="text-xl font-semibold">New User Fast-Start</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Limited time discount for first booking after registration.
            </p>
          </article>

          <article className="rounded-xl border bg-card p-6">
            <h2 className="text-xl font-semibold">Tutor Launch Week</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Priority profile visibility for newly approved tutors during first 14 days.
            </p>
          </article>

          <article className="rounded-xl border bg-card p-6 md:col-span-2">
            <h2 className="text-xl font-semibold">Bundle Booking Benefit</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Students booking recurring weekly sessions can unlock reduced session pricing based on tutor policy.
            </p>
          </article>
        </section>

        <section className="flex justify-center">
          <Link href="/pricing">
            <Button>See Full Pricing Plans</Button>
          </Link>
        </section>
      </div>
    </div>
  );
}

import Link from "next/link";
import { BadgePercent, Flame, Gift, Megaphone, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OffersPage() {
    return (
        <div className="sb-page">
            <div className="sb-container max-w-6xl space-y-8">
                <section className="rounded-2xl border bg-linear-to-r from-primary/15 via-secondary/15 to-accent/15 p-8 text-center">
                    <p className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                        <Megaphone className="h-3.5 w-3.5" /> Live Campaigns
                    </p>
                    <h1 className="mt-4 text-4xl font-bold sm:text-5xl">All Offers and Campaigns</h1>
                    <p className="mx-auto mt-3 max-w-3xl text-muted-foreground">
                        Explore student and tutor promotions designed to accelerate early momentum, increase visibility,
                        and reward recurring learning.
                    </p>
                </section>

                <section className="grid gap-6 md:grid-cols-2">
                    <article className="rounded-xl border bg-card p-6 shadow-sm">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                            <Flame className="h-4 w-4" /> Hot Offer
                        </div>
                        <h2 className="text-xl font-semibold">New Learner Fast-Start</h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            First booking bonus and onboarding priority for newly registered students.
                        </p>
                        <p className="mt-3 text-xs text-amber-700">Valid this month only.</p>
                    </article>

                    <article className="rounded-xl border bg-card p-6 shadow-sm">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-secondary/20 px-3 py-1 text-xs font-semibold text-secondary-foreground">
                            <BadgePercent className="h-4 w-4" /> Tutor Growth
                        </div>
                        <h2 className="text-xl font-semibold">Top-Rated Tutor Spotlight</h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            High-rated teachers receive featured visibility blocks and profile highlight badges.
                        </p>
                        <p className="mt-3 text-xs text-muted-foreground">Performance reviewed weekly.</p>
                    </article>

                    <article className="rounded-xl border bg-card p-6 shadow-sm md:col-span-2">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent/25 px-3 py-1 text-xs font-semibold text-accent-foreground">
                            <Gift className="h-4 w-4" /> Bundle Benefit
                        </div>
                        <h2 className="text-xl font-semibold">Recurring Session Advantage</h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Students booking recurring weekly sessions unlock better per-session value and tutor continuity.
                        </p>
                    </article>
                </section>

                <section className="rounded-xl border bg-card/95 p-6">
                    <h3 className="mb-2 inline-flex items-center gap-2 text-lg font-semibold">
                        <Sparkles className="h-5 w-5 text-primary" /> What You Can Do Next
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Compare subscription plans for regular teachers and high-rated teachers to maximize your teaching revenue.
                    </p>
                    <div className="mt-4">
                        <Link href="/pricing">
                            <Button>See Pricing Plans</Button>
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Award, ChevronDown, ChevronLeft, ChevronRight, Clock3, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import FeaturedTutorsSection from "@/components/featured-tutors-section";
import { toast } from "sonner";
import { getApiBaseUrl } from "@/lib/api-url";

const heroSlides = [
    {
        title: "Learn Faster With The Right Tutor",
        subtitle:
            "Match with verified mentors, book flexible sessions, and stay on track with clear goals.",
        ctaPrimary: "Create Account",
        ctaSecondary: "Explore Tutors",
        primaryHref: "/register",
        secondaryHref: "/tutors",
    },
    {
        title: "Teach, Earn, And Grow Your Reputation",
        subtitle:
            "Create your tutor profile, choose your schedule, and teach students who need your expertise.",
        ctaPrimary: "Become a Tutor",
        ctaSecondary: "Sign In",
        primaryHref: "/tutors/become-tutor",
        secondaryHref: "/login",
    },
    {
        title: "From First Session To Real Progress",
        subtitle:
            "Track bookings, ratings, and feedback in one place while building momentum week by week.",
        ctaPrimary: "View Dashboard",
        ctaSecondary: "Create Account",
        primaryHref: "/dashboard",
        secondaryHref: "/register",
    },
];

const faqItems = [
    {
        question: "How do I choose a tutor?",
        answer:
            "Use filters for subject, budget, availability, and rating. Review tutor bios and recent student feedback before booking.",
    },
    {
        question: "Can I reschedule or cancel sessions?",
        answer:
            "Yes. Manage upcoming bookings from your dashboard. Cancellation and reschedule rules are shown during booking.",
    },
    {
        question: "How do tutor ratings work?",
        answer:
            "After completed sessions, students can rate and review tutors. Ratings are averaged to keep quality transparent.",
    },
    {
        question: "Do tutors control their own schedule?",
        answer:
            "Yes. Tutors set availability and can update it anytime from their dashboard profile.",
    },
    {
        question: "Is SkillBridge safe for students?",
        answer:
            "We prioritize verified profiles, moderation, and transparent booking records for trust and accountability.",
    },
];

export default function HomePage() {
    const [activeSlide, setActiveSlide] = useState(0);
    const [slideDirection, setSlideDirection] = useState<"left" | "right">("right");
    const [newsletterEmail, setNewsletterEmail] = useState("");
    const [newsletterLoading, setNewsletterLoading] = useState(false);
    const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

    useEffect(() => {
        const timer = setInterval(() => {
            setSlideDirection("right");
            setActiveSlide((prev) => (prev + 1) % heroSlides.length);
        }, 5000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const base = getApiBaseUrl();
        const url = base.endsWith("/api") ? `${base}/categories` : `${base}/api/categories`;
        fetch(url, { credentials: "include" })
            .then((res) => res.json())
            .then((data) => {
                const next = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
                setCategories(next.slice(0, 8));
            })
            .catch(() => setCategories([]));
    }, []);

    const slide = heroSlides[activeSlide];
    const nextSlide = () => {
        setSlideDirection("right");
        setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    };
    const prevSlide = () => {
        setSlideDirection("left");
        setActiveSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    };

    const handleNewsletterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const email = newsletterEmail.trim();

        if (!email) {
            toast.error("Please enter your email address.");
            return;
        }

        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!isValidEmail) {
            toast.error("Please enter a valid email address.");
            return;
        }

        setNewsletterLoading(true);
        try {
            const res = await fetch("/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok || !data?.success) {
                throw new Error(data?.message || "Failed to subscribe");
            }
            toast.success("Subscribed successfully. Check your inbox for upcoming updates.");
            setNewsletterEmail("");
        } catch (error: any) {
            toast.error(error.message || "Newsletter subscription failed");
        } finally {
            setNewsletterLoading(false);
        }
    };

    return (
        <main className="min-h-screen">
            <section className="relative flex min-h-[65vh] w-full items-center justify-center overflow-hidden bg-linear-to-br from-blue-900 via-cyan-900 to-amber-700 px-4 py-14 text-center text-white sm:px-6">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.25),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.25),transparent_45%)]" />
                <button
                    type="button"
                    aria-label="Previous slide"
                    onClick={prevSlide}
                    className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/40 bg-black/20 p-2 text-white/90 backdrop-blur hover:bg-black/35 sm:left-6"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                    type="button"
                    aria-label="Next slide"
                    onClick={nextSlide}
                    className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/40 bg-black/20 p-2 text-white/90 backdrop-blur hover:bg-black/35 sm:right-6"
                >
                    <ChevronRight className="h-5 w-5" />
                </button>
                <div
                    key={`hero-slide-${activeSlide}`}
                    className={`relative z-10 mx-auto max-w-4xl space-y-6 animate-in fade-in duration-300 ${slideDirection === "right" ? "slide-in-from-right-8" : "slide-in-from-left-8"
                        }`}
                >
                    <p className="text-xs uppercase tracking-[0.35em] text-cyan-200">SkillBridge</p>
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">{slide.title}</h1>
                    <p className="mx-auto max-w-3xl text-base text-slate-100 sm:text-xl">{slide.subtitle}</p>

                    <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Link href={slide.primaryHref}>
                            <Button size="lg" className="w-full border border-white/20 bg-white text-blue-900 shadow-xl hover:bg-white/90 sm:w-auto">
                                {slide.ctaPrimary}
                            </Button>
                        </Link>
                        <Link href={slide.secondaryHref}>
                            <Button size="lg" variant="outline" className="w-full border-white/70 bg-white/15 text-white hover:bg-white/25 sm:w-auto">
                                {slide.ctaSecondary}
                            </Button>
                        </Link>
                    </div>

                    <div className="flex items-center justify-center gap-2 pt-2">
                        {heroSlides.map((_, index) => (
                            <button
                                key={`hero-dot-${index}`}
                                type="button"
                                aria-label={`Go to slide ${index + 1}`}
                                onClick={() => {
                                    setSlideDirection(index > activeSlide ? "right" : "left");
                                    setActiveSlide(index);
                                }}
                                className={`h-2.5 rounded-full transition-all ${activeSlide === index ? "w-8 bg-cyan-300" : "w-2.5 bg-white/40"}`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            <section className="sb-section-blue w-full py-14">
                <div className="mx-auto grid max-w-6xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
                    {[
                        ["1,200+", "Active Students"],
                        ["300+", "Verified Tutors"],
                        ["4,500+", "Sessions Completed"],
                        ["4.8/5", "Average Rating"],
                    ].map(([value, label]) => (
                        <div key={label} className="rounded-xl border bg-card p-6 text-center">
                            <p className="text-3xl font-bold text-primary">{value}</p>
                            <p className="text-sm text-muted-foreground">{label}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="sb-section-teal w-full py-16">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <h2 className="mb-8 text-center text-3xl font-bold sm:text-4xl">How SkillBridge Works</h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            ["1", "Choose Your Goal", "Academic, exam prep, language, or coding."],
                            ["2", "Find a Tutor", "Filter by category, rating, and price."],
                            ["3", "Book a Session", "Pick a time that fits your weekly routine."],
                            ["4", "Track Progress", "Review outcomes and improve with feedback."],
                        ].map(([step, title, text]) => (
                            <div key={title} className="rounded-xl border bg-card p-6">
                                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">{step}</div>
                                <h3 className="mb-2 text-lg font-semibold">{title}</h3>
                                <p className="text-sm text-muted-foreground">{text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="sb-section-amber w-full py-16">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <h2 className="mb-8 text-center text-3xl font-bold sm:text-4xl">Popular Learning Categories</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {categories.length > 0 ? (
                            categories.map((item) => (
                                <Link key={item.id} href="/tutors" className="rounded-xl border bg-card/95 p-5 text-center font-medium transition hover:-translate-y-0.5 hover:shadow-md">
                                    {item.name}
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-full rounded-xl border bg-card/95 p-5 text-center text-muted-foreground">
                                Categories will appear here as soon as admins create them.
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="sb-section-blue w-full py-16">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <h2 className="mb-8 text-center text-3xl font-bold sm:text-4xl">Why Students Choose SkillBridge</h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            {
                                icon: ShieldCheck,
                                title: "Verified Profiles",
                                text: "Every tutor profile is reviewed before going live.",
                            },
                            {
                                icon: Clock3,
                                title: "Flexible Scheduling",
                                text: "Book sessions around school, work, and family time.",
                            },
                            {
                                icon: Award,
                                title: "Transparent Ratings",
                                text: "See real feedback from past learners before you choose.",
                            },
                            {
                                icon: Sparkles,
                                title: "Progress Focus",
                                text: "Set goals and keep momentum with consistent sessions.",
                            },
                        ].map((item) => (
                            <div key={item.title} className="rounded-xl border bg-card p-6">
                                <item.icon className="mb-3 h-6 w-6 text-primary" />
                                <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
                                <p className="text-muted-foreground">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <FeaturedTutorsSection />

            <section className="sb-section-teal w-full py-16">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <h2 className="mb-8 text-center text-3xl font-bold sm:text-4xl">Student Success Stories</h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            {
                                name: "Maya Rahman",
                                quote: "Calculus finally made sense after three sessions.",
                                rating: "4.9/5",
                                image: "https://i.pravatar.cc/120?img=32",
                            },
                            {
                                name: "Alex Karim",
                                quote: "I improved my IELTS speaking score in six weeks.",
                                rating: "4.8/5",
                                image: "https://i.pravatar.cc/120?img=12",
                            },
                            {
                                name: "Priya Saha",
                                quote: "My coding confidence doubled after weekly mentorship.",
                                rating: "5.0/5",
                                image: "https://i.pravatar.cc/120?img=44",
                            },
                            {
                                name: "Nabil Islam",
                                quote: "Physics prep became structured and stress-free.",
                                rating: "4.9/5",
                                image: "https://i.pravatar.cc/120?img=20",
                            },
                        ].map((story) => (
                            <div key={story.name} className="rounded-xl border bg-card p-6">
                                <div className="mb-4 flex items-center gap-3">
                                    <Image
                                        src={story.image}
                                        width={44}
                                        height={44}
                                        alt={`${story.name} profile`}
                                        className="h-11 w-11 rounded-full border object-cover"
                                        unoptimized
                                    />
                                    <div>
                                        <p className="font-semibold text-primary">{story.name}</p>
                                        <p className="text-xs text-amber-600">Rating: {story.rating}</p>
                                    </div>
                                </div>
                                <p className="italic text-muted-foreground">"{story.quote}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="sb-section-amber w-full py-16">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <h2 className="mb-8 text-center text-3xl font-bold sm:text-4xl">Current Offers</h2>
                    <div className="grid gap-6 lg:grid-cols-2">
                        {[
                            ["New User Fast-Start", "Limited time: first booking discount for all newly registered students."],
                            ["Tutor Launch Week", "New tutors get profile promotion support for their first 14 days."],
                        ].map(([title, text]) => (
                            <div key={title} className="rounded-xl border bg-card/95 p-6 shadow-sm">
                                <h3 className="mb-2 text-lg font-semibold">{title}</h3>
                                <p className="text-muted-foreground">{text}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Link href="/offers">
                            <Button variant="outline" className="w-full sm:w-auto">See All Offers</Button>
                        </Link>
                        <Link href="/pricing">
                            <Button className="w-full sm:w-auto">See Full Pricing Plans</Button>
                        </Link>
                    </div>
                </div>
            </section>

            <section className="sb-section-blue w-full py-16">
                <div className="mx-auto max-w-4xl px-4 sm:px-6">
                    <h2 className="mb-8 text-center text-3xl font-bold sm:text-4xl">Frequently Asked Questions</h2>
                    <div className="space-y-3">
                        {faqItems.map((item) => (
                            <details key={item.question} className="group rounded-xl border bg-card p-5 open:bg-card/90">
                                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-semibold">
                                    <span>{item.question}</span>
                                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                                </summary>
                                <p className="mt-3 text-sm text-muted-foreground">{item.answer}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            <section className="w-full border-y bg-linear-to-br from-blue-950 via-slate-950 to-cyan-900 py-16 text-white">
                <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
                    <h2 className="text-3xl font-bold sm:text-4xl">Stay Updated</h2>
                    <p className="mx-auto mt-3 max-w-2xl text-slate-300">
                        Get tutor highlights, product updates, and learning resources delivered to your inbox.
                    </p>
                    <form onSubmit={handleNewsletterSubmit} className="mx-auto mt-6 flex max-w-xl flex-col gap-3 sm:flex-row">
                        <input
                            type="email"
                            value={newsletterEmail}
                            onChange={(e) => setNewsletterEmail(e.target.value)}
                            placeholder="Enter your email"
                            aria-label="Email for newsletter"
                            className="h-11 flex-1 rounded-md border border-slate-700 bg-slate-900 px-4 text-sm text-white placeholder:text-slate-400"
                        />
                        <Button type="submit" disabled={newsletterLoading} className="h-11 border border-white/30 bg-amber-400 text-slate-950 hover:bg-amber-300">
                            {newsletterLoading ? "Submitting..." : "Subscribe"}
                        </Button>
                    </form>
                </div>
            </section>

            <section className="sb-section-teal w-full py-16">
                <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
                    <h2 className="text-3xl font-bold sm:text-4xl">Ready To Start Your Learning Journey?</h2>
                    <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
                        Join SkillBridge and connect with tutors who match your goals, schedule, and learning style.
                    </p>
                    <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                        <Link href="/register">
                            <Button size="lg" className="w-full sm:w-auto">Create Free Account</Button>
                        </Link>
                        <Link href="/tutors">
                            <Button size="lg" variant="outline" className="w-full sm:w-auto">Browse Tutors</Button>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import FeaturedTutorsSection from "@/components/featured-tutors-section";
import { toast } from "sonner";

const heroSlides = [
  {
    title: "Learn Faster With The Right Tutor",
    subtitle:
      "Match with verified mentors, book flexible sessions, and stay on track with clear goals.",
    ctaPrimary: "Start Learning",
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

export default function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const slide = heroSlides[activeSlide];
  const goToNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % heroSlides.length);
  };
  const goToPreviousSlide = () => {
    setActiveSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleNewsletterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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

    toast.success("Subscribed successfully. We will send updates soon.");
    setNewsletterEmail("");
  };

  return (
    <main className="min-h-screen bg-background">
      {/* 1) Interactive Hero */}
      <section className="relative flex min-h-[65vh] w-full items-center justify-center overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-cyan-900 px-4 py-14 text-center text-white sm:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.25),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.25),transparent_45%)]" />
        <div className="relative z-10 mx-auto max-w-4xl space-y-6">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-200">SkillBridge</p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">{slide.title}</h1>
          <p className="mx-auto max-w-3xl text-base text-slate-100 sm:text-xl">{slide.subtitle}</p>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href={slide.primaryHref}>
              <Button size="lg" className="w-full bg-cyan-400 px-8 text-slate-950 hover:bg-cyan-300 sm:w-auto">
                {slide.ctaPrimary}
              </Button>
            </Link>
            <Link href={slide.secondaryHref}>
              <Button size="lg" variant="outline" className="w-full border-slate-200 text-slate-100 hover:bg-slate-100 hover:text-slate-950 sm:w-auto">
                {slide.ctaSecondary}
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              type="button"
              aria-label="Previous hero slide"
              onClick={goToPreviousSlide}
              className="rounded border border-white/30 px-3 py-1 text-xs text-white/90 hover:bg-white/10"
            >
              Prev
            </button>
            {heroSlides.map((_, index) => (
              <button
                key={`hero-dot-${index}`}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                onClick={() => setActiveSlide(index)}
                className={`h-2.5 rounded-full transition-all ${activeSlide === index ? "w-8 bg-cyan-300" : "w-2.5 bg-white/40"}`}
              />
            ))}
            <button
              type="button"
              aria-label="Next hero slide"
              onClick={goToNextSlide}
              className="rounded border border-white/30 px-3 py-1 text-xs text-white/90 hover:bg-white/10"
            >
              Next
            </button>
          </div>
        </div>

        <a href="#home-next" className="absolute bottom-5 left-1/2 -translate-x-1/2 animate-bounce text-sm text-cyan-200">
          Scroll to explore
        </a>
      </section>

      {/* 2) Quick Stats */}
      <section id="home-next" className="w-full border-t bg-background py-14">
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

      {/* 3) How It Works */}
      <section className="w-full border-t py-16">
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

      {/* 4) Learning Categories */}
      <section className="w-full border-t bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="mb-8 text-center text-3xl font-bold sm:text-4xl">Popular Learning Categories</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {["Math", "Science", "English", "Programming", "Design", "Business", "Test Prep", "Languages"].map((item) => (
              <Link key={item} href="/tutors" className="rounded-xl border bg-white p-5 text-center font-medium transition hover:-translate-y-0.5 hover:shadow-md">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5) Why Choose Us */}
      <section className="w-full border-t py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="mb-8 text-center text-3xl font-bold sm:text-4xl">Why Students Choose SkillBridge</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Verified Profiles", "Every tutor profile is reviewed before going live."],
              ["Flexible Scheduling", "Book sessions around school, work, and family time."],
              ["Transparent Ratings", "See real feedback from past learners."],
            ].map(([title, text]) => (
              <div key={title} className="rounded-xl border bg-card p-6">
                <h3 className="mb-2 text-xl font-semibold">{title}</h3>
                <p className="text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6) Featured Tutors */}
      <FeaturedTutorsSection />

      {/* 7) Success Stories */}
      <section className="w-full border-t py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="mb-8 text-center text-3xl font-bold sm:text-4xl">Student Success Stories</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Maya", "Calculus finally made sense after three sessions."],
              ["Alex", "I improved my IELTS speaking score in six weeks."],
              ["Priya", "My coding confidence doubled after weekly mentorship."],
            ].map(([name, quote]) => (
              <div key={name} className="rounded-xl border bg-card p-6">
                <p className="mb-4 italic text-muted-foreground">"{quote}"</p>
                <p className="font-semibold text-primary">{name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8) Offers */}
      <section className="w-full border-t bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="mb-8 text-center text-3xl font-bold sm:text-4xl">Current Offers</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["New Learner", "Get your first session booking fee waived."],
              ["Weekly Plan", "Book 4 sessions and unlock discounted rates."],
              ["Referral Reward", "Invite a friend and both get bonus credits."],
            ].map(([title, text]) => (
              <div key={title} className="rounded-xl border bg-white p-6 shadow-sm">
                <h3 className="mb-2 text-lg font-semibold">{title}</h3>
                <p className="text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9) FAQ */}
      <section className="w-full border-t py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="mb-8 text-center text-3xl font-bold sm:text-4xl">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              ["How do I choose a tutor?", "Use category, rating, and price filters on the Tutors page."],
              ["Can I cancel a booking?", "Yes, students can manage and cancel bookings from their dashboard."],
              ["Can tutors set availability?", "Yes, tutors can define their schedule from dashboard/profile."],
            ].map(([q, a]) => (
              <div key={q} className="rounded-xl border bg-card p-5">
                <h3 className="font-semibold">{q}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10) Newsletter */}
      <section className="w-full border-t bg-slate-950 py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold sm:text-4xl">Stay Updated</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-300">
            Get tutor highlights, platform updates, and learning resources delivered to your inbox.
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
            <Button type="submit" className="h-11 bg-cyan-400 text-slate-950 hover:bg-cyan-300">Subscribe</Button>
          </form>
        </div>
      </section>

      {/* 11) Final CTA */}
      <section className="w-full border-t py-16">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold sm:text-4xl">Ready To Start Your Learning Journey?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Join SkillBridge today and connect with tutors who match your goals, schedule, and learning style.
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

import { Award, BookOpen, ShieldCheck, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="sb-page">
      <div className="sb-container max-w-6xl space-y-8">
        <section className="sb-hero text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">About SkillBridge</h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
            SkillBridge is an education platform built to connect motivated learners with trusted tutors.
            We focus on measurable progress, transparent quality, and flexible scheduling for modern students.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Users, title: "Student First", text: "Learning outcomes and confidence growth come first." },
            { icon: ShieldCheck, title: "Trusted Tutors", text: "Profiles are reviewed to maintain quality standards." },
            { icon: BookOpen, title: "Practical Learning", text: "Sessions are goal-driven with clear improvement paths." },
            { icon: Award, title: "Long-Term Success", text: "Track progress across skills, exams, and milestones." },
          ].map((item) => (
            <article key={item.title} className="rounded-xl border bg-card p-6">
              <item.icon className="mb-3 h-6 w-6 text-primary" />
              <h2 className="text-lg font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-xl border bg-card/95 p-6">
            <h2 className="text-2xl font-semibold">Our Mission</h2>
            <p className="mt-3 text-muted-foreground">
              Make high-quality tutoring accessible, personalized, and transparent for every student,
              whether they are preparing for exams, building professional skills, or learning for growth.
            </p>
          </article>
          <article className="rounded-xl border bg-card/95 p-6">
            <h2 className="text-2xl font-semibold">Our Approach</h2>
            <p className="mt-3 text-muted-foreground">
              We combine category-based tutor discovery, clear ratings, flexible booking, and student feedback loops
              to support consistent improvement over time.
            </p>
          </article>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {[
            ["300+", "Verified Tutors"],
            ["1200+", "Active Students"],
            ["4500+", "Sessions Completed"],
          ].map(([value, label]) => (
            <article key={label} className="rounded-xl border bg-card p-6 text-center">
              <p className="text-3xl font-bold text-primary">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}

import { LoginForm } from "@/components/modules/authentication/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-svh bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.16),transparent_60%),linear-gradient(120deg,hsl(var(--background)),hsl(var(--muted)/0.5))] p-6 md:p-10">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="order-2 rounded-2xl border bg-card/70 p-6 backdrop-blur lg:order-1 lg:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Welcome to SkillBridge</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">Learn with trusted tutors and structured progress.</h1>
          <p className="mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Sign in to manage bookings, track session progress, and access role-based tools for students, tutors, and admins.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border bg-background/70 p-4">
              <p className="text-xs uppercase text-muted-foreground">Students</p>
              <p className="mt-1 text-sm font-semibold">Book smartly</p>
            </div>
            <div className="rounded-xl border bg-background/70 p-4">
              <p className="text-xs uppercase text-muted-foreground">Tutors</p>
              <p className="mt-1 text-sm font-semibold">Grow your profile</p>
            </div>
            <div className="rounded-xl border bg-background/70 p-4">
              <p className="text-xs uppercase text-muted-foreground">Admins</p>
              <p className="mt-1 text-sm font-semibold">Oversee operations</p>
            </div>
          </div>
        </section>

        <div className="order-1 w-full lg:order-2">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

import { RegisterForm } from "@/components/modules/authentication/register-form";

export default function RegisterPage() {
  return (
    <div className="min-h-svh bg-[radial-gradient(circle_at_bottom_right,hsl(var(--secondary)/0.2),transparent_58%),linear-gradient(135deg,hsl(var(--background)),hsl(var(--muted)/0.5))] p-6 md:p-10">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="w-full">
          <RegisterForm />
        </div>

        <section className="rounded-2xl border bg-card/70 p-6 backdrop-blur lg:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Join SkillBridge</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">Create your account and start your learning journey today.</h1>
          <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
            Register as a student to find mentors, or as a tutor to publish your expertise and receive bookings from learners.
          </p>

          <div className="mt-6 space-y-3">
            <div className="rounded-xl border bg-background/70 p-4">
              <p className="text-sm font-semibold">Personalized tutor matching</p>
              <p className="mt-1 text-sm text-muted-foreground">Browse by category, pricing, and ratings that matter to you.</p>
            </div>
            <div className="rounded-xl border bg-background/70 p-4">
              <p className="text-sm font-semibold">Simple booking flow</p>
              <p className="mt-1 text-sm text-muted-foreground">Book sessions in minutes and track status updates from your dashboard.</p>
            </div>
            <div className="rounded-xl border bg-background/70 p-4">
              <p className="text-sm font-semibold">Role-based workspace</p>
              <p className="mt-1 text-sm text-muted-foreground">Students, tutors, and admins each get focused tools after login.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

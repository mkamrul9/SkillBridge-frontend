import Link from "next/link";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
        <div className="space-y-10">
          <div className="space-y-3 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Help and Support</h1>
            <p className="text-muted-foreground">
              Get quick answers about accounts, bookings, tutor matching, and platform safety.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <article className="rounded-xl border bg-card p-6">
              <h2 className="mb-2 text-lg font-semibold">Account and Login</h2>
              <p className="text-sm text-muted-foreground">
                Use Google or email login. If sign-in fails, clear cookies and retry from the Login page.
              </p>
            </article>
            <article className="rounded-xl border bg-card p-6">
              <h2 className="mb-2 text-lg font-semibold">Booking Sessions</h2>
              <p className="text-sm text-muted-foreground">
                Open a tutor profile, click Create Booking, choose your preferred time, and confirm.
              </p>
            </article>
            <article className="rounded-xl border bg-card p-6">
              <h2 className="mb-2 text-lg font-semibold">Reviews and Ratings</h2>
              <p className="text-sm text-muted-foreground">
                Reviews should be honest and respectful. Inappropriate content may be removed by admins.
              </p>
            </article>
            <article className="rounded-xl border bg-card p-6">
              <h2 className="mb-2 text-lg font-semibold">Tutor Profiles</h2>
              <p className="text-sm text-muted-foreground">
                Tutors can update bio, availability, and categories from dashboard/profile settings.
              </p>
            </article>
            <article className="rounded-xl border bg-card p-6">
              <h2 className="mb-2 text-lg font-semibold">Payments and Policies</h2>
              <p className="text-sm text-muted-foreground">
                Please read our privacy and terms pages for service policy and data handling details.
              </p>
            </article>
            <article className="rounded-xl border bg-card p-6">
              <h2 className="mb-2 text-lg font-semibold">Need More Help?</h2>
              <p className="text-sm text-muted-foreground">
                Reach us at support@skillbridge.com or use the contact page for detailed requests.
              </p>
            </article>
          </div>

          <div className="rounded-xl border bg-slate-50 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Still stuck? Visit our <Link href="/contact" className="font-medium text-primary hover:underline">Contact</Link> page and include screenshots for faster support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

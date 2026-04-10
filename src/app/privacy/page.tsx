export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
        <div className="space-y-8">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Privacy Policy</h1>
            <p className="text-muted-foreground">
              Effective date: April 11, 2026
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Information We Collect</h2>
            <p className="text-muted-foreground">
              SkillBridge collects account information such as name, email, phone number,
              profile data, booking details, and review content to provide tutoring services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">How We Use Your Data</h2>
            <p className="text-muted-foreground">
              We use your information to manage accounts, process bookings, match students
              with tutors, improve platform safety, and provide support.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Data Sharing</h2>
            <p className="text-muted-foreground">
              We do not sell personal information. Data is shared only with service providers
              required for authentication, hosting, and core platform operations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Cookies and Sessions</h2>
            <p className="text-muted-foreground">
              SkillBridge uses secure session cookies for authentication and account security.
              You can clear browser cookies at any time, but this may log you out.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Contact</h2>
            <p className="text-muted-foreground">
              For privacy questions, contact us at support@skillbridge.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
                <div className="space-y-8">
                    <div className="space-y-3">
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Terms of Service</h1>
                        <p className="text-muted-foreground">
                            Effective date: April 11, 2026
                        </p>
                    </div>

                    <section className="space-y-3">
                        <h2 className="text-2xl font-semibold">Platform Usage</h2>
                        <p className="text-muted-foreground">
                            By using SkillBridge, you agree to provide accurate account information and use
                            the platform only for lawful educational and tutoring activities.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-2xl font-semibold">Accounts and Security</h2>
                        <p className="text-muted-foreground">
                            You are responsible for account security. Do not share your login credentials.
                            SkillBridge may suspend accounts that violate platform rules.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-2xl font-semibold">Bookings and Reviews</h2>
                        <p className="text-muted-foreground">
                            Booking and review features must be used fairly. Fraudulent bookings, abusive
                            behavior, or manipulated reviews may result in account restrictions.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-2xl font-semibold">Limitation of Liability</h2>
                        <p className="text-muted-foreground">
                            SkillBridge provides a platform to connect students and tutors. We are not liable
                            for off-platform actions or third-party service disruptions.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-2xl font-semibold">Contact</h2>
                        <p className="text-muted-foreground">
                            For terms-related questions, contact us at support@skillbridge.com.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}

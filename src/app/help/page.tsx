import Link from "next/link";

const helpItems = [
  {
    question: "I cannot log in with email and password. What should I do?",
    solution:
      "Reset your password from the login page, then try again. If your account is still blocked, contact support with your registered email.",
  },
  {
    question: "Google sign-in redirects but I remain logged out.",
    solution:
      "Clear cookies for SkillBridge and retry from the login page. If this persists, verify browser third-party cookie settings and try again.",
  },
  {
    question: "How can I find the right tutor quickly?",
    solution:
      "Use filters for category, price, and rating. Open profiles, compare availability, and choose tutors with recent positive reviews.",
  },
  {
    question: "My booking request failed. Why?",
    solution:
      "Check if the selected slot is still available and within tutor availability hours. Try another slot or refresh the tutor page.",
  },
  {
    question: "How do I cancel or reschedule a booking?",
    solution:
      "Open your bookings page, choose the session, and use cancel or reschedule actions based on policy shown for that booking.",
  },
  {
    question: "Where can tutors update profile and categories?",
    solution:
      "Tutors can go to Dashboard and Profile pages to update bio, hourly rate, categories, and availability.",
  },
  {
    question: "How do reviews work on SkillBridge?",
    solution:
      "Students can post a review after a completed session. Admins can moderate inappropriate or misleading review content.",
  },
  {
    question: "What happens if my account is banned?",
    solution:
      "You will lose access to bookings and dashboard actions. Contact support to request account status review and reinstatement.",
  },
  {
    question: "Can I use SkillBridge on mobile?",
    solution:
      "Yes. The platform is responsive across desktop and mobile browsers. If a page looks broken, refresh and report it via contact form.",
  },
  {
    question: "How do I get urgent support?",
    solution:
      "Use the Contact page and include your issue type, screenshot, and booking/user ID for faster resolution by the support team.",
  },
];

export default function HelpPage() {
  return (
    <div className="sb-page">
      <div className="sb-container max-w-5xl space-y-8">
        <section className="sb-hero text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">Help Center</h1>
          <p className="mx-auto mt-3 max-w-3xl text-muted-foreground">
            Find answers to the most common platform issues. Each question includes direct, actionable steps.
          </p>
        </section>

        <section className="space-y-3">
          {helpItems.map((item) => (
            <details key={item.question} className="rounded-xl border bg-card p-5 open:bg-card/90">
              <summary className="cursor-pointer list-none font-semibold">{item.question}</summary>
              <p className="mt-3 text-sm text-muted-foreground">{item.solution}</p>
            </details>
          ))}
        </section>

        <section className="rounded-xl border bg-card/95 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Still need help? Go to <Link href="/contact" className="font-medium text-primary hover:underline">Contact Us</Link> and include screenshots for faster support.
          </p>
        </section>
      </div>
    </div>
  );
}

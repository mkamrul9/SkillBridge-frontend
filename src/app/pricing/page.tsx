import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Starter",
    price: "$0",
    description: "Great for exploring tutors and booking your first lessons.",
    features: [
      "Tutor discovery and filtering",
      "Profile and booking management",
      "Standard support",
    ],
  },
  {
    name: "Growth",
    price: "$19 / month",
    description: "For active learners who want ongoing progress support.",
    features: [
      "Everything in Starter",
      "Priority booking windows",
      "Progress reminders and session insights",
    ],
    highlighted: true,
  },
  {
    name: "Pro",
    price: "$49 / month",
    description: "For serious learners and advanced tutoring workflows.",
    features: [
      "Everything in Growth",
      "Dedicated support channel",
      "Advanced planning and reporting",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="sb-page">
      <div className="sb-container max-w-6xl space-y-8">
        <section className="sb-hero text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">Pricing Plans</h1>
          <p className="mx-auto mt-3 max-w-3xl text-muted-foreground">
            Choose a plan that matches your learning pace. Upgrade anytime as your goals evolve.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`rounded-xl border bg-card p-6 ${plan.highlighted ? "ring-2 ring-primary/40" : ""}`}
            >
              <h2 className="text-2xl font-semibold">{plan.name}</h2>
              <p className="mt-2 text-3xl font-bold text-primary">{plan.price}</p>
              <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {plan.features.map((feature) => (
                  <li key={feature}>- {feature}</li>
                ))}
              </ul>
              <Button className="mt-6 w-full">Choose {plan.name}</Button>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}

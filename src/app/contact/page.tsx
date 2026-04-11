"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useState } from "react";
import { toast } from "sonner";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success("Thanks. Your message has been received by our support team.");
        setFormData({ name: "", email: "", subject: "", message: "" });
    };

    return (
        <div className="sb-page">
            <div className="sb-container max-w-6xl space-y-8">
                <section className="sb-hero text-center">
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Contact Us</h1>
                    <p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
                        Reach our support, partnership, or onboarding teams. We usually respond within one business day.
                    </p>
                </section>

                <section className="grid gap-6 lg:grid-cols-3">
                    <article className="rounded-xl border bg-card p-6">
                        <h2 className="text-lg font-semibold">General Support</h2>
                        <p className="mt-2 text-sm text-muted-foreground">support@skillbridge.com</p>
                        <p className="mt-1 text-sm text-muted-foreground">Sat-Thu, 9:00 AM - 6:00 PM</p>
                    </article>
                    <article className="rounded-xl border bg-card p-6">
                        <h2 className="text-lg font-semibold">Phone</h2>
                        <p className="mt-2 text-sm text-muted-foreground">+880 1700-000000</p>
                        <p className="mt-1 text-sm text-muted-foreground">For urgent booking and account issues</p>
                    </article>
                    <article className="rounded-xl border bg-card p-6">
                        <h2 className="text-lg font-semibold">Office</h2>
                        <p className="mt-2 text-sm text-muted-foreground">Banani, Dhaka, Bangladesh</p>
                        <p className="mt-1 text-sm text-muted-foreground">Partnership and institutional meetings by appointment</p>
                    </article>
                </section>

                <section className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-xl border bg-card p-8">
                        <h2 className="mb-6 text-2xl font-semibold">Send us a message</h2>
                        <form onSubmit={handleSubmit}>
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="name">Name</FieldLabel>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Your name"
                                        required
                                    />
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="email">Email</FieldLabel>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="your.email@example.com"
                                        required
                                    />
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="subject">Subject</FieldLabel>
                                    <Input
                                        id="subject"
                                        type="text"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        placeholder="What is this about?"
                                        required
                                    />
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="message">Message</FieldLabel>
                                    <textarea
                                        id="message"
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        placeholder="Write your message"
                                        required
                                        rows={6}
                                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                    />
                                </Field>

                                <Button type="submit" className="w-full">Send Message</Button>
                            </FieldGroup>
                        </form>
                    </div>

                    <div className="space-y-6">
                        <article className="rounded-xl border bg-card p-6">
                            <h3 className="text-lg font-semibold">For Institutions</h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Schools, coaching centers, and organizations can contact us for tutor onboarding and custom plans.
                            </p>
                        </article>
                        <article className="rounded-xl border bg-card p-6">
                            <h3 className="text-lg font-semibold">For Tutors</h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Need help setting up profile, availability, or categories? Our onboarding team is ready to assist.
                            </p>
                        </article>
                        <article className="rounded-xl border bg-card p-6">
                            <h3 className="text-lg font-semibold">Response SLA</h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                General inquiries: within 24 hours. Critical account or booking issues: within 6 business hours.
                            </p>
                        </article>
                    </div>
                </section>
            </div>
        </div>
    );
}

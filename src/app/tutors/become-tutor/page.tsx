"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BadgeDollarSign, Briefcase, Sparkles, Users } from "lucide-react";

import { getApiBaseUrl } from "@/lib/api-url";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BecomeTutorPage() {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
    const router = useRouter();

    useEffect(() => {
        const base = getApiBaseUrl();
        fetch(`${base}/api/categories`, { credentials: "include" })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setCategories(data.data || []);
                }
            })
            .catch(() => {
                setCategories([]);
            });
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            bio: formData.get("bio"),
            subjects: String(formData.get("subjects") || "")
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            hourlyRate: parseFloat(String(formData.get("hourlyRate") || "0")),
            experience: parseInt(String(formData.get("experience") || "0"), 10),
            availability: String(formData.get("availability") || "").trim() || null,
            categoryIds: selectedCategoryIds,
        };

        const base = getApiBaseUrl();
        const response = await fetch(`${base}/api/tutors/become-tutor`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(data),
        });
        const result = await response.json();

        if (result.success) {
            toast.success("Tutor profile created!");
            router.push("/dashboard");
            setLoading(false);
            return;
        }

        toast.error(result.message || "Failed to create profile");
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.12),transparent_58%),linear-gradient(120deg,hsl(var(--background)),hsl(var(--muted)/0.45))] px-4 py-10 sm:px-6 sm:py-14">
            <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                <section className="rounded-2xl border bg-card/75 p-6 backdrop-blur sm:p-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Tutor Application</p>
                    <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">Become a Tutor on SkillBridge</h1>
                    <p className="mt-4 text-sm text-muted-foreground sm:text-base">
                        Build your public profile, list your expertise, and start receiving bookings from students looking for guidance.
                    </p>

                    <div className="mt-6 space-y-3">
                        <div className="rounded-xl border bg-background/70 p-4">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <Users className="h-4 w-4 text-primary" />
                                Reach motivated learners
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">Your profile appears in tutor discovery with category-based filters.</p>
                        </div>
                        <div className="rounded-xl border bg-background/70 p-4">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <BadgeDollarSign className="h-4 w-4 text-primary" />
                                Set your own hourly rate
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">Define pricing that reflects your expertise and experience.</p>
                        </div>
                        <div className="rounded-xl border bg-background/70 p-4">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <Briefcase className="h-4 w-4 text-primary" />
                                Manage sessions professionally
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">Use your dashboard to track sessions, reviews, and profile performance.</p>
                        </div>
                    </div>
                </section>

                <Card className="border-border/80 bg-card/95 shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            Complete Your Tutor Profile
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="mb-2 block text-sm font-semibold">Bio</label>
                                <textarea
                                    name="bio"
                                    required
                                    className="w-full rounded-lg border px-4 py-3 text-sm"
                                    rows={4}
                                    placeholder="Tell students about your expertise, teaching style, and achievements..."
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold">Subjects</label>
                                <Input
                                    name="subjects"
                                    required
                                    placeholder="Math, Physics, Chemistry"
                                    className="h-11"
                                />
                                <p className="mt-1 text-xs text-muted-foreground">Separate multiple subjects with commas.</p>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold">Categories</label>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map((category) => (
                                        <label
                                            key={category.id}
                                            className={`cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors ${selectedCategoryIds.includes(category.id)
                                                    ? "border-primary bg-primary text-primary-foreground"
                                                    : "border-input bg-background hover:bg-muted"
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={selectedCategoryIds.includes(category.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedCategoryIds([...selectedCategoryIds, category.id]);
                                                    } else {
                                                        setSelectedCategoryIds(selectedCategoryIds.filter((id) => id !== category.id));
                                                    }
                                                }}
                                            />
                                            {category.name}
                                        </label>
                                    ))}
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">Pick one or more categories that match your expertise.</p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold">Hourly Rate ($)</label>
                                    <Input
                                        name="hourlyRate"
                                        type="number"
                                        step="0.01"
                                        required
                                        placeholder="25.00"
                                        className="h-11"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold">Experience (years)</label>
                                    <Input
                                        name="experience"
                                        type="number"
                                        required
                                        placeholder="5"
                                        className="h-11"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold">Availability (optional)</label>
                                <textarea
                                    name="availability"
                                    className="w-full rounded-lg border px-4 py-3 text-sm"
                                    rows={3}
                                    placeholder="e.g., Mon-Fri 6PM-10PM, Sat 9AM-2PM"
                                />
                            </div>

                            <Button type="submit" disabled={loading} className="h-11 w-full text-base font-semibold">
                                {loading ? "Creating Profile..." : "Create Tutor Profile"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

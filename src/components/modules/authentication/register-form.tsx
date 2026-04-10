"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { useUser } from "@/lib/user-context";
import { useState, useEffect } from "react";
import { getApiBaseUrl } from "@/lib/api-url";

export function RegisterForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const { setUser } = useUser();
  const [selectedRole, setSelectedRole] = useState<"STUDENT" | "TUTOR">("STUDENT");
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    // Fetch categories for tutor registration
    const base = getApiBaseUrl();
    fetch(`${base}/api/categories`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCategories(data.data);
        }
      })
      .catch(() => console.error("Failed to load categories"));
  }, []);

  const handleGoogleSignIn = async () => {
    const toastId = toast.loading("Redirecting to Google...");
    setGoogleLoading(true);
    try {
      const response = await (authClient as any).signIn.social({
        provider: "google",
        callbackURL: "/",
        disableRedirect: true,
      });

      if (response?.error) {
        toast.error(response.error.message || "Google sign-in failed", { id: toastId });
        return;
      }

      const redirectUrl = response?.data?.url;
      if (redirectUrl) {
        toast.success("Opening Google sign-in...", { id: toastId });
        window.location.href = redirectUrl;
        return;
      }

      toast.error("Could not start Google sign-in", { id: toastId });
    } catch (error) {
      toast.error("Google sign-in failed. Please try again.", { id: toastId });
    } finally {
      setGoogleLoading(false);
    }
  };

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      bio: "",
      hourlyRate: "",
      experience: "",
    },
    onSubmit: async ({ value }) => {
      const toastId = toast.loading("Creating account...");
      try {
        // First, sign up the user
        const { data, error } = await authClient.signUp.email({
          name: value.name,
          email: value.email,
          password: value.password,
        });

        if (error) {
          toast.error(error.message, { id: toastId });
          return;
        }

        // Update phone number via API
        try {
          const base = getApiBaseUrl();
          const updateUrl = base.endsWith("/api") ? `${base}/user/update-phone` : `${base}/api/user/update-phone`;
          await fetch(updateUrl, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ phone: value.phone }),
          });
        } catch (err) {
          console.error("Failed to update phone:", err);
        }

        // If tutor role, create tutor profile
        if (selectedRole === "TUTOR") {
          try {
            const base = getApiBaseUrl();
            const tutorUrl = base.endsWith("/api") ? `${base}/tutors/become-tutor` : `${base}/api/tutors/become-tutor`;
            const tutorRes = await fetch(tutorUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                bio: value.bio,
                subjects: [], // No subjects, only categories
                hourlyRate: parseFloat(value.hourlyRate),
                experience: parseInt(value.experience),
                categoryIds: selectedCategoryIds,
              }),
            });

            if (!tutorRes.ok) {
              const errorData = await tutorRes.json();
              toast.error(errorData.message || "Failed to create tutor profile", { id: toastId });
              return;
            }
          } catch (err) {
            console.error("Failed to create tutor profile:", err);
            toast.error("Failed to create tutor profile", { id: toastId });
            return;
          }
        }

        // Fetch user data and update context
        try {
          const base = getApiBaseUrl();
          const url = base.endsWith("/api") ? `${base}/user/me` : `${base}/api/user/me`;
          const userRes = await fetch(url, { credentials: "include" });
          if (userRes.ok) {
            const userData = await userRes.json();
            setUser(userData.data);
          }
        } catch (err) {
          console.error("Failed to fetch user data:", err);
        }

        toast.success(selectedRole === "TUTOR" ? "Tutor account created successfully!" : "Account created successfully!", { id: toastId });
        router.push("/");
      } catch (err) {
        console.error("Registration error:", err);
        toast.error("Something went wrong. Please try again.", { id: toastId });
      }
    },
  });

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="register-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            {/* Role Selection */}
            <Field>
              <FieldLabel>Register as</FieldLabel>
              <div className="flex gap-4 mt-2">
                <label className={`flex-1 cursor-pointer rounded-lg border-2 p-4 text-center transition-all ${selectedRole === "STUDENT" ? "border-primary bg-primary/10" : "border-input"}`}>
                  <input
                    type="radio"
                    name="role"
                    value="STUDENT"
                    checked={selectedRole === "STUDENT"}
                    onChange={() => setSelectedRole("STUDENT")}
                    className="sr-only"
                  />
                  <div className="font-semibold">Student</div>
                  <div className="text-xs text-muted-foreground">Find tutors and book sessions</div>
                </label>
                <label className={`flex-1 cursor-pointer rounded-lg border-2 p-4 text-center transition-all ${selectedRole === "TUTOR" ? "border-primary bg-primary/10" : "border-input"}`}>
                  <input
                    type="radio"
                    name="role"
                    value="TUTOR"
                    checked={selectedRole === "TUTOR"}
                    onChange={() => setSelectedRole("TUTOR")}
                    className="sr-only"
                  />
                  <div className="font-semibold">Tutor</div>
                  <div className="text-xs text-muted-foreground">Share your knowledge</div>
                </label>
              </div>
            </Field>

            <form.Field
              name="name"
              validators={{
                onChange: ({ value }) => {
                  const result = z.string().min(1, "Name is required").safeParse(value);
                  return !result.success ? result.error.issues[0].message : undefined;
                },
              }}
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                    <Input
                      type="text"
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="John Doe"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
            <form.Field
              name="email"
              validators={{
                onChange: ({ value }) => {
                  const result = z.string().email("Invalid email address").safeParse(value);
                  return !result.success ? result.error.issues[0].message : undefined;
                },
              }}
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      type="email"
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="john@example.com"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
            <form.Field
              name="password"
              validators={{
                onChange: ({ value }) => {
                  const result = z.string().min(8, "Password must be at least 8 characters").safeParse(value);
                  return !result.success ? result.error.issues[0].message : undefined;
                },
              }}
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <Input
                      type="password"
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="••••••••"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />

            <form.Field
              name="phone"
              validators={{
                onChange: ({ value }) => {
                  const result = z.string().min(1, "Phone is required").safeParse(value);
                  return !result.success ? result.error.issues[0].message : undefined;
                },
              }}
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Phone</FieldLabel>
                    <Input
                      type="tel"
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />

            {/* Tutor-specific fields */}
            {selectedRole === "TUTOR" && (
              <>
                <form.Field
                  name="bio"
                  validators={{
                    onChange: ({ value }) => {
                      const result = z.string().min(10, "Bio must be at least 10 characters").safeParse(value);
                      return !result.success ? result.error.issues[0].message : undefined;
                    },
                  }}
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Bio</FieldLabel>
                        <textarea
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Tell students about your teaching experience..."
                          className="w-full rounded-md border px-3 py-2 min-h-[80px]"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />

                <Field>
                  <FieldLabel>Categories</FieldLabel>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {categories.map((category) => (
                      <label
                        key={category.id}
                        className={`cursor-pointer rounded-full px-4 py-2 text-sm border transition-colors ${
                          selectedCategoryIds.includes(category.id)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background hover:bg-muted border-input"
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
                              setSelectedCategoryIds(selectedCategoryIds.filter(id => id !== category.id));
                            }
                          }}
                        />
                        {category.name}
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Select categories that match your expertise</p>
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <form.Field
                    name="hourlyRate"
                    validators={{
                      onChange: ({ value }) => {
                        const result = z.string().min(1, "Hourly rate is required").safeParse(value);
                        return !result.success ? result.error.issues[0].message : undefined;
                      },
                    }}
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>Hourly Rate ($)</FieldLabel>
                          <Input
                            type="number"
                            step="0.01"
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="25.00"
                          />
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      );
                    }}
                  />

                  <form.Field
                    name="experience"
                    validators={{
                      onChange: ({ value }) => {
                        const result = z.string().min(1, "Experience is required").safeParse(value);
                        return !result.success ? result.error.issues[0].message : undefined;
                      },
                    }}
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>Experience (years)</FieldLabel>
                          <Input
                            type="number"
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="5"
                          />
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      );
                    }}
                  />
                </div>
              </>
            )}
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
        >
          {googleLoading ? "Connecting..." : "Continue with Google"}
        </Button>
        <div className="flex w-full items-center gap-2 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          <span>or continue with email</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <Button form="register-form" type="submit" className="w-full">
          {selectedRole === "TUTOR" ? "Create Tutor Account" : "Create Account"}
        </Button>
        <p className="px-8 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <a
            href="/login"
            className="underline underline-offset-4 hover:text-primary"
          >
            Sign in
          </a>
        </p>
      </CardFooter>
    </Card>
  );
}

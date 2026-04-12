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
import { Eye, EyeOff } from "lucide-react";

const debugError = (...args: unknown[]) => {
  if (process.env.NODE_ENV !== "production") {
    console.error(...args);
  }
};

export function RegisterForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const { setUser } = useUser();
  const [selectedRole, setSelectedRole] = useState<"STUDENT" | "TUTOR">("STUDENT");
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      .catch(() => debugError("Failed to load categories"));

    if (typeof window !== "undefined" && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const error = params.get("error");
      const socialError = params.get("socialError");

      if (error === "state_mismatch") {
        toast.error("Google sign-in expired or was interrupted. Please try again.");
      } else if (socialError || error) {
        toast.error("Google sign-in failed. Please try again.");
      }

      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const handleGoogleSignIn = async () => {
    const toastId = toast.loading("Redirecting to Google...");
    setGoogleLoading(true);
    try {
      const appBaseUrl = window.location.origin;
      const callbackURL = `${appBaseUrl}/dashboard`;
      const errorCallbackURL = `${appBaseUrl}/register?socialError=google`;

      const response = await (authClient as any).signIn.social({
        provider: "google",
        callbackURL,
        errorCallbackURL,
      });

      if (response?.error) {
        toast.error(response.error.message || "Google sign-in failed", { id: toastId });
      } else {
        toast.success("Opening Google sign-in...", { id: toastId });
      }
    } catch {
      toast.error("Google sign-in failed. Please try again.", { id: toastId });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    const toastId = toast.loading("Redirecting to Facebook...");
    setFacebookLoading(true);
    try {
      const appBaseUrl = window.location.origin;
      const callbackURL = `${appBaseUrl}/dashboard`;
      const errorCallbackURL = `${appBaseUrl}/register?socialError=facebook`;

      const response = await (authClient as any).signIn.social({
        provider: "facebook",
        callbackURL,
        errorCallbackURL,
      });

      if (response?.error) {
        toast.error(response.error.message || "Facebook sign-in failed", { id: toastId });
      } else {
        toast.success("Opening Facebook sign-in...", { id: toastId });
      }
    } catch {
      toast.error("Facebook sign-in failed. Please try again.", { id: toastId });
    } finally {
      setFacebookLoading(false);
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
          debugError("Failed to update phone:", err);
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
            debugError("Failed to create tutor profile:", err);
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
          debugError("Failed to fetch user data:", err);
        }

        toast.success(selectedRole === "TUTOR" ? "Tutor account created successfully!" : "Account created successfully!", { id: toastId });
        router.push("/");
      } catch (err) {
        debugError("Registration error:", err);
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
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="••••••••"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
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
                          className="w-full min-h-20 rounded-md border px-3 py-2"
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
                        className={`cursor-pointer rounded-full px-4 py-2 text-sm border transition-colors ${selectedCategoryIds.includes(category.id)
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
        <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="mr-2 h-4 w-4"
            >
              <path
                d="M23.52 12.27c0-.79-.07-1.54-.2-2.27H12v4.31h6.47a5.54 5.54 0 0 1-2.4 3.64v3.02h3.88c2.27-2.09 3.57-5.17 3.57-8.7z"
                fill="#4285F4"
              />
              <path
                d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.88-3.02c-1.07.72-2.44 1.15-4.05 1.15-3.11 0-5.74-2.1-6.68-4.93H1.32v3.1A12 12 0 0 0 12 24z"
                fill="#34A853"
              />
              <path
                d="M5.32 14.3A7.2 7.2 0 0 1 4.95 12c0-.8.14-1.56.37-2.3V6.6H1.32A12 12 0 0 0 0 12c0 1.94.46 3.78 1.32 5.4l4-3.1z"
                fill="#FBBC05"
              />
              <path
                d="M12 4.77c1.76 0 3.33.6 4.57 1.77l3.42-3.42A11.98 11.98 0 0 0 12 0 12 12 0 0 0 1.32 6.6l4 3.1c.94-2.83 3.57-4.93 6.68-4.93z"
                fill="#EA4335"
              />
            </svg>
            {googleLoading ? "Connecting..." : "Google"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleFacebookSignIn}
            disabled={facebookLoading}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="mr-2 h-4 w-4" fill="#1877F2">
              <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073c0 6.016 4.388 11.003 10.125 11.927v-8.437H7.078v-3.49h3.047V9.413c0-3.017 1.792-4.685 4.533-4.685 1.313 0 2.686.236 2.686.236v2.962h-1.513c-1.491 0-1.956.93-1.956 1.885v2.262h3.328l-.532 3.49h-2.796V24C19.612 23.076 24 18.089 24 12.073z" />
            </svg>
            {facebookLoading ? "Connecting..." : "Facebook"}
          </Button>
        </div>
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

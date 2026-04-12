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
import { useEffect, useState } from "react";
import { getApiBaseUrl } from "@/lib/api-url";
import { Eye, EyeOff } from "lucide-react";

const debugError = (...args: unknown[]) => {
  if (process.env.NODE_ENV !== "production") {
    console.error(...args);
  }
};

export function LoginForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const { setUser } = useUser();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Surface OAuth errors on return, then clean URL query parameters.
  useEffect(() => {
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
      const errorCallbackURL = `${appBaseUrl}/login?socialError=google`;

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
      const errorCallbackURL = `${appBaseUrl}/login?socialError=facebook`;

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
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      const toastId = toast.loading("Signing in...");
      try {
        const { data, error } = await authClient.signIn.email({
          email: value.email,
          password: value.password,
        });

        if (error) {
          toast.error(error.message, { id: toastId });
          return;
        }

        // Store token in localStorage if present
        if (data && data.token) {
          localStorage.setItem("token", data.token);
        }

        // Fetch user data and update context immediately
        try {
          const base = getApiBaseUrl();
          const url = base.endsWith("/api") ? `${base}/user/me` : `${base}/api/user/me`;
          const userRes = await fetch(url, { credentials: "include" });
          if (userRes.status === 403) {
            // User is banned
            const userData = await userRes.json();
            toast.error(userData.message || "Your account has been banned", { id: toastId });
            await authClient.signOut({ fetchOptions: { credentials: 'include' } });
            return;
          }
          if (userRes.ok) {
            const userData = await userRes.json();
            setUser(userData.data);
          }
        } catch (err) {
          debugError("Failed to fetch user data:", err);
        }

        toast.success("Signed in successfully!", { id: toastId });
        router.push("/");
      } catch (err) {
        debugError("Login error:", err);
        toast.error("Something went wrong. Please try again.", { id: toastId });
      }
    },
  });

  const fillDemoCredentials = (type: "student" | "admin" | "tutor") => {
    const demoStudentEmail =
      process.env.NEXT_PUBLIC_DEMO_STUDENT_EMAIL || "student.demo@skillbridge.com";
    const demoStudentPassword =
      process.env.NEXT_PUBLIC_DEMO_STUDENT_PASSWORD || "DemoUser123!";
    const demoAdminEmail =
      process.env.NEXT_PUBLIC_DEMO_ADMIN_EMAIL || "admin.demo@skillbridge.com";
    const demoAdminPassword =
      process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD || "DemoAdmin123!";
    const demoTutorEmail =
      process.env.NEXT_PUBLIC_DEMO_TUTOR_EMAIL || "tutor.demo@skillbridge.com";
    const demoTutorPassword =
      process.env.NEXT_PUBLIC_DEMO_TUTOR_PASSWORD || "DemoTutor123!";

    if (type === "admin") {
      form.setFieldValue("email", demoAdminEmail);
      form.setFieldValue("password", demoAdminPassword);
      return;
    }

    if (type === "tutor") {
      form.setFieldValue("email", demoTutorEmail);
      form.setFieldValue("password", demoTutorPassword);
      return;
    }

    form.setFieldValue("email", demoStudentEmail);
    form.setFieldValue("password", demoStudentPassword);
  };

  return (
    <Card className="border-border/80 bg-card/95 shadow-xl backdrop-blur" {...props}>
      <CardHeader>
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>
          Enter your credentials to sign in to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="login-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field
              name="email"
              validators={{
                onChange: ({ value }) => {
                  const result = z.string().email("Invalid email address").safeParse(value);
                  if (!result.success) {
                    return result.error.issues[0].message;
                  }
                  return undefined;
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
                  const result = z.string().min(1, "Password is required").safeParse(value);
                  if (!result.success) {
                    return result.error.issues[0].message;
                  }
                  return undefined;
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
        <Button form="login-form" type="submit" className="w-full">
          Sign In
        </Button>
        <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3">
          <Button type="button" variant="secondary" onClick={() => fillDemoCredentials("student")}>
            Demo Student
          </Button>
          <Button type="button" variant="secondary" onClick={() => fillDemoCredentials("tutor")}>
            Demo Tutor
          </Button>
          <Button type="button" variant="secondary" onClick={() => fillDemoCredentials("admin")}>
            Demo Admin
          </Button>
        </div>
        <p className="rounded-md border border-dashed bg-muted/40 px-3 py-2 text-center text-xs text-muted-foreground">
          Click a demo role to autofill valid seeded credentials.
        </p>
        <p className="px-8 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <a
            href="/register"
            className="underline underline-offset-4 hover:text-primary"
          >
            Sign up
          </a>
        </p>
      </CardFooter>
    </Card>
  );
}

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

export function LoginForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const { setUser } = useUser();
  const [googleLoading, setGoogleLoading] = useState(false);

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
      const callbackURL = `${window.location.origin}/dashboard`;
      const errorCallbackURL = `${window.location.origin}/login?socialError=google`;

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
    } catch (error) {
      toast.error("Google sign-in failed. Please try again.", { id: toastId });
    } finally {
      setGoogleLoading(false);
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
          console.error("Failed to fetch user data:", err);
        }

        toast.success("Signed in successfully!", { id: toastId });
        router.push("/");
      } catch (err) {
        console.error("Login error:", err);
        toast.error("Something went wrong. Please try again.", { id: toastId });
      }
    },
  });

  const fillDemoCredentials = (type: "user" | "admin") => {
    const demoUserEmail =
      process.env.NEXT_PUBLIC_DEMO_USER_EMAIL || "student.demo@skillbridge.com";
    const demoUserPassword =
      process.env.NEXT_PUBLIC_DEMO_USER_PASSWORD || "DemoUser123!";
    const demoAdminEmail =
      process.env.NEXT_PUBLIC_DEMO_ADMIN_EMAIL || "admin.demo@skillbridge.com";
    const demoAdminPassword =
      process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD || "DemoAdmin123!";

    if (type === "admin") {
      form.setFieldValue("email", demoAdminEmail);
      form.setFieldValue("password", demoAdminPassword);
      return;
    }

    form.setFieldValue("email", demoUserEmail);
    form.setFieldValue("password", demoUserPassword);
  };

  return (
    <Card {...props}>
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
        <Button form="login-form" type="submit" className="w-full">
          Sign In
        </Button>
        <div className="grid w-full grid-cols-2 gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => fillDemoCredentials("user")}
          >
            Demo User
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => fillDemoCredentials("admin")}
          >
            Demo Admin
          </Button>
        </div>
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

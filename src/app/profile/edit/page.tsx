"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import LoadingButton from "@/components/LoadingButton";
import { apiFetch } from "@/lib/apiFetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getApiBaseUrl } from "@/lib/api-url";

export default function EditProfilePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", phone: "", image: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const base = getApiBaseUrl();
    const url = base.endsWith("/api") ? `${base}/students/profile` : `${base}/api/students/profile`;
    fetch(url, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setFormData({
            name: data.data.name || "",
            phone: data.data.phone || "",
            image: data.data.image || "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    // basic validation
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (formData.image && !/^https?:\/\/.+/.test(formData.image)) {
      toast.error("Profile Image URL must be a valid http(s) URL");
      return;
    }

    try {
      const base = getApiBaseUrl();
      const url = base.endsWith("/api") ? `${base}/students/profile` : `${base}/api/students/profile`;
      const data = await apiFetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      if (data.success) {
        toast.success("Profile updated!");
        router.push("/profile");
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to update profile");
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="sb-page">
      <div className="sb-container max-w-3xl space-y-6">
        <h1 className="sb-title">Edit Profile</h1>
        <Card>
          <CardHeader>
            <CardTitle>Update Your Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="phone">Phone</FieldLabel>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="image">Profile Image URL</FieldLabel>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  />
                </Field>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <LoadingButton onClick={handleSubmit} className="w-full sm:flex-1">Save</LoadingButton>
                  <Button type="button" variant="outline" className="w-full sm:flex-1" onClick={() => router.push("/profile")}>
                    Cancel
                  </Button>
                </div>
              </FieldGroup>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

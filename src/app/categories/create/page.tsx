"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createCategory } from "@/lib/category-api";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


export default function CreateCategoryPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: any) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await createCategory({ name, description });
      setSuccess("Category created!");
      setName("");
      setDescription("");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sb-page">
      <div className="sb-container max-w-2xl">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Category</CardTitle>
        </CardHeader>
        <form onSubmit={handleCreate}>
          <CardContent className="space-y-4">
            <Input value={name} onChange={e=>setName(e.target.value)} placeholder="Category name" required />
            <Input value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description (optional)" />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">{success}</div>}
          </CardContent>
          <CardFooter className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" className="w-full sm:w-auto" disabled={loading || !name}>{loading ? "Creating..." : "Create"}</Button>
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => router.push("/categories")}>Back to Categories</Button>
          </CardFooter>
        </form>
      </Card>
      </div>
    </div>
  );
}
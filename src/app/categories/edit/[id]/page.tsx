"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getAllCategories, updateCategory } from "@/lib/category-api";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function EditCategoryPage() {
  const router = useRouter();
  const { id } = useParams();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [init, setInit] = useState(false);

  useEffect(() => {
    getAllCategories().then((res) => {
      const cats = Array.isArray(res) ? res : res.data;
      const cat = cats.find((c: any) => c.id === id);
      if (cat) {
        setName(cat.name);
        setDescription(cat.description || "");
      }
      setInit(true);
    });
  }, [id]);

  const handleUpdate = async (e: any) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await updateCategory(id as string, { name, description });
      setSuccess("Category updated!");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!init) return <div className="flex min-h-50 items-center justify-center">Loading...</div>;

  return (
    <div className="sb-page">
      <div className="sb-container max-w-2xl">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle>Edit Category</CardTitle>
        </CardHeader>
        <form onSubmit={handleUpdate}>
          <CardContent className="space-y-4">
            <Input value={name} onChange={e=>setName(e.target.value)} placeholder="Category name" required />
            <Input value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description (optional)" />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">{success}</div>}
          </CardContent>
          <CardFooter className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" className="w-full sm:w-auto" disabled={loading || !name}>{loading ? "Saving..." : "Save"}</Button>
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => router.push("/categories")}>Back to Categories</Button>
          </CardFooter>
        </form>
      </Card>
      </div>
    </div>
  );
}
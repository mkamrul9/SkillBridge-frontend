"use client";
import { getAllCategories, deleteCategory } from "@/lib/category-api";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/user-context";


export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useUser();
  const router = useRouter();

  const loadCategories = () => {
    setLoading(true);
    getAllCategories()
      .then((res) => {
        if (Array.isArray(res)) setCategories(res);
        else if (res && Array.isArray(res.data)) setCategories(res.data);
        else setCategories([]);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    loadCategories();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await deleteCategory(id);
      loadCategories();
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-[200px]">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">Error: {error}</div>;

  return (
    <div className="sb-page">
      <div className="sb-container">
      <div className="sb-header mb-4">
        <h1 className="sb-title">Categories</h1>
        {user?.role === "ADMIN" && (
          <Button onClick={() => router.push("/categories/create")}>Create Category</Button>
        )}
      </div>
      <Card className="border-border/80 bg-card/95">
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-muted-foreground">No categories found.</div>
          ) : (
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat.id} className="border-b last:border-b-0 py-2 text-base flex items-center justify-between">
                  <div>
                    <div className="font-medium">{cat.name}</div>
                    {cat.description && <div className="text-sm text-muted-foreground">{cat.description}</div>}
                  </div>
                  {user?.role === "ADMIN" && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => router.push(`/categories/edit/${cat.id}`)}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(cat.id)}>Delete</Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

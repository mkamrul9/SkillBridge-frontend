"use client";
import { getAllCategories, deleteCategory } from "@/lib/category-api";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/user-context";
import { useConfirm } from "@/components/confirm-provider";


export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const { user } = useUser();
  const router = useRouter();
  const { confirm } = useConfirm();

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
    const approved = await confirm({
      title: "Delete category",
      message: "Are you sure you want to delete this category?",
      confirmText: "Delete",
      variant: "destructive",
    });
    if (!approved) return;
    try {
      await deleteCategory(id);
      loadCategories();
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-50">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">Error: {error}</div>;

  const totalPages = Math.max(1, Math.ceil(categories.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedCategories = categories.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="sb-page">
      <div className="sb-container">
        <section className="sb-hero">
          <div className="sb-header">
            <div className="space-y-2">
              <span className="sb-pill">Learning Catalog</span>
              <h1 className="sb-title">Categories</h1>
              <p className="sb-subtle">Discover and manage learning areas available on the platform.</p>
            </div>
            {user?.role === "ADMIN" && (
              <Button onClick={() => router.push("/categories/create")}>Create Category</Button>
            )}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Card className="bg-card/95">
              <CardContent className="pt-6">
                <p className="sb-subtle">Total Categories</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </CardContent>
            </Card>
            <Card className="bg-card/95 sm:col-span-2">
              <CardContent className="pt-6">
                <p className="sb-subtle">Tip</p>
                <p className="text-sm text-foreground/90">Use clear names and short descriptions so students can find the right tutors faster.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pagedCategories.map((cat) => (
            <Card key={cat.id} className="border-border/80 bg-card/95 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-xl flex items-center justify-between">
                  <span>{cat.name}</span>
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">Category</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{cat.description || "No description provided."}</p>
                {user?.role === "ADMIN" && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => router.push(`/categories/edit/${cat.id}`)}>Edit</Button>
                    <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleDelete(cat.id)}>Delete</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex flex-col items-center justify-between gap-3 rounded-xl border bg-card/80 px-4 py-3 sm:flex-row">
          <p className="text-sm text-muted-foreground">Page {safePage} of {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
            <Button variant="outline" size="sm" disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
          </div>
        </div>
        {categories.length === 0 && (
          <Card className="border-border/80 bg-card/95">
            <CardContent className="py-8 text-center text-muted-foreground">No categories found.</CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

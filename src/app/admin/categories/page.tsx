"use client";
import { useEffect, useState } from "react";
import { getAllCategories, updateCategory, deleteCategory } from "@/lib/category-api";
import { useConfirm } from "@/components/confirm-provider";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState("");
  const { confirm } = useConfirm();

  const load = () => getAllCategories().then(setCategories).catch(e => setError(e.message));
  useEffect(() => { load(); }, []);

  const handleUpdate = async (id: string) => {
    try {
      await updateCategory(id, { name: editName });
      setEditId(null); setEditName("");
      load();
    } catch (e: any) { setError(e.message); }
  };

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
      load();
    } catch (e: any) { setError(e.message); }
  };

  return (
    <div>
      <h1>Admin: Categories</h1>
      {error && <div style={{color:'red'}}>{error}</div>}
      <ul>
        {categories.map(cat => (
          <li key={cat.id}>
            {editId === cat.id ? (
              <>
                <input value={editName} onChange={e=>setEditName(e.target.value)} />
                <button onClick={()=>handleUpdate(cat.id)}>Save</button>
                <button onClick={()=>{setEditId(null);setEditName("")}}>Cancel</button>
              </>
            ) : (
              <>
                {cat.name}
                <button onClick={()=>{setEditId(cat.id);setEditName(cat.name)}}>Edit</button>
                <button onClick={()=>handleDelete(cat.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

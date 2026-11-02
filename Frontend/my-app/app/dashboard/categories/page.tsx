
"use client";

import { instance } from "@/api/api";
import { useEffect, useState } from "react";

type Category = {
  id: number;
  name: string;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load existing categories from Django when the page opens
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await instance.get("/api/categories/");
        setCategories(response.data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setError("Failed to load categories.");
      }
    };

    fetchCategories();
  }, []);

  const addCategories = async () => {
    const name = category.trim();

    if (!name) {
      setError("Please enter a category name.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await instance.post("/api/categories/", {
        name,
      });

      // Add the newly created category to the existing array
      setCategories((prev) => [...prev, response.data]);

      // Clear the input after successful creation
      setCategory("");
    } catch (error) {
      console.error("Failed to add category:", error);
      setError("Failed to add category. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white md:p-10">
      <h1 className="mb-2 text-3xl font-bold">Categories</h1>
      <p className="mb-8 text-sm text-slate-400">
        Organize and manage your inventory categories.
      </p>

      <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-lg font-semibold">Add Category</h2>

        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading) {
              void addCategories();
            }
          }}
          placeholder="Category name"
          className="mt-6 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
        />

        <button
          type="button"
          onClick={() => void addCategories()}
          disabled={loading}
          className="mt-5 rounded-xl bg-indigo-500 px-6 py-3 font-semibold text-white hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Category"}
        </button>

        {error && (
          <p className="mt-3 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>

      <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <p className="text-sm text-slate-400">Total Categories</p>
        <p className="mt-3 text-3xl font-bold">{categories.length}</p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        <div className="border-b border-slate-800 p-5">
          <h2 className="text-lg font-semibold">All Categories</h2>
          <p className="mt-1 text-sm text-slate-400">
            {categories.length} categories available
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/60 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">Category</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {categories.length === 0 ? (
                <tr>
                  <td className="px-6 py-12 text-center text-slate-400">
                    No categories available yet.
                  </td>
                </tr>
              ) : (
                categories.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 font-semibold text-indigo-400">
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{item.name}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { instance } from "../../../api/api";

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  category: number;
  name: string;
  description: string;
  purchase_price: string;
  selling_price: string;
  minimum_stock: number;
  created_at: string;
  updated_at: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [minimumStock, setMinimumStock] = useState("5");

  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      const [productData, categoryData] = await Promise.all([
        instance.get<Product[]>("/api/products/"),
        instance.get<Category[]>("/api/categories/"),
      ]);

      setProducts(productData.data);
      setCategories(categoryData.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function addProduct() {
    if (
      !name ||
      !category ||
      !purchasePrice ||
      !sellingPrice
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    if (Number(sellingPrice) < Number(purchasePrice)) {
      alert(
        "Selling price cannot be lower than purchase price."
      );
      return;
    }

    try {
      await instance.post("/api/products/", {
        category: Number(category),
        name,
        description,
        purchase_price: purchasePrice,
        selling_price: sellingPrice,
        minimum_stock: Number(minimumStock),
      });
    } catch (error) {
      console.error(error);
      setName("");
      setCategory("");
      setDescription("");
      setPurchasePrice("");
      setSellingPrice("");
      setMinimumStock("5");

      loadData();
      alert("Could not create product.");
    }

  }

  async function deleteProduct(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      await instance.delete(`/api/products/${id}/`);

      loadData();

    } catch (error) {
      console.error(error);
      alert("Could not delete product.");
    }
  }

  function getCategoryName(categoryId: number) {
    return (
      categories.find(
        (category) => category.id === categoryId
      )?.name || "Unknown"
    );
  }

  return (
    <div className="p-8">

      <div className="mb-8">
        <p className="text-sm uppercase tracking-widest text-indigo-400">
          Management
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Products
        </h1>

        <p className="mt-2 text-slate-400">
          Manage the products available in your shop.
        </p>
      </div>

      {/* FORM */}

      <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

        <h2 className="text-lg font-semibold">
          Add Product
        </h2>

        <div className="mt-6 grid gap-4 md:grid-cols-2">

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Product name"
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
          >
            <option value="">
              Select category
            </option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500 md:col-span-2"
            rows={3}
          />

          <input
            type="number"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            placeholder="Purchase price"
            min="0"
            step="0.01"
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
          />

          <input
            type="number"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            placeholder="Selling price"
            min="0"
            step="0.01"
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
          />

          <input
            type="number"
            value={minimumStock}
            onChange={(e) => setMinimumStock(e.target.value)}
            placeholder="Minimum stock"
            min="0"
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
          />

        </div>

        <button
          onClick={addProduct}
          className="mt-5 rounded-xl bg-indigo-500 px-6 py-3 font-semibold text-white hover:bg-indigo-600"
        >
          Add Product
        </button>

      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

        <div className="border-b border-slate-800 p-6">
          <h2 className="text-lg font-semibold">
            Product List
          </h2>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-slate-950">
              <tr>

                <th className="px-6 py-4 text-left text-sm text-slate-400">
                  Product
                </th>

                <th className="px-6 py-4 text-left text-sm text-slate-400">
                  Category
                </th>

                <th className="px-6 py-4 text-left text-sm text-slate-400">
                  Purchase
                </th>

                <th className="px-6 py-4 text-left text-sm text-slate-400">
                  Selling
                </th>

                <th className="px-6 py-4 text-left text-sm text-slate-400">
                  Min Stock
                </th>

                <th className="px-6 py-4 text-right text-sm text-slate-400">
                  Action
                </th>

              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-slate-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : products.map((product) => (
                <tr
                  key={product.id}
                  className="border-t border-slate-800"
                >

                  <td className="px-6 py-4">
                    <p className="font-medium text-white">
                      {product.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      #{product.id}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-slate-400">
                    {getCategoryName(product.category)}
                  </td>

                  <td className="px-6 py-4 text-slate-300">
                    Rs {product.purchase_price}
                  </td>

                  <td className="px-6 py-4 font-medium text-white">
                    Rs {product.selling_price}
                  </td>

                  <td className="px-6 py-4">
                    <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300">
                      {product.minimum_stock}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">

                    <button
                      onClick={() =>
                        deleteProduct(product.id)
                      }
                      className="text-sm text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>

                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { instance } from "../../api/api";

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  purchase_price: string;
  selling_price: string;
  minimum_stock: number;
}

interface Supplier {
  id: number;
  name: string;
}

export default function DashboardPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [categoryData, productData, supplierData] =
          await Promise.all([
            instance.get<Category[]>("/api/categories/"),
            instance.get<Product[]>("/api/products/"),
            instance.get<Supplier[]>("/api/suppliers/"),
          ]);

        setCategories(categoryData.data);
        setProducts(productData.data);
        setSuppliers(supplierData.data);
      } catch (error) {
        console.error(error);
      }
    }

    loadData();
  }, []);

  const cards = [
    {
      title: "Categories",
      value: categories.length,
      description: "Product categories",
      icon: "▤",
    },
    {
      title: "Products",
      value: products.length,
      description: "Products registered",
      icon: "□",
    },
    {
      title: "Suppliers",
      value: suppliers.length,
      description: "Active suppliers",
      icon: "♙",
    },
  ];

  return (
    <div className="p-8">

      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-widest text-indigo-400">
          Overview
        </p>

        <h1 className="mt-2 text-3xl font-bold text-white">
          Inventory Dashboard
        </h1>

        <p className="mt-2 text-slate-400">
          Manage your shop products, categories and suppliers.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">

        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
          >
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-400">
                  {card.title}
                </p>

                <p className="mt-2 text-3xl font-bold text-white">
                  {card.value}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  {card.description}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-xl text-indigo-400">
                {card.icon}
              </div>

            </div>
          </div>
        ))}

      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <h2 className="text-lg font-semibold text-white">
            Products
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Recently registered products
          </p>

          <div className="mt-6 space-y-3">

            {products.slice(0, 5).map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between rounded-xl bg-slate-950 p-4"
              >
                <div>
                  <p className="font-medium text-white">
                    {product.name}
                  </p>

                  <p className="text-xs text-slate-500">
                    Selling price: Rs {product.selling_price}
                  </p>
                </div>

                <span className="text-sm text-slate-400">
                  Min: {product.minimum_stock}
                </span>
              </div>
            ))}

          </div>

        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <h2 className="text-lg font-semibold text-white">
            Suppliers
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your registered suppliers
          </p>

          <div className="mt-6 space-y-3">

            {suppliers.slice(0, 5).map((supplier) => (
              <div
                key={supplier.id}
                className="rounded-xl bg-slate-950 p-4"
              >
                <p className="font-medium text-white">
                  {supplier.name}
                </p>
              </div>
            ))}

          </div>

        </div>

      </div>

    </div>
  );
}
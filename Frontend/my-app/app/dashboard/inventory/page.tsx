
"use client";

import { useEffect, useState } from "react";
import { instance } from "@/api/api";

interface Inventory {
  id: number;
  product: number;
  product_name: string;
  quantity: number;
  updated_at: string;
}

type StockAction = "INCREASE" | "DECREASE";

export default function InventoryPage() {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  async function fetchInventory() {
    try {
      setLoading(true);
      setError("");

      const response = await instance.get("api/inventory/");

      setInventory(response.data.results || response.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load inventory."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInventory();
  }, []);

  async function handleStockUpdate(
    inventoryId: number,
    action: StockAction
  ) {
    try {
      setUpdatingId(inventoryId);
      setError("");

      const response = await instance.post(
        `api/inventory/${inventoryId}/update-stock/`,
        {
          action,
          amount: 1,
        }
      );

      const updatedInventory: Inventory = response.data.inventory;

      setInventory((previousInventory) =>
        previousInventory.map((item) =>
          item.id === inventoryId ? updatedInventory : item
        )
      );

    } catch (err: unknown) {
      const errorMessage =
        typeof err === "object" && err !== null && "response" in err
          ? (
              err as {
                response?: {
                  data?: { error?: string | string[]; detail?: string };
                };
              }
            ).response?.data?.error
          : undefined;

      setError(
        Array.isArray(errorMessage)
          ? errorMessage.join(", ")
          : errorMessage || (
              err instanceof Error
                ? err.message
                : "Unable to update stock."
            )
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const totalStock = inventory.reduce(
    (total, item) => total + item.quantity,
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 text-center text-slate-400">
        Loading inventory...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">

      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">

          <div>
            <p className="text-sm uppercase tracking-widest text-indigo-400">
              Management
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Inventory Management
            </h1>

            <p className="mt-2 text-slate-400">
              Monitor and manage your product stock quantities.
            </p>
          </div>

          <button
            onClick={fetchInventory}
            className="rounded-xl bg-indigo-500 px-5 py-3 font-semibold text-white transition hover:bg-indigo-600"
          >
            Refresh
          </button>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Statistics */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              Total products tracked
            </p>

            <p className="mt-3 text-3xl font-bold text-white">
              {inventory.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              Total stock quantity
            </p>

            <p className="mt-3 text-3xl font-bold text-white">
              {totalStock}
            </p>
          </div>

        </div>

        {/* Inventory Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

          <div className="border-b border-slate-800 p-6">
            <h2 className="text-lg font-semibold">
              Stock Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              View and update the current stock of your products.
            </p>
          </div>

          {inventory.length === 0 ? (
            <p className="p-10 text-center text-slate-500">
              No inventory records found.
            </p>
          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-slate-950">
                  <tr>

                    <th className="px-6 py-4 text-left text-sm text-slate-400">
                      Product ID
                    </th>

                    <th className="px-6 py-4 text-left text-sm text-slate-400">
                      Product
                    </th>

                    <th className="px-6 py-4 text-left text-sm text-slate-400">
                      Quantity
                    </th>

                    <th className="px-6 py-4 text-left text-sm text-slate-400">
                      Last Updated
                    </th>

                    <th className="px-6 py-4 text-left text-sm text-slate-400">
                      Manage Stock
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {inventory.map((item) => (

                    <tr
                      key={item.id}
                      className="border-t border-slate-800 transition hover:bg-slate-800/40"
                    >

                      <td className="px-6 py-4 font-medium text-slate-300">
                        #{item.product}
                      </td>

                      <td className="px-6 py-4 font-medium text-white">
                        {item.product_name}
                      </td>

                      {/* Quantity */}
                      <td className="px-6 py-4">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            item.quantity === 0
                              ? "bg-red-500/10 text-red-400"
                              : item.quantity <= 5
                              ? "bg-yellow-500/10 text-yellow-400"
                              : "bg-green-500/10 text-green-400"
                          }`}
                        >
                          {item.quantity}
                        </span>

                      </td>

                      {/* Last Updated */}
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {new Date(item.updated_at).toLocaleString()}
                      </td>

                      {/* Increase / Decrease */}
                      <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                          {/* Decrease */}
                          <button
                            onClick={() =>
                              handleStockUpdate(item.id, "DECREASE")
                            }
                            disabled={
                              updatingId === item.id ||
                              item.quantity === 0
                            }
                            title="Decrease stock"
                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10 text-lg font-bold text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            −
                          </button>

                          {/* Increase */}
                          <button
                            onClick={() =>
                              handleStockUpdate(item.id, "INCREASE")
                            }
                            disabled={updatingId === item.id}
                            title="Increase stock"
                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/10 text-lg font-bold text-green-400 transition hover:bg-green-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            +
                          </button>

                          {updatingId === item.id && (
                            <span className="text-xs text-slate-500">
                              Updating...
                            </span>
                          )}

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>

    </main>
  );
}

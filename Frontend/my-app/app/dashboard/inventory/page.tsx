
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
      // console.log("INVENTORY API RESPONSE:", response.data);

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

  // Increase or decrease stock
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

      // Update the inventory state without refreshing the page
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
      <div className="p-8 text-center">
        Loading inventory...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Inventory Management
            </h1>

            <p className="mt-2 text-gray-600">
              Monitor and manage your product stock quantities.
            </p>
          </div>

          <button
            onClick={fetchInventory}
            className="rounded-lg bg-gray-800 px-4 py-2 text-white hover:bg-gray-700"
          >
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Statistics */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2">

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Total products tracked
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {inventory.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Total stock quantity
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {totalStock}
            </p>
          </div>

        </div>

        {/* Inventory Table */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">

          <div className="border-b p-5">
            <h2 className="text-xl font-semibold text-gray-900">
              Stock Overview
            </h2>
          </div>

          {inventory.length === 0 ? (
            <p className="p-8 text-center text-gray-500">
              No inventory records found.
            </p>
          ) : (

            <div className="overflow-x-auto">
              <table className="w-full text-left">

                <thead className="bg-gray-100 text-sm text-gray-600">
                  <tr>
                    <th className="p-4">Product ID</th>
                    <th className="p-4">Product</th>
                    <th className="p-4">Quantity</th>
                    <th className="p-4">Last Updated</th>
                    <th className="p-4">Manage Stock</th>
                  </tr>
                </thead>

                <tbody>
                  {inventory.map((item) => (

                    <tr
                      key={item.id}
                      className="border-t hover:bg-gray-50"
                    >

                      <td className="p-4 font-medium text-gray-900">
  {item.product}
</td>

                      <td className="p-4 font-medium text-gray-900">
                        {item.product_name}
                      </td>

                      {/* Quantity */}
                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-medium ${
                            item.quantity === 0
                              ? "bg-red-100 text-red-700"
                              : item.quantity <= 5
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {item.quantity}
                        </span>
                      </td>

                      <td className="p-4 text-sm text-gray-500">
                        {new Date(item.updated_at).toLocaleString()}
                      </td>

                      {/* Increase / Decrease */}
                      <td className="p-4">

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
                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-lg font-bold text-red-700 transition hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-40"
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
                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 text-lg font-bold text-green-700 transition hover:bg-green-200 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            +
                          </button>

                          {updatingId === item.id && (
                            <span className="text-xs text-gray-500">
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

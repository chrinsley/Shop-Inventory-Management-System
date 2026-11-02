"use client";

import { useEffect, useState } from "react";
import { instance } from "../../../api/api";

interface Supplier {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  created_at: string;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(true);

  async function loadSuppliers() {
    try {
      const data = await instance.get<Supplier[]>("/api/suppliers/");

      setSuppliers(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSuppliers();
  }, []);

  async function addSupplier() {
    if (!name.trim()) {
      alert("Supplier name is required.");
      return;
    }

    try {
      await instance.post("/api/suppliers/", {
        name,
        phone,
        email,
        address,
      });

      setName("");
      setPhone("");
      setEmail("");
      setAddress("");

      loadSuppliers();

    } catch (error) {
      console.error(error);
      alert("Could not create supplier.");
    }
  }

  async function deleteSupplier(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this supplier?"
    );

    if (!confirmed) return;

    try {
      await instance.delete(`/api/suppliers/${id}/`);

      loadSuppliers();

    } catch (error) {
      console.error(error);
      alert("Could not delete supplier.");
    }
  }

  return (
    <div className="p-8">

      <div className="mb-8">

        <p className="text-sm uppercase tracking-widest text-indigo-400">
          Management
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Suppliers
        </h1>

        <p className="mt-2 text-slate-400">
          Manage the suppliers that provide products to your shop.
        </p>

      </div>

      {/* FORM */}

      <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

        <h2 className="text-lg font-semibold">
          Add Supplier
        </h2>

        <div className="mt-6 grid gap-4 md:grid-cols-2">

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Supplier name"
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
          />

          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone"
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
          />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
          />

          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address"
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
          />

        </div>

        <button
          onClick={addSupplier}
          className="mt-5 rounded-xl bg-indigo-500 px-6 py-3 font-semibold text-white hover:bg-indigo-600"
        >
          Add Supplier
        </button>

      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

        <div className="border-b border-slate-800 p-6">
          <h2 className="text-lg font-semibold">
            Supplier List
          </h2>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-slate-950">

              <tr>

                <th className="px-6 py-4 text-left text-sm text-slate-400">
                  Supplier
                </th>

                <th className="px-6 py-4 text-left text-sm text-slate-400">
                  Phone
                </th>

                <th className="px-6 py-4 text-left text-sm text-slate-400">
                  Email
                </th>

                <th className="px-6 py-4 text-left text-sm text-slate-400">
                  Address
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
                    colSpan={5}
                    className="px-6 py-10 text-center text-slate-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : suppliers.map((supplier) => (

                <tr
                  key={supplier.id}
                  className="border-t border-slate-800"
                >

                  <td className="px-6 py-4 font-medium text-white">
                    {supplier.name}
                  </td>

                  <td className="px-6 py-4 text-slate-400">
                    {supplier.phone || "-"}
                  </td>

                  <td className="px-6 py-4 text-slate-400">
                    {supplier.email || "-"}
                  </td>

                  <td className="px-6 py-4 text-slate-400">
                    {supplier.address || "-"}
                  </td>

                  <td className="px-6 py-4 text-right">

                    <button
                      onClick={() =>
                        deleteSupplier(supplier.id)
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
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: "▦",
  },
  {
    name: "Categories",
    href: "/dashboard/categories",
    icon: "▤",
  },
  {
    name: "Products",
    href: "/dashboard/products",
    icon: "□",
  },
  {
    name: "Suppliers",
    href: "/dashboard/suppliers",
    icon: "♙",
  },
  {
    name: "AI Assistant",
    href: "/dashboard/AI_Chabot",
    icon: "✦",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-800 bg-slate-950">
      <div className="flex h-full flex-col">

        <div className="border-b border-slate-800 px-6 py-6">
          <h1 className="text-xl font-bold text-white">
            ShopInventory
          </h1>

          <p className="mt-1 text-xs text-slate-500">
            Inventory Management
          </p>
        </div>

        <nav className="flex-1 space-y-2 p-4">

          {menuItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-indigo-500 text-white"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <span>{item.icon}</span>
                {item.name}
              </Link>
            );
          })}

        </nav>

        <div className="border-t border-slate-800 p-4">
          <div className="rounded-xl bg-slate-900 p-4">
            <p className="text-sm font-semibold text-white">
              Inventory System
            </p>

            <p className="mt-1 text-xs text-slate-500">
              v1.0
            </p>
          </div>
        </div>

      </div>
    </aside>
  );
}
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <Sidebar />
      <main className="ml-64 min-h-screen">
        {children}
      </main>

    </div>
  );
}
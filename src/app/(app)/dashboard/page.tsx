import type { Metadata } from "next";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export const metadata: Metadata = {
  title: "Dashboard | MacroSleep",
  description: "Your daily health summary.",
};

export default async function DashboardPage() {
  return (
    <div className="flex-1 space-y-4">
        <DashboardClient />
    </div>
  );
}

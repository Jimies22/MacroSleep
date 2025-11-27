import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getTodaysMacroLogs, getSleepLogs } from "@/lib/actions";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { auth } from "@/lib/firebase/config"; // Assuming this is where server-side auth can be checked
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard | MacroSleep",
  description: "Your daily health summary.",
};

// This is a placeholder for a server-side auth check
async function checkAuth() {
  // In a real app with server-side sessions, you would validate the session cookie here.
  // For this Firebase client-side auth example, the layout handles redirection.
  // We'll proceed assuming auth is handled, but this function shows where you'd do it on the server.
  return true; 
}


export default async function DashboardPage() {
    // This server-side auth check is more complex with Firebase client-side SDK.
    // The redirect logic is handled in the (app)/layout.tsx for this setup.
    // We'll proceed to fetch data, assuming the user is authenticated.
    
    // For server-side fetching, we'd need the user's UID. 
    // This is difficult without a server-side session management system.
    // For this demo, we'll fetch data in the client component.
  
  return (
    <div className="flex-1 space-y-4">
        <DashboardClient />
    </div>
  );
}

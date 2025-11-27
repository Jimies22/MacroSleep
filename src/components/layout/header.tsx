"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "@/components/layout/user-nav";
import { useSidebar } from "@/components/ui/sidebar";
import { AppLogo } from "../icons";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Header() {
  const { isMobile } = useSidebar();

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:h-16 sm:px-6">
      <div className="flex items-center gap-2">
        {isMobile && <SidebarTrigger />}
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <AppLogo className="h-6 w-6 text-primary" />
          <span className={cn(isMobile && "hidden")}>MacroSleep</span>
        </Link>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <UserNav />
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bed,
  UtensilsCrossed,
  User,
  PanelLeft,
} from "lucide-react";
import { AppLogo } from "../icons";
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "../ui/sidebar";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/sleep", icon: Bed, label: "Sleep" },
  { href: "/macros", icon: UtensilsCrossed, label: "Macros" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { toggleSidebar, state } = useSidebar();

  return (
    <>
      <SidebarHeader className="border-b">
        <div
          className={cn(
            "flex h-12 items-center justify-between px-2",
            state === "collapsed" && "justify-center"
          )}
        >
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-2 font-semibold",
              state === "collapsed" && "hidden"
            )}
          >
            <AppLogo className="h-6 w-6 text-primary" />
            <span>MacroSleep</span>
          </Link>
          <button onClick={toggleSidebar} className="hidden md:block">
            <PanelLeft className="h-6 w-6" />
          </button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))}
                tooltip={{
                  children: item.label,
                  className: "bg-primary text-primary-foreground",
                }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}

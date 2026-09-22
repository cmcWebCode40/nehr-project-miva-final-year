"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NavItem } from "./nav-types";
import { ShieldCheck } from "lucide-react";

interface DashboardSidebarProps {
  navItems: NavItem[];
  roleLabel: string;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  collapsed: boolean;
}

export function DashboardSidebar({
  navItems,
  roleLabel,
  mobileOpen,
  onCloseMobile,
  collapsed,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/20 lg:hidden" onClick={onCloseMobile} />
      )}

      <aside
        className={cn(
          "fixed lg:sticky top-16 z-50 flex h-[calc(100vh-4rem)] w-[260px] flex-col overflow-hidden border-r border-brand-gray-300 bg-white transition-all duration-200",
          collapsed ? "lg:w-[76px]" : "lg:w-[260px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {!collapsed && (
          <div className="flex items-center gap-2 border-b border-brand-gray-300 px-4 py-3.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-[4px] bg-brand-primary-50 text-brand-primary-600">
              <ShieldCheck className="size-4" />
            </div>
            <span className="truncate text-xs font-semibold uppercase tracking-wide text-brand-gray-650">
              {roleLabel}
            </span>
          </div>
        )}

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  "flex items-center gap-3 rounded-[4px] px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-primary-50 text-brand-primary-600"
                    : "text-brand-gray-700 hover:bg-brand-gray-200 hover:text-brand-gray-900",
                  collapsed && "lg:justify-center lg:px-2"
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="size-4.5 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

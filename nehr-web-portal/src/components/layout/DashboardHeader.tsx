"use client";

import { AlignJustify, LogOut, ShieldCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/lib/auth/useSession";

function truncateDid(value: string, edge = 10) {
  return value.length > edge * 2 + 3 ? `${value.slice(0, edge)}...${value.slice(-edge)}` : value;
}

export function DashboardHeader({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { session, logout } = useSession();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-brand-gray-300 bg-white px-4 sm:px-5">
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
        className="flex size-9 items-center justify-center rounded-[4px] hover:bg-brand-gray-200 transition-colors"
      >
        <AlignJustify className="size-4.5" />
      </button>

      <div className="flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-[4px] bg-brand-primary text-white">
          <ShieldCheck className="size-4" />
        </div>
        <span className="font-averta text-sm font-semibold text-brand-blue-900">NEHR Platform</span>
      </div>

      <div className="flex-1" />

      {session && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-[4px] px-2 py-1.5 hover:bg-brand-gray-200 transition-colors"
            >
              <div className="flex size-7 items-center justify-center rounded-full bg-brand-primary text-[11px] font-bold text-white">
                {session.actorType.charAt(0)}
              </div>
              <span className="hidden text-sm font-medium text-brand-gray-800 sm:inline">
                {truncateDid(session.subject)}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="font-normal">
              <p className="text-xs text-brand-gray-650">Signed in as</p>
              <p className="truncate text-sm font-medium text-brand-gray-900">{session.subject}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={logout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
}

import { Link, Outlet } from "@tanstack/react-router";
import { Home, Users, Calendar, ListChecks, CalendarRange } from "lucide-react";
import type { ReactNode } from "react";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/family", label: "Family", icon: Users },
  { to: "/schedule", label: "Schedule", icon: Calendar },
  { to: "/tasks", label: "Tasks", icon: ListChecks },
  { to: "/plan", label: "Plan", icon: CalendarRange },
] as const;

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fbf6ee] text-stone-800">
      <div className="mx-auto flex min-h-screen max-w-md flex-col">
        <header className="sticky top-0 z-10 border-b border-stone-200/70 bg-[#fbf6ee]/90 px-5 py-4 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-700">
            Family Flow
          </p>
          <h1 className="mt-0.5 text-2xl font-bold text-stone-900">{title}</h1>
        </header>
        <main className="flex-1 px-5 pb-28 pt-4">{children}</main>
        <nav className="fixed inset-x-0 bottom-0 z-20">
          <div className="mx-auto max-w-md border-t border-stone-200 bg-white/95 backdrop-blur">
            <ul className="grid grid-cols-5">
              {items.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <Link
                    to={to}
                    activeOptions={{ exact: true }}
                    activeProps={{ className: "text-amber-700" }}
                    inactiveProps={{ className: "text-stone-500" }}
                    className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium"
                  >
                    <Icon className="h-5 w-5" />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </div>
  );
}

export function OutletShell() {
  return <Outlet />;
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Pencil, Clock, Bell, CalendarCheck } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { FamilyProvider, useFamily, memberName, todayISO } from "../lib/family-store";

export const Route = createFileRoute("/plan")({
  head: () => ({ meta: [{ title: "Weekly Plan — FamilyFlow" }, { name: "description", content: "Your family's seven-day organised plan." }] }),
  component: () => (
    <FamilyProvider>
      <PlanScreen />
    </FamilyProvider>
  ),
});

function PlanScreen() {
  const { commitments, tasks, members } = useFamily();
  const [editing, setEditing] = useState(false);

  const start = new Date(todayISO());
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });

  // Suggested task times: spread active tasks across days
  const active = tasks.filter((t) => !t.completed).sort((a, b) => a.deadline.localeCompare(b.deadline));

  return (
    <AppShell title="Weekly Plan">
      <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-4 text-white shadow-lg shadow-orange-200">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-100">
            <Sparkles className="h-3.5 w-3.5" />
            AI plan
          </div>
          <p className="mt-1 text-sm text-amber-50">
            Seven days organised with commitments, task suggestions and prep reminders.
          </p>
        </div>
        <button
          onClick={() => setEditing(true)}
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-white/20 px-3 py-2 text-sm font-semibold backdrop-blur"
        >
          <Pencil className="h-4 w-4" /> Edit Plan
        </button>
      </div>

      <div className="space-y-4">
        {days.map((date, i) => {
          const dayCommitments = commitments
            .filter((c) => c.date === date)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
          const suggested = active.filter((t) => t.deadline >= date).slice(i, i + 1); // one suggestion/day
          const prep = dayCommitments.filter((c) => c.prepNotes.trim().length > 0);

          return (
            <section key={date} className="rounded-2xl bg-white p-4 shadow-sm">
              <header className="mb-3 flex items-baseline justify-between">
                <h2 className="text-base font-bold text-stone-900">{formatDayLabel(date)}</h2>
                <span className="text-xs font-medium text-stone-500">{formatDate(date)}</span>
              </header>

              <Group icon={CalendarCheck} label="Commitments">
                {dayCommitments.length === 0 ? (
                  <p className="text-xs text-stone-400">Nothing scheduled</p>
                ) : (
                  <ul className="space-y-1.5">
                    {dayCommitments.map((c) => (
                      <li key={c.id} className="flex items-center gap-2 text-sm text-stone-700">
                        <span className="min-w-[3.5rem] rounded-md bg-amber-50 px-1.5 py-0.5 text-center text-xs font-semibold text-amber-700">
                          {c.startTime}
                        </span>
                        <span className="min-w-0 flex-1 truncate">
                          {c.title} <span className="text-stone-400">· {memberName(members, c.personId)}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Group>

              <Group icon={Clock} label="Suggested task time">
                {suggested.length === 0 ? (
                  <p className="text-xs text-stone-400">Free window — enjoy it</p>
                ) : (
                  <ul className="space-y-1.5">
                    {suggested.map((t) => (
                      <li key={t.id} className="text-sm text-stone-700">
                        <span className="font-semibold text-amber-700">{suggestSlot(dayCommitments)}</span>{" "}
                        · {t.title}{" "}
                        <span className="text-stone-400">({t.duration}, {memberName(members, t.assigneeId)})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Group>

              {prep.length > 0 && (
                <Group icon={Bell} label="Prep reminders">
                  <ul className="space-y-1.5">
                    {prep.map((c) => (
                      <li key={c.id} className="text-sm text-stone-700">
                        <span className="font-semibold">{c.title}:</span>{" "}
                        <span className="text-stone-500">{c.prepNotes}</span>
                      </li>
                    ))}
                  </ul>
                </Group>
              )}
            </section>
          );
        })}
      </div>

      {editing && (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 sm:items-center">
          <div className="w-full max-w-md rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl">
            <h2 className="text-lg font-bold text-stone-900">Edit plan</h2>
            <p className="mt-2 text-sm text-stone-600">
              The plan updates automatically as you change commitments and tasks. Head to Schedule or Tasks to add or edit items, or tap Regenerate to refresh suggestions.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setEditing(false)}
                className="flex-1 rounded-2xl border border-stone-200 py-3 font-semibold text-stone-700"
              >
                Close
              </button>
              <button
                onClick={() => setEditing(false)}
                className="flex-1 rounded-2xl bg-amber-600 py-3 font-semibold text-white"
              >
                Regenerate
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Group({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Clock;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-500">
        <Icon className="h-3.5 w-3.5 text-amber-700" />
        {label}
      </div>
      {children}
    </div>
  );
}

function suggestSlot(dayCommitments: { startTime: string; endTime: string }[]) {
  if (dayCommitments.length === 0) return "10:00";
  // Pick a slot right after the last commitment, else 10:00
  const last = dayCommitments[dayCommitments.length - 1].endTime;
  const [h, m] = last.split(":").map(Number);
  const nh = Math.min(h + 1, 20);
  return `${String(nh).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function formatDayLabel(date: string) {
  const today = todayISO();
  if (date === today) return "Today";
  const d = new Date(date);
  const t = new Date(today);
  const diff = Math.round((d.getTime() - t.getTime()) / 86400000);
  if (diff === 1) return "Tomorrow";
  return d.toLocaleDateString(undefined, { weekday: "long" });
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

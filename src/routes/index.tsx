import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Clock, AlertTriangle, CalendarHeart, ArrowRight } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { FamilyProvider, useFamily, memberName, todayISO } from "../lib/family-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FamilyFlow — AI-assisted family organiser" },
      { name: "description", content: "Plan the week, track tasks and keep every family commitment in one warm, phone-friendly place." },
      { property: "og:title", content: "FamilyFlow" },
      { property: "og:description", content: "A calm, AI-assisted organiser for busy families." },
    ],
  }),
  component: () => (
    <FamilyProvider>
      <Home />
    </FamilyProvider>
  ),
});

function Home() {
  const { members, commitments, tasks } = useFamily();
  const today = todayISO();
  const todaysCommitments = commitments
    .filter((c) => c.date === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  const urgent = tasks
    .filter((t) => !t.completed && (t.priority === "High" || t.deadline <= today))
    .slice(0, 3);
  const upcoming = commitments
    .filter((c) => c.date > today)
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))
    .slice(0, 3);

  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";
  const firstParent = members.find((m) => m.role === "Parent")?.name ?? "there";

  return (
    <AppShell title={`${greeting}, ${firstParent}`}>
      <p className="mb-5 text-sm text-stone-600">Here's how your family's week is shaping up.</p>

      <Link
        to="/plan"
        className="mb-5 flex items-center justify-between rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 p-5 text-white shadow-lg shadow-orange-200"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-100">
            <Sparkles className="h-3.5 w-3.5" />
            AI assist
          </div>
          <p className="mt-1 text-xl font-bold leading-tight">Plan My Week</p>
          <p className="mt-1 text-sm text-amber-50">Auto-organise commitments, tasks & prep.</p>
        </div>
        <ArrowRight className="ml-3 h-6 w-6 shrink-0" />
      </Link>

      <Section title="Today's schedule" icon={Clock} link="/schedule">
        {todaysCommitments.length === 0 ? (
          <Empty>Nothing scheduled today. Enjoy the calm.</Empty>
        ) : (
          <ul className="space-y-2">
            {todaysCommitments.map((c) => (
              <li key={c.id} className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm">
                <div className="w-14 shrink-0 rounded-xl bg-amber-50 p-2 text-center">
                  <div className="text-xs font-semibold text-amber-700">{c.startTime}</div>
                  <div className="text-[10px] text-stone-500">{c.endTime}</div>
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-stone-900">{c.title}</p>
                  <p className="truncate text-xs text-stone-500">
                    {memberName(members, c.personId)} · {c.location}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Urgent tasks" icon={AlertTriangle} link="/tasks">
        {urgent.length === 0 ? (
          <Empty>All caught up on urgent work.</Empty>
        ) : (
          <ul className="space-y-2">
            {urgent.map((t) => (
              <li key={t.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${t.priority === "High" ? "bg-red-500" : "bg-amber-500"}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-stone-900">{t.title}</p>
                  <p className="truncate text-xs text-stone-500">
                    {memberName(members, t.assigneeId)} · due {t.deadline}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-600">
                  {t.duration}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Upcoming family events" icon={CalendarHeart} link="/schedule">
        {upcoming.length === 0 ? (
          <Empty>No upcoming commitments yet.</Empty>
        ) : (
          <ul className="space-y-2">
            {upcoming.map((c) => (
              <li key={c.id} className="rounded-2xl bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate font-semibold text-stone-900">{c.title}</p>
                  <span className="shrink-0 text-xs font-medium text-amber-700">{c.date}</span>
                </div>
                <p className="mt-0.5 truncate text-xs text-stone-500">
                  {memberName(members, c.personId)} · {c.startTime} · {c.location}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </AppShell>
  );
}

function Section({
  title,
  icon: Icon,
  link,
  children,
}: {
  title: string;
  icon: typeof Clock;
  link: "/schedule" | "/tasks" | "/plan" | "/family";
  children: React.ReactNode;
}) {
  return (
    <section className="mb-5">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-stone-700">
          <Icon className="h-4 w-4 text-amber-700" />
          {title}
        </h2>
        <Link to={link} className="text-xs font-semibold text-amber-700">
          View all
        </Link>
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300 bg-white/50 p-4 text-center text-sm text-stone-500">
      {children}
    </div>
  );
}

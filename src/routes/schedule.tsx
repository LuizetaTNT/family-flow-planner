import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, MapPin, Clock, Bus, StickyNote, X } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { FamilyProvider, useFamily, memberName, type Commitment, todayISO } from "../lib/family-store";

export const Route = createFileRoute("/schedule")({
  head: () => ({ meta: [{ title: "Schedule — FamilyFlow" }, { name: "description", content: "All family commitments grouped by day." }] }),
  component: () => (
    <FamilyProvider>
      <ScheduleScreen />
    </FamilyProvider>
  ),
});

function ScheduleScreen() {
  const { commitments, members, addCommitment } = useFamily();
  const [adding, setAdding] = useState(false);

  const grouped = commitments
    .slice()
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))
    .reduce<Record<string, Commitment[]>>((acc, c) => {
      (acc[c.date] ||= []).push(c);
      return acc;
    }, {});

  const dates = Object.keys(grouped);
  const today = todayISO();

  return (
    <AppShell title="Schedule">
      <p className="mb-4 text-sm text-stone-600">All commitments, grouped by day.</p>

      <button
        onClick={() => setAdding(true)}
        className="mb-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-600 py-3 font-semibold text-white shadow-md shadow-amber-200"
      >
        <Plus className="h-5 w-5" /> Add commitment
      </button>

      {dates.length === 0 && (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white/50 p-6 text-center text-sm text-stone-500">
          No commitments yet.
        </div>
      )}

      <div className="space-y-5">
        {dates.map((date) => (
          <section key={date}>
            <h2 className="mb-2 flex items-baseline gap-2 text-sm font-bold uppercase tracking-wider text-stone-700">
              {formatDayLabel(date, today)}
              <span className="text-xs font-normal normal-case text-stone-500">{formatDate(date)}</span>
            </h2>
            <ul className="space-y-2">
              {grouped[date].map((c) => (
                <li key={c.id} className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-base font-bold text-stone-900">{c.title}</p>
                      <p className="text-xs font-medium text-amber-700">{memberName(members, c.personId)}</p>
                    </div>
                    <div className="shrink-0 rounded-xl bg-amber-50 px-2.5 py-1 text-center">
                      <div className="text-xs font-bold text-amber-700">{c.startTime}</div>
                      <div className="text-[10px] text-stone-500">to {c.endTime}</div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1.5 text-sm text-stone-600">
                    <Row icon={MapPin}>{c.location || "—"}</Row>
                    <Row icon={Bus}>Travel: {c.travelTime || "—"}</Row>
                    {c.prepNotes && <Row icon={StickyNote}>{c.prepNotes}</Row>}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {adding && (
        <CommitmentForm
          members={members}
          onCancel={() => setAdding(false)}
          onSave={(c) => {
            addCommitment(c);
            setAdding(false);
          }}
        />
      )}
    </AppShell>
  );
}

function Row({ icon: Icon, children }: { icon: typeof Clock; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 shrink-0 text-stone-400" />
      <span className="truncate">{children}</span>
    </div>
  );
}

function formatDayLabel(date: string, today: string) {
  if (date === today) return "Today";
  const d = new Date(date);
  const t = new Date(today);
  const diff = Math.round((d.getTime() - t.getTime()) / 86400000);
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: "long" });
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function CommitmentForm({
  members,
  onSave,
  onCancel,
}: {
  members: { id: string; name: string }[];
  onSave: (c: Omit<Commitment, "id">) => void;
  onCancel: () => void;
}) {
  const [f, setF] = useState<Omit<Commitment, "id">>({
    personId: members[0]?.id ?? "",
    title: "",
    date: todayISO(),
    startTime: "09:00",
    endTime: "10:00",
    location: "",
    travelTime: "",
    prepNotes: "",
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((s) => ({ ...s, [k]: v }));

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-900">Add commitment</h2>
          <button onClick={onCancel} className="rounded-full p-1.5 hover:bg-stone-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!f.title.trim() || !f.personId) return;
            onSave(f);
          }}
          className="space-y-3"
        >
          <Field label="Title">
            <input value={f.title} onChange={(e) => set("title", e.target.value)} className={inputCls} required />
          </Field>
          <Field label="Person">
            <select value={f.personId} onChange={(e) => set("personId", e.target.value)} className={inputCls}>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Date">
            <input type="date" value={f.date} onChange={(e) => set("date", e.target.value)} className={inputCls} required />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start">
              <input type="time" value={f.startTime} onChange={(e) => set("startTime", e.target.value)} className={inputCls} />
            </Field>
            <Field label="End">
              <input type="time" value={f.endTime} onChange={(e) => set("endTime", e.target.value)} className={inputCls} />
            </Field>
          </div>
          <Field label="Location">
            <input value={f.location} onChange={(e) => set("location", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Travel time">
            <input value={f.travelTime} onChange={(e) => set("travelTime", e.target.value)} className={inputCls} placeholder="e.g. 15 min" />
          </Field>
          <Field label="Preparation notes">
            <textarea value={f.prepNotes} onChange={(e) => set("prepNotes", e.target.value)} className={inputCls + " min-h-20"} />
          </Field>
          <button type="submit" className="mt-2 w-full rounded-2xl bg-amber-600 py-3 font-semibold text-white">
            Save commitment
          </button>
        </form>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-900 focus:border-amber-500 focus:bg-white focus:outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone-600">{label}</span>
      {children}
    </label>
  );
}

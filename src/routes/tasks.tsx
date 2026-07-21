import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, X, Check } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { FamilyProvider, useFamily, memberName, type Task, todayISO } from "../lib/family-store";

export const Route = createFileRoute("/tasks")({
  head: () => ({ meta: [{ title: "Tasks — FamilyFlow" }, { name: "description", content: "Track active and completed family tasks." }] }),
  component: () => (
    <FamilyProvider>
      <TasksScreen />
    </FamilyProvider>
  ),
});

function TasksScreen() {
  const { tasks, members, addTask, toggleTask } = useFamily();
  const [adding, setAdding] = useState(false);
  const [tab, setTab] = useState<"active" | "done">("active");

  const active = tasks.filter((t) => !t.completed).sort((a, b) => a.deadline.localeCompare(b.deadline));
  const done = tasks.filter((t) => t.completed);
  const list = tab === "active" ? active : done;

  return (
    <AppShell title="Tasks">
      <div className="mb-4 flex rounded-2xl bg-stone-200/60 p-1">
        {(["active", "done"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${
              tab === k ? "bg-white text-stone-900 shadow-sm" : "text-stone-600"
            }`}
          >
            {k === "active" ? `Active (${active.length})` : `Completed (${done.length})`}
          </button>
        ))}
      </div>

      <button
        onClick={() => setAdding(true)}
        className="mb-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-600 py-3 font-semibold text-white shadow-md shadow-amber-200"
      >
        <Plus className="h-5 w-5" /> Add task
      </button>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white/50 p-6 text-center text-sm text-stone-500">
          {tab === "active" ? "No active tasks. Nice work!" : "No completed tasks yet."}
        </div>
      ) : (
        <ul className="space-y-2">
          {list.map((t) => (
            <li key={t.id} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 shadow-sm">
              <button
                onClick={() => toggleTask(t.id)}
                aria-label={t.completed ? "Mark active" : "Mark done"}
                className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition ${
                  t.completed ? "border-amber-600 bg-amber-600 text-white" : "border-stone-300 bg-white"
                }`}
              >
                {t.completed && <Check className="h-3.5 w-3.5" />}
              </button>
              <div className="min-w-0 flex-1">
                <p className={`font-semibold ${t.completed ? "text-stone-400 line-through" : "text-stone-900"}`}>
                  {t.title}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone-500">
                  <span>{memberName(members, t.assigneeId)}</span>
                  <span>·</span>
                  <span>Due {t.deadline}</span>
                  <span>·</span>
                  <span>{t.duration}</span>
                </div>
              </div>
              <PriorityBadge priority={t.priority} />
            </li>
          ))}
        </ul>
      )}

      {adding && (
        <TaskForm
          members={members}
          onCancel={() => setAdding(false)}
          onSave={(t) => {
            addTask(t);
            setAdding(false);
          }}
        />
      )}
    </AppShell>
  );
}

function PriorityBadge({ priority }: { priority: Task["priority"] }) {
  const map = {
    High: "bg-red-50 text-red-700",
    Medium: "bg-amber-50 text-amber-700",
    Low: "bg-stone-100 text-stone-600",
  } as const;
  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${map[priority]}`}>
      {priority}
    </span>
  );
}

function TaskForm({
  members,
  onSave,
  onCancel,
}: {
  members: { id: string; name: string }[];
  onSave: (t: Omit<Task, "id" | "completed">) => void;
  onCancel: () => void;
}) {
  const [f, setF] = useState<Omit<Task, "id" | "completed">>({
    title: "",
    assigneeId: members[0]?.id ?? "",
    deadline: todayISO(),
    priority: "Medium",
    duration: "30 min",
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((s) => ({ ...s, [k]: v }));

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-900">Add task</h2>
          <button onClick={onCancel} className="rounded-full p-1.5 hover:bg-stone-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!f.title.trim() || !f.assigneeId) return;
            onSave(f);
          }}
          className="space-y-3"
        >
          <Field label="Title">
            <input value={f.title} onChange={(e) => set("title", e.target.value)} className={inputCls} required />
          </Field>
          <Field label="Responsible">
            <select value={f.assigneeId} onChange={(e) => set("assigneeId", e.target.value)} className={inputCls}>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Deadline">
            <input type="date" value={f.deadline} onChange={(e) => set("deadline", e.target.value)} className={inputCls} required />
          </Field>
          <Field label="Priority">
            <select value={f.priority} onChange={(e) => set("priority", e.target.value as Task["priority"])} className={inputCls}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </Field>
          <Field label="Estimated duration">
            <input value={f.duration} onChange={(e) => set("duration", e.target.value)} className={inputCls} placeholder="e.g. 30 min" />
          </Field>
          <button type="submit" className="mt-2 w-full rounded-2xl bg-amber-600 py-3 font-semibold text-white">
            Save task
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

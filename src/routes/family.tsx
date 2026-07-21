import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, X } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { FamilyProvider, useFamily, type Member } from "../lib/family-store";

export const Route = createFileRoute("/family")({
  head: () => ({ meta: [{ title: "Family — FamilyFlow" }, { name: "description", content: "Manage your family members and their regular commitments." }] }),
  component: () => (
    <FamilyProvider>
      <FamilyScreen />
    </FamilyProvider>
  ),
});

function FamilyScreen() {
  const { members, addMember, updateMember } = useFamily();
  const [editing, setEditing] = useState<Member | "new" | null>(null);

  return (
    <AppShell title="Family">
      <p className="mb-4 text-sm text-stone-600">Everyone in your household.</p>
      <ul className="space-y-3">
        {members.map((m) => (
          <li key={m.id} className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <Avatar name={m.name} role={m.role} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-lg font-bold text-stone-900">{m.name}</p>
                  <button
                    onClick={() => setEditing(m)}
                    className="shrink-0 rounded-full p-1.5 text-stone-500 hover:bg-stone-100"
                    aria-label={`Edit ${m.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs font-medium text-amber-700">
                  {m.role} · {m.age} years old
                </p>
                <p className="mt-2 text-sm text-stone-600">{m.commitments}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <button
        onClick={() => setEditing("new")}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-600 py-3 font-semibold text-white shadow-md shadow-amber-200"
      >
        <Plus className="h-5 w-5" /> Add family member
      </button>

      {editing && (
        <MemberForm
          initial={editing === "new" ? undefined : editing}
          onCancel={() => setEditing(null)}
          onSave={(m) => {
            if (editing === "new") addMember(m);
            else updateMember(editing.id, m);
            setEditing(null);
          }}
        />
      )}
    </AppShell>
  );
}

function Avatar({ name, role }: { name: string; role: string }) {
  const initial = name.charAt(0).toUpperCase();
  const bg = role === "Child" ? "bg-orange-100 text-orange-700" : "bg-amber-100 text-amber-700";
  return (
    <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-lg font-bold ${bg}`}>
      {initial}
    </div>
  );
}

function MemberForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Member;
  onSave: (m: Omit<Member, "id">) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [role, setRole] = useState<Member["role"]>(initial?.role ?? "Parent");
  const [age, setAge] = useState(String(initial?.age ?? ""));
  const [commitments, setCommitments] = useState(initial?.commitments ?? "");

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-900">{initial ? "Edit member" : "Add family member"}</h2>
          <button onClick={onCancel} className="rounded-full p-1.5 hover:bg-stone-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            onSave({ name: name.trim(), role, age: Number(age) || 0, commitments: commitments.trim() });
          }}
          className="space-y-3"
        >
          <Field label="Name">
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} required />
          </Field>
          <Field label="Role">
            <select value={role} onChange={(e) => setRole(e.target.value as Member["role"])} className={inputCls}>
              <option>Parent</option>
              <option>Child</option>
              <option>Other</option>
            </select>
          </Field>
          <Field label="Age">
            <input type="number" min="0" value={age} onChange={(e) => setAge(e.target.value)} className={inputCls} required />
          </Field>
          <Field label="Regular commitments">
            <textarea
              value={commitments}
              onChange={(e) => setCommitments(e.target.value)}
              className={inputCls + " min-h-24"}
              placeholder="e.g. Work M–F 9–5, Yoga Mon 7pm"
            />
          </Field>
          <button type="submit" className="mt-2 w-full rounded-2xl bg-amber-600 py-3 font-semibold text-white">
            Save
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

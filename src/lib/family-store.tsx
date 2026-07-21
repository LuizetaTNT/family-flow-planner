import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Member = {
  id: string;
  name: string;
  role: "Parent" | "Child" | "Other";
  age: number;
  commitments: string;
};

export type Commitment = {
  id: string;
  personId: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string;
  location: string;
  travelTime: string;
  prepNotes: string;
};

export type Task = {
  id: string;
  title: string;
  assigneeId: string;
  deadline: string;
  priority: "Low" | "Medium" | "High";
  duration: string; // e.g. "30 min"
  completed: boolean;
};

type State = {
  members: Member[];
  commitments: Commitment[];
  tasks: Task[];
};

type Ctx = State & {
  addMember: (m: Omit<Member, "id">) => void;
  updateMember: (id: string, m: Omit<Member, "id">) => void;
  addCommitment: (c: Omit<Commitment, "id">) => void;
  addTask: (t: Omit<Task, "id" | "completed">) => void;
  toggleTask: (id: string) => void;
};

const uid = () => Math.random().toString(36).slice(2, 10);

const today = new Date();
const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

const sarahId = "m_sarah";
const mikeId = "m_mike";
const lilyId = "m_lily";

const seed: State = {
  members: [
    { id: sarahId, name: "Sarah", role: "Parent", age: 38, commitments: "Work M–F 9–5, Yoga Mon 7pm" },
    { id: mikeId, name: "Mike", role: "Parent", age: 40, commitments: "Work M–F 8–6, Gym Wed 6am" },
    { id: lilyId, name: "Lily", role: "Child", age: 8, commitments: "School M–F 9–3, Soccer Tue 4pm" },
  ],
  commitments: [
    {
      id: uid(),
      personId: lilyId,
      title: "Soccer practice",
      date: iso(addDays(today, 1)),
      startTime: "16:00",
      endTime: "17:30",
      location: "Elm Park Field",
      travelTime: "15 min",
      prepNotes: "Cleats, water bottle, shin guards",
    },
    {
      id: uid(),
      personId: sarahId,
      title: "Yoga class",
      date: iso(today),
      startTime: "19:00",
      endTime: "20:00",
      location: "Studio 4",
      travelTime: "10 min",
      prepNotes: "Bring mat",
    },
    {
      id: uid(),
      personId: mikeId,
      title: "Dentist appointment",
      date: iso(addDays(today, 2)),
      startTime: "09:30",
      endTime: "10:15",
      location: "Downtown Dental",
      travelTime: "20 min",
      prepNotes: "Insurance card",
    },
    {
      id: uid(),
      personId: lilyId,
      title: "Piano lesson",
      date: iso(addDays(today, 3)),
      startTime: "15:30",
      endTime: "16:15",
      location: "Ms. Rowe's home",
      travelTime: "10 min",
      prepNotes: "Practice book",
    },
  ],
  tasks: [
    {
      id: uid(),
      title: "Buy groceries for the week",
      assigneeId: sarahId,
      deadline: iso(today),
      priority: "High",
      duration: "45 min",
      completed: false,
    },
    {
      id: uid(),
      title: "Sign Lily's field trip permission slip",
      assigneeId: mikeId,
      deadline: iso(addDays(today, 1)),
      priority: "High",
      duration: "5 min",
      completed: false,
    },
    {
      id: uid(),
      title: "Book summer camp",
      assigneeId: sarahId,
      deadline: iso(addDays(today, 5)),
      priority: "Medium",
      duration: "30 min",
      completed: false,
    },
    {
      id: uid(),
      title: "Pay electric bill",
      assigneeId: mikeId,
      deadline: iso(addDays(today, -1)),
      priority: "Medium",
      duration: "10 min",
      completed: true,
    },
  ],
};

const FamilyContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "familyflow_v1";

export function FamilyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(seed);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state, hydrated]);

  const value: Ctx = {
    ...state,
    addMember: (m) => setState((s) => ({ ...s, members: [...s.members, { ...m, id: uid() }] })),
    updateMember: (id, m) =>
      setState((s) => ({
        ...s,
        members: s.members.map((x) => (x.id === id ? { ...m, id } : x)),
      })),
    addCommitment: (c) =>
      setState((s) => ({ ...s, commitments: [...s.commitments, { ...c, id: uid() }] })),
    addTask: (t) =>
      setState((s) => ({ ...s, tasks: [...s.tasks, { ...t, id: uid(), completed: false }] })),
    toggleTask: (id) =>
      setState((s) => ({
        ...s,
        tasks: s.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
      })),
  };

  return <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>;
}

export function useFamily() {
  const ctx = useContext(FamilyContext);
  if (!ctx) throw new Error("useFamily must be used within FamilyProvider");
  return ctx;
}

export function memberName(members: Member[], id: string) {
  return members.find((m) => m.id === id)?.name ?? "Unassigned";
}

export function todayISO() {
  return iso(new Date());
}

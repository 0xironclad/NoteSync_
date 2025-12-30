export type NoteColor = "default" | "red" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink";

export type NotePriority = "none" | "low" | "medium" | "high";

export interface ChecklistItem {
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface Note {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  color: NoteColor;
  isPinned: boolean;
  priority: NotePriority;
  isArchived: boolean;
  dueDate: string | null;
  reminder: string | null;
  checklist: ChecklistItem[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoteFormData {
  title: string;
  content: string;
  tags: string[];
  color: NoteColor;
  priority: NotePriority;
  dueDate: string | null;
  reminder: string | null;
  checklist: ChecklistItem[];
}

export const NOTE_COLORS: Record<NoteColor, { bg: string; border: string; text: string }> = {
  default: { bg: "bg-slate-900", border: "border-slate-700", text: "text-white" },
  red: { bg: "bg-red-950", border: "border-red-800", text: "text-red-50" },
  orange: { bg: "bg-orange-950", border: "border-orange-800", text: "text-orange-50" },
  yellow: { bg: "bg-yellow-950", border: "border-yellow-800", text: "text-yellow-50" },
  green: { bg: "bg-green-950", border: "border-green-800", text: "text-green-50" },
  blue: { bg: "bg-blue-950", border: "border-blue-800", text: "text-blue-50" },
  purple: { bg: "bg-purple-950", border: "border-purple-800", text: "text-purple-50" },
  pink: { bg: "bg-pink-950", border: "border-pink-800", text: "text-pink-50" },
};

export const PRIORITY_CONFIG: Record<NotePriority, { label: string; color: string; icon: string }> = {
  none: { label: "None", color: "text-slate-400", icon: "" },
  low: { label: "Low", color: "text-blue-400", icon: "!" },
  medium: { label: "Medium", color: "text-yellow-400", icon: "!!" },
  high: { label: "High", color: "text-red-400", icon: "!!!" },
};

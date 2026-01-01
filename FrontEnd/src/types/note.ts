export type NoteColor = "default" | "red" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink";

export type NotePriority = "none" | "low" | "medium" | "high";

export type NoteType = "note" | "idea" | "task" | "reference";

export interface ChecklistItem {
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface Note {
  _id: string;
  title: string;
  noteType: NoteType;
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
  // Smart Priority Controls
  snoozedUntil?: string | null;
  dismissedFromFocus?: boolean;
  focusPinned?: boolean;
}

export interface NoteFormData {
  title: string;
  noteType: NoteType;
  content: string;
  tags: string[];
  color: NoteColor;
  priority: NotePriority;
  dueDate: string | null;
  reminder: string | null;
  checklist: ChecklistItem[];
}

// Color configurations optimized for readability
// Using lighter backgrounds with dark text for better contrast
export const NOTE_COLORS: Record<NoteColor, {
  card: string;
  accent: string;
  text: string;
  muted: string;
  border: string;
  tag: string;
  checkbox: string;
  checkboxChecked: string;
}> = {
  default: {
    card: "bg-card",
    accent: "bg-slate-500",
    text: "text-foreground",
    muted: "text-muted-foreground",
    border: "border-border",
    tag: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
    checkbox: "border-slate-400",
    checkboxChecked: "bg-primary border-primary text-primary-foreground",
  },
  red: {
    card: "bg-red-50 dark:bg-red-950/40",
    accent: "bg-red-500",
    text: "text-red-900 dark:text-red-100",
    muted: "text-red-600 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
    tag: "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300",
    checkbox: "border-red-400",
    checkboxChecked: "bg-red-500 border-red-500 text-white",
  },
  orange: {
    card: "bg-orange-50 dark:bg-orange-950/40",
    accent: "bg-orange-500",
    text: "text-orange-900 dark:text-orange-100",
    muted: "text-orange-600 dark:text-orange-400",
    border: "border-orange-200 dark:border-orange-800",
    tag: "bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300",
    checkbox: "border-orange-400",
    checkboxChecked: "bg-orange-500 border-orange-500 text-white",
  },
  yellow: {
    card: "bg-amber-50 dark:bg-amber-950/40",
    accent: "bg-amber-500",
    text: "text-amber-900 dark:text-amber-100",
    muted: "text-amber-600 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800",
    tag: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300",
    checkbox: "border-amber-400",
    checkboxChecked: "bg-amber-500 border-amber-500 text-white",
  },
  green: {
    card: "bg-emerald-50 dark:bg-emerald-950/40",
    accent: "bg-emerald-500",
    text: "text-emerald-900 dark:text-emerald-100",
    muted: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
    tag: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300",
    checkbox: "border-emerald-400",
    checkboxChecked: "bg-emerald-500 border-emerald-500 text-white",
  },
  blue: {
    card: "bg-blue-50 dark:bg-blue-950/40",
    accent: "bg-blue-500",
    text: "text-blue-900 dark:text-blue-100",
    muted: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
    tag: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300",
    checkbox: "border-blue-400",
    checkboxChecked: "bg-blue-500 border-blue-500 text-white",
  },
  purple: {
    card: "bg-violet-50 dark:bg-violet-950/40",
    accent: "bg-violet-500",
    text: "text-violet-900 dark:text-violet-100",
    muted: "text-violet-600 dark:text-violet-400",
    border: "border-violet-200 dark:border-violet-800",
    tag: "bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300",
    checkbox: "border-violet-400",
    checkboxChecked: "bg-violet-500 border-violet-500 text-white",
  },
  pink: {
    card: "bg-pink-50 dark:bg-pink-950/40",
    accent: "bg-pink-500",
    text: "text-pink-900 dark:text-pink-100",
    muted: "text-pink-600 dark:text-pink-400",
    border: "border-pink-200 dark:border-pink-800",
    tag: "bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300",
    checkbox: "border-pink-400",
    checkboxChecked: "bg-pink-500 border-pink-500 text-white",
  },
};

export const PRIORITY_CONFIG: Record<NotePriority, { label: string; color: string; bgColor: string }> = {
  none: { label: "None", color: "text-slate-400", bgColor: "bg-slate-400" },
  low: { label: "Low", color: "text-blue-500", bgColor: "bg-blue-500" },
  medium: { label: "Medium", color: "text-amber-500", bgColor: "bg-amber-500" },
  high: { label: "High", color: "text-red-500", bgColor: "bg-red-500" },
};

// Smart Views Configuration
export type SmartViewType =
  | "all"
  | "pinned"
  | "recent"
  | "withTasks"
  | "untagged"
  | "highPriority"
  | "dueSoon"
  | "archived";

export interface SmartViewCounts {
  all: number;
  pinned: number;
  recent: number;
  withTasks: number;
  untagged: number;
  highPriority: number;
  dueSoon: number;
  archived: number;
}

export interface SmartViewConfig {
  id: SmartViewType;
  label: string;
  icon: string;
  description: string;
  section: "main" | "organize" | "status";
}

export const SMART_VIEWS: SmartViewConfig[] = [
  // Main views
  { id: "all", label: "All Notes", icon: "Inbox", description: "All your active notes", section: "main" },
  { id: "recent", label: "Recent", icon: "Clock", description: "Updated in the last 7 days", section: "main" },
  { id: "pinned", label: "Pinned", icon: "Pin", description: "Your pinned notes", section: "main" },
  // Organize views
  { id: "withTasks", label: "With Tasks", icon: "CheckSquare", description: "Notes with to-dos still in progress", section: "organize" },
  { id: "untagged", label: "Untagged", icon: "TagOff", description: "Notes without tags", section: "organize" },
  // Status views
  { id: "highPriority", label: "High Priority", icon: "AlertCircle", description: "High priority notes", section: "status" },
  { id: "dueSoon", label: "Due Soon", icon: "Calendar", description: "Due within 7 days", section: "status" },
  { id: "archived", label: "Archived", icon: "Archive", description: "Your archived notes", section: "status" },
];

// Note Type Configuration
// Each type subtly influences the note creation experience without rigid rules
export interface NoteTypeConfig {
  id: NoteType;
  label: string;
  icon: string;
  description: string;
  placeholder: string;
  suggestedTags: string[];
  defaults: {
    expandChecklist: boolean;
    suggestPriority: NotePriority;
    suggestColor: NoteColor;
  };
}

export const NOTE_TYPES: NoteTypeConfig[] = [
  {
    id: "note",
    label: "Note",
    icon: "FileText",
    description: "General purpose notes",
    placeholder: "Start writing your thoughts...",
    suggestedTags: ["personal", "work", "meeting"],
    defaults: {
      expandChecklist: false,
      suggestPriority: "none",
      suggestColor: "default",
    },
  },
  {
    id: "idea",
    label: "Idea",
    icon: "Lightbulb",
    description: "Capture inspiration",
    placeholder: "What's the big idea?",
    suggestedTags: ["brainstorm", "concept", "innovation", "creative"],
    defaults: {
      expandChecklist: false,
      suggestPriority: "none",
      suggestColor: "yellow",
    },
  },
  {
    id: "task",
    label: "Task",
    icon: "CheckSquare",
    description: "Action items & to-dos",
    placeholder: "What needs to be done?",
    suggestedTags: ["todo", "action", "followup", "deadline"],
    defaults: {
      expandChecklist: true,
      suggestPriority: "medium",
      suggestColor: "default",
    },
  },
  {
    id: "reference",
    label: "Reference",
    icon: "BookOpen",
    description: "Information to keep",
    placeholder: "Document important information...",
    suggestedTags: ["documentation", "howto", "guide", "resource"],
    defaults: {
      expandChecklist: false,
      suggestPriority: "none",
      suggestColor: "blue",
    },
  },
];

// Daily Focus Types - Smart Retrieval System
export type FocusReason =
  | "overdue"
  | "dueToday"
  | "dueSoon"
  | "highPriority"
  | "pinnedWithTasks"
  | "recentWithTasks"
  | "recentEdit";

export type FocusUrgency = "critical" | "high" | "medium" | "low";

export interface FocusItem {
  note: Note;
  reason: FocusReason;
  label: string;
  urgency?: FocusUrgency;
  daysOverdue?: number;
  progress?: number;
}

export interface DailyFocusSummary {
  overdueCount: number;
  dueTodayCount: number;
  highPriorityCount: number;
  inProgressCount: number;
}

export interface DailyFocusData {
  needsAttention: FocusItem[];
  continueWorking: FocusItem[];
  recentlyEdited: FocusItem[];
  summary: DailyFocusSummary;
}

// Related Notes Types - Context-Aware Suggestions
export type RelatedReasonType =
  | "sharedTags"
  | "sameType"
  | "unfinishedTasks"
  | "highPriority"
  | "similarTitle";

export interface RelatedReason {
  type: RelatedReasonType;
  label: string;
  tags?: string[];
  noteType?: NoteType;
  progress?: number;
}

export interface RelatedNoteItem {
  note: Note;
  score: number;
  reasons: RelatedReason[];
  primaryReason: RelatedReason | null;
}

export interface RelatedNotesData {
  notes: RelatedNoteItem[];
  withTasks: RelatedNoteItem[];
  currentNoteTags: string[];
  currentNoteType: NoteType;
}

// Resume Suggestions Types - Continuity System
export type ResumeSuggestionType =
  | "incomplete_tasks"
  | "last_viewed"
  | "urgent_task";

export interface ResumeSuggestion {
  type: ResumeSuggestionType;
  note: Note;
  reason: string;
  detail: string | null;
  progress?: number;
  scrollPosition?: number;
}

export interface RecentlyViewedItem {
  note: Note;
  viewedAt: string;
  scrollPosition: number;
}

export interface ResumeSuggestionsData {
  primary: ResumeSuggestion | null;
  context: string | null;
  isReturning: boolean;
  timeSinceActive: string | null;
  recentlyViewed: RecentlyViewedItem[];
}

// =============================================================================
// SIMPLE PRIORITIZATION RULES - Transparent Note Ranking
// =============================================================================
// The system balances three key factors without exposing complex scores:
// 1. URGENCY: Time-sensitive items (overdue, due today/soon)
// 2. RECENCY: Recently touched notes you're actively working on
// 3. USER INTENT: Explicit signals (pinned, high priority, tasks in progress)
//
// How adaptation works:
// - As you interact with notes, recency naturally adjusts rankings
// - Completing tasks reduces a note's prominence
// - Urgency always wins when deadlines approach
// - Pinned notes remain accessible but don't override urgent items
// =============================================================================

export type PrioritySignal =
  | "overdue"         // Highest urgency - past due date
  | "due_today"       // High urgency - due today
  | "due_soon"        // Medium urgency - due within 3 days
  | "high_priority"   // User-set importance
  | "in_progress"     // Has incomplete tasks you're working on
  | "recently_active" // Edited in last 24 hours
  | "pinned"          // User wants easy access
  | "returning";      // Haven't touched in a while but relevant

export interface PriorityRule {
  id: PrioritySignal;
  label: string;
  shortLabel: string;
  description: string;
  icon: string;
  color: "red" | "amber" | "blue" | "emerald" | "purple" | "slate";
}

// Human-readable explanations for why notes appear where they do
export const PRIORITY_RULES: PriorityRule[] = [
  {
    id: "overdue",
    label: "Overdue",
    shortLabel: "Overdue",
    description: "Past its due date — needs attention now",
    icon: "AlertTriangle",
    color: "red",
  },
  {
    id: "due_today",
    label: "Due Today",
    shortLabel: "Today",
    description: "Due today — complete before end of day",
    icon: "Clock",
    color: "red",
  },
  {
    id: "due_soon",
    label: "Due Soon",
    shortLabel: "Soon",
    description: "Due within 3 days — plan ahead",
    icon: "Calendar",
    color: "amber",
  },
  {
    id: "high_priority",
    label: "High Priority",
    shortLabel: "Priority",
    description: "Marked as high priority by you",
    icon: "Flag",
    color: "amber",
  },
  {
    id: "in_progress",
    label: "In Progress",
    shortLabel: "Active",
    description: "Has tasks you're working through",
    icon: "ArrowRight",
    color: "emerald",
  },
  {
    id: "recently_active",
    label: "Recently Active",
    shortLabel: "Recent",
    description: "Edited in the last 24 hours",
    icon: "Edit3",
    color: "blue",
  },
  {
    id: "pinned",
    label: "Pinned",
    shortLabel: "Pinned",
    description: "Pinned for quick access",
    icon: "Pin",
    color: "purple",
  },
  {
    id: "returning",
    label: "Pick Up",
    shortLabel: "Resume",
    description: "You were working on this recently",
    icon: "RotateCcw",
    color: "slate",
  },
];

// Helper to get rule config
export const getPriorityRule = (signal: PrioritySignal): PriorityRule | undefined =>
  PRIORITY_RULES.find((r) => r.id === signal);

// Prioritized note with transparent reasoning
export interface PrioritizedNote {
  note: Note;
  signals: PrioritySignal[];        // All signals that apply
  primarySignal: PrioritySignal;    // Main reason it's surfaced
  explanation: string;              // Human-readable reason
  rank: number;                     // Position in the list (1-based)
  isFocusPinned?: boolean;          // User explicitly pinned to focus
}

export interface SmartPriorityData {
  urgent: PrioritizedNote[];        // Needs immediate attention (max 3)
  active: PrioritizedNote[];        // Currently working on (max 4)
  suggested: PrioritizedNote[];     // Good to tackle next (max 3)
  focusPinned: PrioritizedNote[];   // User-pinned to always show
  insights: PriorityInsight[];      // Quick tips about the ranking
  snoozedCount: number;             // Number of snoozed notes
}

// Snooze duration options
export type SnoozeDuration = "1h" | "4h" | "1d" | "3d" | "1w";

export const SNOOZE_OPTIONS: { value: SnoozeDuration; label: string }[] = [
  { value: "1h", label: "1 hour" },
  { value: "4h", label: "4 hours" },
  { value: "1d", label: "Tomorrow" },
  { value: "3d", label: "3 days" },
  { value: "1w", label: "1 week" },
];

export interface PriorityInsight {
  type: "info" | "tip" | "success";
  message: string;
}

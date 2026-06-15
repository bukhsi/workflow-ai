export type ToolKey = "email" | "meeting" | "task" | "research" | "chat";

export const TIME_SAVED_MINUTES: Record<ToolKey, number> = {
  email: 5,
  meeting: 20,
  task: 15,
  research: 30,
  chat: 2,
};

export const TOOL_LABELS: Record<ToolKey, string> = {
  email: "Emails Generated",
  meeting: "Meetings Summarized",
  task: "Tasks Planned",
  research: "Research Reports",
  chat: "Chat Messages",
};

export type UsageEvent = {
  tool: ToolKey;
  minutesSaved: number;
  at: string;
};

export const STORAGE_KEY = "wpa-usage-v1";

export function loadEvents(): UsageEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as UsageEvent[]) : [];
  } catch {
    return [];
  }
}

export function saveEvents(events: UsageEvent[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

export function recordEvent(tool: ToolKey): UsageEvent {
  const event: UsageEvent = {
    tool,
    minutesSaved: TIME_SAVED_MINUTES[tool],
    at: new Date().toISOString(),
  };
  const all = loadEvents();
  all.push(event);
  saveEvents(all);
  window.dispatchEvent(new CustomEvent("wpa-usage-updated"));
  return event;
}

export function clearEvents() {
  saveEvents([]);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("wpa-usage-updated"));
  }
}
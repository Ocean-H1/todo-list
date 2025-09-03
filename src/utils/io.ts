import type { TodoItem } from "@/types";

export interface ExportPayload {
  version: number;
  exportedAt: number;
  todos: TodoItem[];
  trash: TodoItem[];
}

export function buildExportPayload(
  todos: TodoItem[],
  trash: TodoItem[]
): ExportPayload {
  return {
    version: 1,
    exportedAt: Date.now(),
    todos,
    trash,
  };
}

export function downloadJSON(filename: string, data: ExportPayload) {
  const content = JSON.stringify(data, null, 2);
  const blob = new Blob([content], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function parseImportedJSON(text: string) {
  const data = JSON.parse(text);
  if (Array.isArray(data)) {
    return { todos: data, trash: [] };
  }
  if (data && Array.isArray(data.todos)) {
    return {
      todos: data.todos,
      trash: Array.isArray(data.trash) ? data.trash : [],
    };
  }
  return { todos: [], trash: [] };
}
import type { TodoItem, FilterType } from "@/types";
import { useLocalStorage } from "./useLocalStorage";
import { useMemo, useState } from "react";

export const STORAGE_KEY = "todo:list:v1";

function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function nextOrder(todos: TodoItem[]) {
  if (todos.length === 0) {
    return 1;
  }
  return Math.max(...todos.map((todo) => todo.order)) + 1;
}

function now() {
  return Date.now();
}

export function useTodos() {
  const {
    value: todos,
    setValue: setTodos,
    reset,
  } = useLocalStorage<TodoItem[]>(STORAGE_KEY, []);
  const [filter, setFilter] = useState<FilterType>("all");
  const [trash, setTrash] = useState<TodoItem[]>([]);

  const addTodo = (
    title: string,
    options?: Partial<Pick<TodoItem, "note" | "dueAt">>
  ) => {
    const t = title.trim();
    if (!t) return;
    const timestamp = now();
    const newTodo: TodoItem = {
      id: uuid(),
      title: t,
      completed: false,
      createdAt: timestamp,
      updatedAt: timestamp,
      order: nextOrder(todos),
      ...options,
    };
    setTodos([newTodo, ...todos]);
    return newTodo;
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const updateTodo = (
    id: string,
    todo: Partial<Omit<TodoItem, "id" | "createdAt">>
  ) => {
    setTodos(
      todos.map((t) => (t.id === id ? { ...t, ...todo, updatedAt: now() } : t))
    );
  };

  const removeTodo = (id: string) => {
    const todoToRemove = todos.find((t) => t.id === id);
    if (todoToRemove) {
      setTodos(todos.filter((t) => t.id !== id));
      setTrash([...trash, todoToRemove]);
    }
  };

  // 永久删除任务（从回收站删除）
  const permanentlyDeleteTodo = (id: string) => {
    setTrash(trash.filter((t) => t.id !== id));
  };

  // 从回收站恢复任务
  const restoreTodo = (id: string) => {
    const todoToRestore = trash.find((t) => t.id === id);
    if (todoToRestore) {
      setTrash(trash.filter((t) => t.id !== id));
      setTodos([todoToRestore, ...todos]);
    }
  };

  // 清空回收站
  const clearTrash = () => {
    setTrash([]);
  };

  const clearCompleted = () => {
    setTodos(todos.filter((t) => !t.completed));
  };

  const completeAll = () => {
    setTodos(todos.map((t) => ({ ...t, completed: true, updatedAt: now() })));
  };

  // 拖拽排序：传入新的 id 顺序，或直接传 [fromIndex, toIndex]
  const reorderTodos = (
    nextOrderIds: string[] | { from: number; to: number }
  ) => {
    let ordered = todos.slice().sort((a, b) => a.order - b.order);

    if (Array.isArray(nextOrderIds)) {
      // 得到新 ID 顺序排列的 Todo 数组
      const map = new Map(ordered.map((t) => [t.id, t]));
      ordered = nextOrderIds.map((id) => map.get(id)!).filter(Boolean);
    } else {
      const { from, to } = nextOrderIds;
      // 边界校验
      if (from < 0 || from >= ordered.length || to < 0 || to >= ordered.length)
        return;
      const [moved] = ordered.splice(from, 1);
      ordered.splice(to, 0, moved);
    }

    // 重新赋值ordered
    ordered = ordered.map((t, idx) => ({
      ...t,
      order: idx + 1,
      updatedAt: now(),
    }));
    setTodos(ordered);
  };

  const filteredTodos = useMemo(() => {
    const byGroupThenOrder = (a: TodoItem, b: TodoItem) =>
      Number(a.completed) - Number(b.completed) || a.order - b.order;

    switch (filter) {
      case "active":
        return todos.filter(t => !t.completed).slice().sort((a, b) => a.order - b.order);
      case "completed":
        return todos.filter(t => t.completed).slice().sort((a, b) => a.order - b.order);
      case "trash":
        return trash.slice().sort((a, b) => a.order - b.order);
      default:
        return todos.slice().sort(byGroupThenOrder); // 未完成在前、完成在后，同组内按 order
    }
  }, [todos, filter, trash]);

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((t) => t.completed).length;
    const active = total - completed;
    return { total, completed, active };
  }, [todos]);

  const resetAll = () => reset([]);

  return {
    todos,
    filteredTodos,
    filter,
    stats,
    setFilter,
    addTodo,
    toggleTodo,
    updateTodo,
    removeTodo,
    permanentlyDeleteTodo,
    restoreTodo,
    clearTrash,
    clearCompleted,
    completeAll,
    reorderTodos,
    resetAll,
    trash
  } as const;
}

import React, { useState } from "react";
import { useTodos } from "@/hooks/useTodos";
import { Modal, Message } from "@pixie-ui/core";

import "./index.css";
import SortableTodoItem from "./components/SortableTodoItem";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  buildExportPayload,
  downloadJSON,
  parseImportedJSON,
} from "@/utils/io";

const ToDo: React.FC = () => {
  const [taskTitle, setTaskTitle] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const {
    filteredTodos,
    addTodo,
    removeTodo,
    toggleTodo,
    completeAll,
    updateTodo,
    stats,
    setFilter,
    clearCompleted,
    resetAll,
    filter,
    todos,
    restoreTodo,
    permanentlyDeleteTodo,
    reorderTodos,
    trash,
    replaceAll,
  } = useTodos();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const filterOpts = [
    {
      key: "all",
      label: "全部",
      action: () => {
        setFilter("all");
      },
    },
    {
      key: "active",
      label: "进行中",
      action: () => {
        setFilter("active");
      },
    },
    {
      key: "completed",
      label: "已完成",
      action: () => {
        setFilter("completed");
      },
    },
    {
      key: "trash",
      label: "回收站",
      action: () => {
        setFilter("trash");
      },
    },
    {
      key: "clearCompleted",
      label: "清除已完成",
      action: () => {
        if (filteredTodos.length <= 0) {
          return;
        }
        setClearCompletedModalOpen(true);
      },
    },
    {
      key: "clearAll",
      label: "全部清除",
      action: () => {
        if (filteredTodos.length <= 0) {
          return;
        }
        setClearAllModalOpen(true);
      },
    },
    {
      key: "exportData",
      label: "导出(json)",
      action: () => {
        handleExportJSON();
      },
    },
    {
      key: "importData",
      label: "导入(json)",
      action: () => {
        setImportModalOpen(true);
      },
    },
  ];
  const [clearAllModalOpen, setClearAllModalOpen] = useState(false);
  const [clearCompletedModalOpen, setClearCompletedModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleAddTask = () => {
    if (taskTitle.trim() === "") {
      setError(true);
      setErrorMessage("💡请输入事项内容!");
      return;
    }
    addTodo(taskTitle);
    setTaskTitle("");
  };

  const removeTask = (id: string) => {
    removeTodo(id);
  };

  const restoreTask = (id: string) => {
    restoreTodo(id);
  };

  // 永久删除任务
  const permanentlyDeleteTask = (id: string) => {
    permanentlyDeleteTodo(id);
  };

  const toggleTask = (id: string) => {
    toggleTodo(id);
  };

  // 编辑
  const startEdit = (id: string, title: string) => {
    setEditingId(id);
    setDraftTitle(title);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setDraftTitle("");
  };
  const commitEdit = (id: string) => {
    const t = draftTitle.trim();
    if (!t) return cancelEdit();
    updateTodo(id, { title: t });
    cancelEdit();
  };

  // 配置拖拽传感器
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 拖拽结束处理排序
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id === over?.id) return;
    // 回收站禁止拖拽
    if (filter === "trash") {
      return Message.open({
        type: "warning",
        content: "回收站禁止拖拽",
        className: "pixie-warning-message",
      });
    }

    const activeItem = todos.find((t) => t.id === active.id);
    const overItem = todos.find((t) => t.id === over?.id);

    if (!activeItem || !overItem) return;
    // 全部视图: 禁止跨分组(进行中/已完成) 拖拽
    if (filter === "all" && activeItem.completed !== overItem.completed) {
      return Message.open({
        type: "warning",
        content: "禁止跨分组拖拽",
        className: "pixie-warning-message",
      });
    }

    const ordered = todos.slice().sort((a, b) => a.order - b.order);
    const from = ordered.findIndex((t) => t.id === active.id);
    const to = ordered.findIndex((t) => t.id === over?.id);

    if (from < 0 || to < 0) return;

    reorderTodos({ from, to });
  };

  const handleExportJSON = () => {
    try {
      const payload = buildExportPayload(todos, trash);
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      downloadJSON(`todolist-${stamp}.json`, payload);
      Message.success("导出成功！");
    } catch (error) {
      Message.error(`导出失败, JSON 不合法或内容异常！ ${error}`);
    }
  };

  const handleImportJSON = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const { todos: list } = parseImportedJSON(text);
        replaceAll(list);
        Message.success("导入成功！");
      } catch (error) {
        Message.error(`导入失败, JSON 不合法或内容异常！ ${error}`);
      } finally {
        input.remove();
      }
    };
    input.click();
  };

  return (
    <div className="todo">
      <div className="todo-wrapper">
        <div className="todo-container">
          <header className="todo-header">
            <img src="./assets/img/todo.svg" height={52} alt="logo" />
            <div className="add-task-wrapper">
              <input
                className="add-task-input"
                value={taskTitle}
                onChange={(e) => {
                  if (e.target.value !== "") {
                    setError(false);
                  }
                  setTaskTitle(e.target.value);
                }}
                type="text"
                placeholder="新增待办事项..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddTask();
                  }
                }}
              />
              <button className="submit" onClick={handleAddTask}>
                提交
              </button>
            </div>
            {error && <div className="error-message">{errorMessage}</div>}
          </header>
          <main className="todo-main">
            <div className="bar header">
              <input
                type="button"
                value="全部标记为完成"
                className="all-complete-btn"
                onClick={() => completeAll()}
              />
              <div className="message-box">
                <span className="message">
                  今日事今日毕，勿将今事待明日!.☕
                </span>
              </div>
            </div>
            <div className="todo-list-box">
              {todos.length > 0 ? (
                <DndContext
                  sensors={sensors}
                  onDragEnd={handleDragEnd}
                  collisionDetection={closestCenter}
                >
                  <SortableContext
                    items={filteredTodos.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <ul className="todo-list">
                      {filteredTodos.map((t) => (
                        <SortableTodoItem
                          todo={t}
                          filter={filter}
                          editingId={editingId}
                          draftTitle={draftTitle}
                          onToggle={toggleTask}
                          onRemove={removeTask}
                          onRestore={restoreTask}
                          onCancelEdit={cancelEdit}
                          onCommitEdit={commitEdit}
                          onStartEdit={startEdit}
                          onPermanentlyDelete={permanentlyDeleteTask}
                          onDraftTitleChange={setDraftTitle}
                          key={t.id}
                        />
                      ))}
                    </ul>
                  </SortableContext>
                </DndContext>
              ) : (
                <ul className="empty-tips">
                  <li>添加你的第一个待办事项！📝</li>
                  <li>食用方法💡：</li>
                  <li>✔️ 所有提交操作支持Enter回车键提交</li>
                  <li>✔️ 拖拽Todo上下移动可排序(仅支持PC)</li>
                  <li>✔️ 双击上面的标语和 Todo 可进行编辑</li>
                  <li>✔️ 右侧的小窗口是快捷操作哦</li>
                  <li>🔒 所有的Todo数据存储在浏览器本地</li>
                  <li>📝 支持下载和导入，导入追加到当前序列</li>
                </ul>
              )}
              {/* <div className="bar footer">
                {stats.total > 0 && (
                  <span className="stats-message">
                    {stats.active > 0
                      ? `还有 ${stats.active} 个事项待完成, 当前总进度: ${(
                          (stats.completed / stats.total) *
                          100
                        ).toFixed(2)} %`
                      : "完美收工! 🎉"}
                  </span>
                )}
                <div
                  className="progress"
                  style={{
                    width: `${((stats.completed / stats.total) * 100).toFixed(
                      2
                    )}%`,
                  }}
                />
              </div> */}
            </div>
            <div className={`side-bar ${sidebarCollapsed ? "collapsed" : ""}`}>
              <div
                className="side-bar-switch"
                role="button"
                tabIndex={0}
                onClick={() => setSidebarCollapsed((v) => !v)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setSidebarCollapsed((v) => !v);
                  }
                }}
                title={sidebarCollapsed ? "展开" : "折叠"}
              >
                <span className="title">{sidebarCollapsed ? "展开👉" : "折叠👈"}</span>
              </div>
              <ul className="side-bar-list">
                {filterOpts.length > 0 &&
                  filterOpts.map((f) => {
                    return (
                      <li
                        className={`filter-item ${
                          ["all", "active", "completed", "trash"].includes(
                            f.key
                          ) && filter === f.key
                            ? "active"
                            : ""
                        }`}
                        onClick={() => {
                          f.action?.();
                        }}
                        key={f.key}
                      >
                        {f.label}
                      </li>
                    );
                  })}
              </ul>
            </div>
            <div className="bar footer">
              {stats.total > 0 && (
                <div className="stats-message">
                  {stats.active > 0
                    ? `还有 ${stats.active} 个事项待完成, 当前总进度: ${(
                        (stats.completed / stats.total) *
                        100
                      ).toFixed(2)} %`
                    : "完美收工! 🎉"}
                </div>
              )}
              <div
                className="progress"
                style={{
                  width: `${((stats.completed / stats.total) * 100).toFixed(
                    2
                  )}%`,
                }}
              />
            </div>
            <Modal
              title="清空全部事项"
              open={clearAllModalOpen}
              onOk={() => {
                resetAll();
                setClearAllModalOpen(false);
              }}
              onCancel={() => setClearAllModalOpen(false)}
            >
              <p>是否确认清空全部事项？</p>
            </Modal>
            <Modal
              title="清除已完成事项"
              open={clearCompletedModalOpen}
              onOk={() => {
                clearCompleted();
                setClearCompletedModalOpen(false);
              }}
              onCancel={() => setClearCompletedModalOpen(false)}
            >
              <p>是否确认清除已完成事项?</p>
            </Modal>
            <Modal
              title="导入确认"
              open={importModalOpen}
              onOk={() => {
                handleImportJSON();
                setImportModalOpen(false);
              }}
              onCancel={() => setImportModalOpen(false)}
            >
              <p>此操作将会覆盖现有数据, 是否确认导入?</p>
            </Modal>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ToDo;

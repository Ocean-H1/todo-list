import React, { useState } from "react";
import { useTodos } from "@/hooks/useTodos";
import { Modal } from "@pixie-ui/core";

import "./index.css";

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
      label: "清除全部",
      action: () => {
        if (filteredTodos.length <= 0) {
          return;
        }
        setClearAllModalOpen(true);
      },
    },
    {
      key: "exportData",
      label: "导出数据",
      action: () => {
        console.log("导出数据");
      },
    },
    {
      key: "importData",
      label: "导入(txt/json)",
      action: () => {
        console.log("导入text/json");
      },
    },
  ];
  const [clearAllModalOpen, setClearAllModalOpen] = useState(false);
  const [clearCompletedModalOpen, setClearCompletedModalOpen] = useState(false);

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
            <div className="todo-list-box">
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
              {todos.length > 0 ? (
                <ul className="todo-list">
                  {filteredTodos.map((t) => {
                    return (
                      <li
                        className={`todo-item ${
                          t.completed ? "todo-item-completed" : ""
                        } ${filter === "trash" ? "trash-item" : ""}`}
                        key={t.id}
                      >
                        {filter !== "trash" && (
                          <div
                            className="todo-btn btn-toggle"
                            onClick={() => toggleTask(t.id)}
                          >
                            {t.completed && (
                              <img
                                src="./assets/img/complete.svg"
                                alt="完成"
                                width={30}
                              />
                            )}
                          </div>
                        )}
                        {editingId === t.id ? (
                          <input
                            type="text"
                            className="todo-item-edit"
                            value={draftTitle}
                            onChange={(e) => setDraftTitle(e.target.value)}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                commitEdit(t.id);
                              }
                              if (e.key === "Escape") {
                                cancelEdit();
                              }
                            }}
                            onBlur={() => commitEdit(t.id)}
                          />
                        ) : (
                          <div
                            className="todo-item-content"
                            title={filter === "trash" ? "" : "双击编辑"}
                            onDoubleClick={
                              filter === "trash"
                                ? undefined
                                : () => startEdit(t.id, t.title)
                            }
                          >
                            {t.title}
                          </div>
                        )}
                        {filter === "trash" ? (
                          <>
                            <div
                              className="todo-btn btn-restore"
                              onClick={() => restoreTask(t.id)}
                              title="恢复任务"
                            >
                              <img
                                src="./assets/img/restore.svg"
                                alt="恢复"
                                height={16}
                                width={16}
                              />
                            </div>
                            <div
                              className="todo-btn btn-delete"
                              onClick={() => permanentlyDeleteTask(t.id)}
                              title="永久删除"
                            >
                              <img
                                src="./assets/img/delete.svg"
                                alt="永久删除"
                                height={16}
                                width={16}
                              />
                            </div>
                          </>
                        ) : (
                          <div
                            className="todo-btn btn-delete"
                            onClick={() => removeTask(t.id)}
                          >
                            <img
                              src="./assets/img/delete.svg"
                              alt="删除"
                              height={16}
                              width={16}
                            />
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
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
              <div className="bar footer">
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
              </div>
            </div>
            <div className="side-bar">
              <div className="side-bar-switch">
                <span className="title">折叠👈</span>
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
          </main>
        </div>
      </div>
    </div>
  );
};

export default ToDo;

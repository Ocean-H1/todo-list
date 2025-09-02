import type { FilterType, TodoItem } from "@/types";
import { useSortable } from "@dnd-kit/sortable";

import "./SortableTodoItem.css";

interface SortableTodoItemProps {
  todo: TodoItem;
  filter: FilterType;
  editingId: string | null;
  draftTitle: string;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onRestore: (id: string) => void;
  onCancelEdit: () => void;
  onCommitEdit: (id: string) => void;
  onStartEdit: (id: string, title: string) => void;
  onPermanentlyDelete: (id: string) => void;
  onDraftTitleChange: (title: string) => void;
}

const SortableTodoItem: React.FC<SortableTodoItemProps> = (props) => {
  const {
    todo,
    filter,
    editingId,
    draftTitle,
    onToggle,
    onRemove,
    onRestore,
    onCancelEdit,
    onCommitEdit,
    onStartEdit,
    onPermanentlyDelete,
    onDraftTitleChange,
  } = props;
  const {
    attributes,
    listeners,
    setNodeRef,
    transition,
    transform,
    isDragging,
  } = useSortable({
    id: todo.id,
  });
  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
    opacity: isDragging ? 0 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`todo-item ${todo.completed ? "todo-item-completed" : ""} ${
        filter === "trash" ? "trash-item" : ""
      } ${isDragging ? "dragging" : ""}`}
    >
      {filter !== "trash" && (
        <div className="todo-btn btn-toggle" onClick={() => onToggle(todo.id)}>
          {todo.completed && (
            <img src="./assets/img/complete.svg" alt="完成" width={30} />
          )}
        </div>
      )}
      {editingId === todo.id ? (
        <input
          type="text"
          className="todo-item-edit"
          value={draftTitle}
          onChange={(e) => onDraftTitleChange(e.target.value)}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onCommitEdit(todo.id);
            }
            if (e.key === "Escape") {
              onCancelEdit();
            }
          }}
          onBlur={() => onCommitEdit(todo.id)}
        />
      ) : (
        <div
          className="todo-item-content"
          title={filter === "trash" ? "" : "双击编辑"}
          onDoubleClick={
            filter === "trash"
              ? undefined
              : () => onStartEdit(todo.id, todo.title)
          }
        >
          {todo.title}
        </div>
      )}
      {filter === "trash" ? (
        <>
          <div
            className="todo-btn btn-restore"
            onClick={() => onRestore(todo.id)}
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
            onClick={() => onPermanentlyDelete(todo.id)}
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
        <div className="todo-btn btn-delete" onClick={() => onRemove(todo.id)}>
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
};

export default SortableTodoItem;

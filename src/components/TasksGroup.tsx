import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { RouterOutputs } from "~/lib/api";
import { cn } from "~/lib/utils";
import Task from "./Task";
import { useMemo } from "react";

interface Props {
  boardColumn: RouterOutputs["board"]["getSingleBoard"]["boardColumns"][number];
}

export default function TasksGroup({ boardColumn }: Props) {
  const taskIds = useMemo(
    () => boardColumn.tasks.map((t) => t.id),
    [boardColumn.tasks]
  );
  const [tasksGroupParent] = useAutoAnimate();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: boardColumn.id,
    data: {
      type: "Column",
      column: boardColumn,
    },
    animateLayoutChanges: () => false,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="
      h-[31.5rem]
      max-h-[31.5rem]
      w-[17.5rem]
      rounded-md
      border-2
      border-main-color
      opacity-40
      "
      ></div>
    );
  }

  return (
    <div className={cn("w-[17.5rem] shrink-0")} ref={setNodeRef} style={style}>
      <h3
        {...listeners}
        {...attributes}
        className={cn(
          "mb-5 flex select-none items-center gap-x-2 text-xs font-bold uppercase tracking-widest text-gray-400",
          isDragging && "cursor-grabbing"
        )}
      >
        <span
          className={cn("h-3 w-3 rounded-full", boardColumn.columnColor)}
        ></span>
        {boardColumn.title} ({boardColumn.tasks.length})
      </h3>

      <article className="space-y-3.5" ref={tasksGroupParent}>
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {boardColumn.tasks.map((t) => (
            <Task key={t.id} task={t} columnId={boardColumn.id} />
          ))}
        </SortableContext>
      </article>
    </div>
  );
}

import { useAutoAnimate } from "@formkit/auto-animate/react";
import type { RouterOutputs } from "~/lib/api";
import { cn } from "~/lib/utils";
import Task from "./Task";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo } from "react";

interface Props {
  boardColumn: RouterOutputs["board"]["getSingleBoard"]["boardColumns"][number];
}

export default function TasksGroup({ boardColumn }: Props) {
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
    data: { type: "column" },
    animateLayoutChanges: () => false,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const taskIds = useMemo(() => {
    return boardColumn.tasks.map((t) => t.id);
  }, [boardColumn.tasks]);

  if (isDragging) {
    return (
      <div
        className="h-[500px] w-[17.5rem] rounded-lg border border-solid border-main-color bg-main-background/40"
        ref={setNodeRef}
        style={style}
      ></div>
    );
  }

  return (
    <div className={cn("w-[17.5rem] shrink-0")} ref={setNodeRef} style={style}>
      <h3
        {...{ ...attributes, "aria-describedby": "tasks group" }}
        {...listeners}
        className={cn(
          "mb-5 flex cursor-grab select-none items-center gap-x-2 text-xs font-bold uppercase tracking-widest text-gray-400"
        )}
      >
        <span
          className={cn("h-3 w-3 rounded-full", boardColumn.columnColor)}
        ></span>
        {boardColumn.title} ({boardColumn.tasks.length})
      </h3>

      <article className="space-y-3.5" ref={tasksGroupParent}>
        <SortableContext items={taskIds}>
          {boardColumn.tasks.map((t) => (
            <Task key={t.id} task={t} columnId={boardColumn.id} />
          ))}
        </SortableContext>
      </article>
    </div>
  );
}

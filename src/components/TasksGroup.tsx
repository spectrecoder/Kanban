import { RouterOutputs } from "~/lib/api";
import { cn } from "~/lib/utils";
import Task from "./Task";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { UniqueIdentifier, useDraggable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
        {boardColumn.tasks.map((t) => (
          <Task key={t.id} task={t} />
        ))}
      </article>
    </div>
  );
}

import { useState } from "react";
import { RouterOutputs } from "~/lib/api";
import DeleteTask from "./DeleteTask";
import TaskCard from "./TaskCard";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "~/lib/utils";

interface TaskProps {
  task: RouterOutputs["board"]["getSingleBoard"]["boardColumns"][number]["tasks"][number];
  columnId: string;
}

export default function Task({ task, columnId }: TaskProps) {
  const [openDetailModal, setOpenDetailModal] = useState<boolean>(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
      columnId,
    },
    // animateLayoutChanges: () => false,
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
        {...attributes}
        {...listeners}
        className="h-[76px] max-h-[76px] w-[17.5rem] space-y-1 rounded-lg border-2 border-main-color bg-board-background p-4 opacity-40 shadow-sm shadow-indigo-500/20"
      ></div>
    );
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => setOpenDetailModal(true)}
        className={cn(
          "group cursor-pointer select-none space-y-1 rounded-lg bg-main-background p-4 shadow-sm shadow-indigo-500/20",
          isDragging && "cursor-grabbing"
        )}
      >
        <h3 className="text-base font-bold tracking-wide text-primary group-hover:text-main-color">
          {task.title}
        </h3>
        <p className="text-xs font-semibold text-gray-500">
          {task.subTasks.length} of {task._count.subTasks} subtasks
        </p>
      </div>

      <TaskCard
        open={openDetailModal}
        setOpen={setOpenDetailModal}
        taskId={task.id}
        taskTitle={task.title}
      />
    </>
  );
}

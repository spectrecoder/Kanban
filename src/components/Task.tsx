import { useEffect, useState } from "react";
import type { RouterOutputs } from "~/lib/api";
import { cn } from "~/lib/utils";
import TaskCard from "./TaskCard";
import { useRouter } from "next/router";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface TaskProps {
  task: RouterOutputs["board"]["getSingleBoard"]["boardColumns"][number]["tasks"][number];
  columnId: string;
}

export default function Task({ task, columnId }: TaskProps) {
  const [openDetailModal, setOpenDetailModal] = useState<boolean>(false);
  const routerQuery = useRouter().query;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "task", columnId },
    animateLayoutChanges: () => false,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    if (!routerQuery.taskId) return;
    if (routerQuery.taskId === task.id) setOpenDetailModal(true);
  }, [routerQuery.taskId, task.id]);

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-[76px] rounded-lg border border-solid border-main-color bg-main-background/20"
      ></div>
    );
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...{ ...attributes, "aria-describedby": "task" }}
        {...listeners}
        onClick={() => setOpenDetailModal(true)}
        className={cn(
          "group cursor-grab select-none space-y-1 rounded-lg bg-main-background p-4 shadow-sm shadow-indigo-500/20"
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

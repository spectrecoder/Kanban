import { useEffect, useState } from "react";
import { RouterOutputs } from "~/lib/api";
import { cn } from "~/lib/utils";
import TaskCard from "./TaskCard";
import { useRouter } from "next/router";

interface TaskProps {
  task: RouterOutputs["board"]["getSingleBoard"]["boardColumns"][number]["tasks"][number];
  columnId: string;
}

export default function Task({ task, columnId }: TaskProps) {
  const [openDetailModal, setOpenDetailModal] = useState<boolean>(false);
  const routerQuery = useRouter().query;

  useEffect(() => {
    if (!routerQuery.taskId) return;
    if (routerQuery.taskId === task.id) setOpenDetailModal(true);
  }, []);

  return (
    <>
      <div
        onClick={() => setOpenDetailModal(true)}
        className={cn(
          "group cursor-pointer select-none space-y-1 rounded-lg bg-main-background p-4 shadow-sm shadow-indigo-500/20"
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

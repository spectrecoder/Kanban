import { useState } from "react";
import { RouterOutputs } from "~/lib/api";
import DeleteTask from "./DeleteTask";
import TaskCard from "./TaskCard";

interface TaskProps {
  task: RouterOutputs["board"]["getSingleBoard"]["boardColumns"][number]["tasks"][number];
}

export default function Task({ task }: TaskProps) {
  const [openDetailModal, setOpenDetailModal] = useState<boolean>(false);

  return (
    <>
      <div
        key={task.id}
        onClick={() => setOpenDetailModal(true)}
        className="group cursor-pointer space-y-1 rounded-lg bg-main-background p-4 shadow-sm shadow-indigo-500/20"
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

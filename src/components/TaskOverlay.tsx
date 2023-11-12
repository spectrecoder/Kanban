import { RouterOutputs } from "~/lib/api";
import { cn } from "~/lib/utils";

interface TaskProps {
  task: RouterOutputs["board"]["getSingleBoard"]["boardColumns"][number]["tasks"][number];
}

export default function TaskOverlay({ task }: TaskProps) {
  return (
    <div
      className={cn(
        "group cursor-grabbing select-none space-y-1 rounded-lg bg-main-background p-4 shadow-sm shadow-indigo-500/20"
      )}
    >
      <h3 className="text-base font-bold tracking-wide text-primary group-hover:text-main-color">
        {task.title}
      </h3>
      <p className="text-xs font-semibold text-gray-500">
        {task.subTasks.length} of {task._count.subTasks} subtasks
      </p>
    </div>
  );
}

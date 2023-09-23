import { useTaskDetails } from "~/lib/hooks/use-task-details";
import TaskCard from "./TaskCard";
import { RouterOutputs } from "~/lib/api";
import { cn } from "~/lib/utils";
import { useModal } from "~/lib/hooks/useModal";

interface Props {
  boardColumn: RouterOutputs["board"]["getSingleBoard"]["boardColumns"][number];
}

export default function TasksGroup({ boardColumn }: Props) {
  const onOpen = useModal((state) => state.onOpen);

  return (
    <div className="w-[17.5rem] shrink-0">
      <h3 className="mb-5 flex items-center gap-x-2 text-xs font-bold uppercase tracking-widest text-gray-400">
        <span
          className={cn("h-3 w-3 rounded-full", boardColumn.columnColor)}
        ></span>
        {boardColumn.title} ({boardColumn.tasks.length})
      </h3>

      <article className="space-y-3.5">
        {boardColumn.tasks.map((t) => (
          <div
            key={t.id}
            onClick={() => onOpen("taskDetails")}
            className="group cursor-pointer space-y-1 rounded-lg bg-main-background p-4 shadow-sm shadow-indigo-500/20"
          >
            <h3 className="text-base font-bold tracking-wide text-primary group-hover:text-main-color">
              {t.title}
            </h3>
            <p className="text-xs font-semibold text-gray-500">
              {t.subTasks.length} of {t._count.subTasks} subtasks
            </p>
          </div>
        ))}
      </article>
    </div>
  );
}

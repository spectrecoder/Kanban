import { useTaskDetails } from "~/lib/hooks/use-task-details";
import TaskCard from "./TaskCard";
import { RouterOutputs } from "~/lib/api";
import { cn } from "~/lib/utils";

interface Props {
  boardColumn: RouterOutputs["board"]["getSingleBoard"]["boardColumns"][number];
}

export default function TasksGroup({ boardColumn }: Props) {
  const onOpen = useTaskDetails((state) => state.onOpen);

  return (
    <div className="w-[17.5rem] shrink-0">
      <h3 className="mb-5 flex items-center gap-x-2 text-xs font-bold uppercase tracking-widest text-gray-400">
        <span
          className={cn("h-3 w-3 rounded-full", boardColumn.columnColor)}
        ></span>
        {boardColumn.title} ({boardColumn.tasks.length})
      </h3>

      <article className="space-y-5">
        <div
          onClick={onOpen}
          className="group cursor-pointer space-y-1 rounded-lg bg-main-background p-4 shadow-sm shadow-indigo-500/20"
        >
          <h3 className="text-base font-bold tracking-wide text-primary group-hover:text-main-color">
            Build UI for onboarding flow
          </h3>
          <p className="text-xs font-semibold text-gray-500">0 of 3 subtasks</p>
        </div>

        <div
          onClick={onOpen}
          className="group cursor-pointer space-y-1 rounded-lg bg-main-background p-4 shadow-sm shadow-indigo-500/20"
        >
          <h3 className="text-base font-bold tracking-wide text-primary group-hover:text-main-color">
            Build UI for onboarding flow
          </h3>
          <p className="text-xs font-semibold text-gray-500">0 of 3 subtasks</p>
        </div>
      </article>
    </div>
  );
}

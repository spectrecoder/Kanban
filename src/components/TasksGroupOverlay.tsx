import { RouterOutputs } from "~/lib/api";
import { cn } from "~/lib/utils";
import Task from "./Task";

interface Props {
  boardColumn: RouterOutputs["board"]["getSingleBoard"]["boardColumns"][number];
}

export default function TasksGroupOverlay({ boardColumn }: Props) {
  return (
    <div className={cn("w-[17.5rem] shrink-0")}>
      <h3
        className={cn(
          "mb-5 flex cursor-grabbing select-none items-center gap-x-2 text-xs font-bold uppercase tracking-widest text-gray-400"
        )}
      >
        <span
          className={cn("h-3 w-3 rounded-full", boardColumn.columnColor)}
        ></span>
        {boardColumn.title} ({boardColumn.tasks.length})
      </h3>

      <article className="space-y-3.5">
        {boardColumn.tasks.map((t) => (
          <Task key={t.id} task={t} columnId={boardColumn.id} />
        ))}
      </article>
    </div>
  );
}

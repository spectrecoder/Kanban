import { RouterOutputs } from "~/lib/api";
import { cn } from "~/lib/utils";
import Task from "./Task";

interface Props {
  boardColumn: RouterOutputs["board"]["getSingleBoard"]["boardColumns"][number];
}

export default function TasksGroup({ boardColumn }: Props) {
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
          <Task key={t.id} task={t} />
        ))}
      </article>
    </div>
  );
}

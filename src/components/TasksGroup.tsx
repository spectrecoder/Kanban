import { TaskCard } from "./TaskCard";

export default function TasksGroup() {
  return (
    <div className="w-[17.5rem] shrink-0">
      <h3 className="mb-5 flex items-center gap-x-2 text-xs font-bold uppercase tracking-widest text-gray-400">
        <span className="h-3 w-3 rounded-full bg-lime-500"></span>
        todo (4)
      </h3>

      <article className="space-y-5">
        <TaskCard />
        <TaskCard />
        <TaskCard />
        <TaskCard />
      </article>
    </div>
  );
}

import { AlarmCheck } from "lucide-react";
import { useRouter } from "next/router";
import React from "react";
import { api } from "~/lib/api";

export default function RecentTasks() {
  const { data: recentTasks } = api.task.recentTasks.useQuery();
  const router = useRouter();

  if (!recentTasks) {
    return null;
  }

  return (
    <div className="space-y-8">
      {recentTasks.map((task) => (
        <div key={task.id} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <AlarmCheck className="h-8 min-h-[2rem] w-8 min-w-[2rem]" />
            <div className="space-y-1">
              <p
                className="cursor-pointer text-sm font-medium leading-none hover:underline"
                onClick={() =>
                  router.push(
                    `/board/${task.boardColumn.board.id}?taskId=${task.id}`
                  )
                }
              >
                {task.title}
              </p>
              {task.description && (
                <p className="text-sm text-muted-foreground">
                  {task.description.slice(0, 50)}
                  {task.description.length > 50 ? "..." : ""} Lorem ipsum dolor
                  sit amet consectetur adipisicing elit. Commodi, voluptate?
                </p>
              )}
            </div>
          </div>
          <div className="hidden whitespace-nowrap font-medium sm:block">
            {task._count.subTasks}{" "}
            <span className="font-normal">
              sub{task._count.subTasks > 1 ? "tasks" : "task"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

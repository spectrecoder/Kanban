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
        <div key={task.id} className="flex items-center">
          <AlarmCheck className="h-8 w-8" />
          <div className="ml-4 space-y-1">
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
            <p className="w-72 truncate text-sm text-muted-foreground">
              {task.description}
            </p>
          </div>
          <div className="ml-auto font-medium">
            {task._count.subTasks}{" "}
            <span className="font-normal">
              sub {task._count.subTasks > 1 ? "tasks" : "task"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

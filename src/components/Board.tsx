import { cn } from "~/lib/utils";
import BoardHeader from "./BoardHeader";
import TasksGroup from "./TasksGroup";
import { ScrollArea } from "./ui/scroll-area";
import { useSidebar } from "~/lib/hooks/use-sidebar";

export default function Board() {
  const isSidebarOpen = useSidebar((state) => state.isOpen);

  return (
    <section className="flex-grow bg-board-background">
      <BoardHeader />

      <ScrollArea
        direction="horizontal"
        className={cn(
          "w-[calc(100vw-16rem)] max-w-[calc(100vw-16rem)] transition-all duration-300",
          !isSidebarOpen && "w-screen max-w-[100vw]"
        )}
      >
        <main className={cn("flex gap-x-6 p-5")}>
          <TasksGroup />
          <TasksGroup />

          <TasksGroup />
          <TasksGroup />

          <TasksGroup />
        </main>
      </ScrollArea>
    </section>
  );
}

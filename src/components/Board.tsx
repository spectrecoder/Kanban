import { cn } from "~/lib/utils";
import BoardHeader from "./BoardHeader";
import TasksGroup from "./TasksGroup";
import { ScrollArea } from "./ui/scroll-area";
import { useSidebar } from "~/lib/hooks/use-sidebar";
import NewColumn from "./NewColumn";

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
        <div className="flex h-[calc(100vh-76.8px)] gap-x-6 overflow-y-auto p-5 scrollbar-none">
          <main className="flex h-fit gap-x-6">
            <div className="flex h-full gap-x-6">
              <TasksGroup />
              <TasksGroup />

              <TasksGroup />
              {/* <TasksGroup />

              <TasksGroup /> */}
            </div>

            <NewColumn />
          </main>
        </div>
      </ScrollArea>
    </section>
  );
}

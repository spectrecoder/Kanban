import { useAutoAnimate } from "@formkit/auto-animate/react";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { AlertCircle } from "lucide-react";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { useMemo, useState } from "react";
import superjson from "superjson";
import BoardHeader from "~/components/BoardHeader";
import CreateTask from "~/components/CreateTask";
import DeleteBoard from "~/components/DeleteBoard";
import EditBoard from "~/components/EditBoard";
import NewColumn from "~/components/NewColumn";
import TasksGroup from "~/components/TasksGroup";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { ScrollArea } from "~/components/ui/scroll-area";
import { RouterOutputs, api } from "~/lib/api";
import { useSidebar } from "~/lib/hooks/use-sidebar";
import { useModal } from "~/lib/hooks/useModal";
import { cn } from "~/lib/utils";
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { getServerAuthSession } from "~/server/auth";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import TasksGroupOverlay from "~/components/TasksGroupOverlay";
import { createPortal } from "react-dom";
import TaskOverlay from "~/components/TaskOverlay";
import { useToast } from "~/components/ui/use-toast";

export default function Board({
  userSession,
  boardID,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const isSidebarOpen = useSidebar((state) => state.isOpen);
  const onOpen = useModal((state) => state.onOpen);
  const [activeItem, setActiveItem] = useState<{
    data:
      | RouterOutputs["board"]["getSingleBoard"]["boardColumns"][number]
      | RouterOutputs["board"]["getSingleBoard"]["boardColumns"][number]["tasks"][number];
    type: "column" | "task";
  } | null>(null);
  const [swap, setSwap] = useState<boolean>(false);
  const utils = api.useContext();
  const { toast } = useToast();

  const { data: currentBoard } = api.board.getSingleBoard.useQuery(
    { boardID },
    {
      enabled: !!userSession,
    }
  );

  const { mutate: reorderColumns } = api.board.reorderColumns.useMutation({
    onSuccess: () => {
      toast({
        description: "Reordered Successfully",
      });

      if (!currentBoard) return;

      const allTasks = currentBoard.boardColumns.flatMap((b) => b.tasks);

      allTasks.map((t) =>
        utils.task.getTaskDetail.setData(
          { boardId: boardID, taskId: t.id },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              boardColumns: currentBoard.boardColumns.map((b) => ({
                id: b.id,
                title: b.title,
              })),
            };
          }
        )
      );
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Reorder failed. Please try again later",
      });
    },
  });

  const { mutate: reorderTasks } = api.task.reorderTasks.useMutation({
    onSuccess: (_, variables) => {
      toast({
        description: "Reordered Successfully",
      });
      utils.task.getTaskDetail.setData(
        { boardId: boardID, taskId: variables.movedTask },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            taskDetail: {
              ...old.taskDetail,
              boardColumn: { id: variables.columnId },
            },
          };
        }
      );
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Reorder failed. Please try again later",
      });
    },
  });

  const [boardColumnsParent] = useAutoAnimate();

  let columnIds = useMemo(
    () => currentBoard?.boardColumns.map((bc) => bc.id) || [],
    [currentBoard]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 2,
      },
    })
  );

  if (!currentBoard) {
    return (
      <Alert variant="destructive" className="m-4 h-fit bg-board-background">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Board not found. Please enter a valid board id.
        </AlertDescription>
      </Alert>
    );
  }

  function handleDragStart(event: DragStartEvent) {
    if (!currentBoard) return;

    const { active } = event;

    if (active.data.current?.type === "column") {
      const activeColumn = currentBoard.boardColumns.find(
        (bc) => bc.id === active.id
      );

      if (!activeColumn) return;

      setActiveItem({ data: activeColumn, type: "column" });
    } else if (active.data.current?.type === "task") {
      const activeTask = currentBoard.boardColumns
        .find((bc) => bc.id === active.data.current?.columnId)
        ?.tasks.find((t) => t.id === active.id);

      if (!activeTask) return;

      setActiveItem({ data: activeTask, type: "task" });
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveItem(null);
    setSwap(false);

    if (!currentBoard) return;

    const { active, over } = event;

    if (!over) return;

    if (active.id === over.id && !swap) return;

    if (
      active.data.current?.type === "column" &&
      over.data.current?.type === "column"
    ) {
      const activeIndex = currentBoard.boardColumns.findIndex(
        (bc) => bc.id === active.id
      );
      const overIndex = currentBoard.boardColumns.findIndex(
        (bc) => bc.id === over.id
      );

      const boardColumns = arrayMove(
        currentBoard.boardColumns,
        activeIndex,
        overIndex
      );

      boardColumns.forEach((bc, idx) => {
        bc.order = idx;
      });

      utils.board.getSingleBoard.setData({ boardID }, (old) => {
        if (!old) return old;

        return { ...old, boardColumns };
      });

      reorderColumns({
        boardId: boardID,
        columns: boardColumns.map((bc) => ({ id: bc.id, order: bc.order })),
      });
    } else if (active.data.current?.type === "task") {
      if (over.data.current?.type === "task") {
        // console.log("active", active.data.current);
        // console.log("over", over.data.current);

        const overColId = over.data.current?.columnId as string;

        const overColumn = currentBoard.boardColumns.find(
          (bc) => bc.id === overColId
        );

        if (!overColumn) return;

        const activeIndex = overColumn.tasks.findIndex(
          (t) => t.id === active.id
        );
        const overIndex = overColumn.tasks.findIndex((t) => t.id === over.id);

        const tasks = arrayMove(overColumn.tasks, activeIndex, overIndex);

        tasks.forEach((t, idx) => {
          t.order = idx;
        });

        utils.board.getSingleBoard.setData({ boardID }, (old) => {
          if (!old) return old;

          const boardColumns = old.boardColumns.map((bc) =>
            bc.id === overColId
              ? {
                  ...bc,
                  tasks,
                }
              : bc
          );

          return { ...old, boardColumns };
        });

        reorderTasks({
          columnId: overColId,
          tasks: tasks.map((t) => ({ id: t.id, order: t.order })),
          movedTask: active.id as string,
        });
      }
    }
  }

  function handleDragOver(event: DragOverEvent) {
    if (!currentBoard) return;

    const { active, over } = event;

    if (!over) return;

    if (active.data.current?.type !== "task") return;

    if (
      over.data.current?.type === "task" &&
      over.data.current?.columnId === active.data.current?.columnId
    )
      return;
    if (
      over.data.current?.type === "column" &&
      over.id === active.data.current?.columnId
    )
      return;

    const newColId =
      over.data.current?.type === "task"
        ? over.data.current?.columnId
        : over.data.current?.type === "column"
        ? over.id
        : null;

    if (!newColId) return;

    const oldColId = active.data.current?.columnId;

    utils.board.getSingleBoard.setData({ boardID }, (old) => {
      if (!old) return old;

      const task = old.boardColumns
        .find((bc) => bc.id === oldColId)
        ?.tasks.find((t) => t.id === active.id);

      if (!task) return old;

      const boardColumns = old.boardColumns.map((bc) =>
        bc.id === oldColId
          ? { ...bc, tasks: bc.tasks.filter((t) => t.id !== active.id) }
          : bc.id === newColId
          ? {
              ...bc,
              tasks: [task, ...bc.tasks],
            }
          : bc
      );

      return { ...old, boardColumns };
    });

    console.log("first");

    setSwap(true);
  }

  return (
    <>
      <section className="flex-grow bg-board-background">
        <BoardHeader
          hasColumns={!!currentBoard.boardColumns.length}
          boardName={currentBoard.title}
          userSession={userSession}
        />

        <ScrollArea
          direction="horizontal"
          className={cn(
            "w-[calc(100vw-16rem)] max-w-[calc(100vw-16rem)] transition-all duration-300",
            !isSidebarOpen && "w-screen max-w-[100vw]"
          )}
        >
          <div className="flex h-[calc(100vh-76.8px)] gap-x-6 overflow-y-auto p-5 scrollbar-none">
            <main className="flex h-fit gap-x-6">
              <div className="flex h-full gap-x-6" ref={boardColumnsParent}>
                <DndContext
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  sensors={sensors}
                >
                  <SortableContext items={columnIds}>
                    {currentBoard.boardColumns.map((bc) => (
                      <TasksGroup key={bc.id} boardColumn={bc} />
                    ))}
                  </SortableContext>

                  {typeof window !== "undefined" &&
                    createPortal(
                      <DragOverlay dropAnimation={null} zIndex={0}>
                        {activeItem && activeItem.type === "column" && (
                          <TasksGroupOverlay
                            boardColumn={
                              activeItem.data as RouterOutputs["board"]["getSingleBoard"]["boardColumns"][number]
                            }
                          />
                        )}

                        {activeItem && activeItem.type === "task" && (
                          <TaskOverlay
                            task={
                              activeItem.data as RouterOutputs["board"]["getSingleBoard"]["boardColumns"][number]["tasks"][number]
                            }
                          />
                        )}
                      </DragOverlay>,
                      document.body
                    )}
                </DndContext>
              </div>

              <aside
                onClick={() => onOpen("createColumn")}
                className="mt-9 flex max-h-[813px] min-h-[572.2px] w-[17.5rem] shrink-0 cursor-pointer items-center justify-center rounded-md bg-sky-100/60 text-[1.65rem] font-semibold capitalize text-gray-600 hover:text-main-color dark:bg-main-background/40 dark:text-gray-500 dark:hover:text-main-color"
              >
                + new column
              </aside>
            </main>
          </div>
        </ScrollArea>
      </section>

      <CreateTask
        boardId={currentBoard.id}
        columns={currentBoard.boardColumns.map((c) => ({
          id: c.id,
          title: c.title,
        }))}
      />

      <EditBoard
        boardDetails={{
          title: currentBoard.title,
          id: currentBoard.id,
          boardColumns: currentBoard.boardColumns.map((c) => ({
            id: c.id,
            title: c.title,
          })),
        }}
      />

      <DeleteBoard boardTitle={currentBoard.title} />

      <NewColumn />
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const userSession = (await getServerAuthSession(context))!;

  if (context.params === undefined) {
    return {
      notFound: true,
    };
  }

  const boardID = context.params.id as string;

  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({ session: userSession }),
    transformer: superjson,
  });

  await ssg.board.getSingleBoard.prefetch({ boardID });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      userSession,
      boardID,
    },
  };
}

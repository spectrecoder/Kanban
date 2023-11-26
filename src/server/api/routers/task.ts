import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { formatError } from "~/lib/utils";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const taskRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(2).max(50),
        description: z.string().max(150).optional(),
        columnId: z.string().min(6),
        subtasks: z.object({ title: z.string() }).array(),
      })
    )
    .mutation(async ({ ctx: { prisma, session }, input }) => {
      try {
        await prisma.boardColumn.findUniqueOrThrow({
          where: {
            id: input.columnId,
            board: {
              user: {
                id: session.user.id,
              },
            },
          },
        });

        const lastTask = await prisma.task.findFirst({
          where: {
            boardColumn: {
              id: input.columnId,
            },
          },
          orderBy: {
            order: "desc",
          },
        });

        const nextOrder = lastTask ? lastTask.order + 1 : 0;

        return await prisma.task.create({
          data: {
            title: input.title,
            description: input.description,
            order: nextOrder,
            boardColumn: {
              connect: {
                id: input.columnId,
              },
            },
            subTasks: input.subtasks.length
              ? {
                  createMany: {
                    data: input.subtasks,
                  },
                }
              : undefined,
          },
          select: {
            id: true,
            title: true,
            subTasks: {
              where: {
                completed: true,
              },
              select: {
                id: true,
              },
            },
            _count: {
              select: {
                subTasks: true,
              },
            },
          },
        });
      } catch (err) {
        console.log(err);
        throw new TRPCError(formatError(err));
      }
    }),
  getTaskDetail: protectedProcedure
    .input(z.object({ taskId: z.string(), boardId: z.string() }))
    .query(async ({ ctx: { prisma, session }, input }) => {
      try {
        const taskDetail = await prisma.task.findUniqueOrThrow({
          where: {
            id: input.taskId,
            boardColumn: {
              board: {
                user: {
                  id: session.user.id,
                },
              },
            },
          },
          select: {
            id: true,
            title: true,
            description: true,
            subTasks: {
              select: {
                id: true,
                title: true,
                completed: true,
              },
            },
            boardColumn: {
              select: {
                id: true,
              },
            },
          },
        });

        const columns = await prisma.board.findUniqueOrThrow({
          where: {
            id: input.boardId,
          },
          select: {
            boardColumns: {
              orderBy: {
                order: "asc",
              },
              select: {
                id: true,
                title: true,
              },
            },
          },
        });

        return { taskDetail, ...columns };
      } catch (err) {
        console.log(err);
        throw new TRPCError(formatError(err));
      }
    }),
  saveTaskDetail: protectedProcedure
    .input(
      z.object({
        taskId: z.string(),
        columnId: z.string().optional(),
        subtasks: z
          .object({ completed: z.boolean(), id: z.string(), title: z.string() })
          .array(),
      })
    )
    .mutation(async ({ ctx: { prisma, session }, input }) => {
      try {
        return await prisma.$transaction(async (tx) => {
          if (input.subtasks.length) {
            await Promise.all(
              input.subtasks.map((st) =>
                tx.subTask.update({
                  where: {
                    id: st.id,
                    Task: {
                      id: input.taskId,
                    },
                  },
                  data: {
                    completed: st.completed,
                  },
                })
              )
            );
          }

          const saveTask = await tx.task.update({
            where: {
              id: input.taskId,
              boardColumn: {
                board: {
                  user: {
                    id: session.user.id,
                  },
                },
              },
            },
            data: {
              boardColumn: input.columnId
                ? {
                    connect: {
                      id: input.columnId,
                    },
                  }
                : undefined,
            },
            select: {
              id: true,
              subTasks: {
                select: {
                  id: true,
                  completed: true,
                  title: true,
                },
              },
              boardColumn: {
                select: {
                  id: true,
                },
              },
            },
          });

          return saveTask;
        });
      } catch (err) {
        console.log(err);
        throw new TRPCError(formatError(err));
      }
    }),
  editTask: protectedProcedure
    .input(
      z.object({
        taskId: z.string(),
        columnId: z.string().optional(),
        taskTitle: z.string().min(2).max(50).optional(),
        taskDescription: z.string().max(150).optional(),
        deleteSubtasks: z.string().min(1).array(),
        updateSubtasks: z
          .object({ title: z.string().min(1), id: z.string() })
          .array(),
        createSubtasks: z.object({ title: z.string().min(1) }).array(),
      })
    )
    .mutation(async ({ ctx: { prisma, session }, input }) => {
      try {
        return await prisma.$transaction(async (tx) => {
          if (input.updateSubtasks.length) {
            await Promise.all(
              input.updateSubtasks.map((st) =>
                tx.subTask.update({
                  where: {
                    id: st.id,
                    Task: {
                      id: input.taskId,
                    },
                  },
                  data: {
                    title: st.title,
                  },
                })
              )
            );
          }

          return await tx.task.update({
            where: {
              id: input.taskId,
              boardColumn: {
                board: {
                  user: {
                    id: session.user.id,
                  },
                },
              },
            },
            data: {
              title: input.taskTitle,
              description: input.taskDescription,
              boardColumn: input.columnId
                ? {
                    connect: {
                      id: input.columnId,
                    },
                  }
                : undefined,
              subTasks: {
                createMany: input.createSubtasks.length
                  ? {
                      data: input.createSubtasks.map((st) => ({
                        title: st.title,
                      })),
                    }
                  : undefined,
                deleteMany: input.deleteSubtasks.length
                  ? input.deleteSubtasks.map((st) => ({ id: st }))
                  : undefined,
              },
            },
            select: {
              id: true,
              title: true,
              description: true,
              subTasks: {
                select: {
                  id: true,
                  title: true,
                  completed: true,
                },
              },
              boardColumn: {
                select: {
                  id: true,
                },
              },
            },
          });
        });
      } catch (err) {
        console.log(err);
        throw new TRPCError(formatError(err));
      }
    }),
  deleteTask: protectedProcedure
    .input(z.object({ taskId: z.string() }))
    .mutation(async ({ ctx: { prisma, session }, input }) => {
      try {
        return await prisma.task.delete({
          where: {
            id: input.taskId,
            boardColumn: {
              board: {
                user: {
                  id: session.user.id,
                },
              },
            },
          },
          select: {
            boardColumn: {
              select: {
                id: true,
              },
            },
          },
        });
      } catch (err) {
        console.log(err);
        throw new TRPCError(formatError(err));
      }
    }),
  recentTasks: protectedProcedure.query(
    async ({ ctx: { prisma, session } }) => {
      try {
        return await prisma.task.findMany({
          where: {
            boardColumn: {
              board: {
                user: {
                  id: session.user.id,
                },
              },
            },
          },
          take: 5,
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            title: true,
            description: true,
            _count: {
              select: {
                subTasks: true,
              },
            },
            boardColumn: {
              select: {
                board: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        });
      } catch (err) {
        console.log(err);
        throw new TRPCError(formatError(err));
      }
    }
  ),
  tasksStatistic: protectedProcedure.query(
    async ({ ctx: { session, prisma } }) => {
      const currentYear = new Date().getFullYear();

      try {
        const tasks = await prisma.task.findMany({
          where: {
            createdAt: {
              gte: new Date(`${currentYear}-01-01`),
              lte: new Date(`${currentYear}-12-30`),
            },
            boardColumn: {
              board: {
                user: {
                  id: session.user.id,
                },
              },
            },
          },
          select: {
            createdAt: true,
          },
        });

        // Initialize all months with a count of 0
        const tasksByMonth = [
          { name: "Jan", total: 0 },
          { name: "Feb", total: 0 },
          { name: "Mar", total: 0 },
          { name: "Apr", total: 0 },
          { name: "May", total: 0 },
          { name: "Jun", total: 0 },
          { name: "Jul", total: 0 },
          { name: "Aug", total: 0 },
          { name: "Sep", total: 0 },
          { name: "Oct", total: 0 },
          { name: "Nov", total: 0 },
          { name: "Dec", total: 0 },
        ];

        // Update the counts for the months where tasks were created
        tasks.forEach((task) => {
          const monthName = new Intl.DateTimeFormat("en", {
            month: "short",
          }).format(task.createdAt);
          const index = tasksByMonth.findIndex(
            (month) => month.name === monthName
          );
          if (index !== -1) {
            tasksByMonth[index]!.total += 1;
          }
        });

        return tasksByMonth;
      } catch (err) {
        console.log(err);
        throw new TRPCError(formatError(err));
      }
    }
  ),
  reorderTasks: protectedProcedure
    .input(
      z.object({
        columnId: z.string(),
        tasks: z
          .object({ id: z.string().min(6), order: z.number().gte(0) })
          .array(),
        movedTask: z.string(),
      })
    )
    .mutation(async ({ ctx: { prisma, session }, input }) => {
      try {
        await prisma.board.findFirstOrThrow({
          where: {
            user: {
              id: session.user.id,
            },
            boardColumns: {
              some: {
                id: input.columnId,
              },
            },
          },
        });

        const reorderTasks = input.tasks.map((t) =>
          prisma.task.update({
            where: {
              id: t.id,
            },
            data: {
              order: t.order,
              boardColumn:
                t.id === input.movedTask
                  ? {
                      connect: {
                        id: input.columnId,
                      },
                    }
                  : undefined,
            },
          })
        );

        await prisma.$transaction(reorderTasks);
      } catch (err) {
        console.log(err);
        throw new TRPCError(formatError(err));
      }
    }),
});

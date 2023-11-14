import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { UsageExceededError } from "~/lib/exceptions";
import { formatError, pickColumnColor } from "~/lib/utils";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

const boardDetails = {
  id: true,
  title: true,
  boardColumns: {
    orderBy: {
      order: "asc",
    },
    select: {
      id: true,
      title: true,
      columnColor: true,
      order: true,
      tasks: {
        orderBy: {
          order: "asc",
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
      },
    },
  },
} as const;

export const boardRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(2).max(50),
        columns: z.string().array(),
      })
    )
    .mutation(
      async ({ ctx: { prisma, session }, input: { title, columns } }) => {
        try {
          const user = await prisma.user.findUniqueOrThrow({
            where: {
              id: session.user.id,
            },
            select: {
              usage: true,
              usageLimit: true,
            },
          });

          if (user.usage + 1 > user.usageLimit) throw new UsageExceededError();

          return await prisma.$transaction(async (tx) => {
            const newBoard = await tx.board.create({
              data: {
                title,
                user: {
                  connect: {
                    id: session.user.id,
                  },
                },
                boardColumns: columns.length
                  ? {
                      create: columns.map((c, idx) => ({
                        title: c,
                        columnColor: pickColumnColor(),
                        order: idx,
                      })),
                    }
                  : undefined,
              },
              select: {
                id: true,
                title: true,
              },
            });

            await tx.user.update({
              where: {
                id: session.user.id,
              },
              data: {
                usage: {
                  increment: 1,
                },
              },
            });

            return newBoard;
          });
        } catch (err) {
          console.log(err);
          if (err instanceof UsageExceededError) {
            throw new UsageExceededError();
          } else {
            throw new Error("Server error. Please try again later.");
          }
        }
      }
    ),
  getBoards: protectedProcedure.query(async ({ ctx: { prisma, session } }) => {
    try {
      const allBoards = await prisma.board.findMany({
        where: {
          user: {
            id: session.user.id,
          },
        },
        select: {
          id: true,
          title: true,
        },
      });
      return allBoards;
    } catch (err) {
      console.log(err);
      throw new TRPCError(formatError(err));
    }
  }),
  getSingleBoard: protectedProcedure
    .input(z.object({ boardID: z.string() }))
    .query(async ({ ctx: { prisma, session }, input }) => {
      try {
        return await prisma.board.findUniqueOrThrow({
          where: {
            id: input.boardID,
            user: {
              id: session.user.id,
            },
          },
          select: boardDetails,
        });
      } catch (err) {
        console.log(err);
        throw new TRPCError(formatError(err));
      }
    }),
  deleteBoard: protectedProcedure
    .input(z.object({ boardID: z.string() }))
    .mutation(async ({ ctx: { prisma, session }, input }) => {
      try {
        const deleteBoard = await prisma.board.delete({
          where: {
            id: input.boardID,
            user: {
              id: session.user.id,
            },
          },
        });

        if (deleteBoard.id) {
          return "Successfully Deleted";
        } else {
          throw new Error("Server Error. Please try again later");
        }
      } catch (err) {
        console.log(err);
        throw new TRPCError(formatError(err));
      }
    }),
  updateBoard: protectedProcedure
    .input(
      z.object({
        boardID: z.string(),
        title: z.string().min(2).max(50).optional(),
        deleteColumns: z.string().min(1).array(),
        updateColumns: z
          .object({ name: z.string().min(1), columnID: z.string() })
          .array(),
        createColumns: z.object({ name: z.string().min(1) }).array(),
      })
    )
    .mutation(async ({ ctx: { prisma, session }, input }) => {
      try {
        return await prisma.$transaction(async (tx) => {
          if (input.updateColumns.length) {
            await Promise.all(
              input.updateColumns.map((c) =>
                tx.boardColumn.update({
                  where: {
                    id: c.columnID,
                    board: {
                      id: input.boardID,
                    },
                  },
                  data: {
                    title: c.name,
                  },
                })
              )
            );
          }

          const getLastCol = await tx.boardColumn.findFirst({
            where: {
              board: {
                id: input.boardID,
              },
            },
            orderBy: {
              order: "desc",
            },
          });

          const nextOrder = getLastCol ? getLastCol.order + 1 : 0;

          const updatedBoard = await tx.board.update({
            where: {
              id: input.boardID,
              user: {
                id: session.user.id,
              },
            },
            data: {
              title: input.title,
              boardColumns: {
                createMany: input.createColumns.length
                  ? {
                      data: input.createColumns.map((c, idx) => ({
                        title: c.name,
                        columnColor: pickColumnColor(),
                        order: idx + nextOrder,
                      })),
                    }
                  : undefined,
                deleteMany: input.deleteColumns.length
                  ? input.deleteColumns.map((c) => ({ id: c }))
                  : undefined,
              },
            },
            select: boardDetails,
          });

          return updatedBoard;
        });
      } catch (err) {
        console.log(err);
        throw new TRPCError(formatError(err));
      }
    }),
  createColumn: protectedProcedure
    .input(
      z.object({ columnName: z.string().min(2).max(50), boardId: z.string() })
    )
    .mutation(async ({ ctx: { prisma, session }, input }) => {
      try {
        await prisma.board.findUniqueOrThrow({
          where: {
            id: input.boardId,
            user: {
              id: session.user.id,
            },
          },
        });

        const getLastCol = await prisma.boardColumn.findFirst({
          where: {
            board: {
              id: input.boardId,
            },
          },
          orderBy: {
            order: "desc",
          },
        });

        const nextOrder = getLastCol ? getLastCol.order + 1 : 0;

        return await prisma.boardColumn.create({
          data: {
            title: input.columnName,
            columnColor: pickColumnColor(),
            order: nextOrder,
            board: {
              connect: {
                id: input.boardId,
              },
            },
          },
          select: {
            id: true,
            title: true,
            columnColor: true,
            order: true,
          },
        });
      } catch (err) {
        console.log(err);
        throw new TRPCError(formatError(err));
      }
    }),
  reorderColumns: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        columns: z
          .object({ id: z.string().min(6), order: z.number().gte(0) })
          .array(),
      })
    )
    .mutation(async ({ ctx: { prisma, session }, input }) => {
      try {
        await prisma.board.findUniqueOrThrow({
          where: {
            id: input.boardId,
            user: {
              id: session.user.id,
            },
          },
        });

        const reorderColumns = input.columns.map((c) =>
          prisma.boardColumn.update({
            where: {
              id: c.id,
              board: {
                id: input.boardId,
              },
            },
            data: {
              order: c.order,
            },
          })
        );

        await prisma.$transaction(reorderColumns);
      } catch (err) {
        console.log(err);
        throw new TRPCError(formatError(err));
      }
    }),
});

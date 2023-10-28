import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { formatError, pickColumnColor } from "~/lib/utils";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

interface GetBoardDetailsProps {
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>;
  userId: string;
  boardID: string;
}

async function getBoardDetails({
  prisma,
  userId,
  boardID,
}: GetBoardDetailsProps) {
  return await prisma.board.findUniqueOrThrow({
    where: {
      id: boardID,
      user: {
        id: userId,
      },
    },
    select: {
      id: true,
      title: true,
      boardColumns: {
        select: {
          id: true,
          title: true,
          columnColor: true,
          tasks: {
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
    },
  });
}

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
          const newBoard = await prisma.board.create({
            data: {
              title,
              user: {
                connect: {
                  id: session.user.id,
                },
              },
              boardColumns: {
                create: columns.map((c) => ({
                  title: c,
                  columnColor: pickColumnColor(),
                })),
              },
            },
            select: {
              id: true,
              title: true,
            },
          });

          return newBoard;
        } catch (err) {
          console.log(err);
          throw new TRPCError(formatError(err));
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
        return await getBoardDetails({
          prisma,
          userId: session.user.id,
          boardID: input.boardID,
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
                      data: input.createColumns.map((c) => ({
                        title: c.name,
                        columnColor: pickColumnColor(),
                      })),
                    }
                  : undefined,
                deleteMany: input.deleteColumns.length
                  ? input.deleteColumns.map((c) => ({ id: c }))
                  : undefined,
              },
            },
            select: {
              id: true,
              title: true,
              boardColumns: {
                select: {
                  id: true,
                  title: true,
                  columnColor: true,
                  tasks: {
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
            },
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
        return await prisma.boardColumn.create({
          data: {
            title: input.columnName,
            columnColor: pickColumnColor(),
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
          },
        });
      } catch (err) {
        console.log(err);
        throw new TRPCError(formatError(err));
      }
    }),
});

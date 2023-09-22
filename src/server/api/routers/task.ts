import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { formatError } from "~/lib/utils";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const taskRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        columnId: z.string().min(6),
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

        return await prisma.task.create({
          data: {
            title: input.title,
            description: input.description,
            boardColumn: {
              connect: {
                id: input.columnId,
              },
            },
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
          },
        });
      } catch (err) {
        console.log(err);
        throw new TRPCError(formatError(err));
      }
    }),
  getTaskDetail: protectedProcedure
    .input(z.object({ taskId: z.string(), columnId: z.string() }))
    .query(async ({ ctx: { prisma, session }, input }) => {
      try {
        return await prisma.task.findUniqueOrThrow({
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
          },
        });
      } catch (err) {
        console.log(err);
        throw new TRPCError(formatError(err));
      }
    }),
});

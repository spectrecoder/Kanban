import { z } from "zod";
import { registerSchema } from "~/lib/validations/auth";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import bcrypt from "bcrypt";
import { formatError } from "~/lib/utils";
import { TRPCError } from "@trpc/server";
import cloudinary from "~/lib/cloudinaryConfig";

export const userRouter = createTRPCRouter({
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ ctx: { prisma }, input }) => {
      try {
        const { name, email, password, image } = input;

        const isUser = await prisma.user.count({
          where: {
            email,
          },
        });

        if (isUser) {
          throw new Error("User already exists!");
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt) as string;

        let userImage;

        if (image) {
          userImage = await cloudinary.uploader.upload(image);
        }

        await prisma.user.create({
          data: {
            name,
            email,
            image: userImage?.url,
            imageID: userImage?.public_id,
            hashedPassword,
          },
        });

        return { message: "Successfully registered" };
      } catch (err: any) {
        console.log(err);
        throw new TRPCError(formatError(err));
      }
    }),
  userStatistics: protectedProcedure.query(
    async ({ ctx: { prisma, session } }) => {
      try {
        const statistics = await prisma.user.findUniqueOrThrow({
          where: {
            id: session.user.id,
          },
          select: {
            plan: true,
            _count: {
              select: {
                boards: true,
              },
            },
            boards: {
              select: {
                boardColumns: {
                  select: {
                    _count: {
                      select: {
                        tasks: true,
                      },
                    },
                    tasks: {
                      select: {
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
            },
          },
        });

        return {
          currentPlan: statistics.plan,
          totalBoards: statistics._count.boards,
          totalTasks: statistics.boards.reduce(
            (acc, elm) =>
              acc + elm.boardColumns.reduce((a, t) => a + t._count.tasks, 0),
            0
          ),
          totalSubtasks: statistics.boards.reduce(
            (acc, elm) =>
              acc +
              elm.boardColumns.reduce(
                (a, t) =>
                  a + t.tasks.reduce((acc, st) => acc + st._count.subTasks, 0),
                0
              ),
            0
          ),
        };
      } catch (err) {
        console.log(err);
        throw new TRPCError(formatError(err));
      }
    }
  ),
});

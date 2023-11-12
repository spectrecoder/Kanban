import { z } from "zod";
import { stripe } from "~/lib/stripe";
import { getPlanFromPriceSlug } from "~/lib/stripe/utils";
import { absoluteUrl } from "~/lib/utils";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

const billingUrl = absoluteUrl("/");

export const subscriptionRouter = createTRPCRouter({
  checkout: protectedProcedure
    .input(
      z.object({
        plan: z.enum(["pro", "enterprise"]),
        recurring: z.enum(["monthly", "yearly"]),
      })
    )
    .mutation(async ({ ctx: { session }, input }) => {
      const subscriptionPlan = getPlanFromPriceSlug(input.plan)!;

      try {
        const stripeSession = await stripe.checkout.sessions.create({
          success_url: billingUrl,
          cancel_url: billingUrl,
          payment_method_types: ["card"],
          mode: "subscription",
          billing_address_collection: "auto",
          customer_email: session.user.email ?? undefined,
          line_items: [
            {
              price: subscriptionPlan.price[input.recurring].priceIds.test,
              quantity: 1,
            },
          ],
          metadata: {
            userId: session.user.id,
          },
        });

        return { url: stripeSession.url };
      } catch (err) {
        if (err instanceof z.ZodError) {
          return new Response(JSON.stringify(err.issues), { status: 422 });
        }

        return new Response(null, { status: 500 });
      }
    }),
  manage: protectedProcedure.mutation(async ({ ctx: { prisma, session } }) => {
    try {
      const user = await prisma.user.findUniqueOrThrow({
        where: {
          id: session.user.id,
        },
        select: {
          plan: true,
          stripeCustomerId: true,
        },
      });

      if (user.plan !== "free" && user.stripeCustomerId) {
        const { url } = await stripe.billingPortal.sessions.create({
          customer: user.stripeCustomerId,
          return_url: billingUrl,
        });

        return { url };
      } else {
        throw new Error("You are in free plan.");
      }
    } catch (err) {
      console.log(err);
      throw new Error("Server error. Please try again later.");
    }
  }),
  getUserSubscriptionPlan: protectedProcedure.query(
    async ({ ctx: { prisma, session } }) => {
      try {
        const user = await prisma.user.findUniqueOrThrow({
          where: {
            id: session.user.id,
          },
          select: {
            plan: true,
            stripeCustomerId: true,
            stripeCurrentPeriodEnd: true,
            usage: true,
            usageLimit: true,
          },
        });

        let isCanceled = false;

        if (user.plan !== "free" && user.stripeCustomerId) {
          const subscriptionId = (await stripe.subscriptions
            .list({
              customer: user.stripeCustomerId,
            })
            .then((res) => res?.data[0]?.id))!;

          const stipePlan = await stripe.subscriptions.retrieve(subscriptionId);
          isCanceled = stipePlan.cancel_at_period_end;
        }

        return {
          ...user,
          isCanceled,
        };
      } catch (err) {
        console.log(err);
        throw new Error("Server error. Please try again later.");
      }
    }
  ),
});

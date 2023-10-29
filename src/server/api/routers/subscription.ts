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
        recurring: z.enum(["monthly"]),
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
});

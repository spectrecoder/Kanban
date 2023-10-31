import type { NextApiRequest, NextApiResponse } from "next";
import { buffer } from "stream/consumers";
import Stripe from "stripe";
import { env } from "~/env.mjs";
import { stripe } from "~/lib/stripe";
import { getPlanFromPriceId } from "~/lib/stripe/utils";
import { prisma } from "~/server/db";

const relevantEvents = new Set([
  "checkout.session.completed",
  "invoice.payment_succeeded",
  // "customer.subscription.updated",
  "customer.subscription.deleted",
]);

type ResponseData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method === "POST") {
    // Process a POST request
    const buf = await buffer(req);
    const signature = req.headers["stripe-signature"] as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        buf,
        signature,
        env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error: any) {
      console.log(`Webhook Error: ${error.message}`);
      return res
        .status(400)
        .json({ message: `Webhook Error: ${error.message}` });
    }

    if (relevantEvents.has(event.type)) {
      try {
        if (event.type === "checkout.session.completed") {
          console.log("checkout.session.completed");

          const checkoutSession = event.data.object;

          const subscription = await stripe.subscriptions.retrieve(
            checkoutSession.subscription as string
          );

          const priceId = subscription.items.data[0]?.price.id;

          if (!priceId) throw new Error("Price Id is missing");

          const plan = getPlanFromPriceId(priceId);

          let usageLimit: number | undefined = undefined;

          if (
            subscription.items.data[0]!.price.recurring?.interval === "month"
          ) {
            usageLimit = plan?.quota;
          } else if (
            subscription.items.data[0]!.price.recurring?.interval === "year"
          ) {
            usageLimit = plan?.quota ? plan.quota * 12 : undefined;
          }

          // Update the user stripe into in our database.
          // Since this is the initial subscription, we need to update
          // the subscription related fields.
          await prisma.user.update({
            where: {
              id: checkoutSession?.metadata?.userId,
            },
            data: {
              stripeCustomerId: subscription.customer as string,
              stripePriceId: priceId,
              stripeCurrentPeriodEnd: new Date(
                subscription.current_period_end * 1000
              ),
              usageLimit,
              plan: plan?.slug,
            },
          });
        } else if (event.type === "invoice.payment_succeeded") {
          // gets called in checkout and subscription update event
          console.log("invoice.payment_succeeded");

          const invoiceSession = event.data.object;

          const subscription = await stripe.subscriptions.retrieve(
            invoiceSession.subscription as string
          );

          const priceId = subscription.items.data[0]?.price.id;

          if (!priceId) throw new Error("Price Id is missing");

          const user = await prisma.user.findUniqueOrThrow({
            where: {
              stripeCustomerId: subscription.customer as string,
            },
            select: {
              stripeCurrentPeriodEnd: true,
              stripePriceId: true,
            },
          });

          console.log(user);

          if (!user.stripePriceId || !user.stripeCurrentPeriodEnd)
            throw new Error("priceId or currentPeriodEnd is missing");

          const plan = getPlanFromPriceId(priceId);

          let usageLimit: number | undefined = undefined;

          if (
            subscription.items.data[0]?.price.recurring?.interval === "month"
          ) {
            usageLimit = plan?.quota;
          } else if (
            subscription.items.data[0]?.price.recurring?.interval === "year"
          ) {
            usageLimit = plan?.quota ? plan.quota * 12 : undefined;
          }

          const prevPlan = await stripe.plans.retrieve(user.stripePriceId);
          const prevDate = user.stripeCurrentPeriodEnd;

          function setUsage() {
            if (
              new Date(subscription.current_period_end * 1000).getTime() >
              new Date(prevDate).getTime()
            ) {
              if (
                prevPlan.interval === "month" &&
                subscription.items.data[0]?.price.recurring?.interval === "year"
              )
                return undefined;
              return 0;
            }
            return undefined;
          }

          await prisma.user.update({
            where: {
              stripeCustomerId: subscription.customer as string,
            },
            data: {
              usage: setUsage(),
              stripePriceId: priceId,
              stripeCurrentPeriodEnd: new Date(
                subscription.current_period_end * 1000
              ),
              usageLimit,
              plan: plan?.slug,
            },
          });
        } else if (event.type === "customer.subscription.deleted") {
          console.log("customer.subscription.deleted");

          const subscription = event.data.object;

          const stripeCustomerId = subscription.customer.toString();

          await prisma.user.update({
            where: {
              stripeCustomerId,
            },
            data: {
              usage: 0,
              usageLimit: 5,
              plan: "free",
              stripeCustomerId: null,
              stripePriceId: null,
              stripeCurrentPeriodEnd: null,
            },
          });
        }
      } catch (err) {
        console.log("STRIPE_WEBHOOK: " + err);
        return res.status(400).json({
          message: 'Webhook error: "Webhook handler failed. View logs."',
        });
      }
    } else {
      return res
        .status(400)
        .json({ message: `🤷‍♀️ Unhandled event type: ${event.type}` });
    }

    return res.status(200).json({ message: "Hello stripe" });
  } else {
    // Handle any other HTTP method
    res.status(200).json({ message: "Only POST method is allowed" });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};

/* 
else if (event.type === "customer.subscription.updated") {
          // gets called also in checkout event
          console.log("customer.subscription.updated");

          const subscriptionSession = event.data.object;

          const priceId = subscriptionSession.items.data[0]?.price.id;

          if (!priceId) throw new Error("PriceId is missing");

          const stripeCustomerId = subscriptionSession.customer.toString();
          const plan = getPlanFromPriceId(priceId);

          let usageLimit: number | undefined = undefined;

          if (
            subscriptionSession.items.data[0]?.price.recurring?.interval ===
            "month"
          ) {
            usageLimit = plan?.quota;
          } else if (
            subscriptionSession.items.data[0]?.price.recurring?.interval ===
            "year"
          ) {
            usageLimit = plan?.quota ? plan.quota * 12 : undefined;
          }

          await prisma.user.update({
            where: {
              stripeCustomerId,
            },
            data: {
              usageLimit,
              plan: plan?.slug,
            },
          });
        } 
*/

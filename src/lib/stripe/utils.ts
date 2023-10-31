export function getPlanFromPriceId(priceId: string) {
  return (
    PLANS.find((plan) => plan.price.monthly.priceIds.test === priceId) ||
    PLANS.find((plan) => plan.price.yearly.priceIds.test === priceId)
  );
}

export function getPlanFromPriceSlug(priceSlug: "pro" | "enterprise") {
  return PLANS.find((plan) => plan.slug === priceSlug);
}

export const PLANS = [
  {
    name: "Pro",
    slug: "pro",
    popular: true,
    quota: 25,
    price: {
      monthly: {
        amount: 5,
        priceIds: {
          test: "price_1O6VFCENdk7SXFEHNvGsfExE",
          production: null,
        },
      },
      yearly: {
        amount: 50,
        priceIds: {
          test: "price_1O7E36ENdk7SXFEHmcUwziLZ",
          production: null,
        },
      },
    },
  },
  {
    name: "Enterprise",
    slug: "enterprise",
    popular: false,
    quota: 50,
    price: {
      monthly: {
        amount: 10,
        priceIds: {
          test: "price_1O6VGLENdk7SXFEHBNhFs5ZZ",
          production: null,
        },
      },
      yearly: {
        amount: 100,
        priceIds: {
          test: "price_1O7E3wENdk7SXFEHrS1io0zF",
          production: null,
        },
      },
    },
  },
];

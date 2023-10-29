export function getPlanFromPriceId(priceId: string) {
  return PLANS.find((plan) => plan.price.monthly.priceIds.test === priceId);
}

export function getPlanFromPriceSlug(priceSlug: "pro" | "enterprise") {
  return PLANS.find((plan) => plan.slug === priceSlug);
}

export const PLANS = [
  {
    name: "Pro",
    slug: "pro",
    quota: 25,
    price: {
      monthly: {
        amount: 5,
        priceIds: {
          test: "price_1O6VFCENdk7SXFEHNvGsfExE",
          production: null,
        },
      },
      // yearly: {
      //   amount: 90,
      //   priceIds: {
      //     test: "price_1LoytoAlJJEpqkPVsWjM4tB9",
      //     production: "price_1LodNLAlJJEpqkPVRxUyCQgZ",
      //   },
      // },
    },
  },
  {
    name: "Enterprise",
    slug: "enterprise",
    quota: 50,
    price: {
      monthly: {
        amount: 10,
        priceIds: {
          test: "price_1O6VGLENdk7SXFEHBNhFs5ZZ",
          production: null,
        },
      },
      // yearly: {
      //   amount: 490,
      //   priceIds: {
      //     test: "price_1LoyrCAlJJEpqkPVgIlNG23q",
      //     production: "price_1LodLoAlJJEpqkPVJdwv5zrG",
      //   },
      // },
    },
  },
];

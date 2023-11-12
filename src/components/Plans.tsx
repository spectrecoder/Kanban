import { useModal } from "~/lib/hooks/useModal";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import { api } from "~/lib/api";
import { useToast } from "./ui/use-toast";
import { Loader2 } from "lucide-react";
import { PLANS, getPlanFromPriceSlug } from "~/lib/stripe/utils";
import { useState } from "react";
import { Switch } from "./ui/switch";
import ConfettiExplosion from "react-confetti-explosion";

const PRO = getPlanFromPriceSlug("pro")!;
const ENTERPRISE = getPlanFromPriceSlug("enterprise")!;

export default function Plans() {
  const [recurring, setRecurring] = useState<"monthly" | "yearly">("monthly");
  const { toast } = useToast();

  const [onClose, type] = useModal((state) => [state.onClose, state.type]);

  const { mutate: checkout, isLoading } = api.subscription.checkout.useMutation(
    {
      onSuccess: (data) => {
        if (data.url) {
          window.location.href = data.url;
        }
      },
      onError: (err) => {
        console.log(err);
        toast({
          variant: "destructive",
          description: "Server error. Please try again later",
        });
      },
    }
  );

  return (
    <Dialog open={type === "allPlans"} onOpenChange={onClose}>
      <DialogContent className="max-h-[90%] overflow-y-auto bg-main-background scrollbar-none sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>All plans</DialogTitle>
          <DialogDescription>Choose a suitable plan for you.</DialogDescription>
        </DialogHeader>

        {recurring === "yearly" && (
          <ConfettiExplosion
            style={{ left: "50%", position: "absolute", top: "10%" }}
            zIndex={10000}
          />
        )}

        <div className="mx-auto mb-3 flex w-fit items-center justify-center gap-x-5 rounded-md bg-board-background px-5 py-3">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Monthly
          </p>
          <Switch
            id="mode-toggle"
            checked={recurring === "yearly" ? true : false}
            onCheckedChange={() =>
              setRecurring((prev) =>
                prev === "monthly" ? "yearly" : "monthly"
              )
            }
          />
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Yearly
          </p>
        </div>

        <section className="grid grid-cols-3 gap-x-4">
          <div className="rounded-md bg-board-background p-3">
            <h3 className="flex justify-center text-lg font-medium tracking-widest">
              Free
            </h3>
            <h2 className="mt-2 flex items-baseline justify-center gap-x-2">
              <span className="text-3xl font-bold tracking-tight text-primary">
                $0
              </span>
              <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600 dark:text-gray-300">
                USD
              </span>
            </h2>
            <p className="my-3 flex justify-center text-sm tracking-wide text-gray-600 dark:text-gray-300">
              5 Boards Per Month
            </p>
            <Button className="w-full">Current plan</Button>
          </div>

          {PLANS.map((plan, idx) => (
            <div
              key={idx}
              className="relative rounded-md bg-board-background p-3"
            >
              {plan.popular ? (
                <Badge
                  variant="purple"
                  className="absolute -top-3 left-1/2 -translate-x-1/2"
                >
                  Popular
                </Badge>
              ) : null}
              <h3 className="flex justify-center text-lg font-medium tracking-widest">
                {plan.name}
              </h3>
              <h2 className="mt-2 flex items-baseline justify-center gap-x-2">
                <span className="text-3xl font-bold tracking-tight text-primary">
                  ${plan.price[recurring].amount}
                </span>
                <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600 dark:text-gray-300">
                  USD
                </span>
              </h2>
              <p className="my-3 flex justify-center text-sm tracking-wide text-gray-600 dark:text-gray-300">
                {recurring === "monthly" ? plan.quota : plan.quota * 12} Boards
                Per {recurring === "monthly" ? "Month" : "Year"}
              </p>
              <Button
                variant="purple"
                onClick={() =>
                  checkout({
                    plan: plan.slug as "pro" | "enterprise",
                    recurring,
                  })
                }
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading
                  </>
                ) : (
                  "Choose plan"
                )}
              </Button>
            </div>
          ))}

          {/* <div className="relative p-3 rounded-md bg-board-background">
            <Badge
              variant="purple"
              className="absolute -translate-x-1/2 -top-3 left-1/2"
            >
              Popular
            </Badge>
            <h3 className="flex justify-center text-lg font-medium tracking-widest">
              {PRO.name}
            </h3>
            <h2 className="flex items-baseline justify-center mt-2 gap-x-2">
              <span className="text-3xl font-bold tracking-tight text-primary">
                ${PRO.price.monthly.amount}
              </span>
              <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600 dark:text-gray-300">
                USD
              </span>
            </h2>
            <p className="flex justify-center my-3 text-sm tracking-wide text-gray-600 dark:text-gray-300">
              {PRO.quota} Boards Per Month
            </p>
            <Button
              variant="purple"
              onClick={() => checkout({ plan: "pro", recurring: "monthly" })}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading
                </>
              ) : (
                "Choose plan"
              )}
            </Button>
          </div>

          <div className="p-3 rounded-md bg-board-background">
            <h3 className="flex justify-center text-lg font-medium tracking-widest">
              {ENTERPRISE.name}
            </h3>
            <h2 className="flex items-baseline justify-center mt-2 gap-x-2">
              <span className="text-3xl font-bold tracking-tight text-primary">
                ${ENTERPRISE.price.monthly.amount}
              </span>
              <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600 dark:text-gray-300">
                USD
              </span>
            </h2>
            <p className="flex justify-center my-3 text-sm tracking-wide text-gray-600 dark:text-gray-300">
              {ENTERPRISE.quota} Boards Per Month
            </p>
            <Button
              className="w-full"
              disabled={isLoading}
              onClick={() =>
                checkout({ plan: "enterprise", recurring: "monthly" })
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading
                </>
              ) : (
                "Choose plan"
              )}
            </Button>
          </div> */}
        </section>
      </DialogContent>
    </Dialog>
  );
}

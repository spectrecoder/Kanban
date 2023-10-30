import { useEffect, useState } from "react";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { useModal } from "~/lib/hooks/useModal";
import { api } from "~/lib/api";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import Manage from "./Manage";

export function QuotaBar() {
  const openModal = useModal((state) => state.onOpen);

  const { data: subscriptionPlan, isLoading } =
    api.subscription.getUserSubscriptionPlan.useQuery();

  function showModal() {
    if (!subscriptionPlan || !subscriptionPlan.plan) return;
    if (subscriptionPlan.plan === "free") {
      openModal("allPlans");
    } else {
      openModal("managePlan");
    }
  }

  return (
    <div className="mx-4 mt-5">
      {!isLoading && !subscriptionPlan ? (
        <Alert variant="destructive" className="h-fit bg-board-background">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Sever error. Try again later</AlertDescription>
        </Alert>
      ) : (
        <>
          {subscriptionPlan && (
            <p className="text-sm text-primary">
              <span className="font-medium">
                {subscriptionPlan.plan[0]?.toUpperCase() +
                  subscriptionPlan.plan?.slice(1)}
              </span>{" "}
              (
              {subscriptionPlan.usage > subscriptionPlan.usageLimit
                ? subscriptionPlan.usageLimit
                : subscriptionPlan.usage}
              /{subscriptionPlan.usageLimit})
            </p>
          )}
          {subscriptionPlan && (
            <Progress
              value={
                subscriptionPlan.usage > subscriptionPlan.usageLimit
                  ? subscriptionPlan.usageLimit
                  : (subscriptionPlan.usage / subscriptionPlan.usageLimit) * 100
              }
              className="mt-1 w-full"
            />
          )}
          <Button
            disabled={isLoading}
            variant="purple"
            className="mt-2 w-full"
            onClick={showModal}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : subscriptionPlan.plan === "free" ? (
              "Upgrade 💎"
            ) : (
              "Manage Subscription"
            )}
          </Button>
        </>
      )}

      {subscriptionPlan ? <Manage subscriptionPlan={subscriptionPlan} /> : null}
    </div>
  );
}

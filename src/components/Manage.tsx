import { useModal } from "~/lib/hooks/useModal";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import { RouterOutputs, api } from "~/lib/api";
import { useToast } from "./ui/use-toast";
import { formatDate } from "~/lib/utils";
import { Loader2 } from "lucide-react";

interface Props {
  subscriptionPlan: RouterOutputs["subscription"]["getUserSubscriptionPlan"];
}

export default function Manage({ subscriptionPlan }: Props) {
  const { toast } = useToast();

  const [onClose, type] = useModal((state) => [state.onClose, state.type]);

  const { mutate: manage, isLoading } = api.subscription.manage.useMutation({
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (err) => {
      console.log(err);
      toast({
        variant: "destructive",
        description: err.shape?.message,
      });
    },
  });

  return (
    <Dialog open={type === "managePlan"} onOpenChange={onClose}>
      <DialogContent className="max-h-[90%] overflow-y-auto bg-board-background scrollbar-none sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Subscription Plan</DialogTitle>
          <DialogDescription>
            You are currently on the{" "}
            <strong className="font-bold">
              {subscriptionPlan.plan.toUpperCase()}
            </strong>{" "}
            plan.
          </DialogDescription>
        </DialogHeader>
        <p>
          The{" "}
          <strong className="font-bold">
            {subscriptionPlan.plan.toUpperCase()}
          </strong>{" "}
          plan has{" "}
          <strong className="font-bold">{subscriptionPlan.usageLimit}</strong>{" "}
          boards
        </p>
        <DialogFooter className="flex w-full items-center sm:justify-between">
          <Button
            variant="purple"
            disabled={isLoading}
            onClick={() => manage()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading
              </>
            ) : (
              "Manage Subscription"
            )}
          </Button>
          {subscriptionPlan.plan !== "free" ? (
            <p className="pb-2 text-sm font-medium text-gray-600 dark:text-gray-300">
              {subscriptionPlan.isCanceled
                ? "Your plan will be canceled on "
                : "Your plan renews on "}
              {formatDate(subscriptionPlan.stripeCurrentPeriodEnd!)}.
            </p>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

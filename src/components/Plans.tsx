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

export default function Plans() {
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

          <div className="relative rounded-md bg-board-background p-3">
            <Badge
              variant="purple"
              className="absolute -top-3 left-1/2 -translate-x-1/2"
            >
              Popular
            </Badge>
            <h3 className="flex justify-center text-lg font-medium tracking-widest">
              Pro
            </h3>
            <h2 className="mt-2 flex items-baseline justify-center gap-x-2">
              <span className="text-3xl font-bold tracking-tight text-primary">
                $5
              </span>
              <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600 dark:text-gray-300">
                USD
              </span>
            </h2>
            <p className="my-3 flex justify-center text-sm tracking-wide text-gray-600 dark:text-gray-300">
              25 Boards Per Month
            </p>
            <Button
              variant="purple"
              onClick={() => checkout({ plan: "pro", recurring: "monthly" })}
              disabled={isLoading}
              className="w-full"
            >
              Choose plan
            </Button>
          </div>

          <div className="rounded-md bg-board-background p-3">
            <h3 className="flex justify-center text-lg font-medium tracking-widest">
              Enterprise
            </h3>
            <h2 className="mt-2 flex items-baseline justify-center gap-x-2">
              <span className="text-3xl font-bold tracking-tight text-primary">
                $10
              </span>
              <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600 dark:text-gray-300">
                USD
              </span>
            </h2>
            <p className="my-3 flex justify-center text-sm tracking-wide text-gray-600 dark:text-gray-300">
              50 Boards Per Month
            </p>
            <Button
              className="w-full"
              disabled={isLoading}
              onClick={() =>
                checkout({ plan: "enterprise", recurring: "monthly" })
              }
            >
              Choose plan
            </Button>
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
}

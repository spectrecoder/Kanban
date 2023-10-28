import { useEffect, useState } from "react";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { useModal } from "~/lib/hooks/useModal";

export function QuotaBar() {
  const [progress, setProgress] = useState<number>(50);
  const openModal = useModal((state) => state.onOpen);

  return (
    <div className="mx-4 mt-5">
      <p className="text-sm text-primary">
        <span className="font-medium">Free</span> (1/5)
      </p>
      <Progress value={progress} className="mt-1 w-full" />
      <Button
        variant="purple"
        className="mt-2 w-full"
        onClick={() => openModal("allPlans")}
      >
        See Plans
      </Button>
    </div>
  );
}

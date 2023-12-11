import { useAutoAnimate } from "@formkit/auto-animate/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { useRouter } from "next/router";
import { useFieldArray, useForm } from "react-hook-form";
import { Button } from "src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";
import * as z from "zod";
import { api } from "~/lib/api";
import { useModal } from "~/lib/hooks/useModal";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { useToast } from "./ui/use-toast";
import { UsageExceededError } from "~/lib/exceptions";

const formSchema = z.object({
  boardName: z
    .string()
    .min(2, { message: "Must be 2 or more characters long" })
    .max(50, { message: "Must be 50 or fewer characters long" }),
  boardColumns: z
    .object({ name: z.string() })
    .array()
    .transform((value) => value.filter((c) => c.name)),
});

export default function CreateBoard() {
  const router = useRouter();
  const [boardColumnsParent] = useAutoAnimate();
  const { toast } = useToast();
  const utils = api.useContext();

  const [onClose, type] = useModal((state) => [state.onClose, state.type]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      boardName: "",
      boardColumns: [{ name: "" }, { name: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control, // control props comes from useForm (optional: if you are using FormContext)
    name: "boardColumns", // unique name for Field Array
  });

  const { mutate: createBoard, isLoading: creatingBoard } =
    api.board.create.useMutation({
      onSuccess: (data) => {
        toast({
          description: "Board created",
        });
        form.setValue("boardColumns", [{ name: "" }, { name: "" }]);
        form.setValue("boardName", "");
        router.push(`/board/${data.id}`);
        onClose();
        utils.board.getBoards.setData(undefined, (old) => {
          if (!old) return old;
          return [...old, data];
        });
        utils.subscription.getUserSubscriptionPlan.setData(undefined, (old) => {
          if (!old) return old;
          return { ...old, usage: old.usage + 1 };
        });
      },
      onError: (err) => {
        console.log(err);
        toast({
          variant: "destructive",
          description: err.shape?.message,
        });
      },
    });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // ✅ This will be type-safe and validated.
    const columns = values.boardColumns.map((c) => c.name);
    createBoard({ title: values.boardName, columns });
  }

  return (
    <Dialog open={type === "createBoard"} onOpenChange={onClose}>
      <DialogContent className="max-h-[90%] overflow-y-auto bg-main-background scrollbar-none sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add new board</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="boardName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Board Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Web Design"
                      {...field}
                      className="cursor-pointer outline-0 ring-offset-0 focus-visible:border-main-color focus-visible:outline-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <fieldset className="grid w-full gap-2.5">
              <Label>Board Columns</Label>
              <div ref={boardColumnsParent} className="space-y-2.5">
                {fields.map((bc, idx) => (
                  <FormField
                    key={bc.id}
                    control={form.control}
                    name={`boardColumns.${idx}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex items-center gap-x-2">
                            <Input
                              {...field}
                              className="cursor-pointer outline-0 ring-offset-0 focus-visible:border-main-color focus-visible:outline-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                            <X
                              onClick={() => remove(idx)}
                              className="h-7 w-7 cursor-pointer text-gray-400"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </fieldset>

            <DialogFooter className="gap-y-2 sm:flex-col sm:space-x-0">
              <Button
                type="button"
                size="full"
                className="font-bold capitalize text-white dark:text-main-color"
                onClick={() => append({ name: "" })}
              >
                + add new column
              </Button>

              <Button
                type="submit"
                size="full"
                variant="purple"
                disabled={creatingBoard}
                className="mt-6 w-full font-bold capitalize"
              >
                {creatingBoard ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating
                  </>
                ) : (
                  "Create new board"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "src/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "src/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "src/components/ui/select";
import { z } from "zod";
import { Checkbox } from "./ui/checkbox";
import TaskSettings from "./TaskSettings";
import { useTaskDetails } from "~/lib/hooks/use-task-details";

const formSchema = z.object({
  status: z.string(),
});

export default function TaskCard() {
  const [isOpen, onClose] = useTaskDetails((state) => [
    state.isOpen,
    state.onClose,
  ]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "todo",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* <DialogTrigger asChild>
        <div className="group cursor-pointer space-y-1 rounded-lg bg-main-background p-4 shadow-sm shadow-indigo-500/20">
          <h3 className="text-base font-bold tracking-wide text-primary group-hover:text-main-color">
            Build UI for onboarding flow
          </h3>
          <p className="text-xs font-semibold text-gray-500">0 of 3 subtasks</p>
        </div>
      </DialogTrigger> */}
      <DialogContent className="max-h-[90%] overflow-y-auto bg-main-background scrollbar-none sm:max-w-[425px]">
        <header className="flex items-center justify-between gap-x-2">
          <DialogHeader>
            <DialogTitle>Build UI for onboarding flow</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <TaskSettings />
        </header>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-2.5 space-y-4"
          >
            <div>
              <p className="mb-3 text-sm font-semibold tracking-widest text-gray-400">
                Subtasks (0 of 2)
              </p>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 rounded-sm bg-board-background p-3 hover:bg-main-color/20 dark:hover:bg-main-color/30">
                  <Checkbox
                    id="subtask1"
                    className="data-[state=checked]:border-main-color data-[state=checked]:bg-main-color data-[state=checked]:text-white"
                  />
                  <label
                    htmlFor="subtask1"
                    className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 peer-aria-checked:text-gray-400 peer-aria-checked:line-through"
                  >
                    Accept terms and conditions
                  </label>
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue="todo">
                    <FormControl>
                      <SelectTrigger className="w-full outline-0 ring-offset-0 focus:border-main-color focus:outline-0 focus:ring-0 focus:ring-offset-0">
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Status</SelectLabel>
                        <SelectItem value="todo">Todo</SelectItem>
                        <SelectItem value="doing">Doing</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

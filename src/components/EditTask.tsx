import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "src/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "src/components/ui/form";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "src/components/ui/select";
import * as z from "zod";
import { useModal } from "~/lib/hooks/useModal";
import { Textarea } from "./ui/textarea";
import { Dispatch, SetStateAction } from "react";
import { RouterOutputs } from "~/lib/api";

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  taskDetail: RouterOutputs["task"]["getTaskDetail"]["taskDetail"] | undefined;
}

const formSchema = z.object({
  taskName: z
    .string()
    .min(2, { message: "Must be 2 or more characters long" })
    .max(50, { message: "Must be 50 or fewer characters long" }),
  description: z
    .string()
    .max(150, { message: "Must be 150 or fewer characters long" })
    .optional(),
  status: z.string(),
});

export default function EditTask({ open, setOpen, taskDetail }: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      taskName: "",
      description: "",
      status: "todo",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[90%] overflow-y-auto bg-main-background scrollbar-none sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit task</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="taskName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Name</FormLabel>
                  <FormControl>
                    <Input
                      defaultValue="Build UI for onboarding flow"
                      placeholder="e.g. Take coffee break"
                      {...{ ...field, value: undefined }}
                      className="cursor-pointer outline-0 ring-offset-0 focus-visible:border-main-color focus-visible:outline-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      defaultValue="It's always good to take a break. This  15 minute break will  recharge the batteries  a little."
                      placeholder="e.g. It's always good to take a break. This  15 minute break will  recharge the batteries  a little."
                      className="h-28 cursor-pointer resize-none outline-0 ring-offset-0 focus-visible:border-main-color focus-visible:outline-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      {...{ ...field, value: undefined }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <fieldset className="grid w-full gap-2.5">
              <Label>Subtasks</Label>
              <div className="flex items-center gap-x-2">
                <Input
                  defaultValue="Sign up page"
                  className="cursor-pointer outline-0 ring-offset-0 focus-visible:border-main-color focus-visible:outline-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <X className="h-7 w-7 cursor-pointer text-gray-400" />
              </div>
              <div className="flex items-center gap-x-2">
                <Input
                  defaultValue="Sign in page"
                  className="cursor-pointer outline-0 ring-offset-0 focus-visible:border-main-color focus-visible:outline-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <X className="h-7 w-7 cursor-pointer text-gray-400" />
              </div>
              <div className="flex items-center gap-x-2">
                <Input
                  defaultValue="Welcome page"
                  className="cursor-pointer outline-0 ring-offset-0 focus-visible:border-main-color focus-visible:outline-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <X className="h-7 w-7 cursor-pointer text-gray-400" />
              </div>
            </fieldset>

            <Button
              type="button"
              size="full"
              className="w-full font-bold capitalize text-white dark:text-main-color"
            >
              + add new subtask
            </Button>

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

            <DialogFooter className="sm:flex-col sm:space-x-0">
              <Button
                type="submit"
                size="full"
                variant="purple"
                className="w-full font-bold capitalize"
              >
                edit task
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

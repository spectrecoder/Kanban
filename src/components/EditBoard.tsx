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
import * as z from "zod";
import { useEditBoard } from "~/lib/hooks/use-edit-board";

const formSchema = z.object({
  boardName: z
    .string()
    .min(2, { message: "Must be 2 or more characters long" })
    .max(50, { message: "Must be 50 or fewer characters long" }),
});

export default function EditBoard() {
  const [isOpen, onClose] = useEditBoard((state) => [
    state.isOpen,
    state.onClose,
  ]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      boardName: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90%] overflow-y-auto bg-main-background scrollbar-none sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit board</DialogTitle>
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
                      defaultValue="Platform Launch"
                      placeholder="e.g. Wandering Maniac"
                      {...{ ...field, value: undefined }}
                      className="cursor-pointer outline-0 ring-offset-0 focus-visible:border-main-color focus-visible:outline-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <fieldset className="grid w-full gap-2.5">
              <Label>Board Columns</Label>
              <div className="flex items-center gap-x-2">
                <Input
                  defaultValue="Todo"
                  className="cursor-pointer outline-0 ring-offset-0 focus-visible:border-main-color focus-visible:outline-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <X className="h-7 w-7 cursor-pointer text-gray-400" />
              </div>
              <div className="flex items-center gap-x-2">
                <Input
                  defaultValue="Doing"
                  className="cursor-pointer outline-0 ring-offset-0 focus-visible:border-main-color focus-visible:outline-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <X className="h-7 w-7 cursor-pointer text-gray-400" />
              </div>
              <div className="flex items-center gap-x-2">
                <Input
                  defaultValue="Done"
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
              + add new column
            </Button>

            <DialogFooter className="sm:flex-col sm:space-x-0">
              <Button
                type="submit"
                size="full"
                variant="purple"
                className="w-full font-bold capitalize"
              >
                save changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

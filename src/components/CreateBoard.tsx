import { zodResolver } from "@hookform/resolvers/zod";
import { PanelRight, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "src/components/ui/dialog";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";

const formSchema = z.object({
  boardName: z
    .string()
    .min(2, { message: "Must be 2 or more characters long" })
    .max(50, { message: "Must be 50 or fewer characters long" }),
});

export default function CreateBoard() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      boardName: "",
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // ✅ This will be type-safe and validated.
    console.log(values);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className={`mr-6 flex items-center gap-x-4 rounded-r-full py-3 pl-5 text-main-color transition-all duration-300 hover:bg-board-background hover:text-main-color`}
        >
          <PanelRight className="h-[1.2rem] w-[1.2rem]" />
          <p className="text-base font-semibold capitalize">
            +create new board
          </p>
        </button>
      </DialogTrigger>
      <DialogContent className="bg-main-background sm:max-w-[425px]">
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
              <div className="flex items-center gap-x-2">
                <Input className="cursor-pointer outline-0 ring-offset-0 focus-visible:border-main-color focus-visible:outline-0 focus-visible:ring-0 focus-visible:ring-offset-0" />
                <X className="h-7 w-7 cursor-pointer text-gray-400" />
              </div>
              <div className="flex items-center gap-x-2">
                <Input className="cursor-pointer outline-0 ring-offset-0 focus-visible:border-main-color focus-visible:outline-0 focus-visible:ring-0 focus-visible:ring-offset-0" />
                <X className="h-7 w-7 cursor-pointer text-gray-400" />
              </div>
            </fieldset>

            <DialogFooter className="sm:flex-col sm:space-x-0">
              <Button
                type="button"
                size="full"
                className="font-bold capitalize text-white dark:text-main-color"
              >
                + add new column
              </Button>

              <Button
                type="submit"
                size="full"
                variant="purple"
                className="mt-6 w-full font-bold capitalize"
              >
                create new board
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "src/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "src/components/ui/form";
import { Input } from "src/components/ui/input";
import * as z from "zod";
import { useToast } from "./ui/use-toast";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";

interface Props {
  setCurrentCard: Dispatch<SetStateAction<"Login" | "Register">>;
}

const formSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(4, { message: "Must be 4 or more characters long" })
    .max(15, { message: "Must be 15 or fewer characters long" }),
});

export default function Login({ setCurrentCard }: Props) {
  const { toast } = useToast();

  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    console.log(values);
    signIn("credentials", { ...values, redirect: false }).then((cb) => {
      setIsLoading(false);

      if (cb?.ok) {
        toast({
          description: "Successfully Logged in",
        });
        router.push("/");
      }

      if (cb?.error) {
        toast({
          variant: "destructive",
          description: "Invalid credentials",
        });
      }
    });
  }

  return (
    <Card className="max-h-[90%] overflow-y-auto bg-board-background scrollbar-none">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-6">
          <Button variant="purple" onClick={() => void signIn("discord")}>
            Discord
          </Button>
          <Button variant="destructive" onClick={() => void signIn("google")}>
            Google
          </Button>
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="px-2 bg-board-background text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="m@example.com"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging in
                </>
              ) : (
                "Log In"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter>
        <p className="text-sm font-semibold text-gray-400">
          Don't have an account?{" "}
          <span
            className="cursor-pointer text-main-color hover:underline"
            onClick={() => setCurrentCard("Register")}
          >
            Register
          </span>{" "}
        </p>
      </CardFooter>
    </Card>
  );
}

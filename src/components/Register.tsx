import { zodResolver } from "@hookform/resolvers/zod";
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
import { Avatar, AvatarFallback, AvatarImage } from "src/components/ui/avatar";
import { Input } from "src/components/ui/input";
import * as z from "zod";
import { Dispatch, SetStateAction } from "react";
import { registerSchema } from "~/lib/validations/auth";
import { api } from "~/lib/api";
import { useToast } from "./ui/use-toast";
import { Loader2 } from "lucide-react";

interface Props {
  setCurrentCard: Dispatch<SetStateAction<"Login" | "Register">>;
}

export default function Register({ setCurrentCard }: Props) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      image: undefined,
      email: "",
      password: "",
      name: "",
    },
  });

  const { mutate: registerUser, isLoading: registeringUser } =
    api.user.register.useMutation({
      onSuccess: (data) => {
        toast({
          description: data.message,
        });
        setCurrentCard("Login");
      },
      onError: (err) => {
        console.log(err);
        toast({
          variant: "destructive",
          description: err.message,
        });
      },
    });

  function onSubmit(values: z.infer<typeof registerSchema>) {
    console.log(values);
    registerUser(values);
  }

  function handleImageChange(file: File | undefined) {
    if (file === undefined) return;
    const reader = (readFile: File) =>
      new Promise<string>((resolve) => {
        const fileReader = new FileReader();
        fileReader.onload = () => resolve(fileReader.result as string);
        fileReader.readAsDataURL(readFile);
      });

    reader(file)
      .then((result: string) =>
        form.setValue("image", result, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        })
      )
      .catch((err) => console.log(err));
  }

  return (
    <Card className="max-h-[90%] overflow-y-auto bg-board-background scrollbar-none">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription>
          Enter your email below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 ">
        <div className="grid grid-cols-2 gap-6">
          <Button variant="purple">Discord</Button>
          <Button variant="destructive">Google</Button>
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-board-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            {form.getValues().image ? (
              <Avatar className="mx-auto h-14 w-14">
                <AvatarImage src={form.getValues().image} alt="@shadcn" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            ) : null}

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <Input
                      {...{
                        ...field,
                        value: undefined,
                      }}
                      onChange={(e) =>
                        handleImageChange(
                          e.target.files ? e.target.files[0] : undefined
                        )
                      }
                      type="file"
                      accept="image/*"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} type="text" placeholder="John Doe" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <Button disabled={registeringUser} className="w-full">
              {registeringUser ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering
                </>
              ) : (
                "Register"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter>
        <p className="text-sm font-semibold text-gray-400">
          Already have an account?{" "}
          <span
            className="cursor-pointer text-main-color hover:underline"
            onClick={() => setCurrentCard("Login")}
          >
            Login
          </span>{" "}
        </p>
      </CardFooter>
    </Card>
  );
}

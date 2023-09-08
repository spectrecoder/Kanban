import { TRPCError } from "@trpc/server";
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatError(err: any) {
  const formattedError: TRPCError = {
    name: "TRPCError",
    code: "INTERNAL_SERVER_ERROR",
    message:
      (err.response && err.response.data && err.response.data.message) ||
      err.message ||
      err.toString(),
    cause: err,
  };
  return formattedError;
}
import { TRPCError } from "@trpc/server";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { COLUMN_COLORS } from "./constants";
import { env } from "~/env.mjs";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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

export function avatarFallback(name: string) {
  const nameArray = name.split(" ");
  const fallback =
    nameArray.length > 1
      ? nameArray[0]![0]! + nameArray[1]![0]!
      : nameArray[0]![0]! + nameArray[0]![1]!;
  return fallback.toUpperCase();
}

export function pickColumnColor(): string {
  return COLUMN_COLORS[
    Math.floor(Math.random() * COLUMN_COLORS.length)
  ] as string;
}

export function formatDate(input: Date): string {
  const date = new Date(input);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function absoluteUrl(path: string) {
  return `${env.NEXT_PUBLIC_APP_URL}${path}`;
}

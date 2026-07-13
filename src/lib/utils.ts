import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Note: standard twMerge works perfectly for class joining
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

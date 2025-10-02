import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Common link styles for data grids
export const gridLinkStyles = {
  base: "text-blue-600 hover:text-blue-800 dark:text-yellow-400 dark:hover:text-yellow-300 hover:underline",
  withIcon: "flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-yellow-400 dark:hover:text-yellow-300 hover:underline group",
  icon: "h-3 w-3 flex-shrink-0 group-hover:text-blue-800 dark:group-hover:text-yellow-300"
}
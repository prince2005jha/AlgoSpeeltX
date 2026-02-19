import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function ellipseAddress(address: string | undefined, amountToShrink = 8): string {
  if (!address) return 'Not Connected';
  
  if (amountToShrink > address.length / 2) {
    amountToShrink = Math.floor(address.length / 2);
  }
  
  return `${address.slice(0, amountToShrink)}...${address.slice(-amountToShrink)}`;
}

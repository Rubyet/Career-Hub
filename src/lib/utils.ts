import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

export function getReadinessColor(score: number): string {
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-yellow-500";
  if (score >= 40) return "text-orange-500";
  return "text-red-500";
}

export function getReadinessBgColor(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
}

export function getDifficultyColor(level: string): string {
  const colors: Record<string, string> = {
    Junior: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    "Mid-level": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    Senior: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    Staff: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    Lead: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };
  return colors[level] || "bg-gray-100 text-gray-800";
}

export function getCompetitivenessColor(level: string): string {
  const colors: Record<string, string> = {
    Easy: "text-green-500",
    Moderate: "text-yellow-500",
    Competitive: "text-orange-500",
    "Highly Competitive": "text-red-500",
  };
  return colors[level] || "text-gray-500";
}

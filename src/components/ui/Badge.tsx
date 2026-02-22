"use client";
import React from "react";
import { cn } from "./cn";

const variantClasses = {
  default: "bg-gray-100 text-gray-600 ring-1 ring-gray-200/60",
  // Job statuses
  OPEN:        "bg-primary-50 text-primary-700 ring-1 ring-primary-200/80",
  IN_PROGRESS: "bg-blue-50  text-blue-700  ring-1 ring-blue-200/80",
  COMPLETED:   "bg-primary-50 text-primary-800 ring-1 ring-primary-200/80",
  CANCELLED:   "bg-red-50   text-red-700   ring-1 ring-red-200/80",
  // Bid statuses
  PENDING:     "bg-amber-50  text-amber-700  ring-1 ring-amber-200/80",
  ACCEPTED:    "bg-primary-50 text-primary-700 ring-1 ring-primary-200/80",
  REJECTED:    "bg-red-50   text-red-700   ring-1 ring-red-200/80",
  WITHDRAWN:   "bg-gray-100  text-gray-500  ring-1 ring-gray-200/60",
} as const;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variantClasses;
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}

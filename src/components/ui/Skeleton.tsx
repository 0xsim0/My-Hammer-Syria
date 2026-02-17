import React from "react";
import { cn } from "./cn";

const variantClasses = {
  text: "h-4 w-full rounded",
  avatar: "h-10 w-10 rounded-full",
  card: "h-32 w-full rounded-xl",
  image: "h-48 w-full rounded-lg",
} as const;

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof variantClasses;
}

export function Skeleton({
  variant = "text",
  className,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-gray-200",
        "motion-reduce:animate-none motion-reduce:bg-gray-300",
        variantClasses[variant],
        className
      )}
      aria-hidden="true"
      {...props}
    />
  );
}

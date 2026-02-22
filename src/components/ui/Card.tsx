"use client";
import React from "react";
import { cn } from "./cn";

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border border-gray-100 bg-white",
      "shadow-[0_1px_4px_0_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.04)]",
      "transition-all duration-200 ease-out",
      "hover:border-gray-200 hover:shadow-[0_4px_16px_0_rgba(0,0,0,0.08),0_2px_6px_-2px_rgba(0,0,0,0.05)]",
      "motion-reduce:transition-none",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col gap-1.5 p-6 pb-4", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-6 pb-6", className)}
    {...props}
  />
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center border-t border-gray-100/80 px-6 py-4",
      className
    )}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

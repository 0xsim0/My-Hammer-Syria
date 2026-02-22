"use client";

import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "./cn";
import { Spinner } from "./Spinner";

const variantClasses = {
  primary:
    "bg-primary-600 text-white shadow-sm shadow-primary-600/30 " +
    "hover:bg-primary-500 hover:shadow-md hover:shadow-primary-500/40 hover:-translate-y-px " +
    "active:bg-primary-700 active:translate-y-0 active:shadow-sm",
  secondary:
    "bg-gray-100 text-gray-800 shadow-sm " +
    "hover:bg-gray-200 hover:shadow " +
    "active:bg-gray-300",
  ghost:
    "bg-transparent text-gray-700 " +
    "hover:bg-gray-100 hover:text-gray-900 " +
    "active:bg-gray-200",
  destructive:
    "bg-red-600 text-white shadow-sm shadow-red-600/30 " +
    "hover:bg-red-500 hover:shadow-md hover:shadow-red-500/40 hover:-translate-y-px " +
    "active:bg-red-700 active:translate-y-0 active:shadow-sm",
  outline:
    "border border-gray-300 bg-white text-gray-700 shadow-sm " +
    "hover:border-primary-400 hover:text-primary-700 hover:bg-primary-50 hover:shadow " +
    "active:bg-primary-100 active:border-primary-500",
} as const;

const sizeClasses = {
  sm: "h-8 px-3 text-sm gap-1.5 rounded-md",
  md: "h-10 px-4 text-sm gap-2 rounded-lg",
  lg: "h-12 px-6 text-base gap-2.5 rounded-xl",
  icon: "h-10 w-10 p-0 rounded-lg",
} as const;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantClasses;
  size?: keyof typeof sizeClasses;
  isLoading?: boolean;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      asChild = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = disabled || isLoading;

    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium",
          "transition-all duration-200 ease-out",
          "touch-manipulation select-none",
          "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:outline-none",
          "disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:translate-y-0",
          "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        disabled={isDisabled}
        aria-disabled={isLoading ? true : undefined}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {isLoading && (
              <Spinner
                size="sm"
                className="animate-spin motion-reduce:animate-[spin_1.5s_linear_infinite]"
              />
            )}
            {children}
          </>
        )}
      </Comp>
    );
  }
);

Button.displayName = "Button";

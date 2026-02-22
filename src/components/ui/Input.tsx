"use client";
import React from "react";
import { cn } from "./cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, type, ...props }, ref) => {
    const inputId = id || React.useId();
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const describedBy = [errorId, helperId].filter(Boolean).join(" ") || undefined;

    const shouldDisableSpellCheck =
      type === "email" || type === "password" || props.autoComplete === "username";

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-semibold text-gray-700 tracking-tight"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          spellCheck={shouldDisableSpellCheck ? false : undefined}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className={cn(
            "flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm",
            "border-gray-200 text-gray-900 placeholder:text-gray-400",
            "shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]",
            "transition-all duration-200 ease-out",
            "hover:border-gray-300",
            "focus-visible:border-primary-400 focus-visible:ring-3 focus-visible:ring-primary-500/20 focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(18,188,108,0.15)]",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
            "motion-reduce:transition-none",
            // RTL-compatible logical border
            "border-is-[1px]",
            error && [
              "border-red-400",
              "focus-visible:border-red-500 focus-visible:ring-3 focus-visible:ring-red-500/20 focus-visible:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]",
            ],
            className
          )}
          {...props}
        />
        {error && (
          <p id={errorId} className="flex items-center gap-1 text-sm text-red-600 font-medium" role="alert">
            <span className="inline-block w-3.5 h-3.5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold flex items-center justify-center leading-none select-none" aria-hidden="true">!</span>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="text-xs text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

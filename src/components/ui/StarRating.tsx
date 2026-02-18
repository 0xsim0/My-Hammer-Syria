"use client";
import React from "react";
import { Star } from "lucide-react";
import { cn } from "./cn";

interface StarRatingDisplayProps {
  rating: number;
  maxStars?: number;
  size?: number;
  className?: string;
}

export function StarRatingDisplay({
  rating,
  maxStars = 5,
  size = 16,
  className,
}: StarRatingDisplayProps) {
  return (
    <div
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={`Rating: ${rating} out of ${maxStars} stars`}
    >
      {Array.from({ length: maxStars }, (_, i) => {
        const starIndex = i + 1;
        const isFull = rating >= starIndex;
        const isHalf = !isFull && rating >= starIndex - 0.5;

        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            {/* Empty star background */}
            <Star
              size={size}
              className="text-gray-300"
              aria-hidden="true"
            />
            {/* Filled or half-filled overlay */}
            {(isFull || isHalf) && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: isHalf ? "50%" : "100%" }}
              >
                <Star
                  size={size}
                  className="fill-yellow-400 text-yellow-400"
                  aria-hidden="true"
                />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
  maxStars?: number;
  size?: number;
  className?: string;
}

export function StarRatingInput({
  value,
  onChange,
  maxStars = 5,
  size = 24,
  className,
}: StarRatingInputProps) {
  return (
    <div
      className={cn("inline-flex items-center gap-0.5", className)}
      role="group"
      aria-label="Star rating"
    >
      {Array.from({ length: maxStars }, (_, i) => {
        const starValue = i + 1;
        const isFilled = value >= starValue;

        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(starValue)}
            className={cn(
              "rounded-sm p-0.5 transition-transform duration-100",
              "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 focus-visible:outline-none",
              "hover:scale-110 active:scale-95",
              "motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
            )}
            aria-label={`Rate ${starValue} star${starValue !== 1 ? "s" : ""}`}
          >
            <Star
              size={size}
              className={cn(
                isFilled
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300 hover:text-yellow-300"
              )}
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
}

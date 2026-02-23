"use client";

import React from "react";
import NextImage from "next/image";
import { cn } from "./cn";

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-lg",
} as const;

// Generate a consistent color from a name string
function getColorFromName(name: string): string {
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-amber-500",
    "bg-emerald-500",
    "bg-teal-500",
    "bg-cyan-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-violet-500",
    "bg-pink-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  name: string;
  size?: keyof typeof sizeClasses;
}

export function Avatar({ src, name, size = "md", className, ...props }: AvatarProps) {
  const [imgError, setImgError] = React.useState(false);
  const showFallback = !src || imgError;

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full",
        sizeClasses[size],
        showFallback && getColorFromName(name),
        className
      )}
      {...props}
    >
      {showFallback ? (
        <span className="font-medium text-white select-none">
          {getInitials(name)}
        </span>
      ) : (
        <NextImage
          src={src!}
          alt={name}
          fill
          className="object-cover"
          onError={() => setImgError(true)}
        />
      )}
    </div>
  );
}

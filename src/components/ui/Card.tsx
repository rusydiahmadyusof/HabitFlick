import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined" | "interactive";
  padding?: "none" | "sm" | "md" | "lg";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant = "default", 
    padding = "md",
    children, 
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl bg-white dark:bg-neutral-800 transition-all duration-200",
          {
            // Variants
            "shadow-sm border border-neutral-200 dark:border-neutral-700": variant === "default",
            "shadow-md border border-neutral-200 dark:border-neutral-700": variant === "elevated",
            "border-2 border-neutral-300 dark:border-neutral-600": variant === "outlined",
            "shadow-sm border border-neutral-200 dark:border-neutral-700 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer": variant === "interactive",
            // Padding
            "p-0": padding === "none",
            "p-4": padding === "sm",
            "p-6": padding === "md",
            "p-8": padding === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export default Card;


import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-transparent text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.99] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-linear-to-r from-primary via-primary to-secondary text-primary-foreground shadow-[0_12px_24px_-14px_rgba(37,99,235,0.9)] hover:brightness-105",
        destructive:
          "bg-linear-to-r from-rose-700 to-rose-600 text-white shadow-[0_10px_22px_-14px_rgba(190,24,93,0.8)] hover:brightness-105",
        outline:
          "border-primary/35 bg-linear-to-r from-primary/15 to-secondary/20 text-foreground shadow-[0_10px_22px_-16px_rgba(37,99,235,0.5)] hover:brightness-105",
        secondary:
          "border-secondary/40 bg-linear-to-r from-secondary/75 to-primary/35 text-secondary-foreground shadow-[0_10px_22px_-16px_rgba(20,184,166,0.45)] hover:brightness-105",
        ghost: "border-primary/20 bg-linear-to-r from-primary/10 to-transparent text-foreground hover:from-primary/20 hover:to-secondary/20",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

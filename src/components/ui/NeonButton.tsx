import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const neonButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-base font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 font-display",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:shadow-[0_0_30px_hsl(280_100%_65%/0.7)] active:scale-95",
        secondary:
          "bg-secondary text-secondary-foreground hover:shadow-[0_0_30px_hsl(200_100%_50%/0.7)] active:scale-95",
        outline:
          "border-2 border-primary bg-transparent text-primary hover:bg-primary/10 hover:shadow-[0_0_20px_hsl(280_100%_65%/0.5)]",
        ghost:
          "bg-transparent text-foreground hover:bg-muted/50",
        hero:
          "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-[0_0_30px_hsl(280_100%_65%/0.5)] hover:shadow-[0_0_50px_hsl(280_100%_65%/0.8)] active:scale-95",
        glass:
          "glass-dark border border-primary/30 text-foreground hover:border-primary/60 hover:shadow-[0_0_20px_hsl(280_100%_65%/0.4)]",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 px-4 py-2 text-sm",
        lg: "h-14 px-8 py-4 text-lg",
        xl: "h-16 px-10 py-5 text-xl",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface NeonButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof neonButtonVariants> {}

const NeonButton = React.forwardRef<HTMLButtonElement, NeonButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(neonButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
NeonButton.displayName = "NeonButton";

export { NeonButton, neonButtonVariants };

import { cva, type VariantProps } from "class-variance-authority";

export const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-sm",
  {
    variants: {
      variant: {
        default: "border-transparent bg-gradient-to-b from-primary via-primary to-primary/90 text-primary-foreground hover:brightness-110 hover:shadow-md",
        secondary: "border-transparent bg-gradient-to-b from-secondary via-secondary to-secondary/90 text-secondary-foreground hover:brightness-110 hover:shadow-md",
        destructive: "border-transparent bg-gradient-to-b from-destructive via-destructive to-destructive/90 text-destructive-foreground hover:brightness-110 hover:shadow-md",
        outline: "text-foreground border bg-background/50 backdrop-blur-sm hover:bg-background/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

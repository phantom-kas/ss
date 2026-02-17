import * as React from "react";
// import { Button, type  buttonVariants } from "./Button";
import { cva, type VariantProps  } from "class-variance-authority"

import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";
import { Button , buttonVariants } from "../ui/button";

interface LoadingButtonProps
  extends React.ComponentProps<typeof Button>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  loadingText?: string;
  children?:React.ReactNode,
  className?:string
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading = false,
  loadingText,
  children,
  className,
  ...props
}) => {
  return (
    <Button
      {...props}
      disabled={isLoading || props.disabled}
      className={cn("relative flex items-center justify-center gap-2", className)}
    >
      {isLoading && (
        <Loader className="animate-spin h-4 w-4 text-current" />
      )}
      <span className={cn('  ',isLoading ? "opacity-50" : "opacity-100")}>
        {isLoading && loadingText ? loadingText : children}
      </span>
    </Button>
  );
};
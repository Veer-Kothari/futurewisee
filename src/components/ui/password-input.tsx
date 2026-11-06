import { Eye, EyeOff } from "lucide-react";
import * as React from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * A password field with an eye button that shows or hides what's been typed.
 * Hides Edge's own reveal icon, so there's never a second eye in the box.
 */
const PasswordInput = React.forwardRef<
  HTMLInputElement,
  Omit<React.ComponentProps<"input">, "type">
>(({ className, disabled, ...props }, ref) => {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="relative">
      <Input
        ref={ref}
        type={visible ? "text" : "password"}
        disabled={disabled}
        className={cn("pr-11 [&::-ms-clear]:hidden [&::-ms-reveal]:hidden", className)}
        {...props}
      />
      <button
        type="button"
        disabled={disabled}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-controls={props.id}
        // Keeps focus (and the phone keyboard) in the field when clicked or tapped.
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setVisible((current) => !current)}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-charcoal/65 transition-colors hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
      >
        {visible ? (
          <EyeOff aria-hidden="true" className="size-5" />
        ) : (
          <Eye aria-hidden="true" className="size-5" />
        )}
      </button>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };

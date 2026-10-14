import { useId, type ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: ReactNode;
  error?: string | undefined;
  children: (props: {
    id: string;
    "aria-invalid": boolean;
    "aria-describedby"?: string;
  }) => ReactNode;
}) {
  const id = useId();
  const describedBy = [hint ? `${id}-hint` : "", error ? `${id}-error` : ""]
    .filter(Boolean)
    .join(" ");
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children({
        id,
        "aria-invalid": Boolean(error),
        ...(describedBy ? { "aria-describedby": describedBy } : {}),
      })}
      {hint ? (
        <p id={`${id}-hint`} className="text-xs leading-5 text-charcoal/65">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  error,
  hint,
  maxLength,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | undefined;
  hint?: ReactNode;
  maxLength?: number;
  type?: string;
}) {
  return (
    <Field label={label} hint={hint} error={error}>
      {(props) => (
        <Input
          {...props}
          type={type}
          value={value}
          maxLength={maxLength}
          onChange={(event) => onChange(event.target.value)}
          className="h-11"
        />
      )}
    </Field>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  error,
  hint,
  maxLength,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | undefined;
  hint?: ReactNode;
  maxLength?: number;
  rows?: number;
}) {
  return (
    <Field label={label} hint={hint} error={error}>
      {(props) => (
        <Textarea
          {...props}
          rows={rows}
          value={value}
          maxLength={maxLength}
          onChange={(event) => onChange(event.target.value)}
          className="font-[inherit] leading-6"
        />
      )}
    </Field>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<{ value: string; label: string }>;
  error?: string | undefined;
}) {
  return (
    <Field label={label} error={error}>
      {(props) => (
        <select
          {...props}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full border border-input bg-background px-3 text-sm"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}

export function CheckField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium text-charcoal"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 accent-[var(--navy)]"
      />
      {label}
    </label>
  );
}

export function StatusLine({ message, tone }: { message: string; tone: "ok" | "error" | "idle" }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn("min-h-6 text-sm", tone === "error" ? "text-destructive" : "text-navy")}
    >
      {message}
    </p>
  );
}

export const MARKDOWN_HINT = (
  <>
    Blank line = new paragraph · <code>## Heading</code> · <code>- list item</code> ·{" "}
    <code>**bold**</code> · <code>*italic*</code> · <code>[link text](https://…)</code>
  </>
);

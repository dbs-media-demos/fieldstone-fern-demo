"use client";

import clsx from "clsx";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const base =
  "mt-2 block w-full rounded-2xl border bg-bg px-4 py-3.5 text-[1.02rem] text-fg outline-none transition-[border-color,box-shadow] duration-300 placeholder:text-faint focus:border-fern focus:shadow-[0_0_0_4px_rgba(47,74,52,0.14)]";

export function Field({
  label,
  error,
  hint,
  id,
  children,
  className,
}: {
  label: string;
  error?: string;
  hint?: string;
  id: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-faint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} role="alert" className="mt-1.5 text-sm font-medium text-terracotta">
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({ error, id, ...props }: InputHTMLAttributes<HTMLInputElement> & { error?: string; id: string }) {
  return (
    <input
      id={id}
      aria-invalid={!!error || undefined}
      aria-describedby={error ? `${id}-err` : undefined}
      className={clsx(base, error ? "border-terracotta" : "border-line")}
      {...props}
    />
  );
}

export function Textarea({ error, id, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string; id: string }) {
  return (
    <textarea
      id={id}
      aria-invalid={!!error || undefined}
      aria-describedby={error ? `${id}-err` : undefined}
      className={clsx(base, "min-h-32 resize-y", error ? "border-terracotta" : "border-line")}
      {...props}
    />
  );
}

export function Select({ error, id, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { error?: string; id: string }) {
  return (
    <select
      id={id}
      aria-invalid={!!error || undefined}
      aria-describedby={error ? `${id}-err` : undefined}
      className={clsx(base, "appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22><path d=%22M5 8l5 5 5-5%22 fill=%22none%22 stroke=%22%2316241c%22 stroke-width=%221.8%22/></svg>')] bg-[length:18px] bg-[right_1rem_center] bg-no-repeat pr-12", error ? "border-terracotta" : "border-line")}
      {...props}
    >
      {children}
    </select>
  );
}

/** Big selectable card (checkbox or radio semantics). */
export function ChoiceCard({
  checked,
  onChange,
  label,
  note,
  type = "checkbox",
  name,
  value,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  note?: string;
  type?: "checkbox" | "radio";
  name: string;
  value: string;
}) {
  return (
    <label
      className={clsx(
        "relative flex min-h-16 cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors duration-300 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-terracotta",
        checked ? "border-fern bg-fern text-cream" : "border-line bg-bg hover:border-fern/40",
      )}
    >
      <input type={type} name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
      <span
        aria-hidden
        className={clsx(
          "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center border transition-colors",
          type === "radio" ? "rounded-full" : "rounded-md",
          checked ? "border-lantern bg-lantern text-forest" : "border-current/40",
        )}
      >
        {checked && (
          <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2.5 6.5l2.2 2L9.5 3.5" />
          </svg>
        )}
      </span>
      <span>
        <span className="block font-medium leading-tight">{label}</span>
        {note && <span className={clsx("mt-1 block text-sm", checked ? "text-cream/75" : "text-muted")}>{note}</span>}
      </span>
    </label>
  );
}

export const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
export const phoneOk = (v: string) => v.replace(/\D/g, "").length >= 10;

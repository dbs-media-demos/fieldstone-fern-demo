"use client";

import { useRef, useState } from "react";
import { Field, Input, Select, Textarea, emailOk } from "./Fields";
import { Mark } from "@/components/brand/Logo";
import { Arrow } from "@/components/ui/Button";

/** Simple contact form with inline validation and a success state (concept site: nothing is sent). */
export function ContactForm() {
  const [d, setD] = useState({ name: "", email: "", topic: "General question", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const done = useRef<HTMLHeadingElement>(null);

  const set = (k: keyof typeof d, v: string) => {
    setD((c) => ({ ...c, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  if (sent)
    return (
      <div className="rounded-[2rem] bg-forest p-8 text-cream sm:p-12" role="status">
        <Mark className="h-16 w-16 text-lantern" animate />
        <h2 ref={done} className="t-h3 mt-6">
          Message received, {d.name.split(" ")[0]}.
        </h2>
        <p className="mt-4 max-w-md text-cream/80">We reply to every message within one business day, usually much sooner.</p>
        <p className="mt-6 text-sm text-cream/60">Concept website by DBS Media: nothing was actually sent.</p>
      </div>
    );

  return (
    <form
      noValidate
      className="grid gap-6 rounded-[2rem] border border-line bg-bg p-6 sm:grid-cols-2 sm:p-10"
      onSubmit={(e) => {
        e.preventDefault();
        const errs: Record<string, string> = {};
        if (d.name.trim().length < 2) errs.name = "Please enter your name.";
        if (!emailOk(d.email)) errs.email = "Enter a valid email address.";
        if (d.message.trim().length < 10) errs.message = "Tell us a little more (at least 10 characters).";
        setErrors(errs);
        if (Object.keys(errs).length) {
          (e.currentTarget.querySelector("[aria-invalid='true']") as HTMLElement | null)?.focus();
          return;
        }
        setSent(true);
      }}
    >
      <Field id="c-name" label="Name" error={errors.name}>
        <Input id="c-name" autoComplete="name" value={d.name} onChange={(e) => set("name", e.target.value)} error={errors.name} />
      </Field>
      <Field id="c-email" label="Email" error={errors.email}>
        <Input id="c-email" type="email" autoComplete="email" value={d.email} onChange={(e) => set("email", e.target.value)} error={errors.email} />
      </Field>
      <Field id="c-topic" label="Topic" className="sm:col-span-2">
        <Select id="c-topic" value={d.topic} onChange={(e) => set("topic", e.target.value)}>
          {["General question", "Existing customer", "Lawn plan change", "Careers", "Vendors & partners"].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </Select>
      </Field>
      <Field id="c-msg" label="Message" error={errors.message} className="sm:col-span-2">
        <Textarea id="c-msg" value={d.message} onChange={(e) => set("message", e.target.value)} error={errors.message} />
      </Field>
      <div className="sm:col-span-2">
        <button type="submit" className="group inline-flex min-h-12 items-center gap-2.5 rounded-full bg-terracotta px-7 font-medium text-cream transition-colors hover:bg-[#8e3b23]">
          Send message <Arrow className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </form>
  );
}

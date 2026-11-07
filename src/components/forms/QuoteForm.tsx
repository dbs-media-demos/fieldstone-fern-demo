"use client";

import { useState } from "react";
import { Field, Input, Select, phoneOk } from "./Fields";
import { Mark } from "@/components/brand/Logo";
import { Arrow } from "@/components/ui/Button";
import { useBiz } from "@/components/preview/BizContext";
import { categories } from "@/content/categories";
import { agencyName } from "@/content/site";

/** The short form on the phone home page (concept site: validates and confirms, nothing is sent). */
export function QuoteForm() {
  const biz = useBiz();
  const [d, setD] = useState({ name: "", phone: "", project: categories[0].label });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const set = (k: keyof typeof d, v: string) => {
    setD((c) => ({ ...c, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  if (sent)
    return (
      <div className="mt-5 rounded-[1.5rem] bg-forest p-6 text-cream" role="status">
        <Mark className="h-12 w-12 text-lantern" />
        <p className="t-h3 mt-4">Thanks, {d.name.split(" ")[0]}.</p>
        <p className="mt-2 text-cream/80">We&rsquo;ll call within one business day to set up your free yard walk.</p>
        <p className="mt-3 text-sm text-cream/60">
          {biz.preview ? "Preview" : "Concept website"} by {agencyName}: nothing was actually sent.
        </p>
      </div>
    );

  return (
    <form
      noValidate
      className="mt-4 grid grid-cols-2 gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const errs: Record<string, string> = {};
        if (d.name.trim().length < 2) errs.name = "Please enter your name.";
        if (!phoneOk(d.phone)) errs.phone = "Enter a phone number we can call.";
        setErrors(errs);
        if (Object.keys(errs).length) {
          (e.currentTarget.querySelector("[aria-invalid='true']") as HTMLElement | null)?.focus();
          return;
        }
        setSent(true);
      }}
    >
      <Field id="q-name" label="Name" error={errors.name}>
        <Input id="q-name" autoComplete="name" value={d.name} onChange={(e) => set("name", e.target.value)} error={errors.name} />
      </Field>
      <Field id="q-phone" label="Phone" error={errors.phone}>
        <Input id="q-phone" type="tel" autoComplete="tel" value={d.phone} onChange={(e) => set("phone", e.target.value)} error={errors.phone} />
      </Field>
      <Field id="q-project" label="Project" className="col-span-2">
        <Select id="q-project" value={d.project} onChange={(e) => set("project", e.target.value)}>
          {categories.map((c) => (
            <option key={c.id}>{c.label}</option>
          ))}
          <option>Not sure yet</option>
        </Select>
      </Field>
      <button type="submit" className="col-span-2 mt-1 inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-terracotta px-7 font-medium text-cream">
        Get my quote <Arrow />
      </button>
    </form>
  );
}

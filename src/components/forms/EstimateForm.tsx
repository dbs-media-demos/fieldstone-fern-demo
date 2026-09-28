"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import clsx from "clsx";
import { ChoiceCard, Field, Input, Select, Textarea, emailOk, phoneOk } from "./Fields";
import { Mark } from "@/components/brand/Logo";
import { Arrow } from "@/components/ui/Button";
import { services } from "@/content/services";
import { cities } from "@/content/cities";
import { site, telHref } from "@/content/site";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const STEPS = ["Services", "Property", "Timing", "Contact"];
const SIZES = ["Under ¼ acre", "¼ – ½ acre", "½ – 1 acre", "Over 1 acre", "Not sure"];
const TIMELINES = [
  { v: "asap", l: "As soon as possible", n: "Lawn plans usually start within 7 days" },
  { v: "month", l: "Within a month" },
  { v: "season", l: "In 1–3 months", n: "Great for fall planting or spring builds" },
  { v: "planning", l: "Just planning for now" },
];
const BUDGETS = ["Recurring care only", "Under $10k", "$10k – $25k", "$25k – $50k", "$50k – $100k", "$100k+"];
const CONTACT = ["Text", "Call", "Email"];

type Data = {
  services: string[];
  city: string;
  size: string;
  address: string;
  timeline: string;
  budget: string;
  walk: string;
  name: string;
  phone: string;
  email: string;
  contact: string;
  notes: string;
};

/**
 * Four-step free-estimate form. Validates each step, pre-fills from the lawn-plan
 * builder / service links via the query string, and ends in a success state.
 * Concept site: nothing is sent anywhere.
 */
export function EstimateForm() {
  const params = useSearchParams();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const panel = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const prev = useRef({ step: 0, done: false });

  const pre = {
    services: (params.get("services") ?? "").split(",").filter((s) => services.some((x) => x.slug === s)),
    city: cities.some((c) => c.slug === params.get("city")) ? params.get("city")! : "",
    size: params.get("size"),
    freq: params.get("freq"),
    plan: params.get("plan"),
  };
  const sizeFromSqft = (n: number) => (n < 11000 ? SIZES[0] : n < 21800 ? SIZES[1] : n <= 43560 ? SIZES[2] : SIZES[3]);

  const [d, setD] = useState<Data>(() => ({
    services: pre.services,
    city: pre.city,
    size: pre.size && !isNaN(Number(pre.size)) ? sizeFromSqft(Number(pre.size)) : "",
    address: "",
    timeline: "",
    budget: pre.services.length && pre.services.every((s) => s === "lawn-care" || s === "irrigation" || s === "seasonal-cleanups") ? BUDGETS[0] : "",
    walk: "Weekday morning",
    name: "",
    phone: "",
    email: "",
    contact: "Text",
    notes: pre.size ? `From the lawn-plan builder: ${Number(pre.size).toLocaleString("en-US")} sq ft, ${pre.freq ?? "weekly"}, ${(pre.plan ?? "").split(",").join(", ")}.` : "",
  }));
  const set = <K extends keyof Data>(k: K, v: Data[K]) => {
    setD((cur) => ({ ...cur, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  useEffect(() => {
    // Only react to real step changes (not the initial mount, incl. StrictMode's double run).
    if (prev.current.step === step && prev.current.done === done) return;
    prev.current = { step, done };
    heading.current?.focus({ preventScroll: true });
    if (panel.current && !prefersReducedMotion()) gsap.fromTo(panel.current, { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.7, ease: "expo.out" });
    const top = panel.current?.closest("section")?.getBoundingClientRect().top ?? 0;
    if (top < 0) window.scrollBy({ top: top - 100, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, [step, done]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (step === 0 && d.services.length === 0) e.services = "Pick at least one service so we send the right person.";
    if (step === 1) {
      if (!d.city) e.city = "Choose your city.";
      if (!d.size) e.size = "Choose an approximate yard size.";
    }
    if (step === 2 && !d.timeline) e.timeline = "Let us know your timing.";
    if (step === 3) {
      if (d.name.trim().length < 2) e.name = "Please enter your name.";
      if (!phoneOk(d.phone)) e.phone = "Enter a 10-digit phone number.";
      if (!emailOk(d.email)) e.email = "Enter a valid email address.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validate()) return;
    if (step < STEPS.length - 1) setStep(step + 1);
    else setDone(true);
  };

  if (done) {
    const ref = `FF-${(d.name.length * 7919 + d.phone.replace(/\D/g, "").slice(-4).length * 131 + 2409).toString().slice(0, 4)}`;
    return (
      <div ref={panel} className="rounded-[2rem] bg-forest p-8 text-cream sm:p-14" role="status">
        <Mark className="h-20 w-20 text-lantern" animate />
        <h2 ref={heading} tabIndex={-1} className="t-h2 mt-8 outline-none">
          Thanks, {d.name.split(" ")[0]}. <span className="t-italic text-lantern">We&rsquo;re on it.</span>
        </h2>
        <p className="t-lead mt-6 max-w-xl text-cream/80">
          A designer will {d.contact === "Call" ? "call" : d.contact === "Email" ? "email" : "text"} you within one business hour to book your free yard walk
          {d.walk ? ` (${d.walk.toLowerCase()})` : ""}.
        </p>
        <dl className="mt-10 grid gap-6 border-t border-cream/15 pt-8 sm:grid-cols-3">
          <div>
            <dt className="t-eyebrow text-cream/60">Reference</dt>
            <dd className="mt-2 font-mono">{ref}</dd>
          </div>
          <div>
            <dt className="t-eyebrow text-cream/60">Services</dt>
            <dd className="mt-2">{d.services.map((s) => services.find((x) => x.slug === s)?.short).join(", ")}</dd>
          </div>
          <div>
            <dt className="t-eyebrow text-cream/60">City</dt>
            <dd className="mt-2">{cities.find((c) => c.slug === d.city)?.name ?? "Other"}</dd>
          </div>
        </dl>
        <p className="mt-10 text-sm text-cream/60">
          This is a concept website by DBS Media, so nothing was actually sent. On a live site, this request would go straight to the office and your phone.
        </p>
        <a href={telHref} className="mt-6 inline-flex min-h-11 items-center gap-2 text-lantern underline-offset-4 hover:underline">
          Can&rsquo;t wait? Call {site.phoneDisplay}
        </a>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        next();
      }}
      className="rounded-[2rem] border border-line bg-bg p-6 sm:p-10"
      aria-labelledby="est-step-title"
    >
      {/* Progress */}
      <ol className="grid grid-cols-4 gap-2" aria-label="Progress">
        {STEPS.map((s, i) => (
          <li key={s} aria-current={i === step ? "step" : undefined}>
            <span className={clsx("block h-1 rounded-full transition-colors duration-500", i <= step ? "bg-fern" : "bg-line")} />
            <span className={clsx("t-eyebrow mt-3", i === step ? "block text-fg" : "hidden text-faint sm:block")}>
              <span className="hidden sm:inline">0{i + 1} · </span>
              {s}
            </span>
          </li>
        ))}
      </ol>

      <div ref={panel} className="mt-10">
        {step === 0 && (
          <fieldset>
            <legend>
              <h2 ref={heading} tabIndex={-1} id="est-step-title" className="t-h3 outline-none">
                What can we help with?
              </h2>
              <p className="mt-2 text-muted">Pick everything that applies.</p>
            </legend>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {services.map((s) => (
                <ChoiceCard
                  key={s.slug}
                  name="services"
                  value={s.slug}
                  label={s.short}
                  note={s.kind === "recurring" ? "Recurring care" : "Design & build project"}
                  checked={d.services.includes(s.slug)}
                  onChange={() => set("services", d.services.includes(s.slug) ? d.services.filter((x) => x !== s.slug) : [...d.services, s.slug])}
                />
              ))}
            </div>
            {errors.services && (
              <p role="alert" className="mt-4 text-sm font-medium text-terracotta">
                {errors.services}
              </p>
            )}
          </fieldset>
        )}

        {step === 1 && (
          <div>
            <h2 ref={heading} tabIndex={-1} id="est-step-title" className="t-h3 outline-none">
              Tell us about the property.
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <Field id="est-city" label="City" error={errors.city}>
                <Select id="est-city" value={d.city} onChange={(e) => set("city", e.target.value)} error={errors.city} required>
                  <option value="">Choose…</option>
                  {cities.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                  <option value="other">Other nearby city</option>
                </Select>
              </Field>
              <Field id="est-size" label="Approximate yard size" error={errors.size}>
                <Select id="est-size" value={d.size} onChange={(e) => set("size", e.target.value)} error={errors.size} required>
                  <option value="">Choose…</option>
                  {SIZES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </Select>
              </Field>
              <Field id="est-address" label="Street address (optional)" hint="Helps us look at the lot before the visit." className="sm:col-span-2">
                <Input id="est-address" autoComplete="street-address" value={d.address} onChange={(e) => set("address", e.target.value)} placeholder="e.g. 1200 Oak Hollow Ln" />
              </Field>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <fieldset>
              <legend>
                <h2 ref={heading} tabIndex={-1} id="est-step-title" className="t-h3 outline-none">
                  When are you hoping to start?
                </h2>
              </legend>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {TIMELINES.map((t) => (
                  <ChoiceCard key={t.v} type="radio" name="timeline" value={t.v} label={t.l} note={t.n} checked={d.timeline === t.v} onChange={() => set("timeline", t.v)} />
                ))}
              </div>
              {errors.timeline && (
                <p role="alert" className="mt-4 text-sm font-medium text-terracotta">
                  {errors.timeline}
                </p>
              )}
            </fieldset>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <Field id="est-budget" label="Project budget (if a project)">
                <Select id="est-budget" value={d.budget} onChange={(e) => set("budget", e.target.value)}>
                  <option value="">Not sure yet</option>
                  {BUDGETS.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </Select>
              </Field>
              <Field id="est-walk" label="Best time for a yard walk">
                <Select id="est-walk" value={d.walk} onChange={(e) => set("walk", e.target.value)}>
                  {["Weekday morning", "Weekday afternoon", "Saturday morning", "Anytime, I don't need to be home"].map((w) => (
                    <option key={w}>{w}</option>
                  ))}
                </Select>
              </Field>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 ref={heading} tabIndex={-1} id="est-step-title" className="t-h3 outline-none">
              How do we reach you?
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <Field id="est-name" label="Full name" error={errors.name}>
                <Input id="est-name" autoComplete="name" value={d.name} onChange={(e) => set("name", e.target.value)} error={errors.name} required />
              </Field>
              <Field id="est-phone" label="Mobile phone" error={errors.phone}>
                <Input id="est-phone" type="tel" inputMode="tel" autoComplete="tel" value={d.phone} onChange={(e) => set("phone", e.target.value)} error={errors.phone} placeholder="(817) 555-0100" required />
              </Field>
              <Field id="est-email" label="Email" error={errors.email}>
                <Input id="est-email" type="email" autoComplete="email" value={d.email} onChange={(e) => set("email", e.target.value)} error={errors.email} required />
              </Field>
              <fieldset>
                <legend className="text-sm font-medium">Preferred contact</legend>
                <div className="mt-2 grid grid-cols-3 gap-1 rounded-2xl bg-surface p-1">
                  {CONTACT.map((c) => (
                    <label
                      key={c}
                      className={clsx(
                        "flex min-h-11 cursor-pointer items-center justify-center rounded-xl text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-terracotta",
                        d.contact === c ? "bg-forest text-cream" : "",
                      )}
                    >
                      <input type="radio" name="contact" value={c} checked={d.contact === c} onChange={() => set("contact", c)} className="sr-only" />
                      {c}
                    </label>
                  ))}
                </div>
              </fieldset>
              <Field id="est-notes" label="Anything else? (optional)" className="sm:col-span-2">
                <Textarea id="est-notes" value={d.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Gate codes, dogs, the one sprinkler that never works…" />
              </Field>
            </div>
            <p className="mt-4 text-sm text-faint">We&rsquo;ll only use your details to schedule your estimate. No spam, ever.</p>
          </div>
        )}
      </div>

      <div className="mt-10 flex items-center justify-between gap-4 border-t border-line pt-6">
        <button
          type="button"
          onClick={() => setStep(Math.max(0, step - 1))}
          className={clsx("inline-flex min-h-12 items-center gap-2 rounded-full px-4 font-medium", step === 0 && "invisible")}
        >
          <Arrow className="rotate-180" /> Back
        </button>
        <button type="submit" className="group inline-flex min-h-12 items-center gap-2.5 rounded-full bg-terracotta px-7 font-medium text-cream transition-colors hover:bg-[#8e3b23]">
          {step === STEPS.length - 1 ? "Request my free estimate" : "Continue"}
          <Arrow className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </form>
  );
}

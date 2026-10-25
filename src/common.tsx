import { Input, Select, DatePicker } from "./ui";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { X, ArrowUpRight, Check, Code2, Mail } from "lucide-react";
import { useBrandMotion } from "./motion";

import meta from "./build-meta.json";


export function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReduced(query.matches);
    query.addEventListener("change", change);
    return () => query.removeEventListener("change", change);
  }, []);
  return reduced;
}
export function useReveal() { const reduced = useReducedMotion(); useBrandMotion(reduced); }
export function useStoredState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      return JSON.parse(localStorage.getItem(key) || "null") ?? initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* Private browsing can deny storage. */
    }
  }, [key, value]);
  return [value, setValue] as const;
}
export function Modal({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open) {
      dialog.showModal();
      const old = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        dialog.close();
        document.body.style.overflow = old;
      };
    }
    dialog.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={`modal ${wide ? "modal-wide" : ""}`}
      aria-label={title}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) {
          const box = ref.current.getBoundingClientRect();
          if (
            e.clientX < box.left ||
            e.clientX > box.right ||
            e.clientY < box.top ||
            e.clientY > box.bottom
          )
            onClose();
        }
      }}
    >
      <div className="modal-top">
        <span className="eyebrow">{title}</span>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={22} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function DevBadge() {
  const [visible, setVisible] = useState(() => {
    try {
      return sessionStorage.getItem("dev-badge-dismissed") !== "yes";
    } catch {
      return true;
    }
  });
  const [open, setOpen] = useState(false);
  if (!visible) return null;
  return (
    <aside className="dev-badge" aria-label="Development information">
      {open && (
        <div className="dev-info">
          <strong>Behind the build</strong>
          <p>
            {meta.tool} · {meta.model}
          </p>
          <p>{meta.technologies}</p>
          <p>Development time: {meta.time}</p>
          <p>AI generation cost: {meta.cost}</p>
          <small>Fictional brand · portfolio concept</small>
        </div>
      )}
      <div className="dev-bar">
        <button onClick={() => setOpen(!open)} aria-expanded={open}>
          <Code2 size={13} /> Behind the build <ArrowUpRight size={12} />
        </button>
        <button
          aria-label="Dismiss developer badge"
          onClick={() => {
            setVisible(false);
            try {
              sessionStorage.setItem("dev-badge-dismissed", "yes");
            } catch {
              /* optional */
            }
          }}
        >
          <X size={13} />
        </button>
      </div>
    </aside>
  );
}
export function RequestForm({
  subject,
  label = "Request an appointment",
  onComplete,
}: {
  subject: string;
  label?: string;
  onComplete?: () => void;
}) {
  const [done, setDone] = useState(false);
  if (done)
    return (
      <div className="form-success" role="status">
        <span className="success-icon">
          <Check size={30} />
        </span>
        <h2>You're on the list.</h2>
        <p>Your demo request for {subject} is complete.</p>
        <p className="muted">
          This is a portfolio experience. Nothing has been sent and no
          appointment has been booked.
        </p>
        {onComplete && (
          <button className="button" onClick={onComplete}>
            Keep exploring <ArrowUpRight size={17} />
          </button>
        )}
      </div>
    );
  const today = new Date();
  today.setDate(today.getDate() + 1);
  const minDate = today.toLocaleDateString("en-CA");
  return (
    <form
      className="request-form"
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
      }}
    >
      <h2>{subject}</h2>
      <p>Make time for something exceptional.</p>
      <div className="field-pair">
        <label>
          Full name
          <Input
            name="name"
            autoComplete="name"
            required
            placeholder="Your name"
            maxLength={80}
          />
        </label>
        <label>
          Email address
          <Input
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
          />
        </label>
      </div>
      <div className="field-pair">
        <label>
          Preferred date
          <DatePicker name="date" required min={minDate} />
        </label>
        <label>
          Preferred time
          <Select name="time">
            <option>Morning · 9am–12pm</option>
            <option>Afternoon · 12pm–4pm</option>
            <option>Evening · 4pm–6pm</option>
          </Select>
        </label>
      </div>
      <label className="check-field">
        <Input required type="checkbox" /> I understand this is a local demo
        request.
      </label>
      <button className="button" type="submit">
        {label}
        <ArrowUpRight size={18} />
      </button>
      <small className="muted">
        Demo only. Your information is not sent or stored.
      </small>
    </form>
  );
}
export function Newsletter({
  label = "A little inspiration, occasionally.",
}: {
  label?: string;
}) {
  const [subscribed, setSubscribed] = useState(false);
  return (
    <form
      className="newsletter"
      onSubmit={(e) => {
        e.preventDefault();
        setSubscribed(true);
      }}
    >
      <label htmlFor="newsletter-email">{label}</label>
      <div className="newsletter-control">
        <Mail className="newsletter-field-icon" size={20} aria-hidden="true" />
        <Input
          id="newsletter-email"
          type="email"
          placeholder="Your email address"
          required
          autoComplete="email"
          disabled={subscribed}
        />
        <button className="newsletter-submit" type="submit" aria-label="Subscribe" disabled={subscribed}>
          <span>{subscribed ? "Joined" : "Join"}</span>
          {subscribed ? <Check size={19} /> : <ArrowUpRight size={19} />}
        </button>
      </div>
      <small role="status">
        {subscribed
          ? "You’re on the demo list. No email was sent."
          : "Portfolio demo · no emails are sent."}
      </small>
    </form>
  );
}
export const money = (amount: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

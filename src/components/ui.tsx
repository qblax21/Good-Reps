/** Shared building blocks. Every tap target is ≥ 48px (Apple asks for 44pt). */
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Daisy } from '../theme/mascots/art';

type BtnKind = 'primary' | 'secondary' | 'ghost' | 'sun' | 'danger';
const btnClass: Record<BtnKind, string> = {
  primary: 'bg-primary text-white active:bg-primary-dark shadow-md shadow-primary/20',
  secondary: 'bg-card text-primary border-2 border-primary active:bg-primary-soft',
  ghost: 'bg-transparent text-primary active:bg-primary-soft',
  sun: 'bg-sun text-ink active:brightness-95 shadow-md shadow-sun/30',
  danger: 'bg-card text-danger border-2 border-danger active:bg-red-50',
};

export function Button({
  children, onClick, kind = 'primary', big, className = '', label, disabled, type = 'button',
}: {
  children: ReactNode; onClick?: () => void; kind?: BtnKind; big?: boolean; className?: string;
  label?: string; disabled?: boolean; type?: 'button' | 'submit';
}) {
  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition-colors disabled:opacity-40
        ${big ? 'min-h-16 px-6 text-xl' : 'min-h-12 px-4 text-lg'} ${btnClass[kind]} ${className}`}
    >
      {children}
    </motion.button>
  );
}

export function Card({ children, className = '', onClick, label }: { children: ReactNode; className?: string; onClick?: () => void; label?: string }) {
  const cls = `rounded-3xl bg-card p-4 shadow-sm shadow-ink/5 border border-ink/5 ${className}`;
  if (onClick)
    return (
      <motion.button whileTap={{ scale: 0.98 }} onClick={onClick} aria-label={label} className={`${cls} block w-full text-left`}>
        {children}
      </motion.button>
    );
  return <section className={cls}>{children}</section>;
}

/** Screen header with an optional big Back button. */
export function Header({ title, onBack, right, backLabel = 'Back' }: { title: string; onBack?: () => void; right?: ReactNode; backLabel?: string }) {
  return (
    <header className="pt-safe px-safe bg-cream pb-2">
      {/* Back button gets its own row so the title never has to be cut short. */}
      {onBack && (
        <button onClick={onBack} className="-ml-2 flex min-h-12 items-center gap-1 rounded-xl px-2 text-lg font-bold text-primary active:bg-primary-soft">
          <span aria-hidden="true" className="text-2xl">‹</span> {backLabel}
        </button>
      )}
      <div className="flex items-center gap-2">
        <h1 className="flex-1 text-3xl leading-tight font-black text-ink">{title}</h1>
        {right}
      </div>
    </header>
  );
}

/**
 * A number with big − / + buttons. Tap the number to type it instead.
 * Press and hold a button to change quickly.
 */
export function Stepper({
  value, onChange, step, min = 0, max = 9999, label, unit, format, size = 'md',
}: {
  value: number; onChange: (v: number) => void; step: number; min?: number; max?: number;
  label: string; unit?: string; format?: (v: number) => string; size?: 'md' | 'sm';
}) {
  const [editing, setEditing] = useState(false);
  // Local copy so press-and-hold counts smoothly even while the save is still in flight.
  const [local, setLocal] = useState(value);
  const v = useRef(value);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (timer.current === undefined) { v.current = value; setLocal(value); }
  }, [value]);
  const clamp = (n: number) => Math.min(max, Math.max(min, Math.round(n * 100) / 100));
  const bump = (dir: 1 | -1) => {
    v.current = clamp(v.current + dir * step);
    setLocal(v.current);
    onChange(v.current);
  };
  const hold = (dir: 1 | -1) => {
    bump(dir);
    let delay = 450;
    const tick = () => {
      bump(dir);
      delay = Math.max(60, delay * 0.8);
      timer.current = window.setTimeout(tick, delay);
    };
    timer.current = window.setTimeout(tick, delay);
  };
  const release = () => {
    window.clearTimeout(timer.current);
    timer.current = undefined;
  };
  useEffect(() => release, []);
  const shown = format ? format(local) : `${local}`;
  const btn = size === 'sm' ? 'h-12 w-12 text-2xl' : 'h-14 w-14 text-3xl';

  return (
    <div className="flex items-center gap-2" role="group" aria-label={label}>
      <button
        aria-label={`Less ${label}`}
        onPointerDown={(e) => { e.preventDefault(); hold(-1); }}
        onPointerUp={release} onPointerLeave={release} onPointerCancel={release}
        onClick={(e) => e.detail === 0 && bump(-1)} // keyboard & VoiceOver
        className={`${btn} shrink-0 rounded-2xl bg-primary-soft font-black text-primary active:scale-95 active:bg-primary active:text-white`}
      >
        −
      </button>
      {editing ? (
        <input
          autoFocus
          inputMode="decimal"
          defaultValue={value}
          aria-label={label}
          onBlur={(e) => { const n = parseFloat(e.target.value); if (!isNaN(n)) onChange(clamp(n)); setEditing(false); }}
          onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
          className="min-h-12 w-full min-w-0 flex-1 rounded-xl border-2 border-primary bg-white text-center text-xl font-bold"
        />
      ) : (
        <button
          onClick={() => setEditing(true)}
          aria-label={`${label}: ${shown}${unit ? ' ' + unit : ''}. Tap to type.`}
          aria-live="polite"
          className="min-h-12 min-w-0 flex-1 rounded-xl text-center leading-tight active:bg-primary-soft"
        >
          <span className={`${size === 'sm' ? 'text-xl' : 'text-2xl'} font-extrabold tabular-nums`}>{shown}</span>
          {unit && <span className="ml-1 text-base font-semibold text-ink-soft">{unit}</span>}
        </button>
      )}
      <button
        aria-label={`More ${label}`}
        onPointerDown={(e) => { e.preventDefault(); hold(1); }}
        onPointerUp={release} onPointerLeave={release} onPointerCancel={release}
        onClick={(e) => e.detail === 0 && bump(1)}
        className={`${btn} shrink-0 rounded-2xl bg-primary-soft font-black text-primary active:scale-95 active:bg-primary active:text-white`}
      >
        +
      </button>
    </div>
  );
}

/** A checkbox that blooms into a daisy when ticked. */
export function DaisyCheck({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="relative grid h-14 w-14 shrink-0 place-items-center rounded-full active:scale-95"
    >
      <AnimatePresence initial={false} mode="wait">
        {checked ? (
          <motion.span key="on" initial={{ scale: 0.2, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.2 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}>
            <Daisy size={50} />
          </motion.span>
        ) : (
          <motion.span key="off" initial={{ scale: 0.6 }} animate={{ scale: 1 }} exit={{ scale: 0.6 }}
            className="block h-11 w-11 rounded-full border-[3px] border-leaf bg-white" />
        )}
      </AnimatePresence>
    </button>
  );
}

/** Bottom sheet. Tap outside or the big Close button to dismiss. */
export function Sheet({ open, onClose, title, children, closeLabel = 'Close' }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; closeLabel?: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-40 flex flex-col justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-ink/40" onClick={onClose} aria-hidden="true" />
          <motion.div
            role="dialog" aria-modal="true" aria-label={title}
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            className="relative flex max-h-[92%] flex-col rounded-t-[2rem] bg-cream shadow-2xl"
          >
            <div className="px-safe flex items-center gap-2 pt-3 pb-2">
              <h2 className="flex-1 text-2xl font-extrabold">{title}</h2>
              <Button kind="ghost" onClick={onClose}>{closeLabel}</Button>
            </div>
            <div className="scroll-area px-safe pb-safe flex-1 pb-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <button role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex min-h-14 w-full items-center gap-3 py-2 text-left">
      <span className="flex-1">
        <span className="block text-lg font-bold">{label}</span>
        {hint && <span className="block text-base text-ink-soft">{hint}</span>}
      </span>
      <span className={`relative h-9 w-16 shrink-0 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-ink/25'}`}>
        <motion.span layout className="absolute top-1 h-7 w-7 rounded-full bg-white shadow" style={{ left: checked ? 'calc(100% - 2rem)' : '0.25rem' }} />
      </span>
    </button>
  );
}

/** A row of big choice buttons (like a segmented control, but friendlier). */
export function Choices<T extends string>({ value, options, onChange, label, stack }: {
  value: T; options: Array<{ value: T; label: string }>; onChange: (v: T) => void; label: string;
  /** One option per row, for longer labels. */
  stack?: boolean;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={`flex gap-2 ${stack ? "flex-col" : "flex-wrap"}`}>
      {options.map((o) => (
        <button key={o.value} role="radio" aria-checked={value === o.value} onClick={() => onChange(o.value)}
          className={`min-h-12 flex-1 rounded-2xl border-2 px-3 text-lg font-bold ${value === o.value ? 'border-primary bg-primary text-white' : 'border-primary/30 bg-card text-primary'}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="mt-6 mb-2 flex items-center gap-2 text-xl font-extrabold text-ink"><Daisy size={22} />{children}</h2>;
}

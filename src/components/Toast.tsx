/** Little toast with an optional Undo — used instead of scary "Are you sure?" dialogs. */
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ToastMsg { id: number; text: string; undo?: () => void }
let push: (t: Omit<ToastMsg, 'id'>) => void = () => {};
export const toast = (text: string, undo?: () => void) => push({ text, undo });

export function ToastHost() {
  const [msg, setMsg] = useState<ToastMsg | null>(null);
  useEffect(() => {
    push = (t) => setMsg({ ...t, id: Date.now() });
  }, []);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), msg.undo ? 6000 : 3000);
    return () => clearTimeout(t);
  }, [msg]);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-28 z-50 flex justify-center px-4" aria-live="polite">
      <AnimatePresence>
        {msg && (
          <motion.div key={msg.id} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
            className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-ink px-5 py-3 text-lg font-semibold text-white shadow-xl">
            <span>{msg.text}</span>
            {msg.undo && (
              <button className="min-h-12 rounded-xl bg-sun px-4 font-bold text-ink" onClick={() => { msg.undo!(); setMsg(null); }}>
                Undo
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

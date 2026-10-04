import React from 'react';
import type { KeyBinding } from '../hooks/useKeyboard';
import { Modal } from './Modal';

interface HelpOverlayProps {
  open: boolean;
  onClose: () => void;
  bindings: KeyBinding[];
}

/** `Ctrl-d` -> `ctrl` `d`, `gg` -> `gg`. */
const KeyCap: React.FC<{ keys: string }> = ({ keys }) => {
  const parts = keys.includes('-') ? keys.split('-') : [keys];
  return (
    <span className="flex shrink-0 items-center gap-0.5">
      {parts.map((part, index) => (
        <React.Fragment key={`${part}-${index}`}>
          {index > 0 && <span className="text-[0.65rem] text-fg-subtle">·</span>}
          <kbd className="kbd">{part}</kbd>
        </React.Fragment>
      ))}
    </span>
  );
};

export const HelpOverlay: React.FC<HelpOverlayProps> = ({ open, onClose, bindings }) => {
  const groups = bindings.reduce<Map<string, KeyBinding[]>>((acc, binding) => {
    if (!binding.primary) return acc;
    const list = acc.get(binding.group) ?? [];
    list.push(binding);
    acc.set(binding.group, list);
    return acc;
  }, new Map());

  return (
    <Modal open={open} onClose={onClose} labelledBy="help-title">
      <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
        <div>
          <h2 id="help-title" className="font-display text-2xl text-fg">
            keyboard shortcuts
          </h2>
          <p className="mt-0.5 font-mono text-[0.68rem] text-fg-subtle">
            Neovim motions, adapted for reading
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-border px-2 py-1 font-mono text-xs text-fg-muted transition-colors hover:border-accent/50 hover:text-fg"
        >
          close <span className="kbd ml-1">esc</span>
        </button>
      </div>

      <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
        {[...groups.entries()].map(([group, items]) => (
          <section key={group} className="mb-5 last:mb-0">
            <h3 className="eyebrow mb-2">{group}</h3>
            <dl className="grid gap-1.5">
              {items.map((binding) => (
                <div
                  key={binding.keys}
                  className="flex items-baseline justify-between gap-4 font-mono text-xs"
                >
                  <dt className="shrink-0">
                    <KeyCap keys={binding.keys} />
                  </dt>
                  <dd className="text-right text-fg-muted">{binding.description}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </Modal>
  );
};

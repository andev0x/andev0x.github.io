import React, { useCallback, useRef, useState } from 'react';
import { Loader2, Mail, Send } from 'lucide-react';
import { SOCIALS } from '../data/socials';
import { Modal } from './Modal';

/**
 * Formspree endpoint id. Deliberately indirect: the id is a routing secret for
 * the inbox, not a credential, but it still should not be scattered through the
 * UI code. Override per environment with `VITE_FORMSPREE_ID`.
 */
const FORM_ID = (import.meta.env.VITE_FORMSPREE_ID ?? '').trim();
const ENDPOINT = FORM_ID && !/^replace/i.test(FORM_ID) ? `https://formspree.io/f/${FORM_ID}` : null;

type Status = 'idle' | 'submitting' | 'sent' | 'error';

interface Fields {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const EMPTY: Fields = { name: '', email: '', subject: '', message: '' };

const MAX_MESSAGE = 4000;

const inputClass =
  'w-full rounded-md border border-border bg-canvas px-3 py-2 font-mono text-sm text-fg outline-none transition-colors placeholder:text-fg-subtle focus:border-accent/60';

const labelClass = 'mb-1 block font-mono text-[0.68rem] text-fg-subtle';

interface ContactDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Contact dialog.
 *
 * This started life as a form at the foot of the landing page. It was ~250px of
 * fields below the fold that nobody scrolled to, pushing the actual archive out
 * of view, so it is now a peer of About and Help: one trigger in the header, one
 * key, nothing on the page itself.
 *
 * Posts JSON to Formspree and never touches the site's own API, so it keeps
 * working on the static build. Two details matter for delivery:
 *
 *  - `Accept: application/json` is required, otherwise Formspree replies with an
 *    HTML page and a JSON parse of the response throws on every success.
 *  - The `_gotcha` input is Formspree's honeypot. It is hidden from humans but
 *    trivially filled in by bots; a non-empty value makes the endpoint accept
 *    and discard the submission, so the form can report success while nothing
 *    reaches the inbox.
 */
export const ContactDialog: React.FC<ContactDialogProps> = ({ open, onClose }) => {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  // Clearing the *status* on open, but deliberately keeping the draft: Escape is
  // bound to a global dismiss, so a half-written message must not evaporate
  // because someone reached for `q` while looking for a letter.
  const [wasOpen, setWasOpen] = React.useState(false);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setStatus('idle');
      setError('');
    }
  }

  const update = useCallback(
    (key: keyof Fields) =>
      (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFields((current) => ({ ...current, [key]: event.target.value }));
        // Clear a previous failure as soon as the visitor edits their answer.
        if (status === 'error') setStatus('idle');
      },
    [status],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!ENDPOINT || status === 'submitting') return;

    setStatus('submitting');
    setError('');

    const data = new FormData(event.currentTarget);

    // One derived subject for both the reply thread and the inbox notification,
    // so a blank field can never produce two different fallbacks.
    const threadSubject = fields.subject.trim() || `Message from ${fields.name.trim()}`;

    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fields.name.trim(),
          email: fields.email.trim(),
          subject: threadSubject,
          message: fields.message.trim(),
          _subject: `[andev0x] ${threadSubject}`,
          // Honeypot — must arrive empty.
          _gotcha: data.get('_gotcha') ?? '',
        }),
      });

      if (!response.ok) {
        // Formspree answers 4xx with a per-field `{ field, message, type }` list.
        // Show the message; the bare field name ("email") tells the visitor
        // nothing they can act on.
        const detail = await response.json().catch(() => null);
        const first = detail?.errors?.[0];
        const reason = first ? [first.field, first.message].filter(Boolean).join(': ') : '';
        throw new Error(reason || `request failed (${response.status})`);
      }

      setFields(EMPTY);
      formRef.current?.reset();
      setStatus('sent');
    } catch (cause) {
      // `fetch` rejects with an opaque TypeError ("Failed to fetch") for DNS,
      // TLS and offline failures alike; none of that means anything to a reader.
      const message =
        cause instanceof TypeError
          ? 'could not reach formspree — check your connection and try again'
          : cause instanceof Error
            ? cause.message
            : 'could not send — try again';
      setError(message);
      setStatus('error');
    }
  };

  const invalid = status === 'error';

  return (
    <Modal open={open} onClose={onClose} labelledBy="contact-title">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-border-strong" aria-hidden="true" />
          <span className="h-2.5 w-2.5 rounded-full bg-border-strong" aria-hidden="true" />
          <span className="h-2.5 w-2.5 rounded-full bg-accent/60" aria-hidden="true" />
          <span className="ml-2 font-mono text-xs text-fg-subtle">~/contact</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-border px-2 py-1 font-mono text-xs text-fg-muted transition-colors hover:border-accent/50 hover:text-fg"
        >
          close <span className="kbd ml-1">esc</span>
        </button>
      </div>

      <div className="px-5 py-5">
        <h2 id="contact-title" className="sr-only">
          Get in touch
        </h2>

        <p className="mb-5 text-sm leading-relaxed text-fg-muted">
          Found a bug, have an idea for a post, or just want to say hi? Send a note — it lands in the
          same inbox as the site.
        </p>

        {/* Channels sit above the form, not after it: a reader who came to follow
            or report something should not scroll past four inputs first. Each card
            carries its handle and purpose, because a row of three bare icons says
            nothing about which account opens or whether a message is welcome. */}
        <p className="mb-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-fg-subtle/70">
          or reach me directly
        </p>
        <ul className="mb-5 grid gap-2 sm:grid-cols-3">
          {SOCIALS.map(({ label, handle, href, icon: Icon, blurb }) => (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer me"
                aria-label={`${label} ${handle} — ${blurb}`}
                className="group flex h-full items-start gap-2.5 rounded-lg border border-border bg-elevated px-3 py-2.5 transition-colors duration-150 hover:border-accent/50 hover:bg-surface"
              >
                <Icon
                  size={15}
                  strokeWidth={1.75}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-fg-subtle transition-colors group-hover:text-accent"
                />
                <span className="min-w-0">
                  <span className="block truncate font-mono text-[0.68rem] text-fg">{label}</span>
                  <span className="mt-0.5 block truncate font-mono text-[0.62rem] text-accent/90">
                    {handle}
                  </span>
                  <span className="mt-1 block truncate font-mono text-[0.6rem] text-fg-subtle">{blurb}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>

        {status === 'sent' ? (
          <div role="status" className="rounded-lg border border-accent/50 bg-accent/10 px-4 py-6 text-center">
            <p className="font-display text-xl text-fg">message sent</p>
            <p className="mt-1 font-mono text-xs text-fg-subtle">thanks — i&apos;ll reply soon</p>
            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="mt-4 rounded-md border border-accent/50 px-3 py-1.5 font-mono text-xs text-accent transition-colors hover:bg-accent/10"
            >
              send another
            </button>
          </div>
        ) : (
          <form ref={formRef} onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="contact-name" className={labelClass}>
                  name
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  value={fields.name}
                  onChange={update('name')}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="contact-email" className={labelClass}>
                  email
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={fields.email}
                  onChange={update('email')}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="contact-subject" className={labelClass}>
                subject <span className="text-fg-subtle/70">(optional)</span>
              </label>
              <input
                id="contact-subject"
                name="subject"
                type="text"
                value={fields.subject}
                onChange={update('subject')}
                className={inputClass}
              />
            </div>

            <div className="mt-4">
              <label htmlFor="contact-message" className={labelClass}>
                message
              </label>
              <textarea
                id="contact-message"
                name="message"
                required
                rows={5}
                maxLength={MAX_MESSAGE}
                value={fields.message}
                onChange={update('message')}
                aria-describedby="contact-message-count"
                className={`${inputClass} resize-y`}
              />
              <p id="contact-message-count" className="mt-1 text-right font-mono text-[0.62rem] text-fg-subtle">
                {fields.message.length}/{MAX_MESSAGE}
              </p>
            </div>

            {/* Honeypot: off-screen and aria-hidden, never announced or tabbable. */}
            <div aria-hidden="true" className="absolute left-[-9999px] top-0 h-px w-px overflow-hidden">
              <label htmlFor="contact-company">Company (leave blank)</label>
              <input id="contact-company" name="_gotcha" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={!ENDPOINT || status === 'submitting'}
                className="inline-flex items-center gap-2 rounded-md border border-accent bg-accent px-3.5 py-2 font-mono text-xs font-medium text-on-accent transition-opacity duration-150 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === 'submitting' ? (
                  <Loader2 size={13} strokeWidth={2.25} className="animate-spin" aria-hidden="true" />
                ) : (
                  <Send size={13} strokeWidth={2.25} aria-hidden="true" />
                )}
                {status === 'submitting' ? 'sending' : 'send message'}
              </button>

              <p className="inline-flex items-center gap-1.5 font-mono text-[0.62rem] text-fg-subtle">
                <Mail size={11} strokeWidth={1.75} aria-hidden="true" />
                no tracking, no newsletter
              </p>
            </div>

            {!ENDPOINT && (
              <p className="mt-3 rounded-md border border-border bg-elevated px-3 py-2 font-mono text-[0.65rem] text-fg-subtle">
                form endpoint not configured — set <span className="text-accent">VITE_FORMSPREE_ID</span> in{' '}
                <span className="text-accent">.env</span> to a Formspree form id to enable sending.
              </p>
            )}

            <p
              role={invalid ? 'alert' : undefined}
              aria-live="polite"
              className={`mt-3 font-mono text-[0.68rem] ${invalid ? 'text-accent' : 'sr-only'}`}
            >
              {invalid ? error : ''}
            </p>
          </form>
        )}
      </div>
    </Modal>
  );
};

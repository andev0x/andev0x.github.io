import { Github, Rss, Send } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface Social {
  /** Human-facing platform name, used as the visible label. */
  label: string;
  /** Platform-agnostic account id, shown next to the label so a reader knows which account to open. */
  handle: string;
  href: string;
  icon: LucideIcon;
  /** What this channel is actually for — a bare icon says nothing about whether a DM is welcome. */
  blurb: string;
}

/**
 * Where to find the author, in one place. Consumed by the footer and the
 * contact dialog so the two never drift apart — a handle changed in one place
 * used to leave the other pointing at a dead account.
 *
 * Order is intentional: code first (most traffic), then the two federated
 * timelines. `rel="me"` on the outbound links is what Mastodon and Bluesky use
 * to verify the account belongs to this site.
 */
export const SOCIALS: Social[] = [
  {
    label: 'GitHub',
    handle: '@andev0x',
    href: 'https://github.com/andev0x',
    icon: Github,
    blurb: 'code, issues, dotfiles',
  },
  {
    label: 'Bluesky',
    handle: '@anvndev.bsky.social',
    href: 'https://bsky.app/profile/anvndev.bsky.social',
    icon: Send,
    blurb: 'quick replies, short notes',
  },
  {
    label: 'Mastodon',
    handle: '@anvndev',
    href: 'https://mastodon.social/@anvndev',
    icon: Rss,
    blurb: 'longer posts, no algorithm',
  },
];
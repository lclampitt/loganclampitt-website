// Keeps a copy of a contact form message for Logan's console, beside the
// Formspree email he already gets (owner request 2026-10-20). Linked to
// this visit only when tracking is on for the browser.

import { visitIds } from './analytics'
import { uuid } from './analytics/storage'

export const newMessageId = () => uuid()

// Fire and forget: the visitor's send never waits on, or fails because
// of, the copy. keepalive lets it finish if the page closes right after.
export function keepCopy(messageId, { name, email, message, website }) {
  try {
    const ids = visitIds()
    fetch('/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message_id: messageId, name, email, message, website, page: window.location.pathname, ...(ids ?? {}) }),
      keepalive: true,
    }).catch(() => {})
  } catch {
    // the email still goes out through Formspree
  }
}

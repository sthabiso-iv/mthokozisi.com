/**
 * Encodes an email address as HTML character entities so it doesn't
 * appear as plaintext in HTML source, defeating simple regex scrapers.
 * Browsers decode entities transparently — links and display still work.
 */
export function encodeEmailHtml(email: string): string {
  return email
    .split("")
    .map((c) => `&#${c.charCodeAt(0)};`)
    .join("");
}

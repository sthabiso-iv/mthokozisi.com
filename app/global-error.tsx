"use client";

/**
 * app/global-error.tsx
 * Catches errors in the root layout itself (rare but possible).
 * Must include its own <html> and <body> since the root layout is broken.
 */

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0d0d0d", color: "#f0f0f0", fontFamily: "sans-serif" }}>
        <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
          <div style={{ maxWidth: "480px", width: "100%" }}>
            <div style={{ height: "2px", width: "96px", background: "#f5c518", marginBottom: "48px" }} />
            <p style={{ color: "#f5c518", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "16px" }}>
              // Critical error
            </p>
            <h1 style={{ fontSize: "clamp(4rem,16vw,8rem)", color: "#1c1c1c", lineHeight: 1, margin: "0 0 32px", userSelect: "none" }}>
              500
            </h1>
            <h2 style={{ fontSize: "20px", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 16px" }}>
              Something went seriously wrong
            </h2>
            <p style={{ color: "#606060", lineHeight: 1.6, marginBottom: "48px" }}>
              The page couldn&apos;t load at all. Try refreshing.
            </p>
            <button
              onClick={reset}
              style={{ padding: "12px 24px", background: "#f5c518", color: "#0d0d0d", border: "none", cursor: "pointer", fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700 }}
            >
              Try again
            </button>
            {error.digest && (
              <p style={{ marginTop: "32px", fontSize: "11px", color: "#333", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </main>
      </body>
    </html>
  );
}

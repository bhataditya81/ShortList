"use client";

import { useState } from "react";

export default function LedgerImportPage() {
  const [clickId, setClickId] = useState("");
  const [amountCents, setAmountCents] = useState("");
  const [note, setNote] = useState("");
  const [secret, setSecret] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    setError(null);
    const cents = Number(amountCents);
    if (!clickId || !Number.isFinite(cents)) {
      setError("clickId and amountCents are required");
      setBusy(false);
      return;
    }
    try {
      const res = await fetch("/api/ledger/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret,
        },
        body: JSON.stringify({ clickId, amountCents: cents, note: note || undefined }),
      });
      const data = (await res.json()) as { error?: string; entry?: { id: string }; platformShareCents?: number };
      if (!res.ok) {
        setError(data.error ?? `HTTP ${res.status}`);
      } else {
        setStatus(
          `Imported ledger ${data.entry?.id}. User share recorded; platform kept ${data.platformShareCents ?? "?"} cents.`,
        );
        setClickId("");
        setAmountCents("");
        setNote("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <h1>Ledger import (admin)</h1>
      <p className="lede">
        Paste a conversion from Railway / CJ / PartnerStack. Gross commission in cents; the API records 70%
        for the user. Requires <code>FEATURED_ADMIN_SECRET</code> — not exposed publicly.
      </p>
      <form onSubmit={onSubmit}>
        <label>
          Admin secret
          <input
            name="secret"
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            required
            autoComplete="off"
          />
        </label>
        <label>
          Click id
          <input
            name="clickId"
            value={clickId}
            onChange={(e) => setClickId(e.target.value)}
            placeholder="clk_xxxxxxxx"
            required
          />
        </label>
        <label>
          Gross commission (cents)
          <input
            name="amountCents"
            type="number"
            min={1}
            value={amountCents}
            onChange={(e) => setAmountCents(e.target.value)}
            placeholder="1000"
            required
          />
        </label>
        <label>
          Note (optional)
          <input name="note" value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
        <button type="submit" disabled={busy}>
          {busy ? "Importing…" : "Import conversion"}
        </button>
      </form>
      {error ? <p className="meta">Error: {error}</p> : null}
      {status ? <p className="notice">{status}</p> : null}
    </>
  );
}

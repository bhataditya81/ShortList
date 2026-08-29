import { redirect } from "next/navigation";
import { setSession } from "@/lib/session";

async function loginAction(formData: FormData) {
  "use server";
  const email = String(formData.get("email") || "");
  const next = String(formData.get("next") || "/account");
  if (!email.includes("@")) {
    redirect("/login?error=email");
  }
  await setSession(email);
  redirect(next.startsWith("/") ? next : "/account");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const q = await searchParams;
  return (
    <>
      <h1>Log in</h1>
      <p className="lede">
        Email-only demo session (no password). Used for tracked links and the payout ledger.
      </p>
      <form action={loginAction}>
        {q.error ? <p className="meta">Enter a valid email.</p> : null}
        <input type="hidden" name="next" value={q.next || "/account"} />
        <label>
          Email
          <input name="email" type="email" required placeholder="you@example.com" />
        </label>
        <button type="submit">Continue</button>
      </form>
    </>
  );
}

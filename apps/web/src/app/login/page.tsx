import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { emailAllowedForPoc, safeInternalPath } from "@/lib/poc-security";

async function loginAction(formData: FormData) {
  "use server";
  const email = String(formData.get("email") || "");
  const next = safeInternalPath(String(formData.get("next") || "/account"));
  if (!email.includes("@")) {
    redirect("/login?error=email");
  }
  if (!emailAllowedForPoc(email)) {
    redirect("/login?error=forbidden");
  }
  try {
    await signIn("credentials", { email, redirectTo: next });
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    // Auth.js throws NEXT_REDIRECT via special digest — rethrow redirect-like errors
    const digest = typeof err === "object" && err && "digest" in err ? String((err as { digest?: string }).digest) : "";
    if (digest.startsWith("NEXT_REDIRECT")) throw err;
    redirect("/login?error=session");
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const q = await searchParams;
  const next = safeInternalPath(q.next);
  return (
    <>
      <h1>Log in</h1>
      <p className="lede">
        Email sign-in for tracked affiliate links and the payout ledger. Private beta: if{" "}
        <code>SHORTLIST_ALLOWED_EMAILS</code> is set, only listed addresses can enter.
      </p>
      <form action={loginAction}>
        {q.error === "email" ? <p className="meta">Enter a valid email.</p> : null}
        {q.error === "forbidden" ? <p className="meta">That email is not invited to this POC.</p> : null}
        {q.error === "session" ? <p className="meta">Could not sign in. Try again.</p> : null}
        <input type="hidden" name="next" value={next} />
        <label>
          Email
          <input name="email" type="email" required placeholder="you@example.com" />
        </label>
        <button type="submit">Continue</button>
      </form>
    </>
  );
}

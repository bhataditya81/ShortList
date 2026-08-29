import { redirect } from "next/navigation";
import { signIn } from "@/auth";

async function loginAction(formData: FormData) {
  "use server";
  const email = String(formData.get("email") || "");
  const next = String(formData.get("next") || "/account");
  if (!email.includes("@")) {
    redirect("/login?error=email");
  }
  try {
    await signIn("credentials", { email, redirectTo: next.startsWith("/") ? next : "/account" });
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    redirect("/login?error=session");
  }
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
        Email-only sign-in (Auth.js). Used for tracked links and the payout ledger.
      </p>
      <form action={loginAction}>
        {q.error === "email" ? <p className="meta">Enter a valid email.</p> : null}
        {q.error === "session" ? <p className="meta">Could not sign in. Try again.</p> : null}
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

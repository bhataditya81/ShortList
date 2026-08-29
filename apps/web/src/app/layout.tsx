import type { Metadata } from "next";
import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shortlist — compare tools, cashback only when money moves",
  description:
    "Repo-aware shortlist of developer tools. Labeled Featured never outranks organic. Not wait-state ads.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  return (
    <html lang="en">
      <body>
        <header>
          <Link className="brand" href="/">
            Shortlist
          </Link>
          <nav>
            <Link href="/">Categories</Link>
            <Link href="/featured">Featured</Link>
            {user ? <Link href="/account">Account</Link> : <Link href="/login">Log in</Link>}
          </nav>
        </header>
        <main>{children}</main>
        <footer>
          Affiliate disclosure: some links may be tracked. Organic ranking is not for sale. Featured is
          labeled and listed after organic. We do not inject ads into IDE wait/spinner UI. This product is
          not submitted to Anthropic’s software directory as an advertising vehicle. Cursor Marketplace
          listings, if any, stay free.
        </footer>
      </body>
    </html>
  );
}

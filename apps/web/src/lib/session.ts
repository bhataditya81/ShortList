import { auth, signIn, signOut } from "@/auth";
import { getUserById, type User } from "@shortlist/data-store";

export async function getSessionUser(): Promise<User | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await getUserById(session.user.id);
  if (user) return user;
  if (!session.user.email) return null;
  return {
    id: session.user.id,
    email: session.user.email,
    createdAt: new Date().toISOString(),
  };
}

export async function setSession(email: string): Promise<User> {
  await signIn("credentials", { email, redirect: false });
  const user = await getSessionUser();
  if (!user) throw new Error("Failed to create session");
  return user;
}

export async function clearSession(): Promise<void> {
  await signOut({ redirect: false });
}

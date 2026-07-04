import "server-only";
import { auth } from "../../auth";
import { db } from "./ipn-db";

function adminEmails() {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return db.user.findUnique({ where: { id: session.user.id } });
}

export async function isAdmin() {
  const user = await getCurrentUser();
  if (!user) return false;
  return user.role === "ADMIN" || Boolean(user.email && adminEmails().has(user.email.toLowerCase()));
}

export async function canManagePharmacy(pharmacyNpi: string) {
  const user = await getCurrentUser();
  if (!user) return { allowed: false as const, reason: "unauthenticated" as const };
  if (user.role === "ADMIN" || Boolean(user.email && adminEmails().has(user.email.toLowerCase()))) {
    return { allowed: true as const, user };
  }
  const membership = await db.pharmacyMember.findFirst({
    where: {
      pharmacyNpi,
      status: "active",
      OR: [
        { userId: user.id },
        ...(user.email ? [{ email: { equals: user.email, mode: "insensitive" as const } }] : []),
      ],
    },
  });
  if (!membership) return { allowed: false as const, reason: "forbidden" as const };
  if (!membership.userId) {
    await db.pharmacyMember.update({ where: { id: membership.id }, data: { userId: user.id } });
  }
  return { allowed: true as const, user, membership };
}

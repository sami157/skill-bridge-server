import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import type { Role } from "../../../generated/prisma/enums";

const SALT_ROUNDS = 10;

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  role?: Role;
  image?: string | null;
}) {
  const email = data.email.trim().toLowerCase();
  const role = data.role === "ADMIN" || data.role === "TUTOR" ? data.role : "STUDENT";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: data.name.trim(),
      email,
      role,
      image: data.image ?? null,
      accounts: {
        create: {
          id: crypto.randomUUID(),
          accountId: email,
          providerId: "credential",
          password: hashedPassword,
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
}

export async function verifyCredentials(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: { accounts: { where: { providerId: "credential" }, take: 1 } },
  });

  if (!user) return null;
  const credentialAccount = user.accounts[0];
  if (!credentialAccount?.password) return null;

  const valid = await bcrypt.compare(password, credentialAccount.password);
  if (!valid) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    image: user.image,
    emailVerified: user.emailVerified,
  };
}

/**
 * Set password for an existing user (e.g. after migrating from Better Auth).
 * Finds user by email and credential account, updates password to bcrypt hash.
 */
export async function setPasswordForEmail(email: string, password: string): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: { accounts: { where: { providerId: "credential" }, take: 1 } },
  });
  if (!user) return false;
  const credentialAccount = user.accounts[0];
  if (!credentialAccount) {
    // No credential account - create one
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    await prisma.account.create({
      data: {
        id: crypto.randomUUID(),
        accountId: normalizedEmail,
        providerId: "credential",
        userId: user.id,
        password: hashedPassword,
      },
    });
    return true;
  }
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  await prisma.account.update({
    where: { id: credentialAccount.id },
    data: { password: hashedPassword },
  });
  return true;
}

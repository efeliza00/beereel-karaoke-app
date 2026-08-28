import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

const SESSION_COOKIE = "beereel_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not set. Add it to your .env file.");
  }
  return secret;
}

export function getAdminCredentials(): {
  username: string;
  password: string;
} {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) {
    throw new Error(
      "ADMIN_USERNAME and ADMIN_PASSWORD are not set. Add them to your .env file.",
    );
  }
  return { username, password };
}

function sign(value: string): string {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

export function verifyCredentials(
  username: string,
  password: string,
): boolean {
  const { username: expectedName, password: expectedPass } =
    getAdminCredentials();
  const nameOk =
    username.length === expectedName.length &&
    timingSafeEqual(Buffer.from(username), Buffer.from(expectedName));
  const passOk =
    password.length === expectedPass.length &&
    timingSafeEqual(Buffer.from(password), Buffer.from(expectedPass));
  return nameOk && passOk;
}

export function createSessionToken(username: string): string {
  const payload = `${username}.${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [username, timestamp, sig] = parts;
  const payload = `${username}.${timestamp}`;
  const expected = sign(payload);
  const sigMatches =
    sig.length === expected.length &&
    timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  return sigMatches && getAdminCredentials().username === username;
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

export async function setSession(username: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken(username), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

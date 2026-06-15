/**
 * DEMO MODE: Mock auth & session
 * Returns a fake session so all pages work without a real database.
 */

export const MOCK_USER = {
  id: "demo-user-001",
  name: "Nihar Raval",
  email: "nihar@verdure.app",
  role: "user",
  emailVerified: true,
  image: null,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

export const MOCK_SESSION = {
  session: {
    id: "demo-session-001",
    userId: MOCK_USER.id,
    token: "demo-token",
    expiresAt: new Date("2099-01-01"),
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    ipAddress: null,
    userAgent: null,
  },
  user: MOCK_USER,
};

// Drop-in replacement for auth.api.getSession
export const auth = {
  api: {
    getSession: async (_opts?: unknown) => MOCK_SESSION,
  },
  handler: async (req: Request) => new Response("ok"),
};

export type Session = typeof MOCK_SESSION;

/**
 * DEMO MODE: Auth route stub — bypasses Better Auth entirely.
 */
export async function GET() {
  return Response.json({ session: null });
}
export async function POST() {
  return Response.json({ session: null });
}

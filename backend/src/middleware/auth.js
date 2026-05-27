import { getUserFromToken } from "../lib/supabase.js";

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header." });
  }

  const token = header.slice(7);
  const { user, error } = await getUserFromToken(token);

  if (error || !user) {
    return res.status(401).json({ error: "Unauthorized. Sign in again." });
  }

  req.user = user;
  req.accessToken = token;
  return next();
}


import { createAuthClient } from "better-auth/react";

export const { signIn, signUp, useSession, signOut } = createAuthClient({
  baseURL: "https://social-event-website-server.vercel.app", // NO /api at the end here
});
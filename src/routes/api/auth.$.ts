import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/server/auth";

// Better Auth API handler — catches all /api/auth/* requests.
// This handles sign-up, sign-in, sign-out, session, etc.
export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        return auth.handler(request);
      },
      POST: async ({ request }: { request: Request }) => {
        return auth.handler(request);
      },
    },
  },
});

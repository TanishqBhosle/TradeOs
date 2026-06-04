import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Error 404</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">Page not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has moved.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
        >
          Back to TradeOS
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">Please try again in a moment.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >Try again</button>
          <a href="/" className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary">Home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "TradeOS AI — Your AI Copilot for Smarter Trading" },
      { name: "description", content: "Discover opportunities, analyze stocks, manage risk, and learn trading with AI. Built for Indian traders and investors." },
      { name: "theme-color", content: "#0A0F1C" },
      { property: "og:title", content: "TradeOS AI — Your AI Copilot for Smarter Trading" },
      { property: "og:description", content: "Discover opportunities, analyze stocks, manage risk, and learn trading with AI. Built for Indian traders and investors." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "TradeOS AI — Your AI Copilot for Smarter Trading" },
      { name: "twitter:description", content: "Discover opportunities, analyze stocks, manage risk, and learn trading with AI. Built for Indian traders and investors." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ebd8fbf1-8d43-4e2c-8385-445107e8db60/id-preview-bf2593ab--44a9e12b-f91b-4924-9061-d5763207cd6a.lovable.app-1780226619324.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ebd8fbf1-8d43-4e2c-8385-445107e8db60/id-preview-bf2593ab--44a9e12b-f91b-4924-9061-d5763207cd6a.lovable.app-1780226619324.png" },
    ],
    links: [
      { rel: "stylesheet", href: "https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700,900&display=swap" },
      { rel: "stylesheet", href: appCss }
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}

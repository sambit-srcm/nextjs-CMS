/** Security headers for every response. See next.config.ts. */

type Environment = {
  /** `next dev`: hot reload needs eval and a websocket. */
  isDev: boolean;
  /** A Vercel preview deployment, where the Vercel Toolbar is injected. */
  isVercelPreview: boolean;
  /** Served by Vercel, i.e. always over HTTPS. */
  isVercel: boolean;
};

// Vercel Toolbar sources: https://vercel.com/docs/vercel-toolbar/managing-toolbar#using-a-content-security-policy
const TOOLBAR = "https://vercel.live";

export function contentSecurityPolicy({
  isDev,
  isVercelPreview,
  isVercel,
}: Environment): string {
  // Next and the theme script use inline scripts. Other sites are still blocked.
  let scriptSrc = "'self' 'unsafe-inline'";
  // Tailwind and next/font set inline styles.
  let styleSrc = "'self' 'unsafe-inline'";
  // Contentful images, including ones served through /_next/image.
  let imgSrc = "'self' data: blob: https://images.ctfassets.net";
  // next/font downloads Geist at build time and serves it from this site.
  let fontSrc = "'self'";
  // The blog list refreshes from /api/posts; nothing else is fetched.
  let connectSrc = "'self'";
  let frameSrc = "'none'";

  // `next dev`: hot reload needs eval and a websocket.
  if (isDev) {
    scriptSrc += " 'unsafe-eval'";
    connectSrc += " ws: wss:";
  }

  // Vercel preview deployments add the Vercel Toolbar to the page.
  if (isVercelPreview) {
    scriptSrc += ` ${TOOLBAR}`;
    styleSrc += ` ${TOOLBAR}`;
    imgSrc += ` ${TOOLBAR} https://vercel.com`;
    fontSrc += ` ${TOOLBAR} https://assets.vercel.com`;
    connectSrc += ` ${TOOLBAR} wss://ws-us3.pusher.com`;
    frameSrc = TOOLBAR;
  }

  const policy = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    `style-src ${styleSrc}`,
    `img-src ${imgSrc}`,
    `font-src ${fontSrc}`,
    `connect-src ${connectSrc}`,
    `frame-src ${frameSrc}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    // Nobody may put this site in a frame (clickjacking).
    "frame-ancestors 'none'",
  ];

  // Localhost is plain HTTP, so this is only added on Vercel.
  if (isVercel) policy.push("upgrade-insecure-requests");

  return policy.join("; ");
}

export function securityHeaders(env: Environment) {
  return [
    { key: "Content-Security-Policy", value: contentSecurityPolicy(env) },
    // Ask browsers to keep using HTTPS. Ignored on plain HTTP.
    {
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains",
    },
    // Don't guess a file's type from its contents.
    { key: "X-Content-Type-Options", value: "nosniff" },
    // Older browsers' version of frame-ancestors 'none'.
    { key: "X-Frame-Options", value: "DENY" },
    // Other sites see only our origin, never the full URL, when a reader clicks out.
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    // Turn off browser features this site never uses.
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
    },
    // Pages opened from this site can't reach back into it via window.opener.
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ];
}

/** The environment as seen by next.config.ts at build/start time. */
export function currentEnvironment(): Environment {
  return {
    isDev: process.env.NODE_ENV === "development",
    isVercelPreview: process.env.VERCEL_ENV === "preview",
    isVercel: process.env.VERCEL === "1",
  };
}

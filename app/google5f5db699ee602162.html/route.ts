export const dynamic = "force-static";

export function GET() {
  return new Response(
    "google-site-verification: google5f5db699ee602162.html",
    { headers: { "Content-Type": "text/html" } }
  );
}

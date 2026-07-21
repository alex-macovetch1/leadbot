import { NextResponse } from "next/server";
import { getBusiness } from "@/lib/businesses";

// Branding for the embeddable widget. Called cross-origin from any site the
// widget is installed on, so it allows all origins.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const biz = getBusiness(url.searchParams.get("b"));
  return NextResponse.json(
    {
      slug: biz.slug,
      name: biz.name,
      title: biz.widgetTitle,
      greeting: biz.greeting,
      accent: biz.accent,
    },
    { headers: CORS },
  );
}

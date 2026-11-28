import { NextResponse } from "next/server";
import { getArticles } from "@/lib/news";

export const revalidate = 300;

export async function GET() {
  const articles = await getArticles();
  return NextResponse.json({ updatedAt: new Date().toISOString(), articles });
}

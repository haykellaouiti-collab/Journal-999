import { auth } from "@/auth";
import NewsstandClient from "@/components/NewsstandClient";

export default async function HomePage() {
  const session = await auth();
  return <NewsstandClient user={session?.user ?? null} />;
}

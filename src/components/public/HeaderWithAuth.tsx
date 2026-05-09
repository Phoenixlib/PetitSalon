import { auth } from "@/auth";
import Header from "./Header";

export default async function HeaderWithAuth() {
  const session = await auth();
  return <Header isAuthenticated={!!session?.user} />;
}

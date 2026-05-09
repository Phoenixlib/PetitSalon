import HeaderWithAuth from "@/components/public/HeaderWithAuth";
import Footer from "@/components/public/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <HeaderWithAuth />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}

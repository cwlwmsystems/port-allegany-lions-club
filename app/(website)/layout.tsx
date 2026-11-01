import GivebutterDonation from '@/components/givebutter-donation';
import { Header, Footer } from '@/components/site';

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main id="main-content">{children}</main>
      <GivebutterDonation />
      <Footer />
    </>
  );
}

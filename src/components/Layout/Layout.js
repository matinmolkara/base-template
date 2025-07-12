import Header from "./Header";
import Footer from "./Footer";
import BootstrapClient from "../BootstrapClient";

export default function Layout({ children }) {
  return (
    <>
      <BootstrapClient />
      <div className="min-vh-100 d-flex flex-column">
        <Header />
        <main className="flex-grow-1">{children}</main>
        <Footer />
      </div>
    </>
  );
}

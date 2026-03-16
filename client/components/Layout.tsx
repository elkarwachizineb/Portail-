import { Link } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import { useSidebar } from "../context/SidebarContext";

interface LayoutProps {
  children: React.ReactNode;
  currentPage?: "dashboard" | "reports" | "program" | "ideas" | "account";
  showHamburger?: boolean;
}

export default function Layout({ children, currentPage, showHamburger = true }: LayoutProps) {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="min-h-screen bg-scout-cream flex flex-col" dir="rtl">
      <Header hamburgerVisible={showHamburger} onHamburgerClick={toggleSidebar} />
      {showHamburger && <Sidebar />}


      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

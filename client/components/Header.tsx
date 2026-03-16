import { Link } from "react-router-dom";

interface HeaderProps {
  hamburgerVisible?: boolean;
  onHamburgerClick?: () => void;
}

export default function Header({ hamburgerVisible = true, onHamburgerClick }: HeaderProps) {
  return (
    <header className="bg-gradient-to-l from-red-600 to-purple-600 text-white px-4 py-4 sticky top-0 z-40 shadow-lg" dir="rtl">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2F1f75f54747b54e29825eb23fdf70cfc1%2Fa8caeb8f3ae14cfe9ddb9534cad38297?format=webp&width=800&height=1200"
            alt="شعار الكشافة الحسنية"
            className="w-12 h-12 flex-shrink-0"
          />
          <div className="text-right">
            <h1 className="text-lg md:text-xl font-bold text-white">
              الكشافة الحسنية
            </h1>
            <p className="text-xs md:text-sm text-red-100">بوابة الأعضاء</p>
          </div>
        </Link>

        {/* Navigation Links and Hamburger */}
        <nav className="flex gap-4 items-center">
          <Link
            to="/"
            className="text-white hover:text-red-100 font-semibold text-sm md:text-base transition-colors"
          >
            الرئيسية
          </Link>
          <a
            href="#logout"
            className="text-white hover:text-red-100 font-semibold text-sm md:text-base transition-colors"
          >
            تسجيل الخروج
          </a>

          {/* Hamburger Menu Button */}
          {hamburgerVisible && (
            <button
              onClick={onHamburgerClick}
              className="hidden md:flex flex-col gap-1.5 text-white hover:text-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 p-2 rounded"
              aria-label="فتح القائمة"
              aria-expanded="false"
            >
              <span className="w-6 h-0.5 bg-white rounded"></span>
              <span className="w-6 h-0.5 bg-white rounded"></span>
              <span className="w-6 h-0.5 bg-white rounded"></span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

export default function Footer() {
  return (
    <footer className="bg-gradient-to-l from-red-600 to-purple-600 text-white px-4 py-8 mt-12" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Logo and Copyright */}
        <div className="flex flex-col items-center gap-4">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2F1f75f54747b54e29825eb23fdf70cfc1%2Fa8caeb8f3ae14cfe9ddb9534cad38297?format=webp&width=800&height=1200"
            alt="شعار الكشافة الحسنية"
            className="w-16 h-16"
          />
          <div className="text-center">
            <h3 className="text-lg font-bold mb-2">الكشافة الحسنية صفي</h3>
            <p className="text-sm text-red-100">© 2026 - جميع الحقوق محفوظة</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

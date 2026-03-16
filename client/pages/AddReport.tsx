import { Link } from "react-router-dom";
import Layout from "@/components/Layout";

export default function AddReport() {
  return (
    <Layout currentPage="reports">
      <h2 className="text-2xl md:text-3xl font-bold text-scout-purple mb-4">
        إضافة تقرير جديد
      </h2>
      <p className="text-gray-600 mb-8">
        هذه الصفحة قيد الإعداد. يمكنك المتابعة في تطوير التطبيق لملء محتوى هذه الصفحة.
      </p>
      <Link
        to="/reports"
        className="inline-block bg-scout-purple hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
      >
        العودة إلى التقارير
      </Link>
    </Layout>
  );
}

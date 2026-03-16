import Layout from "@/components/Layout";

export default function Dashboard() {
  return (
    <Layout currentPage="dashboard">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-scout-purple mb-4">
          لوحة التحكم
        </h2>
        <p className="text-gray-600 mb-8">
          هذه الصفحة قيد الإعداد. يمكنك التنقل باستخدام القائمة أعلاه.
        </p>
      </div>
    </Layout>
  );
}

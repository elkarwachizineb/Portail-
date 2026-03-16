import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { fetchReports, Report } from "../lib/api";

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const data = await fetchReports();
        setReports(data);
      } catch (error) {
        console.error("Error loading reports:", error);
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-MA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      draft: "مسودة",
      submitted: "مرسل",
      approved: "موافق عليه",
      rejected: "مرفوض",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      draft: "bg-gray-100 text-gray-700",
      submitted: "bg-blue-100 text-blue-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <Layout currentPage="reports">
      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-l from-red-600 to-purple-600 bg-clip-text text-transparent mb-2">
          التقارير
        </h1>
        <p className="text-gray-600">
          عرض التقارير الأخيرة والإحصائيات النشاط الكشفي
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-96">
          <div className="inline-block animate-spin">
            <div className="w-8 h-8 border-4 border-purple-300 border-t-purple-600 rounded-full"></div>
          </div>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center border-t-4 border-gray-300">
          <p className="text-gray-500 text-lg mb-4">لا توجد تقارير مسجلة</p>
        </div>
      ) : (
        <div className="space-y-4 pb-32">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-lg shadow-md overflow-hidden border-r-4 border-gradient-to-b from-red-600 to-purple-600 hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                      {report.title}
                    </h3>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                      <span>📅 {formatDate(report.report_date)}</span>
                      <span>📍 {report.location}</span>
                    </div>
                  </div>
                  <div
                    className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap ${getStatusColor(
                      report.status
                    )}`}
                  >
                    {getStatusLabel(report.status)}
                  </div>
                </div>

                {/* Activity Details */}
                <div className="bg-purple-50 p-4 rounded-lg mb-4">
                  <p className="text-gray-700 leading-relaxed">{report.activity_details}</p>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 uppercase font-semibold">إجمالي المشاركين</p>
                    <p className="text-2xl font-bold text-blue-600">{report.members_count}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 uppercase font-semibold">القادة</p>
                    <p className="text-2xl font-bold text-green-600">{report.leaders_count}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 uppercase font-semibold">ذكور</p>
                    <p className="text-2xl font-bold text-purple-600">{report.male_count}</p>
                  </div>
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 uppercase font-semibold">إناث</p>
                    <p className="text-2xl font-bold text-pink-600">{report.female_count}</p>
                  </div>
                </div>

                {/* Recommendations */}
                {report.recommendations && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded">
                    <p className="text-sm text-gray-700">
                      <span className="font-bold text-yellow-700">💡 التوصيات:</span> {report.recommendations}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3">
                  {report.pdf_url && (
                    <a
                      href={report.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg transition-colors"
                    >
                      <span>📄</span> تحميل PDF
                    </a>
                  )}
                  <a
                    href={`#report-${report.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-600 font-bold rounded-lg transition-colors"
                  >
                    <span>👁️</span> عرض التفاصيل
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Action Button */}
      <Link
        to="/add-report"
        className="fixed bottom-8 left-8 w-16 h-16 bg-gradient-to-l from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all text-2xl font-bold z-10"
        title="إضافة تقرير جديد"
      >
        +
      </Link>
    </Layout>
  );
}

import { useLocation, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { generateMemberId } from "../lib/memberIdGenerator";

interface RegistrationData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  patrol?: string;
  role?: string;
  guardianName?: string;
  guardianRelationship?: string;
}

export default function AccountConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [qrCode, setQrCode] = useState<string>("");
  const [generating, setGenerating] = useState(false);

  // Get registration data from location state
  const registrationData: RegistrationData = location.state?.data || {};
  const userId: string = location.state?.userId || "";
  const memberId: string = location.state?.memberId || generateMemberId(registrationData.gender || "male");

  // Redirect if no data provided
  if (!userId || !registrationData.firstName) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 flex items-center justify-center" dir="rtl">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">خطأ</h1>
          <p className="text-gray-600 mb-6">لم يتم العثور على بيانات التسجيل</p>
          <Link
            to="/register"
            className="inline-block bg-gradient-to-l from-red-600 to-purple-600 text-white font-bold py-2 px-6 rounded-lg hover:shadow-lg transition-shadow"
          >
            العودة إلى التسجيل
          </Link>
        </div>
      </div>
    );
  }

  const generatePDF = async () => {
    setGenerating(true);
    try {
      // Use HTML element approach for better RTL and Arabic support
      // Create a hidden HTML element with proper RTL and font support
      const pdfContainer = document.createElement('div');
      pdfContainer.innerHTML = `
        <div style="
          padding: 40px;
          direction: rtl;
          text-align: right;
          font-family: 'Cairo', 'Noto Sans Arabic', 'Arial Unicode MS', sans-serif;
          background: white;
          width: 210mm;
          height: 297mm;
        ">
          <h1 style="text-align: center; font-size: 28px; font-weight: bold; margin-bottom: 10px; direction: rtl;">
            الكشافة الحسنية صفي
          </h1>
          <h2 style="text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 20px; direction: rtl;">
            شهادة تأكيد الحساب
          </h2>
          <hr style="border: none; border-top: 2px solid #ddd; margin-bottom: 20px;">

          <p style="text-align: center; font-size: 16px; margin-bottom: 30px; direction: rtl;">
            مبروك! تم إنشاء حسابك بنجاح
          </p>

          <div style="margin: 30px 0;">
            ${[
              { label: "الاسم الكامل:", value: `${registrationData.firstName} ${registrationData.lastName}` },
              { label: "رقم العضو:", value: memberId },
              { label: "معرف المستخدم:", value: userId },
              { label: "رقم الهاتف:", value: registrationData.phone || "N/A" },
              { label: "تاريخ الميلاد:", value: registrationData.birthDate || "N/A" },
              { label: "الجنس:", value: registrationData.gender === "male" ? "ذكر" : "أنثى" },
              { label: "الفريق:", value: registrationData.patrol || "N/A" },
              { label: "الدور:", value: registrationData.role || "N/A" },
            ]
              .map(
                (item) => `
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding: 8px 0; border-bottom: 1px solid #eee;">
                <span style="font-weight: bold; direction: rtl;">${item.label}</span>
                <span style="direction: rtl;">${item.value}</span>
              </div>
            `
              )
              .join('')}
          </div>

          <hr style="border: none; border-top: 2px solid #ddd; margin: 30px 0;">

          <p style="text-align: center; font-size: 12px; color: #666; margin-bottom: 5px; direction: rtl;">
            تم الإنشاء: ${new Date().toLocaleDateString("ar-MA")}
          </p>
          <p style="text-align: center; font-size: 11px; color: #999; direction: rtl;">
            جميع الحقوق محفوظة © 2026 الكشافة الحسنية صفي
          </p>
        </div>
      `;

      pdfContainer.style.position = 'absolute';
      pdfContainer.style.left = '-9999px';
      pdfContainer.style.top = '-9999px';
      document.body.appendChild(pdfContainer);

      // Convert HTML to canvas for better rendering
      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Convert canvas to PDF
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/png');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Calculate image dimensions to fit page
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      const pdfData = doc.output('dataurlstring');
      setPdfUrl(pdfData);

      // Clean up
      document.body.removeChild(pdfContainer);

      // Generate QR code with member profile link (optimized for URL format)
      let qrCodeDataUrl = "";
      try {
        // Use URL format for better usability - can be scanned and redirected
        // Format: domain/member-profile?id=memberId
        const currentUrl = window.location.origin;
        const qrValue = `${currentUrl}/member-profile?id=${memberId}`;

        qrCodeDataUrl = await QRCode.toDataURL(qrValue, {
          errorCorrectionLevel: "H",
          type: "image/png",
          width: 200,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });
        setQrCode(qrCodeDataUrl);
      } catch (qrError) {
        console.error("Error generating QR code:", qrError);
        // If QR generation fails, just skip it
      }

      // Save PDF and QR code to Supabase
      try {
        await fetch("/api/auth/save-documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            generated_id: memberId,
            pdf_url: pdfData,
            qr_code_url: qrCodeDataUrl,
          }),
        });
      } catch (saveError) {
        console.error("Error saving documents to Supabase:", saveError);
        // Continue even if save fails
      }

      setPdfGenerated(true);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setGenerating(false);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.addImage(pdfUrl, "PNG", 0, 0, 210, 297);
    doc.save(`SHM_Account_${memberId}.pdf`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("تم النسخ!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-purple-50" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-l from-red-600 to-purple-600 text-white px-4 py-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center">الكشافة الحسنية صفي</h1>
          <p className="text-center text-red-100 text-sm">تأكيد إنشاء الحساب</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-12">
        {/* Success Message */}
        <div className="bg-gradient-to-l from-green-400 to-blue-500 rounded-lg p-8 text-white text-center mb-8 shadow-lg">
          <div className="text-6xl mb-4">✓</div>
          <h1 className="text-3xl font-bold mb-2">مبروك!</h1>
          <p className="text-lg">تم إنشاء حسابك بنجاح</p>
        </div>

        {/* Member Information Card */}
        <div className="bg-white rounded-lg shadow-lg border-r-4 border-gradient-to-b from-red-600 to-purple-600 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            معلومات حسابك
          </h2>

          {/* Member ID - Prominent */}
          <div className="bg-gradient-to-l from-red-50 to-purple-50 rounded-lg p-6 mb-6 border-r-4 border-red-600">
            <p className="text-gray-600 text-sm mb-2">
              رقم العضو الخاص بك
              <span className="block text-xs text-gray-500 mt-1">
                {memberId.startsWith('E') ? '(ذكر)' : memberId.startsWith('F') ? '(أنثى)' : ''}
              </span>
            </p>
            <div className="flex items-center justify-between">
              <p className="text-4xl font-bold text-red-600">{memberId}</p>
              <button
                onClick={() => copyToClipboard(memberId)}
                className="bg-red-600 text-white font-bold py-2 px-4 rounded hover:bg-red-700 transition-colors"
              >
                نسخ
              </button>
            </div>
          </div>

          {/* User ID */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <p className="text-gray-600 text-sm mb-2">معرف المستخدم</p>
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-gray-800">{userId}</p>
              <button
                onClick={() => copyToClipboard(userId)}
                className="bg-purple-600 text-white font-bold py-2 px-4 rounded hover:bg-purple-700 transition-colors"
              >
                نسخ
              </button>
            </div>
          </div>

          {/* Member Information */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="font-bold text-lg text-gray-800 mb-4">البيانات الشخصية</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 text-sm">الاسم</p>
                <p className="font-semibold text-gray-800">
                  {registrationData.firstName} {registrationData.lastName}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">الهاتف</p>
                <p className="font-semibold text-gray-800">{registrationData.phone}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">الفريق</p>
                <p className="font-semibold text-gray-800">{registrationData.patrol}</p>
              </div>
            </div>
          </div>
        </div>

        {/* PDF and QR Code Section */}
        <div className="bg-white rounded-lg shadow-lg border-r-4 border-blue-600 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            تحميل شهادة التأكيد
          </h2>

          {!pdfGenerated ? (
            <button
              onClick={generatePDF}
              disabled={generating}
              className="w-full bg-gradient-to-l from-blue-600 to-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50 mb-4"
            >
              {generating ? "جاري إنشاء PDF..." : "إنشاء ملف PDF"}
            </button>
          ) : (
            <div className="space-y-6">
              {/* PDF Preview Link */}
              <div className="text-center">
                <a
                  href={pdfUrl}
                  download={`SHM_Account_${memberId}.pdf`}
                  className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  📥 تحميل ملف PDF
                </a>
              </div>

              {/* QR Code */}
              <div className="bg-gray-50 rounded-lg p-6 flex flex-col items-center">
                <p className="text-gray-600 mb-4 text-center">
                  امسح رمز الاستجابة السريعة بهاتفك الذكي للوصول إلى البيانات
                </p>
                {qrCode ? (
                  <img
                    src={qrCode}
                    alt="QR Code for PDF"
                    className="w-48 h-48 border-4 border-gray-300 rounded-lg"
                  />
                ) : (
                  <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">جاري إنشاء رمز الاستجابة...</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/login")}
            className="flex-1 bg-gradient-to-l from-red-600 to-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transition-shadow"
          >
            تسجيل الدخول
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex-1 bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-400 transition-colors"
          >
            الرئيسية
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-l from-red-600 to-purple-600 text-white px-4 py-6 mt-12">
        <div className="max-w-4xl mx-auto text-center text-sm">
          <p>© 2026 الكشافة الحسنية صفي - جميع الحقوق محفوظة</p>
        </div>
      </footer>
    </div>
  );
}

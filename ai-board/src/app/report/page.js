'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Calendar, Trash2, ArrowRight, Zap, CheckCircle2, Download, Mail, Send } from 'lucide-react';
// import { jsPDF } from 'jspdf';
// import html2canvas from 'html2canvas';

/**
 * AI Board - Module C: Final Conclusion Report
 * Archive for approved business plans.
 */

export default function ReportPage() {
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);

    useEffect(() => {
        const saved = localStorage.getItem('saved_reports');
        if (saved) {
            setReports(JSON.parse(saved).reverse()); // Newest first
        }
    }, []);

    const handleDelete = (id, e) => {
        e.stopPropagation();
        if (confirm("정말 이 리포트를 삭제하시겠습니까?")) {
            const newReports = reports.filter(r => r.id !== id);
            setReports(newReports);
            localStorage.setItem('saved_reports', JSON.stringify(newReports));
            if (selectedReport?.id === id) setSelectedReport(null);
        }
    };

    // --- Export Functions ---
    // --- Export Functions ---
    const handleDownloadPDF = () => {
        // Use native browser print which produces better PDFs (text searchable, high quality)
        // and avoids HTML5 canvas "tainted" or "color profile" errors with modern CSS.
        window.print();
    };

    const handleSendEmail = async (targetEmail = "") => {
        if (!selectedReport) return;

        // 1. Copy full content to clipboard first (to bypass URL limits)
        try {
            await navigator.clipboard.writeText(selectedReport.content);
            alert("리포트 전체 내용이 클립보드에 복사되었습니다.\n메일이 열리면 본문에 붙여넣기(Ctrl+V) 해주세요.");
        } catch (err) {
            console.error('Clipboard failed', err);
        }

        // 2. Open mail client with minimal body
        const subject = `[AI Board Report] ${selectedReport.title}`;
        const body = `
[AI Board 최종 리포트]
제목: ${selectedReport.title}
날짜: ${selectedReport.date}

(방금 복사된 리포트 내용을 여기에 붙여넣으세요)
`;

        const mailtoUrl = `mailto:${targetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        // Use window.location.href for maximum compatibility
        window.location.href = mailtoUrl;
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">

            {/* Sidebar List */}
            <div className="w-96 bg-white border-r border-slate-200 flex flex-col z-20 shrink-0 no-print">
                <div className="p-6 border-b border-slate-100">
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 mb-4 font-bold text-xs">
                        <ArrowLeft size={14} /> 메인으로
                    </Link>
                    <h1 className="text-xl font-extrabold text-green-700 flex items-center gap-2">
                        <Zap size={24} />
                        최종 리포트
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">Approved Business Plan Archive</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {reports.length === 0 ? (
                        <div className="text-center text-slate-400 py-10">
                            <FileText size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="text-sm">저장된 리포트가 없습니다.</p>
                            <p className="text-xs mt-2">Module A에서 담당자 승인을 받으면<br />이곳에 저장됩니다.</p>
                        </div>
                    ) : (
                        reports.map(report => (
                            <div
                                key={report.id}
                                onClick={() => setSelectedReport(report)}
                                className={`group relative p-5 rounded-2xl border transition-all cursor-pointer ${selectedReport?.id === report.id ? 'bg-green-50 border-green-200 shadow-md ring-1 ring-green-200' : 'bg-white border-slate-100 hover:border-green-200 hover:shadow-sm'}`}
                            >
                                <h3 className={`font-bold text-sm mb-2 line-clamp-2 ${selectedReport?.id === report.id ? 'text-green-800' : 'text-slate-700'}`}>
                                    {report.title}
                                </h3>
                                <div className="flex items-center justify-between text-xs text-slate-400">
                                    <span className="flex items-center gap-1"><Calendar size={12} /> {report.date}</span>
                                </div>

                                <button
                                    onClick={(e) => handleDelete(report.id, e)}
                                    className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Content (Preview) */}
            <div className="flex-1 bg-slate-100 p-8 overflow-hidden flex flex-col">
                {selectedReport ? (
                    <div className="flex-1 bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4">
                        <div className="p-6 border-b border-slate-100 bg-green-50/30 flex justify-between items-center no-print">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
                                        <CheckCircle2 size={12} /> Final Approved
                                    </div>
                                    <span className="text-xs text-slate-400">{selectedReport.date}</span>
                                </div>
                                <h2 className="text-xl font-bold text-slate-800">{selectedReport.title}</h2>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleSendEmail('yk40100@naver.com')}
                                    className="px-3 py-2 bg-white border border-green-200 text-green-700 hover:bg-green-50 rounded-lg text-xs font-bold flex items-center gap-1"
                                    title="담당자에게 전송"
                                >
                                    <Send size={14} /> 담당자 전송
                                </button>
                                <button
                                    onClick={() => handleSendEmail()}
                                    className="px-3 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-bold flex items-center gap-1"
                                >
                                    <Mail size={14} /> 메일 보내기
                                </button>
                                <button
                                    onClick={handleDownloadPDF}
                                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-md"
                                >
                                    <Download size={14} /> PDF 저장
                                </button>
                            </div>
                        </div>
                        <div id="report-content" className="flex-1 overflow-y-auto p-10 prose prose-slate max-w-none bg-white print-content">
                            <div className="whitespace-pre-wrap font-serif text-slate-700 leading-relaxed">
                                {selectedReport.content}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <Zap size={64} className="opacity-10 mb-6" />
                        <p className="text-lg font-medium">리포트를 선택하여 상세 내용을 확인하세요.</p>
                    </div>
                )}
            </div>

        </div>
    );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, FileText, ArrowRight, Zap, Users } from 'lucide-react';

import InteractiveRobot from '../components/InteractiveRobot';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">

      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-6 px-8 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="text-orange-600" size={28} />
          <h1 className="text-sm md:text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
            아이파크몰 총무팀 아이디어 검토
          </h1>
        </div>
        <div className="text-sm text-slate-500 font-medium">
          Powered by Claude 4.5 Sonnet
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">

        {/* 3D Robot Mascot */}
        <div className="mb-10 w-32 md:w-48 hover:scale-110 transition-transform duration-500 flex justify-center items-center">
          <InteractiveRobot />
        </div>

        <div className="max-w-6xl w-full grid md:grid-cols-3 gap-8 relative z-10">

          {/* Module A: Plan */}
          <Link href="/plan" className="group relative bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-indigo-200 hover:shadow-indigo-500/15 transition-all duration-300 transform hover:-translate-y-2">
            <div className="absolute top-6 right-6 w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
              <FileText size={24} />
            </div>
            <div className="text-xs font-bold text-indigo-500 mb-2 uppercase tracking-wider">Module A</div>
            <h2 className="text-2xl font-extrabold text-slate-800 mb-4 group-hover:text-indigo-600 transition-colors">
              아이디어 자동화
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-8 h-24">
              각 분야별 아이디어 검토 전문가와 협업하여, 전문적인 기획안을 자동으로 작성하세요. 담당자 승인 프로세스까지 원스톱으로 지원합니다.
            </p>
            <div className="flex items-center gap-2 text-indigo-600 font-bold group-hover:gap-3 transition-all">
              작성 시작하기 <ArrowRight size={20} />
            </div>
          </Link>

          {/* Module B: Persona */}
          <Link href="/persona" className="group relative bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-orange-200 hover:shadow-orange-500/15 transition-all duration-300 transform hover:-translate-y-2">
            <div className="absolute top-6 right-6 w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
              <Users size={24} />
            </div>
            <div className="text-xs font-bold text-orange-500 mb-2 uppercase tracking-wider">Module B</div>
            <h2 className="text-2xl font-extrabold text-slate-800 mb-4 group-hover:text-orange-600 transition-colors">
              AI 리서치
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-8 h-24">
              11명의 전문가 및 다양한 소비자 페르소나와 1:1로 대화하거나, 영상/문서에 대한 다각도의 피드백을 받아보세요.
            </p>
            <div className="flex items-center gap-2 text-orange-600 font-bold group-hover:gap-3 transition-all">
              리서치 입장하기 <ArrowRight size={20} />
            </div>
          </Link>

          {/* Module C: Report */}
          <Link href="/report" className="group relative bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-green-200 hover:shadow-green-500/15 transition-all duration-300 transform hover:-translate-y-2">
            <div className="absolute top-6 right-6 w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
              <Zap size={24} />
            </div>
            <div className="text-xs font-bold text-green-600 mb-2 uppercase tracking-wider">Module C</div>
            <h2 className="text-2xl font-extrabold text-slate-800 mb-4 group-hover:text-green-600 transition-colors">
              최종 결론 보고서
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-8 h-24">
              승인된 아이디어와 리서치 회의록이 저장되는 아카이브입니다. 프로젝트별 히스토리를 관리하고 언제든 열람하세요.
            </p>
            <div className="flex items-center gap-2 text-green-600 font-bold group-hover:gap-3 transition-all">
              리포트 확인하기 <ArrowRight size={20} />
            </div>
          </Link>

        </div>
      </main>

      <footer className="py-8 text-center text-slate-400 text-sm">
        © 2026 AI Board Simulator. All rights reserved.
      </footer>
    </div>
  );
}

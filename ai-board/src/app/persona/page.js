'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Shield, Server, TrendingUp, Zap, Coffee, Armchair, Send, Settings, CheckCircle2, XCircle, Lock, FileText, Sparkles, Handshake, Briefcase, Gamepad2, Palette, Wallet, Baby, Newspaper, Heart, Plus, Pencil, Trash2, Download, Paperclip, X, MessageSquare, Users2, Copy } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * AI 이사회 시뮬레이터 (v6.0: Flexible Selection & Full Management)
 */

// --- 0. Icon Map ---
const ICON_MAP = {
    User, Shield, Server, TrendingUp, Zap, Coffee, Armchair, Handshake, Briefcase, Gamepad2, Palette, Wallet, Baby, Newspaper, Heart, Sparkles, Star: Sparkles
};

// --- 1. Initial Agent Definitions (Same as before) ---
const INITIAL_AGENTS = [
    // --- Experts ---
    {
        id: 'legal',
        name: '법률/컴플라이언스',
        role: 'Legal Officer',
        category: 'Expert',
        iconName: 'Shield',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        description: '보수적인 법률 고문. 리스크 제로 목표.',
        systemPrompt: `당신은 20년 경력의 보수적인 법률 고문입니다.`
    },
    {
        id: 'cto',
        name: '기술 아키텍트 (CTO)',
        role: 'Tech Lead',
        category: 'Expert',
        iconName: 'Server',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        description: '실용주의 개발자. 비용과 구현 가능성 중시.',
        systemPrompt: `당신은 실용주의적인 CTO입니다.`
    },
    {
        id: 'cfo',
        name: '재무 전략가 (CFO)',
        role: 'Finance',
        category: 'Expert',
        iconName: 'TrendingUp',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        description: '냉철한 재무 분석가.',
        systemPrompt: `당신은 냉철한 CFO입니다.`
    },
    {
        id: 'co_ceo',
        name: '공동창업자 (Co-CEO)',
        role: 'Vision & Strategy',
        category: 'Expert',
        iconName: 'Handshake',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-200',
        description: '비전 공유 및 멘탈 케어.',
        systemPrompt: `당신은 사용자의 든든한 공동창업자(Co-CEO)입니다.`
    },
    {
        id: 'coo',
        name: '운영/인사 (COO)',
        role: 'Operations & HR',
        category: 'Expert',
        iconName: 'Briefcase',
        color: 'text-slate-600',
        bgColor: 'bg-slate-50',
        borderColor: 'border-slate-200',
        description: '현실적인 살림꾼.',
        systemPrompt: `당신은 꼼꼼한 살림꾼 COO/CHRO입니다.`
    },
    // --- Personas ---
    {
        id: 'genz_m',
        name: 'Z세대 여자',
        role: 'Target User',
        category: 'Persona',
        iconName: 'Gamepad2',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        description: '게임/테크/도파민.',
        systemPrompt: `당신은 게임과 테크에 미쳐있는 20대 초반 Z세대 남성입니다.`
    },
    {
        id: 'genz_f',
        name: 'Z세대 여자',
        role: 'Target User',
        category: 'Persona',
        iconName: 'Palette',
        color: 'text-pink-600',
        bgColor: 'bg-pink-50',
        borderColor: 'border-pink-200',
        description: '트렌드 민감.',
        systemPrompt: `당신은 트렌드와 미학에 민감한 20대 초반 Z세대 여성입니다.`
    },
    {
        id: 'mill_m',
        name: '밀레니얼 남자',
        role: 'Target User',
        category: 'Persona',
        iconName: 'Wallet',
        color: 'text-blue-700',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        description: '효율/가성비 중시.',
        systemPrompt: `당신은 3040 밀레니얼 남성 직장인입니다.`
    },
    {
        id: 'mill_f',
        name: '밀레니얼 여자',
        role: 'Target User',
        category: 'Persona',
        iconName: 'Baby',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        description: '육아/직장 병행.',
        systemPrompt: `당신은 일과 육아를 병행하는 3040 밀레니얼 여성(워킹맘)입니다.`
    },
    {
        id: 'boomer',
        name: '베이비부머',
        role: 'Target User',
        category: 'Persona',
        iconName: 'Newspaper',
        color: 'text-slate-700',
        bgColor: 'bg-slate-100',
        borderColor: 'border-slate-300',
        description: '은퇴/지도자.',
        systemPrompt: `당신은 5060 베이비부머입니다.`
    }
];

// --- 2. Sub-Components ---
const MessageBubble = ({ message, agent }) => {
    const Icon = ICON_MAP[agent.iconName] || User;
    return (
        <div className={`flex gap-3 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${agent.bgColor} ${agent.color} border ${agent.borderColor} shadow-sm`}>
                <Icon size={20} />
            </div>
            <div className="flex flex-col max-w-[85%]">
                <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-bold text-sm text-gray-800">{agent.name}</span>
                    <span className="text-[10px] text-gray-500 font-medium px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200">{agent.role}</span>
                </div>
                <div className={`p-4 rounded-2xl rounded-tl-none bg-white border border-gray-100 shadow-sm text-sm leading-relaxed text-gray-700 whitespace-pre-wrap font-nanum`}>
                    {/* Notion-style simple formatting for bold/headers if needed, or just font application */}
                    {message.split('\n').map((line, i) => {
                        if (line.startsWith('### ')) return <div key={i} className="text-lg font-extrabold text-slate-800 mb-2 mt-4">{line.replace('### ', '')}</div>;
                        if (line.startsWith('**') && line.endsWith('**')) return <div key={i} className="font-bold text-slate-900 my-1">{line.replace(/\*\*/g, '')}</div>;
                        return <div key={i}>{line}</div>;
                    })}
                </div>
            </div>
        </div>
    );
};

const UserBubble = ({ message, files }) => (
    <div className="flex flex-col items-end mb-6 animate-in fade-in slide-in-from-bottom-2">
        <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-sm text-gray-800">나 (CEO)</span>
        </div>
        <div className="bg-indigo-600 text-white p-4 rounded-2xl rounded-tr-none shadow-md max-w-[85%] text-sm whitespace-pre-wrap leading-relaxed">
            {files && files.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {files.map((file, idx) => {
                        if (file.type.startsWith('image/')) {
                            return <img key={idx} src={file.data} alt="attached" className="max-w-full h-auto rounded-lg border-2 border-white/20 max-h-60 object-contain" />;
                        } else {
                            return (
                                <div key={idx} className="bg-white/20 p-3 rounded-lg flex items-center gap-2 text-xs">
                                    <FileText size={16} />
                                    <span className="truncate max-w-[150px]">{file.name}</span>
                                </div>
                            )
                        }
                    })}
                </div>
            )}
            {message}
        </div>
    </div>
);

// --- 3. Main Application ---
export default function AI_Board_Simulator() {
    const [messages, setMessages] = useState([{ type: 'system', text: "AI 이사회에 오신 것을 환영합니다." }]);
    const [agents, setAgents] = useState(INITIAL_AGENTS);
    const [inputText, setInputText] = useState("");
    const [selectedAgentIds, setSelectedAgentIds] = useState(INITIAL_AGENTS.map(a => a.id));
    const [isProcessing, setIsProcessing] = useState(false);
    const [apiKey, setApiKey] = useState(''); // Key removed for security
    const [pendingContext, setPendingContext] = useState(null); // Loaded Plan Content

    // UI State
    const [showSettings, setShowSettings] = useState(false);
    const [showAgentModal, setShowAgentModal] = useState(false);
    const [editingAgent, setEditingAgent] = useState(null);
    const [soloAgent, setSoloAgent] = useState(null);
    const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null);
    const chatContainerRef = useRef(null);

    // Init Logic
    useEffect(() => {
        const savedAgents = localStorage.getItem('ai_board_agents');
        if (savedAgents) setAgents(JSON.parse(savedAgents));
        const savedKey = localStorage.getItem('claude_api_key');
        if (savedKey) setApiKey(savedKey);

        const loadedContext = localStorage.getItem('pending_research_context');
        if (loadedContext) {
            const parsed = JSON.parse(loadedContext);
            setPendingContext(parsed);
            setMessages(prev => [
                ...prev,
                { type: 'system', text: `[아이디어 자동화]에서 전달된 기획안이 로드되었습니다. ("${parsed.title}")` },
                { type: 'agent', agent: { name: 'System', role: 'Guide', iconName: 'Sparkles', bgColor: 'bg-indigo-50', color: 'text-indigo-600', borderColor: 'border-indigo-100' }, text: `전달받은 기획안을 바탕으로 리서치를 시작합니다.\n\n[기획안 요약]\n${parsed.content.substring(0, 200)}...` }
            ]);

            // Auto-trigger Co-CEO to start the discussion to avoid "stuck" feeling
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    type: 'agent',
                    agent: INITIAL_AGENTS.find(a => a.id === 'co_ceo'),
                    text: `반갑습니다! 전달해주신 [${parsed.title}] 기획안, 흥미롭게 잘 봤습니다. \n\n이 아이템의 시장 검증을 위해 어떤 부분을 중점적으로 체크해볼까요? (예: 타겟 유저 반응, 경쟁사 리스크, 수익성 등)`
                }]);
            }, 1000);

            localStorage.removeItem('pending_research_context'); // Clear after loading
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('ai_board_agents', JSON.stringify(agents));
    }, [agents]);

    useEffect(() => {
        if (chatContainerRef.current) chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }, [messages, isProcessing]);

    const saveApiKey = (key) => {
        setApiKey(key);
        localStorage.setItem('claude_api_key', key);
        setShowSettings(false);
        alert("저장되었습니다.");
    };

    // --- Selection Logic ---
    const toggleAgent = (id) => {
        if (soloAgent) return; // In Solo mode, clicking others does nothing (or could exit solo, but explicit exit is safer)

        setSelectedAgentIds(prev => {
            if (prev.includes(id)) {
                // Prevent deselecting correct last one? Optional.
                return prev.filter(aid => aid !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const handleSoloChat = (agentId) => {
        if (soloAgent === agentId) {
            setSoloAgent(null); // Exit Solo
            setSelectedAgentIds(agents.map(a => a.id)); // Restore all by default or keep prev? Restoring all is simpler UX.
        } else {
            setSoloAgent(agentId);
            setSelectedAgentIds([agentId]);
        }
    };

    const selectAll = () => {
        setSoloAgent(null);
        setSelectedAgentIds(agents.map(a => a.id));
    };

    // --- Agent Management Logic ---
    const handleSaveAgent = () => {
        if (!editingAgent.name || !editingAgent.systemPrompt) return alert("이름과 프롬프트는 필수입니다.");

        setAgents(prev => {
            if (editingAgent.id && prev.find(a => a.id === editingAgent.id)) {
                return prev.map(a => a.id === editingAgent.id ? editingAgent : a);
            } else {
                return [...prev, { ...editingAgent, id: Date.now().toString(), bgColor: 'bg-slate-50', color: 'text-slate-800', borderColor: 'border-slate-200', iconName: 'User' }];
            }
        });
        setShowAgentModal(false);
    };

    const handleDeleteAgent = () => {
        if (!confirm("삭제하시겠습니까?")) return;
        setAgents(prev => prev.filter(a => a.id !== editingAgent.id));
        setShowAgentModal(false);
    };


    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files);
        Promise.all(selectedFiles.map(file => new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve({ name: file.name, type: file.type, data: reader.result });
            reader.readAsDataURL(file);
        }))).then(newFiles => setFiles(prev => [...prev, ...newFiles]));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const callClaude = async (agent, userMessage, attachedFiles) => {
        try {
            let userContent = [];
            const images = attachedFiles.filter(f => f.type.startsWith('image/'));
            images.forEach(f => userContent.push({ type: "image", source: { type: "base64", media_type: f.type, data: f.data.split(',')[1] } }));

            const others = attachedFiles.filter(f => !f.type.startsWith('image/'));
            let extra = others.length ? `\n[첨부파일: ${others.map(f => f.name).join(', ')}]` : "";

            let promptText = `[System] ${agent.systemPrompt}`;
            if (pendingContext) {
                promptText += `\n\n[Context: Approved Business Plan]\nTitle: ${pendingContext.title}\nContent:\n${pendingContext.content}\n----------------`;
            }
            promptText += `\n\n[User] "${userMessage}"${extra}`;

            userContent.push({ type: "text", text: promptText });

            const res = await fetch('/api/claude', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey, system: agent.systemPrompt, messages: [{ role: 'user', content: userContent }], model: 'claude-sonnet-4-20250514' })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error.message);
            return data.content[0].text;
        } catch (e) { return `[Error] ${e.message}`; }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!inputText.trim() && files.length === 0) || isProcessing) return;
        if (!apiKey) return setShowSettings(true);

        const curText = inputText;
        const curFiles = [...files];
        setInputText("");
        setFiles([]);
        setIsProcessing(true);
        setMessages(prev => [...prev, { type: 'user', text: curText, files: curFiles }]);

        const activeAgents = agents.filter(a => selectedAgentIds.includes(a.id));
        for (const agent of activeAgents) {
            if (!soloAgent) await new Promise(r => setTimeout(r, 600));
            const reply = await callClaude(agent, curText, curFiles);
            setMessages(prev => [...prev, { type: 'agent', agent, text: reply }]);
        }
        setIsProcessing(false);
    };

    // ... Output logic (Notion) ...
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    // --- Final Report Logic ---
    const handleGenerateFinalReport = async () => {
        if (!confirm("현재까지의 리서치 내용과 기획안을 종합하여 최종 리포트를 생성하시겠습니까?")) return;
        setIsProcessing(true);

        try {
            const contextPlan = pendingContext ? `[Original Plan]\n${pendingContext.content}` : "No initial plan.";
            const researchLog = messages.map(m => m.type === 'user' ? `User: ${m.text}` : m.type === 'agent' ? `${m.agent.name}: ${m.text}` : '').join('\n');
            const prompt = `
            당신은 최고의 전략 컨설턴트입니다.
            다음 [Original Plan]과 [Research Logs]를 종합 분석하여,
            최종 결론이 포함된 완벽한 결과 보고서를 작성하세요.

            [Original Plan]
            ${contextPlan}

            [Research Logs]
            ${researchLog}

            [Output Format]
            Markdown 형식으로 작성하세요.
            1. Executive Summary (요약)
            2. Revised Business Plan (리서치 반영 수정된 기획안)
            3. Key Research Insights (주요 리서치 인사이트)
            4. Final Conclusion (최종 종합 결론 - GO/NO-GO 및 이유)
            `;

            const res = await fetch('/api/claude', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey, system: "You are a master strategist.", messages: [{ role: 'user', content: prompt }], model: 'claude-sonnet-4-20250514' })
            });

            const data = await res.json();
            let finalContent = data.content[0].text;

            // Append full research logs as requested
            finalContent += `\n\n---\n\n# AI Research Logs\n\n${researchLog}`;

            const report = {
                id: Date.now(),
                title: pendingContext ? `[Final] ${pendingContext.title}` : `[Final] Research Report ${new Date().toLocaleDateString()}`,
                date: new Date().toLocaleString(),
                content: finalContent,
                summary: "Research Integrated Final Report"
            };

            const savedReports = JSON.parse(localStorage.getItem('saved_reports') || '[]');
            localStorage.setItem('saved_reports', JSON.stringify([...savedReports, report]));

            alert("최종 리포트가 생성되었습니다. Module C로 이동합니다.");
            window.location.href = '/report';

        } catch (e) {
            alert("Error: " + e.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const exportToNotion = () => {
        let text = messages.map(m => m.type === 'user' ? `[CEO] ${m.text}` : m.type === 'system' ? `[System] ${m.text}` : `[${m.agent.name}] ${m.text}`).join('\n\n');
        navigator.clipboard.writeText(text).then(() => alert("복사됨"));
    };

    return (
        <div className="flex bg-slate-50 font-sans text-slate-900 overflow-hidden md:h-screen h-[111dvh] md:scale-100 scale-90 origin-top">
            {/* Sidebar (Desktop) - Add no-print */}
            <div className="w-80 bg-white border-r border-slate-200 flex flex-col z-20 shrink-0 hidden md:flex no-print">
                <div className="p-6 border-b border-slate-100 flex flex-col gap-4">
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold text-xs"><ArrowLeft size={14} /> 메인으로</Link>
                    <div className="flex justify-between items-center">
                        <h1 className="text-xl font-extrabold text-orange-600 flex items-center gap-2"><Sparkles size={24} /> AI Board</h1>
                        <button onClick={selectAll} className="text-xs bg-slate-100 px-2 py-1 rounded hover:bg-slate-200 font-bold flex items-center gap-1" title="전체 선택"><Users2 size={12} /> 전체</button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {['Expert', 'Persona'].map(cat => (
                        <div key={cat}>
                            <div className="flex items-center justify-between mb-3 px-1">
                                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{cat} Group</h2>
                                <button onClick={() => { setEditingAgent({ category: cat, name: '', role: '', systemPrompt: '' }); setShowAgentModal(true); }}><Plus size={14} className="text-slate-300 hover:text-slate-600" /></button>
                            </div>
                            <div className="space-y-2">
                                {agents.filter(a => a.category === cat).map(agent => {
                                    const Icon = ICON_MAP[agent.iconName] || User;
                                    const isSelected = selectedAgentIds.includes(agent.id);
                                    const isSolo = soloAgent === agent.id;
                                    return (
                                        <div key={agent.id} className={`relative flex items-center p-2 rounded-xl border transition-all ${isSolo ? 'bg-orange-100 ring-2 ring-orange-500' : isSelected ? 'bg-orange-50 border-orange-200' : 'bg-white opacity-60'}`}>
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${agent.bgColor} ${agent.color}`}><Icon size={16} /></div>
                                            <div className="flex-1 cursor-pointer" onClick={() => toggleAgent(agent.id)}>
                                                <div className="text-sm font-bold text-slate-700">{agent.name}</div>
                                                <div className="text-[10px] text-slate-500 truncate w-24">{agent.role}</div>
                                            </div>
                                            <button onClick={() => setEditingAgent({ ...agent })} className="p-1.5 text-slate-300 hover:text-indigo-500"><Pencil size={12} /></button>
                                            <button onClick={() => handleSoloChat(agent.id)} className={`p-1.5 rounded-full ${isSolo ? 'bg-white text-orange-600' : 'text-slate-300 hover:text-orange-600'}`}><MessageSquare size={12} fill={isSolo ? "currentColor" : "none"} /></button>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile Sidebar Overlay - Add no-print */}
            {showMobileMenu && (
                <div className="fixed inset-0 z-50 flex no-print">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setShowMobileMenu(false)}></div>
                    <div className="relative w-80 bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-left duration-300">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="font-bold text-lg">참여자 목록</h2>
                            <button onClick={() => setShowMobileMenu(false)}><X size={24} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {/* Copy of Desktop Sidebar Content */}
                            <div className="flex justify-between items-center mb-4">
                                <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold text-xs"><ArrowLeft size={14} /> 메인으로</Link>
                                <button onClick={selectAll} className="text-xs bg-slate-100 px-2 py-1 rounded hover:bg-slate-200 font-bold flex items-center gap-1"><Users2 size={12} /> 전체 선택</button>
                            </div>
                            {['Expert', 'Persona'].map(cat => (
                                <div key={cat}>
                                    <div className="flex items-center justify-between mb-3 px-1">
                                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{cat} Group</h2>
                                        {/* Mobile Add button */}
                                        <button onClick={() => { setEditingAgent({ category: cat, name: '', role: '', systemPrompt: '' }); setShowAgentModal(true); setShowMobileMenu(false); }}><Plus size={14} className="text-slate-300 hover:text-slate-600" /></button>
                                    </div>
                                    <div className="space-y-2">
                                        {agents.filter(a => a.category === cat).map(agent => {
                                            const Icon = ICON_MAP[agent.iconName] || User;
                                            const isSelected = selectedAgentIds.includes(agent.id);
                                            const isSolo = soloAgent === agent.id;
                                            return (
                                                <div key={agent.id} className={`relative flex items-center p-2 rounded-xl border transition-all ${isSolo ? 'bg-orange-100 ring-2 ring-orange-500' : isSelected ? 'bg-orange-50 border-orange-200' : 'bg-white opacity-60'}`}>
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${agent.bgColor} ${agent.color}`}><Icon size={16} /></div>
                                                    <div className="flex-1 cursor-pointer" onClick={() => toggleAgent(agent.id)}>
                                                        <div className="text-sm font-bold text-slate-700">{agent.name}</div>
                                                        <div className="text-[10px] text-slate-500 truncate w-24">{agent.role}</div>
                                                    </div>
                                                    <button onClick={() => setEditingAgent({ ...agent })} className="p-1.5 text-slate-300 hover:text-indigo-500"><Pencil size={12} /></button>
                                                    <button onClick={() => handleSoloChat(agent.id)} className={`p-1.5 rounded-full ${isSolo ? 'bg-white text-orange-600' : 'text-slate-300 hover:text-orange-600'}`}><MessageSquare size={12} fill={isSolo ? "currentColor" : "none"} /></button>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Chat */}
            <div className="flex-1 flex flex-col h-full bg-slate-100 relative">
                <div className="min-h-[3.5rem] h-auto py-2 bg-white border-b border-slate-200 flex flex-nowrap gap-2 items-center justify-between px-2 md:px-6 shadow-sm z-10 no-print">
                    <div className="font-bold text-slate-700 flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                        {/* Mobile Menu Button */}
                        <button onClick={() => setShowMobileMenu(true)} className="md:hidden flex-none mr-1 p-2 bg-slate-100 rounded-lg text-slate-600">
                            <Users2 size={20} />
                        </button>
                        {soloAgent ? <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-lg text-xs truncate">1:1 {agents.find(a => a.id === soloAgent)?.name}</span> : <span className="truncate">전체 이사회</span>}
                    </div>
                    <div className="flex gap-1.5 md:gap-2 flex-none">
                        <button onClick={() => window.print()} className="bg-slate-100 text-slate-600 px-2.5 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1">
                            <Download size={16} /> <span className="hidden md:inline">PDF</span>
                        </button>
                        {pendingContext && (
                            <button onClick={handleGenerateFinalReport} className="bg-green-600 hover:bg-green-700 text-white px-2.5 md:px-4 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 shadow-md animate-pulse ring-2 ring-green-200">
                                <CheckCircle2 size={16} /> <span className="hidden md:inline">승인 및 리포트</span><span className="md:hidden">승인</span>
                            </button>
                        )}
                        <button onClick={exportToNotion} className="bg-slate-100 text-slate-600 px-2.5 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1">
                            <Copy size={16} /> <span className="hidden md:inline">노션 복사</span>
                        </button>
                        <button onClick={() => setShowSettings(true)} className="bg-slate-100 text-slate-600 px-2.5 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1">
                            <Settings size={16} /> <span className="hidden md:inline">설정</span>
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 print-content" ref={chatContainerRef}>
                    {messages.map((m, i) => {
                        if (m.type === 'system') return <div key={i} className="flex justify-center mb-8"><span className="bg-slate-200/80 backdrop-blur-sm text-slate-600 text-xs px-4 py-1.5 rounded-full">{m.text}</span></div>;
                        if (m.type === 'user') return <UserBubble key={i} message={m.text} files={m.files} />;
                        if (m.type === 'agent') return <MessageBubble key={i} message={m.text} agent={m.agent} />;
                        return null;
                    })}
                    {isProcessing && <div className="text-slate-400 text-sm ml-2 animate-pulse">분석 중...</div>}
                </div>

                <div className="p-4 bg-white border-t border-slate-200 z-20 no-print">
                    {files.length > 0 && <div className="flex gap-2 mb-2 p-2 bg-slate-50 rounded-lg overflow-x-auto">{files.map((f, i) => <div key={i} className="text-xs bg-white border px-2 py-1 rounded flex items-center gap-1"><span className="truncate max-w-[100px]">{f.name}</span><button onClick={() => setFiles(files.filter((_, idx) => idx !== i))}><X size={10} /></button></div>)}</div>}
                    <form onSubmit={handleSendMessage} className="flex gap-3">
                        <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileSelect} accept="image/*,.pdf,audio/*,video/*" />
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-4 bg-slate-100 rounded-2xl text-slate-500 hover:bg-slate-200"><Paperclip size={20} /></button>
                        <input className="flex-1 bg-slate-100 rounded-2xl px-6 outline-none focus:bg-white focus:ring-2 focus:ring-orange-200 transition-all" placeholder="메시지를 입력하세요 (이미지/PDF/영상 가능)" value={inputText} onChange={e => setInputText(e.target.value)} />
                        <button type="submit" className="px-8 bg-orange-600 text-white rounded-2xl font-bold hover:bg-orange-700"><Send size={20} /></button>
                    </form>
                </div>
            </div>

            {/* Agent Modal (Full Implementation) */}
            {showAgentModal && editingAgent && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAgentModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="font-bold text-lg mb-4">{editingAgent.id ? '멤버 수정' : '새 멤버 추가'}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">이름</label>
                                <input className="w-full p-2 border rounded-lg text-sm" value={editingAgent.name} onChange={e => setEditingAgent({ ...editingAgent, name: e.target.value })} placeholder="예: 마케팅 구루" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">역할 (Role)</label>
                                <input className="w-full p-2 border rounded-lg text-sm" value={editingAgent.role} onChange={e => setEditingAgent({ ...editingAgent, role: e.target.value })} placeholder="예: Specialist" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">시스템 프롬프트</label>
                                <textarea className="w-full p-2 border rounded-lg text-sm h-32" value={editingAgent.systemPrompt} onChange={e => setEditingAgent({ ...editingAgent, systemPrompt: e.target.value })} placeholder="당신은..." />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-6">
                            {editingAgent.id && <button onClick={handleDeleteAgent} className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-bold"><Trash2 size={18} /></button>}
                            <div className="flex-1"></div>
                            <button onClick={() => setShowAgentModal(false)} className="px-4 py-2 text-slate-500 font-bold">취소</button>
                            <button onClick={handleSaveAgent} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold">저장</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowSettings(false)}>
                    <div className="bg-white p-6 rounded-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <h3 className="font-bold mb-4">API 설정</h3>
                        <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} className="w-full border p-2 rounded mb-4" placeholder="sk-ant-..." />
                        <button onClick={() => saveApiKey(apiKey)} className="w-full bg-orange-600 text-white p-2 rounded font-bold">저장</button>
                    </div>
                </div>
            )}
        </div>
    );
}

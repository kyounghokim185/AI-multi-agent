'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, RotateCw, CheckCircle2, AlertCircle, FileText, User, Search, TrendingUp, DollarSign, PenTool, LayoutTemplate, Loader2, Plus, Pencil, Trash2, Download, Zap, Paperclip, X, Mic, MicOff } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * AI Business Plan Automation (Multi-Agent System) v2.5
 * Features: File Attachments, Team Add/Edit, CEO Workflow
 */

// --- 1. Default Agents ---
const DEFAULT_AGENTS = {
    PM: {
        id: 'PM',
        name: 'PM (기획 총괄)',
        role: 'Project Manager',
        iconName: 'LayoutTemplate',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        desc: 'PSST 목차 수립 및 전체 진행 관리',
        systemPrompt: `당신은 사용자의 아이디어를 바탕으로 'PSST(문제-해결-성장-팀)' 구조에 맞춘 상세 목차를 기획하세요. 첨부된 파일(이미지, 문서 등)이 있다면 해당 내용을 정밀하게 분석하여 기획안에 적극 반영하십시오.`
    },
    Researcher: {
        id: 'Researcher',
        name: 'Researcher (조사)',
        role: 'Market Researcher',
        iconName: 'Search',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        desc: '시장 규모 및 경쟁사 분석',
        systemPrompt: `당신은 데이터 기반의 시장 분석가입니다. 주어진 아이템의 TAM/SAM/SOM 시장 규모를 추정하고, 주요 경쟁사를 찾아 그들의 약점을 분석하세요. 첨부된 자료가 있다면 그 안의 데이터를 추출하여 분석의 근거로 삼으세요.`
    },
    Strategist: {
        id: 'Strategist',
        name: 'Strategist (전략)',
        role: 'Business Strategist',
        iconName: 'TrendingUp',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        desc: 'BM 수립 및 차별화 전략',
        systemPrompt: `당신은 노련한 비즈니스 전략가입니다. 리서치 결과를 바탕으로 구체적인 비즈니스 모델(BM)과 수익 구조, 그리고 경쟁사 대비 확실한 차별화 포인트(Unique Value Proposition)를 작성하세요. 첨부 파일에 시각 자료나 도표가 있다면 이를 전략 수립에 활용하세요.`
    },
    CFO: {
        id: 'CFO',
        name: 'CFO (재무)',
        role: 'Financial Officer',
        iconName: 'DollarSign',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        desc: '소요 예산 및 매출 추정',
        systemPrompt: `당신은 계획(인건비, 외주용역비 등)을 수립하고, 향후 3년 간의 예상 매출을 Top-down 및 Bottom-up 방식으로 논리적으로 추정하세요.`
    },
    Critic: {
        id: 'Critic',
        name: 'Critic (평가위원)',
        role: 'Gov Funding Judge',
        iconName: 'AlertCircle',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        desc: '가상의 심사위원 (검증)',
        systemPrompt: `당신은 평가 기준(구체성, 실현가능성, 시장성)에 따라 냉정하게 비판하세요. 점수(100점 만점)와 구체적인 보완 사항을 지적하세요. 80점 미만이면 반려(Reject)하십시오.`
    },
    Writer: {
        id: 'Writer',
        name: 'Writer (작성자)',
        role: 'Technical Writer',
        iconName: 'PenTool',
        color: 'text-slate-600',
        bgColor: 'bg-slate-50',
        desc: '최종 문서화 및 편집',
        systemPrompt: `당신은 전문 테크니컬 라이터입니다. 최종 합의된 내용을 바탕으로 마크다운 형식으로 출력하세요.`
    }
};

const ICON_MAP = {
    LayoutTemplate, Search, TrendingUp, DollarSign, AlertCircle, PenTool, User, Zap
};

// --- 2. Main Module ---

export default function BusinessPlanPage() {
    // Config State
    const [agents, setAgents] = useState(DEFAULT_AGENTS);
    const [idea, setIdea] = useState('');
    const [teamInfo, setTeamInfo] = useState('');
    const [isListening, setIsListening] = useState(false); // Voice Input State
    const [apiKey, setApiKey] = useState(''); // Key removed for security, uses env var on server if empty
    const [files, setFiles] = useState([]); // Array of {name, type, data}

    // Execution State
    const [isRunning, setIsRunning] = useState(false);
    const [stage, setStage] = useState('Input'); // Input, PM, Research, Strategy, CFO, Review, Writing, CEO_Review, Done
    const [activeAgent, setActiveAgent] = useState(null);
    const [logs, setLogs] = useState([]);
    const [draft, setDraft] = useState({});
    const [finalDoc, setFinalDoc] = useState('');
    const [criticScore, setCriticScore] = useState(0);
    const [loopCount, setLoopCount] = useState(0);

    // Agent Management State
    const [showAgentModal, setShowAgentModal] = useState(false);
    const [editingAgentId, setEditingAgentId] = useState(null);
    const [tempAgent, setTempAgent] = useState(null);

    // CEO Review State
    const [ceoFeedback, setCeoFeedback] = useState('');

    const logsEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // Auto-scroll logs
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    // Load API Key
    useEffect(() => {
        const savedKey = localStorage.getItem('claude_api_key');
        if (savedKey) setApiKey(savedKey);
    }, []);

    // Helper function to call Claude
    const callAgent = async (agentName, context, task) => {
        const agent = agents[agentName];
        if (!agent) return `[Error] Agent ${agentName} not found`;

        try {
            let userContent = [];
            const currentFiles = context.files || [];

            // 1. Add Text
            let promptText = `[Context]\n${JSON.stringify({ ...context, files: undefined })}\n\n[Task]\n${task}`;

            // 2. Add Images if any
            const images = currentFiles.filter(f => f.type.startsWith('image/'));
            images.forEach(file => {
                const base64 = file.data.split(',')[1];
                userContent.push({ type: "image", source: { type: "base64", media_type: file.type, data: base64 } });
            });

            // 3. Add other file metadata to text
            const others = currentFiles.filter(f => !f.type.startsWith('image/'));
            if (others.length > 0) {
                promptText += `\n[Attached Files Metadata: ${others.map(f => f.name).join(', ')}]`;
            }

            userContent.push({ type: "text", text: promptText });

            const response = await fetch('/api/claude', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    apiKey: apiKey,
                    system: agent.systemPrompt,
                    messages: [
                        { role: 'user', content: userContent }
                    ],
                    model: 'claude-sonnet-4-20250514'
                })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error.message);
            return data.content[0].text;
        } catch (e) {
            console.error(e);
            return `[Error] ${agentName} failed: ${e.message}`;
        }
    };

    // --- Core Workflow Logic ---
    const startSimulation = async () => {
        if (!idea.trim()) return alert("사업 아이디어를 입력해주세요.");
        // if (!apiKey) return alert("Claude API Key가 필요합니다."); // Uses server-side key if missing

        setIsRunning(true);
        setLogs([]);
        setDraft({});
        setLoopCount(0);

        const contextBase = { idea, teamInfo, files };

        // 1. PM
        setStage('PM');
        setActiveAgent('PM');
        addLog('System', '시뮬레이션을 시작합니다. PM이 기획을 시작합니다.');
        const pmOutput = await callAgent('PM', contextBase, "사용자의 아이디어(및 첨부파일)와 팀 정보를 바탕으로 PSST 목차를 수립하고, 각 파트별 핵심 전략을 요약하세요.");
        addLog('PM', pmOutput);
        setDraft(prev => ({ ...prev, pm: pmOutput }));

        // 2. Researcher
        setStage('Research');
        setActiveAgent('Researcher');
        const researchOutput = await callAgent('Researcher', { ...contextBase, pm: pmOutput }, "시장 규모, 성장률, 주요 경쟁사 분석을 수행하세요.");
        addLog('Researcher', researchOutput);
        setDraft(prev => ({ ...prev, research: researchOutput }));

        // 3. Strategist
        setStage('Strategy');
        setActiveAgent('Strategist');
        let strategyOutput = await callAgent('Strategist', { ...contextBase, pm: pmOutput, research: researchOutput }, "비즈니스 모델(BM)과 차별화 전략을 수립하세요.");
        addLog('Strategist', strategyOutput);

        // 4. CFO
        setStage('CFO');
        setActiveAgent('CFO');
        const cfoOutput = await callAgent('CFO', { ...contextBase, pm: pmOutput, strategy: strategyOutput }, "예산 계획과 3개년 매출 추정을 작성하세요.");
        addLog('CFO', cfoOutput);

        // Loop Logic
        let currentStrategy = strategyOutput;
        let loop = 0;
        let passed = false;

        // 5. Critic Loop
        setStage('Review');
        setActiveAgent('Critic');
        while (loop < 2 && !passed) {
            const criticOutput = await callAgent('Critic', {
                strategy: currentStrategy,
                cfo: cfoOutput,
                research: researchOutput,
                files: files // Critic needs to see everything
            }, "이 사업계획의 논리와 구체성을 평가하고 100점 만점으로 점수를 매기세요. JSON 형식이 아닌 줄글로 비평하되, 점수는 '점수: 00점' 형식으로 명시하세요.");

            addLog('Critic', criticOutput);
            const scoreMatch = criticOutput.match(/점수:\s*(\d+)점/);
            const score = scoreMatch ? parseInt(scoreMatch[1]) : 70;
            setCriticScore(score);

            if (score >= 80) {
                passed = true;
                addLog('System', `평가 통과! (점수: ${score}점)`);
            } else {
                loop++;
                setLoopCount(loop);
                addLog('System', `점수 미달 (${score}점). 재수정 요청 (시도 ${loop}/2).`);
                setActiveAgent('Strategist');
                currentStrategy = await callAgent('Strategist', { prevStrategy: currentStrategy, feedback: criticOutput }, "심사위원의 비평을 반영하여 전략을 수정하세요.");
                addLog('Strategist', `(수정본) ${currentStrategy}`);
                setActiveAgent('Critic');
            }
        }

        setDraft(prev => ({ ...prev, strategy: currentStrategy, cfo: cfoOutput }));

        // 6. Writer
        generateFinalDoc({ pm: pmOutput, research: researchOutput, strategy: currentStrategy, cfo: cfoOutput, files });
    };

    const generateFinalDoc = async (context, feedback = null) => {
        setStage('Writing');
        setActiveAgent('Writer');

        let taskPrompt = "모든 내용을 종합하여 완벽한 '예비창업패키지 사업계획서' 초안을 마크다운 형식으로 작성하세요.";
        if (feedback) {
            taskPrompt += `\n[CEO 피드백 반영 사항]\n${feedback}\n위 피드백을 반영하여 내용을 수정 보완하세요.`;
        }

        const finalOutput = await callAgent('Writer', context, taskPrompt);
        addLog('Writer', feedback ? "CEO 피드백을 반영하여 수정 완료하였습니다." : "초안 작성이 완료되었습니다.");

        setFinalDoc(finalOutput);
        setStage('CEO_Review');
        setActiveAgent(null);
        setIsRunning(false);
    };

    // --- CEO Approval Logic ---
    const handleCeoApprove = () => {
        // Save the approved plan context to localStorage for Module B
        localStorage.setItem('pending_research_context', JSON.stringify({
            title: idea,
            content: finalDoc,
            date: new Date().toLocaleDateString()
        }));

        alert("아이디어(기획안)가 승인되었습니다. AI 리서치(Module B)로 이동하여 심층 분석을 진행합니다.");
        window.location.href = '/persona';
    };

    const handleCeoReject = async () => {
        if (!ceoFeedback.trim()) return alert("반려 사유(수정 요청 사항)를 입력해주세요.");

        setIsRunning(true);
        addLog('System', `CEO 반려: "${ceoFeedback}" 내용 반영을 위해 Writer에게 재작성을 요청합니다.`);

        await generateFinalDoc(draft, ceoFeedback);
        setCeoFeedback('');
    };


    const addLog = (agent, msg) => {
        setLogs(prev => [...prev, { agent, message: msg }]);
    };

    // --- Agent Management Logic ---
    const handleAddAgent = () => {
        const newId = `Agent_${Date.now()}`;
        setEditingAgentId(newId);
        setTempAgent({
            id: newId,
            name: '새로운 팀원',
            role: 'Specialist',
            iconName: 'User',
            color: 'text-slate-600',
            bgColor: 'bg-slate-50',
            systemPrompt: '당신의 역할을 정의하세요.'
        });
        setShowAgentModal(true);
    };

    const handleEditAgent = (key) => {
        setEditingAgentId(key);
        setTempAgent({ ...agents[key] });
        setShowAgentModal(true);
    };

    const saveAgent = () => {
        setAgents(prev => ({ ...prev, [editingAgentId]: tempAgent }));
        setShowAgentModal(false);
    };

    // --- Export Logic ---
    const exportToNotion = () => {
        navigator.clipboard.writeText(finalDoc).then(() => alert("노션 포맷으로 복사되었습니다."));
    };

    // --- File Logic ---
    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files);
        Promise.all(selectedFiles.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve({
                        name: file.name,
                        type: file.type,
                        data: reader.result
                    });
                };
                reader.readAsDataURL(file);
            });
        })).then(newFiles => {
            setFiles(prev => [...prev, ...newFiles]);
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
    };


    // --- Voice Input Logic ---
    const toggleListening = () => {
        if (isListening) {
            // Stop (handled by one-time event, but we can force stop if needed, mostly auto-stop)
            setIsListening(false);
            return;
        }

        if (!('webkitSpeechRecognition' in window)) {
            alert("이 브라우저는 음성 인식을 지원하지 않습니다. (Chrome 권장)");
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.lang = 'ko-KR';
        recognition.continuous = false; // Stop after one sentence/pause
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setIdea(prev => prev + (prev ? ' ' : '') + transcript);
        };
        recognition.onerror = (event) => {
            console.error(event.error);
            setIsListening(false);
        };

        recognition.start();
    };


    // Render
    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">

            {/* Configure Panel */}
            <div className="w-96 bg-white border-r border-slate-200 flex flex-col z-20 shrink-0 overflow-y-auto no-print">
                {/* Header */}
                <div className="p-6 border-b border-slate-100">
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 mb-4 font-bold text-xs">
                        <ArrowLeft size={14} /> 메인으로
                    </Link>
                    <h1 className="text-xl font-extrabold text-indigo-900 flex items-center gap-2">
                        <FileText size={24} className="text-indigo-600" />
                        아이디어 자동화
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">v2.5: Attachments & Team Add</p>
                </div>

                {/* Input */}
                <div className="p-6 space-y-4 border-b border-slate-100">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 flex justify-between items-center">
                            아이디어
                            <button
                                onClick={toggleListening}
                                className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full transition-all ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                            >
                                {isListening ? <MicOff size={10} /> : <Mic size={10} />}
                                {isListening ? '듣는 중...' : '음성 입력'}
                            </button>
                        </label>
                        <textarea
                            className="w-full p-3 border rounded-xl text-sm h-20 focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="어떤 아이디어를 계획 중이신가요?"
                            value={idea}
                            onChange={e => setIdea(e.target.value)}
                            disabled={isRunning}
                        />
                        {/* File Attachment UI */}
                        <div className="flex flex-wrap gap-2 mb-2">
                            {files.map((f, i) => (
                                <div key={i} className="text-[10px] bg-slate-100 border px-2 py-1 rounded flex items-center gap-1">
                                    <span className="truncate max-w-[80px]">{f.name}</span>
                                    <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))}><X size={10} /></button>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between items-center">
                            <button onClick={() => fileInputRef.current?.click()} className="text-xs font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1">
                                <Paperclip size={12} /> 파일 첨부
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" multiple accept="image/*,.pdf" />
                        </div>
                    </div>

                    <button
                        onClick={startSimulation}
                        disabled={isRunning || !idea.trim()}
                        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 ${isRunning ? 'bg-slate-100 text-slate-400' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                    >
                        {isRunning ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
                        {isRunning ? '팀 협업 진행 중...' : '프로젝트 시작'}
                    </button>
                </div>

                {/* Team Settings */}
                <div className="p-6 bg-slate-50/50 flex-1">
                    <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider flex justify-between items-center">
                        Project Team
                        <button onClick={handleAddAgent} className="p-1 hover:bg-slate-200 rounded-full text-slate-500"><Plus size={14} /></button>
                    </h3>
                    <div className="space-y-3">
                        {Object.keys(agents).map(key => {
                            const agent = agents[key];
                            const Icon = ICON_MAP[agent.iconName || 'User'] || User;
                            const isActive = activeAgent === key;
                            return (
                                <div key={key} className={`group relative flex items-center gap-3 p-3 rounded-xl border bg-white transition-all ${isActive ? 'border-indigo-500 shadow-md ring-1 ring-indigo-500' : 'border-transparent hover:border-indigo-100'}`}>
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${agent.bgColor} ${agent.color}`}>
                                        <Icon size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-slate-800">{agent.name}</div>
                                        <div className="text-[10px] text-slate-500 truncate w-32">{agent.role}</div>
                                    </div>
                                    {isActive && <Loader2 size={14} className="text-indigo-500 animate-spin" />}

                                    <button
                                        onClick={() => handleEditAgent(key)}
                                        className="absolute right-2 p-1.5 text-slate-300 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Pencil size={14} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Main Area Code */}
            <div className="flex-1 flex flex-col bg-slate-100 p-4 md:p-8 overflow-hidden">
                {/* Render Logic depending on Stage */}
                {(stage === 'CEO_Review' || stage === 'Done') ? (
                    <div className="flex-1 bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-500">
                        {/* Header for Review */}
                        <div className={`p-6 border-b border-slate-100 flex justify-between items-center ${stage === 'Done' ? 'bg-green-50' : 'bg-indigo-50/50'}`}>
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    {stage === 'Done' ? <CheckCircle2 className="text-green-600" /> : <User className="text-indigo-600" />}
                                    {stage === 'Done' ? '승인 완료된 아이디어' : 'CEO 최종 검토'}
                                </h2>
                                <p className="text-sm text-slate-500">
                                    {stage === 'Done' ? '리서치 단계로 이동 준비 완료.' : '내용을 확인하고 승인하거나 수정 요청을 하세요.'}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => window.print()} className="px-4 py-2 bg-white border hover:bg-slate-50 text-slate-600 rounded-lg text-sm font-bold flex items-center gap-2">
                                    <Download size={16} /> PDF
                                </button>
                                {stage === 'CEO_Review' && (
                                    <>
                                        <button onClick={exportToNotion} className="px-4 py-2 bg-white border hover:bg-slate-50 text-slate-600 rounded-lg text-sm font-bold">노션 복사</button>
                                        <button onClick={handleCeoApprove} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-md">승인 및 리서치 이동</button>
                                    </>
                                )}
                                {stage === 'Done' && (
                                    <button
                                        onClick={() => {
                                            localStorage.setItem('pending_review_plan', finalDoc);
                                            window.location.href = '/persona';
                                        }}
                                        className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-bold shadow-md flex items-center gap-2"
                                    >
                                        <User size={16} /> 이사회로 이동
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Document Preview */}
                        <div className="flex-1 overflow-y-auto p-8 prose prose-slate max-w-none bg-white print-content">
                            <div className="whitespace-pre-wrap font-serif text-slate-700 leading-relaxed">{finalDoc}</div>
                        </div>

                        {/* Reject / Modify Input (Only in Review) */}
                        {stage === 'CEO_Review' && (
                            <div className="p-4 bg-slate-50 border-t border-slate-200">
                                <div className="flex gap-2">
                                    <input
                                        className="flex-1 p-3 border rounded-xl text-sm focus:ring-2 focus:ring-red-200 outline-none"
                                        placeholder="반려 사유나 수정 요청사항을 입력하세요 (예: 재무 계획이 너무 보수적이야. 매출을 2배로 늘려줘)."
                                        value={ceoFeedback}
                                        onChange={e => setCeoFeedback(e.target.value)}
                                    />
                                    <button
                                        onClick={handleCeoReject}
                                        className="px-6 py-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-bold text-sm transition-colors"
                                    >
                                        수정 요청
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    // Live Log View (during simulation)
                    <div className="flex-1 bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <span className="font-bold text-slate-600 flex items-center gap-2">
                                <RotateCw size={16} className={isRunning ? "animate-spin" : ""} />
                                실시간 회의 로그
                            </span>
                            {criticScore > 0 && (
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${criticScore >= 80 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    평가 점수: {criticScore}점
                                </span>
                            )}
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
                            {logs.map((log, idx) => {
                                const isSystem = log.agent === 'System';
                                const agent = agents[log.agent] || { name: 'System', color: 'text-slate-500', bgColor: 'bg-slate-100' };
                                const Icon = ICON_MAP[agent.iconName || 'User'] || User;
                                return (
                                    <div key={idx} className={`flex gap-4 ${isSystem ? 'justify-center my-4' : ''}`}>
                                        {!isSystem && (
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${agent.bgColor} ${agent.color} mt-1`}>
                                                <Icon size={18} />
                                            </div>
                                        )}
                                        <div className={`${isSystem ? 'bg-slate-100 text-slate-500 text-xs px-4 py-2 rounded-full' : 'flex-1'}`}>
                                            {!isSystem && <div className="text-xs font-bold text-slate-400 mb-1">{agent.name}</div>}
                                            <div className={`${isSystem ? '' : 'p-4 bg-white border border-slate-100 rounded-2xl rounded-tl-none shadow-sm text-sm text-slate-700 whitespace-pre-wrap'}`}>
                                                {log.message}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={logsEndRef} />
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Agent Modal */}
            {showAgentModal && tempAgent && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAgentModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="font-bold text-lg mb-4">{tempAgent.id} 설정 변경</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">이름 (Role)</label>
                                <input
                                    className="w-full p-2 border rounded-lg text-sm"
                                    value={tempAgent.name}
                                    onChange={e => setTempAgent({ ...tempAgent, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">시스템 프롬프트 (성향/역량)</label>
                                <textarea
                                    className="w-full p-2 border rounded-lg text-sm h-32"
                                    value={tempAgent.systemPrompt}
                                    onChange={e => setTempAgent({ ...tempAgent, systemPrompt: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-6 justify-end">
                            <button onClick={() => setShowAgentModal(false)} className="px-4 py-2 text-slate-500 font-bold">취소</button>
                            <button onClick={saveAgent} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold">저장</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function InteractiveRobot() {
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const [eyePos, setEyePos] = useState({ x: 0, y: 0 });
    const [headGlow, setHeadGlow] = useState('rgba(139, 92, 246, 0.5)');

    const containerRef = useRef(null);

    useEffect(() => {
        const handleMove = (x, y) => {
            // 3D Rotation
            setRotation({
                x: -y * 20,
                y: x * 30
            });

            // Eye movement
            setEyePos({
                x: x * 8,
                y: y * 5
            });

            // Dynamic Head Glow (Purple intensity)
            const intensity = 0.4 + Math.abs(x) * 0.4; // 0.4 to 0.8
            setHeadGlow(`rgba(147, 51, 234, ${intensity})`);
        };

        const onMouseMove = (e) => {
            const { innerWidth, innerHeight } = window;
            const x = (e.clientX - innerWidth / 2) / (innerWidth / 2);
            const y = (e.clientY - innerHeight / 2) / (innerHeight / 2);
            handleMove(x, y);
        };

        const onTouchMove = (e) => {
            const { innerWidth, innerHeight } = window;
            const touch = e.touches[0];
            const x = (touch.clientX - innerWidth / 2) / (innerWidth / 2);
            const y = (touch.clientY - innerHeight / 2) / (innerHeight / 2);
            handleMove(x, y);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('touchmove', onTouchMove);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('touchmove', onTouchMove);
        };
    }, []);

    return (
        <div
            className="relative w-80 h-80 flex items-center justify-center pointer-events-none"
            style={{ perspective: '800px' }}
            ref={containerRef}
        >
            {/* Container Group */}
            <div
                className="relative w-40 h-64 transition-transform duration-100 ease-out preserve-3d"
                style={{
                    transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                    transformStyle: 'preserve-3d'
                }}
            >
                {/* ---- 1. BASE (Cube) ---- */}
                <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-32"
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* Front Face */}
                    <div className="absolute inset-0 bg-slate-200 border border-purple-300"
                        style={{ transform: 'translateZ(64px)', background: 'linear-gradient(135deg, #e9d5ff 0%, #cbd5e1 100%)', boxShadow: 'inset 0 0 20px rgba(255,255,255,0.5)' }} />
                    {/* Back Face */}
                    <div className="absolute inset-0 bg-slate-300" style={{ transform: 'rotateY(180deg) translateZ(64px)' }} />
                    {/* Right Face */}
                    <div className="absolute inset-0 bg-slate-300" style={{ transform: 'rotateY(90deg) translateZ(64px)', width: '128px', background: 'linear-gradient(to right, #cbd5e1, #94a3b8)' }} />
                    {/* Left Face */}
                    <div className="absolute inset-0 bg-slate-300" style={{ transform: 'rotateY(-90deg) translateZ(64px)', width: '128px', background: 'linear-gradient(to left, #cbd5e1, #94a3b8)' }} />
                    {/* Top Face */}
                    <div className="absolute inset-0 bg-purple-200" style={{ transform: 'rotateX(90deg) translateZ(64px)', height: '128px', background: 'radial-gradient(circle, #e9d5ff 0%, #94a3b8 100%)' }} />

                    {/* Reflection Highlight on Top */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[60px] w-32 h-32 bg-white/40 blur-xl rounded-full" style={{ transform: 'rotateX(90deg)' }} />
                </div>


                {/* ---- 2. BODY (Connector) ---- */}
                <div
                    className="absolute bottom-32 left-1/2 -translate-x-1/2 w-12 h-16 bg-gradient-to-b from-slate-300 to-slate-500 rounded-full"
                    style={{
                        transform: 'translateZ(0px)',
                        background: 'conic-gradient(from 180deg at 50% 50%, #e2e8f0 0deg, #94a3b8 180deg, #e2e8f0 360deg)',
                        boxShadow: 'inset -2px 0 5px rgba(0,0,0,0.1)'
                    }}
                />

                {/* ---- 3. HEAD (Rounded Cube) ---- */}
                <div
                    className="absolute bottom-44 left-1/2 -translate-x-1/2 w-48 h-32"
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* Glow Bloom Behind Head */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-48 blur-2xl transition-colors duration-200"
                        style={{ backgroundColor: headGlow, transform: 'translateZ(-50px)' }} />

                    {/* Front Face (Screen) */}
                    <div className="absolute inset-0 rounded-3xl border-4 border-slate-300 flex items-center justify-center overflow-hidden"
                        style={{
                            transform: 'translateZ(30px)',
                            background: 'radial-gradient(circle at 50% 0%, #4c1d95 0%, #2e1065 50%, #020617 100%)',
                            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8), 0 0 10px rgba(168,85,247,0.3)'
                        }}
                    >
                        {/* Eyes */}
                        <div className="flex gap-8">
                            <div className="w-8 h-8 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)]" style={{ transform: `translate(${eyePos.x}px, ${eyePos.y}px)` }} />
                            <div className="w-8 h-8 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)]" style={{ transform: `translate(${eyePos.x}px, ${eyePos.y}px)` }} />
                        </div>

                        {/* Gloss Reflection (Screen) */}
                        <div className="absolute top-2 right-4 w-32 h-16 bg-white/5 rounded-full blur-md rotate-12" />
                    </div>

                    {/* Back Face */}
                    <div className="absolute inset-0 bg-purple-100 rounded-3xl" style={{ transform: 'rotateY(180deg) translateZ(30px)', background: 'linear-gradient(to bottom, #f3e8ff, #d8b4fe)' }} />
                    {/* Sides logic simplified for CSS 3D illusion */}
                    <div className="absolute inset-y-0 right-0 w-16 bg-purple-200 origin-right rounded-r-xl" style={{ transform: 'rotateY(90deg) translateZ(0px) translateX(28px)', background: 'linear-gradient(to left, #e9d5ff, #c084fc)' }} />
                    <div className="absolute inset-y-0 left-0 w-16 bg-purple-200 origin-left rounded-l-xl" style={{ transform: 'rotateY(-90deg) translateZ(0px) translateX(-28px)', background: 'linear-gradient(to right, #e9d5ff, #c084fc)' }} />
                    <div className="absolute inset-x-0 top-0 h-16 bg-purple-100 origin-top rounded-t-xl" style={{ transform: 'rotateX(90deg) translateZ(0px) translateY(-28px)', background: 'linear-gradient(to bottom, #f3e8ff, #e9d5ff)' }} />
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-purple-300 origin-bottom rounded-b-xl" style={{ transform: 'rotateX(-90deg) translateZ(0px) translateY(28px)', background: 'linear-gradient(to top, #d8b4fe, #a855f7)' }} />

                </div>

            </div>

            {/* Floating Call to Action */}


        </div>
    );
}

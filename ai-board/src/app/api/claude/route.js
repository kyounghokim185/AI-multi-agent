import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        let { apiKey, messages, system, model = "claude-sonnet-4-20250514" } = await req.json();

        // Use Server-side environment variable if client didn't provide one
        if (!apiKey || apiKey.trim() === '') {
            apiKey = process.env.ANTHROPIC_API_KEY;
        }

        if (!apiKey) {
            return NextResponse.json({ error: { message: "API Key is missing (Check .env.local or Settings)" } }, { status: 400 });
        }

        const cleanKey = apiKey.trim();

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': cleanKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: model,
                max_tokens: 1024,
                system: system,
                messages: messages
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Anthropic API Raw Error:", errorText);
            try {
                const errorJson = JSON.parse(errorText);
                return NextResponse.json(errorJson, { status: response.status });
            } catch (e) {
                return NextResponse.json({ error: { message: `Anthropic Error (${response.status}): ${errorText}` } }, { status: response.status });
            }
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("API Proxy Internal Error:", error);
        return NextResponse.json({ error: { message: "Internal Server Error", details: error.message } }, { status: 500 });
    }
}

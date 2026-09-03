import { NextResponse } from "next/server";

const LOCAL_API_URL = "https://server.tail8a9f83.ts.net/api/history";

export async function GET() {
    try {
        const response = await fetch(LOCAL_API_URL, {cache: "no-store"});

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Unable to fecth History' },
                { status: response.status }
            );
        }
        
        const history = await response.json();

        return NextResponse.json(history);
    } catch (error) {
        return NextResponse.json(
            { error: "History API unavailable" },
            { status: 502 }
        );
    }
    

}

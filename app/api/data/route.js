import { NextResponse } from "next/server";

const LOCAL_API_URL = "https://server.tail8a9f83.ts.net/api/data";

export async function GET() {
    const res =await fetch(LOCAL_API_URL, {cache: "no-store"})
    
    const data = await res.json();
    const bms = data?.bms ?? {};

    return NextResponse.json({
        packs: bms.packs ?? [],
        systemSoc: bms.systemSoc ?? null,
        totalRemainingAh: bms.totalRemainingAh ?? null,
        validPackCount: bms.validPackCount ?? null, 
        srne: data?.srne ?? null,
    });
    
}
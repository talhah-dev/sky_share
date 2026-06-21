import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { textTable } from "@/models/schema";
import { gt } from "drizzle-orm";

export async function POST(req: NextRequest) {
    try {
        const { text } = await req.json();

        if (!text || typeof text !== "string") {
            return NextResponse.json({ error: "Text is required" }, { status: 400 });
        }

        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

        const [entry] = await db
            .insert(textTable)
            .values({ text, expiresAt })
            .returning();

        return NextResponse.json(entry, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const text = await db
            .select()
            .from(textTable)
            .where(gt(textTable.expiresAt, new Date()));

        return NextResponse.json(text);
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
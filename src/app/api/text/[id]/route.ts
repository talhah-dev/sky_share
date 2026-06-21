import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { eq } from "drizzle-orm"
import { textTable } from "@/models/schema"

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const [entry] = await db
            .select()
            .from(textTable)
            .where(eq(textTable.id, Number(id)))

        if (!entry) {
            return NextResponse.json({ error: "Not found" }, { status: 404 })
        }

        if (entry.expiresAt < new Date()) {
            return NextResponse.json({ error: "This text has expired" }, { status: 410 })
        }

        return NextResponse.json(entry)
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const [deleted] = await db
            .delete(textTable)
            .where(eq(textTable.id, Number(id)))
            .returning()

        if (!deleted) {
            return NextResponse.json({ error: "Not found" }, { status: 404 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

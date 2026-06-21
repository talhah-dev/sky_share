import { randomUUID } from "crypto"
import { del, put } from "@vercel/blob"
import { NextRequest, NextResponse } from "next/server"
import { gt, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { fileTable } from "@/models/schema"

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const uploadedFile = formData.get("file")

        if (!(uploadedFile instanceof File)) {
            return NextResponse.json({ error: "File is required" }, { status: 400 })
        }

        if (uploadedFile.size > 100 * 1024 * 1024) {
            return NextResponse.json({ error: "File must be under 100 MB" }, { status: 400 })
        }

        const safeName = uploadedFile.name.replace(/[^a-zA-Z0-9._-]+/g, "-")
        const pathname = `uploads/${randomUUID()}-${safeName}`

        const blob = await put(pathname, uploadedFile, {
            access: "public",
            token: process.env.BLOB_READ_WRITE_TOKEN,
        })

        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

        const [entry] = await db
            .insert(fileTable)
            .values({
                name: uploadedFile.name,
                url: blob.url,
                size: uploadedFile.size,
                type: uploadedFile.type || "application/octet-stream",
                expiresAt,
            })
            .returning()

        return NextResponse.json(entry, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function GET() {
    try {
        const files = await db
            .select()
            .from(fileTable)
            .where(gt(fileTable.expiresAt, new Date()))

        return NextResponse.json(files)
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { id, url } = await req.json()

        if (!id || !url) {
            return NextResponse.json({ error: "id and url are required" }, { status: 400 })
        }

        await del(url, {
            token: process.env.BLOB_READ_WRITE_TOKEN,
        })

        const [deleted] = await db
            .delete(fileTable)
            .where(eq(fileTable.id, Number(id)))
            .returning()

        if (!deleted) {
            return NextResponse.json({ error: "Not found" }, { status: 404 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

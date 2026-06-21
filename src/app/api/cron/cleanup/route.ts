import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { lt } from "drizzle-orm";
import { fileTable, textTable } from "@/models/schema";

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get("authorization");

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    const deletedTexts = await db
        .delete(textTable)
        .where(lt(textTable.expiresAt, now))
        .returning();

    const deletedFiles = await db
        .delete(fileTable)
        .where(lt(fileTable.expiresAt, now))
        .returning();

    return NextResponse.json({
        deleted: {
            texts: deletedTexts.length,
            files: deletedFiles.length,
        }
    });
}
"use client"

import { useState } from "react"
import { Plus, FileText, Clock } from "lucide-react"
import TextEditor from "@/components/TextEditor"

interface TextEntry {
    id: string
    title: string
    content: string
    createdAt: string
}

const MOCK_TEXTS: TextEntry[] = [
    {
        id: "1",
        title: "Project notes",
        content:
            "Finalize the API endpoints for the file upload flow. Make sure to handle multipart form data and return a signed URL from Vercel Blob.",
        createdAt: "2 hours ago",
    },
    {
        id: "2",
        title: "Meeting summary",
        content:
            "Discussed the new sharing feature. Users should be able to share text snippets with a generated link. Link expires after 24 hours by default.",
        createdAt: "Yesterday",
    },
    {
        id: "3",
        title: "Quick snippet",
        content: "npm install drizzle-orm drizzle-kit @neondatabase/serverless",
        createdAt: "3 days ago",
    },
]

type View = "list" | "editor"

export default function TextShare() {
    const [texts] = useState<TextEntry[]>(MOCK_TEXTS)
    const [view, setView] = useState<View>("list")
    const [selected, setSelected] = useState<TextEntry | null>(null)

    const openNew = () => {
        setSelected(null)
        setView("editor")
    }

    const openEntry = (entry: TextEntry) => {
        setSelected(entry)
        setView("editor")
    }

    const goBack = () => {
        setSelected(null)
        setView("list")
    }

    const preview = (content: string) =>
        content.length > 72 ? content.slice(0, 72).trimEnd() + "…" : content

    if (view === "editor") {
        return (
            <TextEditor
                initialContent={selected?.content ?? ""}
                mode={selected ? "view" : "create"}
                onBack={goBack}
            />
        )
    }

    return (
        <div className="mt-2 space-y-5">
            {/* Plus / New button */}
            <button
                onClick={openNew}
                className="w-full group flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-8 transition-colors hover:border-foreground/30 hover:bg-muted/40"
            >
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background transition-colors group-hover:bg-muted">
                    <Plus className="h-5 w-5 text-muted-foreground" />
                </span>
                <span className="text-xs text-muted-foreground">New text</span>
            </button>

            {/* Saved list */}
            {texts.length > 0 && (
                <div className="space-y-2">
                    <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground px-0.5">
                        Saved
                    </p>
                    <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
                        {texts.map((entry) => (
                            <button
                                key={entry.id}
                                onClick={() => openEntry(entry)}
                                className="w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/40"
                            >
                                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                <div className="min-w-0 flex-1 space-y-0.5">
                                    <p className="text-sm font-medium leading-none truncate">{entry.title}</p>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {preview(entry.content)}
                                    </p>
                                </div>
                                <span className="flex items-center gap-1 shrink-0 text-[11px] text-muted-foreground/60 mt-0.5">
                                    <Clock className="h-3 w-3" />
                                    {entry.createdAt}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
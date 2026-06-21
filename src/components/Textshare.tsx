"use client"

import { useEffect, useState } from "react"
import { Plus, FileText, Clock } from "lucide-react"
import TextEditor from "@/components/TextEditor"
import { toast } from "sonner"
import { timeAgo } from "@/lib/timeAgo"
import TextListSkeleton from "./skeleton/TextListSkeleton"

interface TextEntry {
    id: string
    text: string
    createdAt: string
}

type View = "list" | "editor"

export default function TextShare() {
    const [texts, setTexts] = useState<TextEntry[]>([])
    const [view, setView] = useState<View>("list")
    const [selected, setSelected] = useState<TextEntry | null>(null)
    const [isLoading, setIsLoading] = useState(true)

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

    // const preview = (content: string) =>
    //     content.length > 72 ? content.slice(0, 72).trimEnd() + "…" : content

    useEffect(() => {
        const getText = async () => {
            try {
                const res = await fetch("/api/text", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                })

                if (!res.ok) {
                    toast.error("Failed to fetch texts")
                    return
                }

                const data = await res.json()
                setTexts(data)
                console.log(data)
            } finally {
                setIsLoading(false)
            }
        }

        void getText()
    }, [])

    if (view === "editor") {
        return (
            <TextEditor
                initialContent={selected?.text ?? ""}
                mode={selected ? "view" : "create"}
                textId={selected?.id}
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
            {isLoading ? (
                <div className="space-y-2">
                    <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground px-0.5">
                        Saved
                    </p>
                    <TextListSkeleton />
                </div>
            ) : texts.length > 0 ? (
                <div className="space-y-2">
                    <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground px-0.5">
                        Saved
                    </p>
                    <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
                        {texts.map((entry) => (
                            <button
                                key={entry.id}
                                onClick={() => openEntry(entry)}
                                className="w-full cursor-pointer flex items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/40"
                            >
                                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                <div className="w-full pt-0.5">
                                    <p className="text-sm font-medium leading-none">{entry.text.slice(0, 20)}</p>
                                </div>
                                <span className="flex items-center gap-1 shrink-0 text-[11px] text-muted-foreground/60 mt-0.5">
                                    <Clock className="h-3 w-3" />
                                    {timeAgo(entry.createdAt)}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    )
}

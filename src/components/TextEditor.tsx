"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Copy, Check, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface TextEditorProps {
    initialContent?: string
    mode?: "create" | "view"
    textId?: string
    onBack: () => void
}

export default function TextEditor({
    initialContent = "",
    mode = "create",
    textId,
    onBack,
}: TextEditorProps) {
    const [content, setContent] = useState(initialContent)
    const [copied, setCopied] = useState(false)
    const [isLoading, setIsLoading] = useState(mode === "view" && Boolean(textId))
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        if (mode !== "view" || !textId) return

        let ignore = false

        const loadText = async () => {
            setIsLoading(true)

            try {
                const res = await fetch(`/api/text/${textId}`)

                if (!res.ok) {
                    toast.error("Failed to load this text")
                    onBack()
                    return
                }

                const data = await res.json()

                if (!ignore) {
                    setContent(data.text ?? "")
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false)
                }
            }
        }

        void loadText()

        return () => {
            ignore = true
        }
    }, [mode, onBack, textId])

    const handleCopy = () => {
        navigator.clipboard.writeText(content)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleSaveOrUpdate = async () => {
        if (!content.trim()) {
            toast.error("Content is required")
            return
        }

        setIsSaving(true)

        try {
            const res =
                mode === "view" && textId
                    ? await fetch(`/api/text/${textId}`, {
                          method: "PATCH",
                          headers: {
                              "Content-Type": "application/json",
                          },
                          body: JSON.stringify({ text: content }),
                      })
                    : await fetch("/api/text", {
                          method: "POST",
                          headers: {
                              "Content-Type": "application/json",
                          },
                          body: JSON.stringify({ text: content }),
                      })

            if (!res.ok) {
                toast.error(mode === "view" ? "Failed to update text" : "Failed to save text")
                return
            }

            const data = await res.json()
            if (mode === "view") {
                setContent(data.text ?? content)
            }

            toast.success(mode === "view" ? "Text updated successfully" : "Text saved successfully")
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!textId) return

        setIsDeleting(true)

        try {
            const res = await fetch(`/api/text/${textId}`, {
                method: "DELETE",
            })

            if (!res.ok) {
                toast.error("Failed to delete text")
                return
            }

            toast.success("Text deleted successfully")
            onBack()
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="flex flex-col h-full min-h-[420px]">
            <div className="flex items-center gap-3 mb-4 mt-2">
                <button
                    onClick={onBack}
                    className="flex items-center justify-center h-8 w-8 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                </button>
                <span className="font-medium text-muted-foreground">Back</span>
            </div>

            <div className="flex flex-col gap-4">
                {isLoading ? (
                    <div className="flex min-h-80 items-center justify-center rounded-lg border border-border bg-muted/20 text-sm text-muted-foreground">
                        Loading text...
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col gap-1.5 flex-1">
                            <Textarea
                                placeholder="Paste or type your text here..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="resize-none text-sm font-mono leading-relaxed min-h-80"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2">
                            {mode === "view" && textId ? (
                                <Button
                                    size="lg"
                                    variant="outline"
                                    onClick={handleDelete}
                                    disabled={isSaving || isDeleting}
                                    className="gap-2 text-destructive hover:text-destructive"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    {isDeleting ? "Deleting..." : "Delete"}
                                </Button>
                            ) : null}

                            <Button size="lg" variant="outline" onClick={handleCopy} className="gap-2">
                                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                {copied ? "Copied" : "Copy"}
                            </Button>

                            <Button size="lg" className="w-24" onClick={handleSaveOrUpdate} disabled={isSaving}>
                                {isSaving ? "Saving..." : mode === "view" ? "Update" : "Save"}
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

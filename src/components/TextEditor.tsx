"use client"

import { useState } from "react"
import { ArrowLeft, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface TextEditorProps {
    initialContent?: string
    mode?: "create" | "view"
    onBack: () => void
}

export default function TextEditor({
    initialContent = "",
    mode = "create",
    onBack,
}: TextEditorProps) {
    const [content, setContent] = useState(initialContent)
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(content)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="flex flex-col h-full min-h-[420px]">
            {/* Top bar */}
            <div className="flex items-center gap-3 mb-4 mt-2">
                <button
                    onClick={onBack}
                    className="flex items-center justify-center h-8 w-8 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                </button>
                <span className=" font-medium text-muted-foreground">
                    {mode === "view" ? "View text" : "Back"}
                </span>
            </div>

            {/* Fields */}
            <div className="flex flex-col gap-4 ">
                <div className="flex flex-col gap-1.5 flex-1">
                    <Textarea
                        placeholder="Paste or type your text here…"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="resize-none text-sm font-mono leading-relaxed min-h-80"
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end  gap-2 pt-1">
                    <Button size={"lg"} variant="outline" onClick={handleCopy} className="gap-2">
                        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? "Copied" : "Copy"}
                    </Button>
                    <Button size={"lg"} className="w-20" onClick={onBack}>
                        {mode === "view" ? "Done" : "Save"}
                    </Button>
                </div>
            </div>
        </div>
    )
}
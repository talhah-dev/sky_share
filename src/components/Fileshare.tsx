"use client"

import { useState, useRef } from "react"
import {
    Plus,
    FileText,
    FileImage,
    FileCode,
    File,
    Clock,
    ArrowLeft,
    Download,
    Trash2,
    Upload,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface FileEntry {
    id: string
    name: string
    size: string
    type: string
    uploadedAt: string
}

const MOCK_FILES: FileEntry[] = [
    {
        id: "1",
        name: "project-brief.pdf",
        size: "2.4 MB",
        type: "pdf",
        uploadedAt: "1 hour ago",
    },
    {
        id: "2",
        name: "screenshot-ui.png",
        size: "840 KB",
        type: "image",
        uploadedAt: "Yesterday",
    },
    {
        id: "3",
        name: "schema.ts",
        size: "12 KB",
        type: "code",
        uploadedAt: "3 days ago",
    },
]

function getFileIcon(type: string) {
    switch (type) {
        case "pdf":
            return <FileText className="h-5 w-5" />
        case "image":
            return <FileImage className="h-5 w-5" />
        case "code":
            return <FileCode className="h-5 w-5" />
        default:
            return <File className="h-5 w-5" />
    }
}

function getFileBadgeLabel(type: string) {
    switch (type) {
        case "pdf":
            return "PDF"
        case "image":
            return "Image"
        case "code":
            return "Code"
        default:
            return "File"
    }
}

type View = "list" | "detail"

export default function FileShare() {
    const [files] = useState<FileEntry[]>(MOCK_FILES)
    const [view, setView] = useState<View>("list")
    const [selected, setSelected] = useState<FileEntry | null>(null)
    const [dragging, setDragging] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const openDetail = (file: FileEntry) => {
        setSelected(file)
        setView("detail")
    }

    const goBack = () => {
        setSelected(null)
        setView("list")
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setDragging(true)
    }

    const handleDragLeave = () => setDragging(false)

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragging(false)
    }

    if (view === "detail" && selected) {
        return (
            <div className="flex flex-col gap-5 mt-2">
                {/* Back bar */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={goBack}
                        className="flex items-center justify-center h-8 w-8 rounded-lg border border-border hover:bg-muted transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <span className="text-sm font-medium text-muted-foreground">Back</span>
                </div>

                {/* File card */}
                <div className="rounded-xl border border-border p-5 flex flex-col gap-5">
                    {/* Icon + name */}
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground">
                            {getFileIcon(selected.type)}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{selected.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{selected.size}</p>
                        </div>
                    </div>

                    {/* Meta */}
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: "Type", value: getFileBadgeLabel(selected.type) },
                            { label: "Size", value: selected.size },
                            { label: "Uploaded", value: selected.uploadedAt },
                            { label: "Status", value: "Ready to share" },
                        ].map(({ label, value }) => (
                            <div key={label} className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-1">
                                    {label}
                                </p>
                                <p className="text-sm font-medium">{value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <Button size="lg" className="flex-1 gap-2">
                            <Download className="h-3.5 w-3.5" />
                            Download
                        </Button>
                        <Button size="lg" variant="outline" className="gap-2 text-destructive hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="mt-2 space-y-5">
            {/* Drop zone / upload area */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`w-full group flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-8 cursor-pointer transition-colors ${dragging
                        ? "border-foreground/40 bg-muted/60"
                        : "border-border hover:border-foreground/30 hover:bg-muted/40"
                    }`}
            >
                <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background transition-colors ${dragging ? "bg-muted" : "group-hover:bg-muted"
                        }`}
                >
                    {dragging ? (
                        <Upload className="h-5 w-5 text-muted-foreground" />
                    ) : (
                        <Plus className="h-5 w-5 text-muted-foreground" />
                    )}
                </span>
                <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                        {dragging ? "Drop to upload" : "Upload a file"}
                    </p>
                    <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                        or drag and drop anywhere
                    </p>
                </div>
                <input ref={inputRef} type="file" className="hidden" />
            </div>

            {/* Files list */}
            {files.length > 0 && (
                <div className="space-y-2">
                    <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground px-0.5">
                        Uploaded
                    </p>
                    <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
                        {files.map((file) => (
                            <button
                                key={file.id}
                                onClick={() => openDetail(file)}
                                className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/40"
                            >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
                                    {getFileIcon(file.type)}
                                </div>
                                <div className="min-w-0 flex-1 space-y-0.5">
                                    <p className="text-sm font-medium truncate leading-none">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">{file.size}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1 shrink-0">
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                        {getFileBadgeLabel(file.type)}
                                    </Badge>
                                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
                                        <Clock className="h-3 w-3" />
                                        {file.uploadedAt}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
"use client"

import { useEffect, useRef, useState } from "react"
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
import { toast } from "sonner"
import { timeAgo } from "@/lib/timeAgo"
import FileListSkeleton from "./skeleton/FileListSkeleton"

interface FileEntry {
    id: number
    name: string
    size: number
    type: string
    url: string
    createdAt: string
    expiresAt: string
}

type View = "list" | "detail"
type FileKind = "pdf" | "image" | "code" | "file"

const MAX_FILE_SIZE = 100 * 1024 * 1024

function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

function getFileKind(type: string, name: string): FileKind {
    const lowerName = name.toLowerCase()

    if (type.startsWith("image/")) return "image"
    if (type === "application/pdf" || lowerName.endsWith(".pdf")) return "pdf"
    if (
        type.startsWith("text/") ||
        type.includes("json") ||
        type.includes("javascript") ||
        lowerName.endsWith(".ts") ||
        lowerName.endsWith(".tsx") ||
        lowerName.endsWith(".js") ||
        lowerName.endsWith(".jsx") ||
        lowerName.endsWith(".css") ||
        lowerName.endsWith(".html") ||
        lowerName.endsWith(".md")
    ) {
        return "code"
    }

    return "file"
}

function getFileIcon(kind: FileKind) {
    switch (kind) {
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

function getFileBadgeLabel(kind: FileKind) {
    switch (kind) {
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

export default function FileShare() {
    const [files, setFiles] = useState<FileEntry[]>([])
    const [view, setView] = useState<View>("list")
    const [selected, setSelected] = useState<FileEntry | null>(null)
    const [dragging, setDragging] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isUploading, setIsUploading] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const loadFiles = async () => {
            try {
                const res = await fetch("/api/file")

                if (!res.ok) {
                    toast.error("Failed to fetch files")
                    return
                }

                const data = await res.json()
                setFiles(data)
            } finally {
                setIsLoading(false)
            }
        }

        void loadFiles()
    }, [])

    const openDetail = (file: FileEntry) => {
        setSelected(file)
        setView("detail")
    }

    const goBack = () => {
        setSelected(null)
        setView("list")
    }

    const uploadFile = (file: File) => {
        if (isUploading) return

        if (file.size > MAX_FILE_SIZE) {
            toast.error("File must be under 100 MB")
            return
        }

        setIsUploading(true)
        setUploadProgress(0)

        const formData = new FormData()
        formData.append("file", file)

        const xhr = new XMLHttpRequest()
        xhr.open("POST", "/api/file")

        xhr.upload.onprogress = (event) => {
            if (!event.lengthComputable) return
            setUploadProgress(Math.round((event.loaded / event.total) * 100))
        }

        xhr.onload = () => {
            try {
                const response = JSON.parse(xhr.responseText || "{}")

                if (xhr.status < 200 || xhr.status >= 300) {
                    toast.error(response?.error ?? "Failed to upload file")
                    return
                }

                setFiles((current) => [response, ...current])
                toast.success("File uploaded successfully")
                if (inputRef.current) {
                    inputRef.current.value = ""
                }
            } finally {
                setIsUploading(false)
                setUploadProgress(0)
            }
        }

        xhr.onerror = () => {
            setIsUploading(false)
            setUploadProgress(0)
            toast.error("Failed to upload file")
        }

        xhr.send(formData)
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            uploadFile(file)
        }
        e.target.value = ""
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        if (!isUploading) {
            setDragging(true)
        }
    }

    const handleDragLeave = () => setDragging(false)

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragging(false)

        if (isUploading) return

        const file = e.dataTransfer.files?.[0]
        if (file) {
            uploadFile(file)
        }
    }

    const deleteFile = async () => {
        if (!selected) return

        setIsDeleting(true)

        try {
            const res = await fetch("/api/file", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id: selected.id, url: selected.url }),
            })

            if (!res.ok) {
                toast.error("Failed to delete file")
                return
            }

            setFiles((current) => current.filter((file) => file.id !== selected.id))
            toast.success("File deleted")
            goBack()
        } finally {
            setIsDeleting(false)
        }
    }

    if (view === "detail" && selected) {
        const kind = getFileKind(selected.type, selected.name)

        return (
            <div className="flex flex-col gap-5 mt-2">
                <div className="flex items-center gap-3">
                    <button
                        onClick={goBack}
                        className="flex items-center justify-center h-8 w-8 rounded-lg border border-border hover:bg-muted transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <span className="text-sm font-medium text-muted-foreground">Back</span>
                </div>

                <div className="rounded-xl border border-border p-5 flex flex-col gap-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground">
                            {getFileIcon(kind)}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold">{selected.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{formatFileSize(selected.size)}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: "Type", value: getFileBadgeLabel(kind) },
                            { label: "Size", value: formatFileSize(selected.size) },
                            { label: "Uploaded", value: timeAgo(selected.createdAt) },
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

                    <div className="flex gap-2">
                        <Button size="lg" className="flex-1 gap-2" asChild>
                            <a href={selected.url} target="_blank" rel="noreferrer">
                                <Download className="h-3.5 w-3.5" />
                                Download
                            </a>
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="gap-2 text-destructive hover:text-destructive"
                            onClick={deleteFile}
                            disabled={isDeleting}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            {isDeleting ? "Deleting..." : "Delete"}
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    const uploadLabel = isUploading ? `Uploading ${uploadProgress}%` : dragging ? "Drop to upload" : "Upload a file"
    const uploadSubLabel = isUploading ? "Please wait while your file is uploading" : "Max 100 MB · any file type"

    return (
        <div className="mt-2 space-y-5">
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => {
                    if (!isUploading) {
                        inputRef.current?.click()
                    }
                }}
                className={`w-full group flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-8 transition-colors ${
                    dragging
                        ? "border-foreground/40 bg-muted/60"
                        : "border-border hover:border-foreground/30 hover:bg-muted/40"
                } ${isUploading ? "cursor-wait opacity-90" : "cursor-pointer"}`}
            >
                <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background transition-colors ${
                        dragging ? "bg-muted" : "group-hover:bg-muted"
                    }`}
                >
                    {isUploading ? (
                        <Upload className="h-5 w-5 text-muted-foreground" />
                    ) : dragging ? (
                        <Upload className="h-5 w-5 text-muted-foreground" />
                    ) : (
                        <Plus className="h-5 w-5 text-muted-foreground" />
                    )}
                </span>
                <div className="text-center">
                    <p className="text-xs text-muted-foreground">{uploadLabel}</p>
                    <p className="text-[11px] text-muted-foreground/50 mt-0.5">{uploadSubLabel}</p>
                </div>
                <input ref={inputRef} type="file" className="hidden" onChange={handleFileSelect} />
            </div>

            <div className="space-y-2">
                <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground px-0.5">
                    Uploaded
                </p>
                {isLoading ? (
                    <FileListSkeleton />
                ) : files.length > 0 ? (
                    <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
                        {files.map((file) => {
                            const kind = getFileKind(file.type, file.name)

                            return (
                                <button
                                    key={file.id}
                                    onClick={() => openDetail(file)}
                                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/40"
                                >
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
                                        {getFileIcon(kind)}
                                    </div>
                                    <div className="min-w-0 flex-1 space-y-0.5">
                                        <p className="text-sm font-medium leading-none truncate">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                            {getFileBadgeLabel(kind)}
                                        </Badge>
                                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
                                            <Clock className="h-3 w-3" />
                                            {timeAgo(file.createdAt)}
                                        </span>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                ) : (
                    <p className="px-0.5 text-sm text-muted-foreground">No files uploaded yet.</p>
                )}
            </div>
        </div>
    )
}

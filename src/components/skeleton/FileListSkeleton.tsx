import { Skeleton } from "@/components/ui/skeleton"

export default function FileListSkeleton() {
    return (
        <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
            {[...Array(3)].map((_, index) => (
                <div key={index} className="flex items-center gap-3 px-4 py-3.5">
                    <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
                    <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton className="h-3.5 w-32 rounded" />
                        <Skeleton className="h-3 w-20 rounded" />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <Skeleton className="h-4 w-10 rounded" />
                        <Skeleton className="h-3 w-14 rounded" />
                    </div>
                </div>
            ))}
        </div>
    )
}

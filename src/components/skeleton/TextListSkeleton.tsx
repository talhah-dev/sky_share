import { Skeleton } from "@/components/ui/skeleton"

export default function TextListSkeleton() {
    return (
        <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="w-full flex items-start gap-3 px-4 py-3.5">
                    <Skeleton className="mt-0.5 h-4 w-4 shrink-0 rounded" />
                    <div className="min-w-0 flex-1 pt-0.5">
                        <Skeleton className="h-3.5 w-24 rounded" />
                    </div>
                    <Skeleton className="h-3 w-16 rounded mt-0.5" />
                </div>
            ))}
        </div>
    )
}
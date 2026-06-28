"use client"

import {
    Pagination, PaginationContent, PaginationItem,
    PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis,
} from "@/components/ui/pagination"

// Build the list of page tokens to render: actual page numbers plus
// "ellipsis" markers when there are too many pages to show them all.
function pageTokens(current: number, total: number): (number | "ellipsis")[] {
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1)
    }
    const tokens: (number | "ellipsis")[] = [1]
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    if (start > 2) tokens.push("ellipsis")
    for (let p = start; p <= end; p++) tokens.push(p)
    if (end < total - 1) tokens.push("ellipsis")
    tokens.push(total)
    return tokens
}

export function DataPagination({
    page,
    totalPages,
    onPageChange,
}: {
    page: number
    totalPages: number
    onPageChange: (page: number) => void
}) {
    if (totalPages <= 1) return null

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href="#"
                        aria-disabled={page <= 1}
                        className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        onClick={(e) => {
                            e.preventDefault()
                            if (page > 1) onPageChange(page - 1)
                        }}
                    />
                </PaginationItem>
                {pageTokens(page, totalPages).map((token, i) =>
                    token === "ellipsis" ? (
                        <PaginationItem key={`e-${i}`}>
                            <PaginationEllipsis />
                        </PaginationItem>
                    ) : (
                        <PaginationItem key={token}>
                            <PaginationLink
                                href="#"
                                isActive={token === page}
                                className="cursor-pointer"
                                onClick={(e) => {
                                    e.preventDefault()
                                    onPageChange(token)
                                }}
                            >
                                {token}
                            </PaginationLink>
                        </PaginationItem>
                    )
                )}
                <PaginationItem>
                    <PaginationNext
                        href="#"
                        aria-disabled={page >= totalPages}
                        className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        onClick={(e) => {
                            e.preventDefault()
                            if (page < totalPages) onPageChange(page + 1)
                        }}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    )
}

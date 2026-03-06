import { useCallback, useMemo, useRef, useState } from 'react'

import type { TicketCompact } from '@gorgias/helpdesk-types'

export type OnSelectTicketParams = {
    id: number
    selected: boolean
    shiftKey?: boolean
}

export function useTicketSelection(tickets: TicketCompact[]) {
    const [hasSelectedAll, setHasSelectedAll] = useState(false)
    const [selectedTicketIds, setSelectedTicketIds] = useState<Set<number>>(
        new Set(),
    )
    const previousId = useRef<number | null>(null)

    const indexById = useMemo(() => {
        const m = new Map<number, number>()
        tickets.forEach((t, i) => m.set(t.id, i))
        return m
    }, [tickets])

    const onSelect = useCallback(
        ({ id, selected, shiftKey }: OnSelectTicketParams) => {
            setSelectedTicketIds((prev) => {
                if (hasSelectedAll) {
                    setHasSelectedAll(false)
                    return new Set()
                }

                if (!shiftKey || previousId.current == null) {
                    previousId.current = id
                    const next = new Set(prev)
                    if (selected) {
                        next.add(id)
                    } else {
                        next.delete(id)
                    }
                    return next
                }

                const a = indexById.get(previousId.current)
                const b = indexById.get(id)
                previousId.current = id

                if (a == null || b == null) return prev

                const start = Math.min(a, b)
                const end = Math.max(a, b)

                const next = new Set(prev)
                for (let i = start; i <= end; i++) {
                    const rangeId = tickets[i]?.id
                    if (rangeId == null) continue
                    if (selected) {
                        next.add(rangeId)
                    } else {
                        next.delete(rangeId)
                    }
                }
                return next
            })
        },
        [hasSelectedAll, indexById, tickets],
    )

    const onSelectAll = useCallback((selected: boolean) => {
        setHasSelectedAll(selected)
        if (selected) {
            setSelectedTicketIds(new Set())
        }
    }, [])

    const clear = useCallback(() => {
        setHasSelectedAll(false)
        setSelectedTicketIds(new Set())
        previousId.current = null
    }, [])

    return useMemo(
        () => ({
            hasSelectedAll,
            selectedTicketIds,
            selectionCount: selectedTicketIds.size,
            hasAnySelection: hasSelectedAll || selectedTicketIds.size > 0,
            onSelect,
            onSelectAll,
            clear,
        }),
        [hasSelectedAll, selectedTicketIds, onSelect, onSelectAll, clear],
    )
}

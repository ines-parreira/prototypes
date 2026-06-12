import { useMemo } from 'react'
import { TicketPriority } from '@gorgias/helpdesk-queries'
import { capitalize } from '@gorgias/toolkit'

export type PriorityOption = {
    id: TicketPriority
    label: string
}

type UsePriorityOptionsParams = {
    currentPriority?: TicketPriority
}

export function usePriorityOptions({
    currentPriority,
}: UsePriorityOptionsParams) {
    const priorityOptions = useMemo<PriorityOption[]>(() => {
        return Object.values(TicketPriority)
            .map((priority) => ({
                id: priority,
                label: capitalize(priority),
            }))
            .reverse()
    }, [])

    const priorityMap = useMemo(() => {
        return new Map(
            priorityOptions.map((priority) => [priority.id, priority]),
        )
    }, [priorityOptions])

    const selectedOption = useMemo(() => {
        if (!currentPriority) {
            return priorityMap.get(TicketPriority.Normal)
        }
        return priorityMap.get(currentPriority)
    }, [currentPriority, priorityMap])

    return {
        priorityOptions,
        selectedOption,
    }
}

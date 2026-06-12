import { createContext, useContext, useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import { useAgentActivity } from '@gorgias/realtime'
import { debounce, Duration } from '@gorgias/toolkit'

type ViewedTicketsContextValue = {
    viewTickets: (ids: number[]) => void
}

type Props = {
    children?: ReactNode
}

export const TICKETS_VIEWING_DEBOUNCE_TIME = Duration.seconds(1)

const ViewedTicketsContext = createContext<ViewedTicketsContextValue | null>(
    null,
)

export function ViewedTicketsProvider({ children }: Props) {
    const { viewTickets } = useAgentActivity()
    const debouncedViewTickets = useMemo(
        () => debounce(viewTickets, TICKETS_VIEWING_DEBOUNCE_TIME),
        [viewTickets],
    )

    useEffect(() => {
        return () => {
            debouncedViewTickets.cancel()
        }
    }, [debouncedViewTickets])

    const value = useMemo(
        () => ({
            viewTickets: debouncedViewTickets,
        }),
        [debouncedViewTickets],
    )

    return (
        <ViewedTicketsContext.Provider value={value}>
            {children}
        </ViewedTicketsContext.Provider>
    )
}

export function useViewedTickets(): ViewedTicketsContextValue {
    const context = useContext(ViewedTicketsContext)
    const { viewTickets } = useAgentActivity()

    return context ?? { viewTickets }
}

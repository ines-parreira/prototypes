import { create } from 'zustand'

import type { TicketViewNavigationOrdering } from './createTicketViewNavigationData'
import { EMPTY_TICKET_VIEW_NAVIGATION_ORDERING } from './createTicketViewNavigationData'

type TicketViewNavigationOrderingState = {
    optimisticPrivateOrdering: TicketViewNavigationOrdering
    optimisticSharedOrdering: TicketViewNavigationOrdering
    resetOptimisticPrivateOrdering: () => void
    resetOptimisticSharedOrdering: () => void
    resetOptimisticTicketViewNavigationOrdering: () => void
    setOptimisticPrivateOrdering: (
        ordering: TicketViewNavigationOrdering,
    ) => void
    setOptimisticSharedOrdering: (
        ordering: TicketViewNavigationOrdering,
    ) => void
}

export const useTicketViewNavigationOrderingStore =
    create<TicketViewNavigationOrderingState>((set) => ({
        optimisticPrivateOrdering: EMPTY_TICKET_VIEW_NAVIGATION_ORDERING,
        optimisticSharedOrdering: EMPTY_TICKET_VIEW_NAVIGATION_ORDERING,
        resetOptimisticPrivateOrdering: () => {
            set({
                optimisticPrivateOrdering:
                    EMPTY_TICKET_VIEW_NAVIGATION_ORDERING,
            })
        },
        resetOptimisticSharedOrdering: () => {
            set({
                optimisticSharedOrdering: EMPTY_TICKET_VIEW_NAVIGATION_ORDERING,
            })
        },
        resetOptimisticTicketViewNavigationOrdering: () => {
            set({
                optimisticPrivateOrdering:
                    EMPTY_TICKET_VIEW_NAVIGATION_ORDERING,
                optimisticSharedOrdering: EMPTY_TICKET_VIEW_NAVIGATION_ORDERING,
            })
        },
        setOptimisticPrivateOrdering: (optimisticPrivateOrdering) => {
            set({ optimisticPrivateOrdering })
        },
        setOptimisticSharedOrdering: (optimisticSharedOrdering) => {
            set({ optimisticSharedOrdering })
        },
    }))

export const ticketViewNavigationOrderingStore =
    useTicketViewNavigationOrderingStore

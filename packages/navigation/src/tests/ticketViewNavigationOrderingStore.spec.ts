import { describe, expect, it } from 'vitest'

import { ticketViewNavigationOrderingStore } from '../ticketViewNavigationOrderingStore'

describe('ticketViewNavigationOrderingStore', () => {
    it('stores and resets shared and private optimistic ordering', () => {
        ticketViewNavigationOrderingStore
            .getState()
            .resetOptimisticTicketViewNavigationOrdering()

        ticketViewNavigationOrderingStore
            .getState()
            .setOptimisticSharedOrdering({
                view_sections: {},
                views: {
                    1: { display_order: 0 },
                },
            })
        ticketViewNavigationOrderingStore
            .getState()
            .setOptimisticPrivateOrdering({
                view_sections: {
                    2: { display_order: 0 },
                },
                views: {},
            })

        expect(
            ticketViewNavigationOrderingStore.getState()
                .optimisticSharedOrdering,
        ).toEqual({
            view_sections: {},
            views: {
                1: { display_order: 0 },
            },
        })
        expect(
            ticketViewNavigationOrderingStore.getState()
                .optimisticPrivateOrdering,
        ).toEqual({
            view_sections: {
                2: { display_order: 0 },
            },
            views: {},
        })

        ticketViewNavigationOrderingStore
            .getState()
            .resetOptimisticTicketViewNavigationOrdering()

        expect(
            ticketViewNavigationOrderingStore.getState()
                .optimisticSharedOrdering,
        ).toEqual({
            view_sections: {},
            views: {},
        })
        expect(
            ticketViewNavigationOrderingStore.getState()
                .optimisticPrivateOrdering,
        ).toEqual({
            view_sections: {},
            views: {},
        })
    })
})

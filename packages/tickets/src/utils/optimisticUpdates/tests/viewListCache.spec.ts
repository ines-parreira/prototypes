import type { InfiniteData } from '@tanstack/react-query'
import { QueryClient } from '@tanstack/react-query'

import { mockTicket } from '@gorgias/helpdesk-mocks'
import type { Ticket } from '@gorgias/helpdesk-queries'
import { queryKeys } from '@gorgias/helpdesk-queries'

import {
    patchTicketInViewListCache,
    removeTicketFromViewListCache,
} from '../viewListCache'

function makeInfiniteData(pages: Ticket[][]): InfiniteData<{ data: Ticket[] }> {
    return {
        pages: pages.map((data) => ({ data })),
        pageParams: pages.map((_, i) => (i === 0 ? undefined : `cursor-${i}`)),
    }
}

function getViewListCache(
    queryClient: QueryClient,
    key: ReturnType<typeof queryKeys.views.listViewItems>,
) {
    return queryClient.getQueryData<InfiniteData<{ data: Ticket[] }>>(key)
}

let queryClient: QueryClient

beforeEach(() => {
    queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    })
})

afterEach(() => {
    queryClient.clear()
})

describe('patchTicketInViewListCache', () => {
    it('updates a matching ticket across all queries sharing the prefix (no shared object references)', () => {
        const key1 = queryKeys.views.listViewItems(123, undefined)
        const key2 = queryKeys.views.listViewItems(456, {
            order_by: 'updated_datetime:desc' as const,
        })

        const ticketA = mockTicket({ id: 1, subject: 'Original subject' })
        const ticketB = mockTicket({ id: 1, subject: 'Original subject' })

        queryClient.setQueryData(key1, makeInfiniteData([[ticketA]]))
        queryClient.setQueryData(key2, makeInfiniteData([[ticketB]]))

        patchTicketInViewListCache(queryClient, 1, {
            subject: 'Updated subject',
        })

        const cache1 = getViewListCache(queryClient, key1)
        const cache2 = getViewListCache(queryClient, key2)

        expect(cache1?.pages[0].data[0].subject).toBe('Updated subject')
        expect(cache2?.pages[0].data[0].subject).toBe('Updated subject')

        // Ensure infinite structure is preserved.
        expect(cache1?.pageParams).toEqual([undefined])
        expect(cache2?.pageParams).toEqual([undefined])
    })

    it('leaves non-matching tickets unchanged', () => {
        const key = queryKeys.views.listViewItems(123, undefined)

        const ticket1 = mockTicket({ id: 1, subject: 'Ticket 1' })
        const ticket2 = mockTicket({ id: 2, subject: 'Ticket 2' })

        queryClient.setQueryData(key, makeInfiniteData([[ticket1, ticket2]]))

        patchTicketInViewListCache(queryClient, 1, { subject: 'Updated' })

        const cache = getViewListCache(queryClient, key)

        expect(cache?.pages[0].data[0].subject).toBe('Updated')
        expect(cache?.pages[0].data[1].subject).toBe('Ticket 2')
        expect(cache?.pageParams).toEqual([undefined])
    })

    it('updates all occurrences of a ticket id (same page and multiple pages)', () => {
        const key = queryKeys.views.listViewItems(123, undefined)

        const ticket1a = mockTicket({ id: 1, subject: 'Original A' })
        const ticket1b = mockTicket({ id: 1, subject: 'Original B' })
        const other = mockTicket({ id: 2, subject: 'Other' })

        queryClient.setQueryData(
            key,
            makeInfiniteData([
                [ticket1a, other, ticket1b], // two occurrences in the same page
                [mockTicket({ id: 1, subject: 'Original C' })], // another occurrence on a different page
            ]),
        )

        patchTicketInViewListCache(queryClient, 1, { subject: 'Patched' })

        const cache = getViewListCache(queryClient, key)

        expect(cache?.pages).toHaveLength(2)
        expect(cache?.pageParams).toEqual([undefined, 'cursor-1'])

        expect(cache?.pages[0].data.map((t) => t.subject)).toEqual([
            'Patched',
            'Other',
            'Patched',
        ])
        expect(cache?.pages[1].data[0].subject).toBe('Patched')
    })

    it('does not touch queries with a different prefix', () => {
        const viewKey = queryKeys.views.listViewItems(123, undefined)
        const otherKey = ['some', 'other', 'query', 'key'] as const

        queryClient.setQueryData(
            viewKey,
            makeInfiniteData([[mockTicket({ id: 1, subject: 'Original' })]]),
        )
        queryClient.setQueryData(otherKey, { hello: 'world' })

        patchTicketInViewListCache(queryClient, 1, { subject: 'Updated' })

        // view cache updated
        const cache = getViewListCache(queryClient, viewKey)
        expect(cache?.pages[0].data[0].subject).toBe('Updated')

        // unrelated cache untouched
        expect(queryClient.getQueryData(otherKey)).toEqual({ hello: 'world' })
    })

    it('does nothing when no cached data exists', () => {
        expect(() => {
            patchTicketInViewListCache(queryClient, 1, { subject: 'Patched' })
        }).not.toThrow()
    })
})

describe('removeTicketFromViewListCache', () => {
    it('removes a matching ticket from all queries sharing the prefix (no shared object references)', () => {
        const key1 = queryKeys.views.listViewItems(123, undefined)
        const key2 = queryKeys.views.listViewItems(456, {
            order_by: 'updated_datetime:desc' as const,
        })

        const ticketA = mockTicket({ id: 1, subject: 'To remove' })
        const ticketB = mockTicket({ id: 1, subject: 'To remove' })

        queryClient.setQueryData(key1, makeInfiniteData([[ticketA]]))
        queryClient.setQueryData(key2, makeInfiniteData([[ticketB]]))

        removeTicketFromViewListCache(queryClient, 1)

        const cache1 = getViewListCache(queryClient, key1)
        const cache2 = getViewListCache(queryClient, key2)

        expect(cache1?.pages[0].data).toHaveLength(0)
        expect(cache2?.pages[0].data).toHaveLength(0)

        // Ensure infinite structure is preserved.
        expect(cache1?.pageParams).toEqual([undefined])
        expect(cache2?.pageParams).toEqual([undefined])
    })

    it('leaves non-matching tickets unchanged', () => {
        const key = queryKeys.views.listViewItems(123, undefined)

        const ticket1 = mockTicket({ id: 1, subject: 'To remove' })
        const ticket2 = mockTicket({ id: 2, subject: 'To keep' })

        queryClient.setQueryData(key, makeInfiniteData([[ticket1, ticket2]]))

        removeTicketFromViewListCache(queryClient, 1)

        const cache = getViewListCache(queryClient, key)

        expect(cache?.pages[0].data).toHaveLength(1)
        expect(cache?.pages[0].data[0].id).toBe(2)
        expect(cache?.pageParams).toEqual([undefined])
    })

    it('removes all occurrences of a ticket id (same page and multiple pages)', () => {
        const key = queryKeys.views.listViewItems(123, undefined)

        queryClient.setQueryData(
            key,
            makeInfiniteData([
                [
                    mockTicket({ id: 1, subject: 'Page 1 ticket (A)' }),
                    mockTicket({ id: 2, subject: 'Keep' }),
                    mockTicket({ id: 1, subject: 'Page 1 ticket (B)' }),
                ],
                [mockTicket({ id: 1, subject: 'Page 2 ticket' })],
            ]),
        )

        removeTicketFromViewListCache(queryClient, 1)

        const cache = getViewListCache(queryClient, key)

        expect(cache?.pages).toHaveLength(2)
        expect(cache?.pageParams).toEqual([undefined, 'cursor-1'])

        expect(cache?.pages[0].data.map((t) => t.id)).toEqual([2])
        expect(cache?.pages[1].data).toHaveLength(0)
    })

    it('does not touch queries with a different prefix', () => {
        const viewKey = queryKeys.views.listViewItems(123, undefined)
        const otherKey = ['some', 'other', 'query', 'key'] as const

        queryClient.setQueryData(
            viewKey,
            makeInfiniteData([
                [
                    mockTicket({ id: 1, subject: 'To remove' }),
                    mockTicket({ id: 2, subject: 'Keep' }),
                ],
            ]),
        )
        queryClient.setQueryData(otherKey, { hello: 'world' })

        removeTicketFromViewListCache(queryClient, 1)

        const cache = getViewListCache(queryClient, viewKey)
        expect(cache?.pages[0].data.map((t) => t.id)).toEqual([2])

        expect(queryClient.getQueryData(otherKey)).toEqual({ hello: 'world' })
    })

    it('does nothing when no cached data exists', () => {
        expect(() => {
            removeTicketFromViewListCache(queryClient, 1)
        }).not.toThrow()
    })
})

import type { View } from '@gorgias/helpdesk-types'

import { isViewRealtime } from '../isViewRealtime'

function viewWithFilters(filters: string | null): View {
    return { id: 1, filters } as View
}

describe('isViewRealtime', () => {
    it('returns true for eq(ticket.channel, "chat")', () => {
        expect(
            isViewRealtime(viewWithFilters('eq(ticket.channel, "chat")')),
        ).toBe(true)
    })

    it('returns true for single-quoted chat', () => {
        expect(
            isViewRealtime(viewWithFilters("eq(ticket.channel, 'chat')")),
        ).toBe(true)
    })

    it('returns true for containsAny with chat in array', () => {
        expect(
            isViewRealtime(
                viewWithFilters(
                    "containsAny(ticket.channel, ['chat', 'email'])",
                ),
            ),
        ).toBe(true)
    })

    it('returns false for non-chat channels', () => {
        expect(
            isViewRealtime(viewWithFilters('eq(ticket.channel, "email")')),
        ).toBe(false)
    })

    it('returns false for non-channel filters', () => {
        expect(
            isViewRealtime(viewWithFilters('eq(ticket.status, "open")')),
        ).toBe(false)
    })

    it('returns false for null filters', () => {
        expect(isViewRealtime(viewWithFilters(null))).toBe(false)
    })

    it('returns true when chat filter is among multiple filters', () => {
        expect(
            isViewRealtime(
                viewWithFilters(
                    'eq(ticket.status, "open") && eq(ticket.channel, "chat")',
                ),
            ),
        ).toBe(true)
    })
})

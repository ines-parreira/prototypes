import { vi } from 'vitest'

import { useCanEditOrder } from '../useCanEditOrder'

describe('useCanEditOrder', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date('2025-03-01T00:00:00Z'))
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('returns false when order is cancelled', () => {
        expect(
            useCanEditOrder({
                cancelled_at: '2025-02-01T00:00:00Z',
                created_at: '2025-02-28T00:00:00Z',
            }),
        ).toBe(false)
    })

    it('returns false when created_at is missing', () => {
        expect(useCanEditOrder({})).toBe(false)
    })

    it('returns true for a recent order', () => {
        expect(useCanEditOrder({ created_at: '2025-02-20T00:00:00Z' })).toBe(
            true,
        )
    })

    it('returns false for an order exactly 60 days old', () => {
        expect(useCanEditOrder({ created_at: '2024-12-31T00:00:00Z' })).toBe(
            false,
        )
    })

    it('returns true for an order 59 days old', () => {
        expect(useCanEditOrder({ created_at: '2025-01-01T00:00:00Z' })).toBe(
            true,
        )
    })

    it('returns false for an order older than 60 days', () => {
        expect(useCanEditOrder({ created_at: '2024-11-01T00:00:00Z' })).toBe(
            false,
        )
    })
})

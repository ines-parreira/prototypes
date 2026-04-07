import { renderHook } from '@repo/testing/vitest'

import { mockView } from '@gorgias/helpdesk-mocks'

import type { PrivateViewsOrderingData } from '../../types'
import { usePrivateViews } from '../usePrivateViews'

const { mockViews, mockOrdering } = vi.hoisted(() => {
    const mockViews: { current: ReturnType<typeof mockView>[] } = {
        current: [],
    }
    const mockOrdering: { current: PrivateViewsOrderingData } = {
        current: { views: {}, view_sections: {} },
    }
    return { mockViews, mockOrdering }
})

vi.mock('../useAllViews', () => ({
    useAllViews: () => mockViews.current,
}))

vi.mock('../usePrivateViewsOrdering', () => ({
    usePrivateViewsOrdering: () => mockOrdering.current,
}))

describe('usePrivateViews', () => {
    it('filters to only private views', () => {
        mockViews.current = [
            mockView({ id: 1, visibility: 'public' }),
            mockView({ id: 2, visibility: 'private' }),
            mockView({ id: 3, visibility: 'private' }),
        ]

        const { result } = renderHook(() => usePrivateViews())

        expect(result.current.map((v) => v.id)).toEqual([2, 3])
    })

    it('sorts by display_order', () => {
        mockViews.current = [
            mockView({ id: 1, visibility: 'private' }),
            mockView({ id: 2, visibility: 'private' }),
        ]
        mockOrdering.current = {
            views: {
                '1': { display_order: 2 },
                '2': { display_order: 1 },
            },
            view_sections: {},
        }

        const { result } = renderHook(() => usePrivateViews())

        expect(result.current.map((v) => v.id)).toEqual([2, 1])
    })
})

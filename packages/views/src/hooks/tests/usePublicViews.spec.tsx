import { renderHook } from '@repo/testing/vitest'

import { mockView } from '@gorgias/helpdesk-mocks'

import type { PublicViewsOrderingData } from '../../types'
import { usePublicViews } from '../usePublicViews'

const { mockViews, mockOrdering } = vi.hoisted(() => {
    const mockViews: { current: ReturnType<typeof mockView>[] } = {
        current: [],
    }
    const mockOrdering: { current: PublicViewsOrderingData } = {
        current: {
            views: {},
            views_top: {},
            views_bottom: {},
            view_sections: {},
        },
    }
    return { mockViews, mockOrdering }
})

vi.mock('../useAllViews', () => ({
    useAllViews: () => mockViews.current,
}))

vi.mock('../usePublicViewsOrdering', () => ({
    usePublicViewsOrdering: () => mockOrdering.current,
}))

describe('usePublicViews', () => {
    it('filters out private and system views', () => {
        mockViews.current = [
            mockView({ id: 1, visibility: 'public', category: 'user' }),
            mockView({ id: 2, visibility: 'private', category: 'user' }),
            mockView({ id: 3, visibility: 'shared', category: 'user' }),
            mockView({ id: 4, visibility: 'public', category: 'system' }),
        ]

        const { result } = renderHook(() => usePublicViews())

        expect(result.current.map((v) => v.id)).toEqual([1, 3])
    })

    it('sorts by display_order', () => {
        mockViews.current = [
            mockView({ id: 1, visibility: 'public', category: 'user' }),
            mockView({ id: 2, visibility: 'shared', category: 'user' }),
        ]
        mockOrdering.current = {
            views: {
                '1': { display_order: 2 },
                '2': { display_order: 1 },
            },
            views_top: {},
            views_bottom: {},
            view_sections: {},
        }

        const { result } = renderHook(() => usePublicViews())

        expect(result.current.map((v) => v.id)).toEqual([2, 1])
    })
})

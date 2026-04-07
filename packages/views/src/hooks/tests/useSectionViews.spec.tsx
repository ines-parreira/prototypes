import { renderHook } from '@repo/testing/vitest'

import { mockView } from '@gorgias/helpdesk-mocks'

import type {
    PrivateViewsOrderingData,
    PublicViewsOrderingData,
} from '../../types'
import { useSectionViews } from '../useSectionViews'

const { mockViews, mockPublicOrdering, mockPrivateOrdering } = vi.hoisted(
    () => {
        const mockViews: { current: ReturnType<typeof mockView>[] } = {
            current: [],
        }
        const mockPublicOrdering: { current: PublicViewsOrderingData } = {
            current: {
                views: {},
                views_top: {},
                views_bottom: {},
                view_sections: {},
            },
        }
        const mockPrivateOrdering: { current: PrivateViewsOrderingData } = {
            current: { views: {}, view_sections: {} },
        }
        return { mockViews, mockPublicOrdering, mockPrivateOrdering }
    },
)

vi.mock('../useAllViews', () => ({
    useAllViews: () => mockViews.current,
}))

vi.mock('../usePublicViewsOrdering', () => ({
    usePublicViewsOrdering: () => mockPublicOrdering.current,
}))

vi.mock('../usePrivateViewsOrdering', () => ({
    usePrivateViewsOrdering: () => mockPrivateOrdering.current,
}))

describe('useSectionViews', () => {
    it('returns views matching the section id', () => {
        mockViews.current = [
            mockView({ id: 1, section_id: 10 }),
            mockView({ id: 2, section_id: 20 }),
            mockView({ id: 3, section_id: 10 }),
        ]

        const { result } = renderHook(() => useSectionViews(10))

        expect(result.current.map((v) => v.id)).toEqual([1, 3])
    })

    it('sorts public section views by public ordering', () => {
        mockViews.current = [
            mockView({ id: 1, section_id: 10, visibility: 'public' }),
            mockView({ id: 2, section_id: 10, visibility: 'public' }),
        ]
        mockPublicOrdering.current = {
            views: {
                '1': { display_order: 2 },
                '2': { display_order: 1 },
            },
            views_top: {},
            views_bottom: {},
            view_sections: {},
        }

        const { result } = renderHook(() => useSectionViews(10))

        expect(result.current.map((v) => v.id)).toEqual([2, 1])
    })

    it('sorts private section views by private ordering', () => {
        mockViews.current = [
            mockView({ id: 1, section_id: 10, visibility: 'private' }),
            mockView({ id: 2, section_id: 10, visibility: 'private' }),
        ]
        mockPrivateOrdering.current = {
            views: {
                '1': { display_order: 2 },
                '2': { display_order: 1 },
            },
            view_sections: {},
        }

        const { result } = renderHook(() => useSectionViews(10))

        expect(result.current.map((v) => v.id)).toEqual([2, 1])
    })

    it('returns empty array when no views match', () => {
        mockViews.current = [mockView({ section_id: 10 })]

        const { result } = renderHook(() => useSectionViews(99))

        expect(result.current).toEqual([])
    })
})

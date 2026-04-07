import { renderHook } from '@repo/testing/vitest'

import type { PublicViewsOrderingData, ViewSection } from '../../types'
import { usePublicViewSections } from '../usePublicViewSections'

const { mockSections, mockOrdering } = vi.hoisted(() => {
    const mockSections: { current: ViewSection[] } = { current: [] }
    const mockOrdering: { current: PublicViewsOrderingData } = {
        current: {
            views: {},
            views_top: {},
            views_bottom: {},
            view_sections: {},
        },
    }
    return { mockSections, mockOrdering }
})

vi.mock('../useAllViewSections', () => ({
    useAllViewSections: () => mockSections.current,
}))

vi.mock('../usePublicViewsOrdering', () => ({
    usePublicViewsOrdering: () => mockOrdering.current,
}))

describe('usePublicViewSections', () => {
    it('filters to non-private sections', () => {
        mockSections.current = [
            { id: 1, name: 'Public Section', private: false },
            { id: 2, name: 'Private Section', private: true },
        ]

        const { result } = renderHook(() => usePublicViewSections())

        expect(result.current).toEqual([
            expect.objectContaining({ id: 1, name: 'Public Section' }),
        ])
    })

    it('sorts by display_order', () => {
        mockSections.current = [
            { id: 1, name: 'Section A', private: false },
            { id: 2, name: 'Section B', private: false },
        ]
        mockOrdering.current = {
            views: {},
            views_top: {},
            views_bottom: {},
            view_sections: {
                '1': { display_order: 2 },
                '2': { display_order: 1 },
            },
        }

        const { result } = renderHook(() => usePublicViewSections())

        expect(result.current.map((s) => s.id)).toEqual([2, 1])
    })
})

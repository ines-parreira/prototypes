import { renderHook } from '@repo/testing/vitest'

import type { PrivateViewsOrderingData, ViewSection } from '../../types'
import { usePrivateViewSections } from '../usePrivateViewSections'

const { mockSections, mockOrdering } = vi.hoisted(() => {
    const mockSections: { current: ViewSection[] } = { current: [] }
    const mockOrdering: { current: PrivateViewsOrderingData } = {
        current: { views: {}, view_sections: {} },
    }
    return { mockSections, mockOrdering }
})

vi.mock('../useAllViewSections', () => ({
    useAllViewSections: () => mockSections.current,
}))

vi.mock('../usePrivateViewsOrdering', () => ({
    usePrivateViewsOrdering: () => mockOrdering.current,
}))

describe('usePrivateViewSections', () => {
    it('filters to private sections', () => {
        mockSections.current = [
            { id: 1, name: 'Public Section', private: false },
            { id: 2, name: 'Private Section', private: true },
        ]

        const { result } = renderHook(() => usePrivateViewSections())

        expect(result.current).toEqual([
            expect.objectContaining({ id: 2, name: 'Private Section' }),
        ])
    })

    it('sorts by display_order', () => {
        mockSections.current = [
            { id: 1, name: 'Section A', private: true },
            { id: 2, name: 'Section B', private: true },
        ]
        mockOrdering.current = {
            views: {},
            view_sections: {
                '1': { display_order: 2 },
                '2': { display_order: 1 },
            },
        }

        const { result } = renderHook(() => usePrivateViewSections())

        expect(result.current.map((s) => s.id)).toEqual([2, 1])
    })
})

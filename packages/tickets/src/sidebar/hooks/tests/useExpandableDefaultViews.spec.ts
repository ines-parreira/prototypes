import { act } from '@testing-library/react'

import { renderHook } from '../../../tests/render.utils'
import type { SystemView } from '../../types/views'
import { useDefaultViews } from '../useDefaultViews'
import { useExpandableDefaultViews } from '../useExpandableDefaultViews'

vi.mock('../useDefaultViews')

const mockUseDefaultViews = vi.mocked(useDefaultViews)

const makeViews = (count: number): SystemView[] =>
    Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        name: `View ${i + 1}`,
        slug: `view-${i + 1}`,
        uri: `/api/views/${i + 1}`,
        category: 'system' as const,
    }))

describe('useExpandableDefaultViews', () => {
    beforeEach(() => {
        mockUseDefaultViews.mockReturnValue({
            visibleSystemViews: makeViews(5),
            defaultSystemViews: makeViews(5),
            visibilitySettingId: undefined,
            isLoading: false,
            isError: false,
        })
    })

    it('should display first 3 views by default', () => {
        const { result } = renderHook(() => useExpandableDefaultViews())

        expect(result.current.displayedViews).toHaveLength(3)
    })

    it('should start in collapsed state', () => {
        const { result } = renderHook(() => useExpandableDefaultViews())

        expect(result.current.isExpanded).toBe(false)
    })

    it('should show toggle when there are more than 3 visible views', () => {
        const { result } = renderHook(() => useExpandableDefaultViews())

        expect(result.current.showToggle).toBe(true)
    })

    it('should not show toggle when there are 3 or fewer visible views', () => {
        mockUseDefaultViews.mockReturnValue({
            visibleSystemViews: makeViews(3),
            defaultSystemViews: makeViews(3),
            visibilitySettingId: undefined,
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() => useExpandableDefaultViews())

        expect(result.current.showToggle).toBe(false)
    })

    it('should display all views after toggling expanded', () => {
        const { result } = renderHook(() => useExpandableDefaultViews())

        act(() => {
            result.current.toggleExpanded()
        })

        expect(result.current.displayedViews).toHaveLength(5)
        expect(result.current.isExpanded).toBe(true)
    })

    it('should collapse back to 3 views after toggling twice', () => {
        const { result } = renderHook(() => useExpandableDefaultViews())

        act(() => {
            result.current.toggleExpanded()
        })
        act(() => {
            result.current.toggleExpanded()
        })

        expect(result.current.displayedViews).toHaveLength(3)
        expect(result.current.isExpanded).toBe(false)
    })

    it('should display all views when visible count is exactly 3', () => {
        mockUseDefaultViews.mockReturnValue({
            visibleSystemViews: makeViews(3),
            defaultSystemViews: makeViews(3),
            visibilitySettingId: undefined,
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() => useExpandableDefaultViews())

        expect(result.current.displayedViews).toHaveLength(3)
        expect(result.current.showToggle).toBe(false)
    })
})

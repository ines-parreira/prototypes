import { useListAccountSettings, useListViews } from '@gorgias/helpdesk-queries'
import type { View } from '@gorgias/helpdesk-types'

import { renderHook } from '../../../tests/render.utils'
import { getOrderedSystemViews, useDefaultViews } from '../useDefaultViews'

vi.mock('@gorgias/helpdesk-queries')

const mockUseListViews = vi.mocked(useListViews)
const mockUseListAccountSettings = vi.mocked(useListAccountSettings)

describe('getOrderedSystemViews', () => {
    it('should return system views sorted by SYSTEM_VIEW_DEFINITIONS order', () => {
        const views: View[] = [
            { id: 3, name: 'All', category: 'system' },
            { id: 7, name: 'Spam', category: 'system' },
            { id: 1, name: 'Inbox', category: 'system' },
            { id: 2, name: 'Unassigned', category: 'system' },
        ]

        const result = getOrderedSystemViews(views)

        expect(result.map((view) => view.name)).toEqual([
            'Inbox',
            'Unassigned',
            'All',
            'Spam',
        ])
    })

    it('should return empty array when views is undefined', () => {
        expect(getOrderedSystemViews(undefined)).toEqual([])
    })

    it('should filter out views whose name is not in SYSTEM_VIEW_DEFINITIONS', () => {
        const views: View[] = [
            { id: 1, name: 'Inbox', category: 'system' },
            { id: 99, name: 'My custom view', category: 'system' },
        ]

        const result = getOrderedSystemViews(views)

        expect(result).toHaveLength(1)
        expect(result[0].name).toBe('Inbox')
    })

    it('should return all 7 known system views when all are present', () => {
        const views: View[] = [
            { id: 1, name: 'Inbox', category: 'system' },
            { id: 2, name: 'Unassigned', category: 'system' },
            { id: 3, name: 'All', category: 'system' },
            { id: 4, name: 'Snoozed', category: 'system' },
            { id: 5, name: 'Closed', category: 'system' },
            { id: 6, name: 'Trash', category: 'system' },
            { id: 7, name: 'Spam', category: 'system' },
        ]

        const result = getOrderedSystemViews(views)

        expect(result).toHaveLength(7)
        expect(result.map((v) => v.name)).toEqual([
            'Inbox',
            'Unassigned',
            'All',
            'Snoozed',
            'Closed',
            'Trash',
            'Spam',
        ])
    })

    it('should return empty array when no views match known system view names', () => {
        const views: View[] = [
            { id: 99, name: 'My private view', category: 'user' },
        ]

        expect(getOrderedSystemViews(views)).toEqual([])
    })
})

describe('useDefaultViews', () => {
    const allSystemViews: View[] = [
        { id: 1, name: 'Inbox', category: 'system' },
        { id: 2, name: 'Unassigned', category: 'system' },
        { id: 3, name: 'All', category: 'system' },
        { id: 4, name: 'Snoozed', category: 'system' },
        { id: 5, name: 'Closed', category: 'system' },
        { id: 6, name: 'Trash', category: 'system' },
        { id: 7, name: 'Spam', category: 'system' },
    ]

    beforeEach(() => {
        mockUseListViews.mockReturnValue({
            data: allSystemViews,
            isLoading: false,
            isError: false,
        } as any)

        mockUseListAccountSettings.mockReturnValue({
            data: {
                id: 42,
                type: 'views-visibility',
                data: { hidden_views: [] },
            },
            isLoading: false,
            isError: false,
        } as any)
    })

    it('should return all system views ordered by SYSTEM_VIEW_DEFINITIONS', () => {
        const { result } = renderHook(() => useDefaultViews())

        expect(result.current.defaultSystemViews.map((v) => v.name)).toEqual([
            'Inbox',
            'Unassigned',
            'All',
            'Snoozed',
            'Closed',
            'Trash',
            'Spam',
        ])
    })

    it('should return all views as visible when hidden_views is empty', () => {
        const { result } = renderHook(() => useDefaultViews())

        expect(result.current.visibleSystemViews).toHaveLength(7)
    })

    it('should return empty visibleSystemViews when visibility data is not available', () => {
        mockUseListAccountSettings.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        } as any)

        const { result } = renderHook(() => useDefaultViews())

        expect(result.current.visibleSystemViews).toEqual([])
    })

    it('should filter out hidden views from visibleSystemViews', () => {
        mockUseListAccountSettings.mockReturnValue({
            data: {
                id: 42,
                type: 'views-visibility',
                data: { hidden_views: [3, 7] },
            },
            isLoading: false,
            isError: false,
        } as any)

        const { result } = renderHook(() => useDefaultViews())

        expect(result.current.visibleSystemViews.map((v) => v.name)).toEqual([
            'Inbox',
            'Unassigned',
            'Snoozed',
            'Closed',
            'Trash',
        ])
    })

    it('should return the visibility setting id', () => {
        const { result } = renderHook(() => useDefaultViews())

        expect(result.current.visibilitySettingId).toBe(42)
    })

    it('should return undefined visibilitySettingId when account settings are not loaded', () => {
        mockUseListAccountSettings.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        } as any)

        const { result } = renderHook(() => useDefaultViews())

        expect(result.current.visibilitySettingId).toBeUndefined()
    })

    it('should set isLoading to true when views are loading', () => {
        mockUseListViews.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
        } as any)

        const { result } = renderHook(() => useDefaultViews())

        expect(result.current.isLoading).toBe(true)
    })

    it('should set isLoading to true when account settings are loading', () => {
        mockUseListAccountSettings.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
        } as any)

        const { result } = renderHook(() => useDefaultViews())

        expect(result.current.isLoading).toBe(true)
    })

    it('should set isError to true when views fetch fails', () => {
        mockUseListViews.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
        } as any)

        const { result } = renderHook(() => useDefaultViews())

        expect(result.current.isError).toBe(true)
    })

    it('should set isError to true when account settings fetch fails', () => {
        mockUseListAccountSettings.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
        } as any)

        const { result } = renderHook(() => useDefaultViews())

        expect(result.current.isError).toBe(true)
    })
})

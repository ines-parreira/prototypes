import { act, renderHook } from '@testing-library/react'

import type { SortingState } from '@gorgias/axiom'

import { COLUMN_IDS } from '../Table/columns'
import { useKnowledgeHubSortingPreference } from './useKnowledgeHubSortingPreference'

const STORAGE_KEY = 'knowledge-hub-table-sort'
const DEFAULT_SORT: SortingState = [
    { id: COLUMN_IDS.LAST_UPDATED_AT, desc: true },
]

const AVAILABLE_COLUMNS: string[] = [
    COLUMN_IDS.TITLE,
    COLUMN_IDS.LAST_UPDATED_AT,
    COLUMN_IDS.IN_USE_BY_AI,
]
const AVAILABLE_COLUMNS_WITH_METRICS: string[] = [
    ...AVAILABLE_COLUMNS,
    COLUMN_IDS.METRICS_TICKETS,
    COLUMN_IDS.METRICS_HANDOVER_TICKETS,
    COLUMN_IDS.METRICS_CSAT,
]

describe('useKnowledgeHubSortingPreference', () => {
    beforeEach(() => {
        localStorage.clear()
        jest.clearAllMocks()
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    describe('Initial state and loading', () => {
        it('should return default sort when localStorage is empty', () => {
            const { result } = renderHook(() =>
                useKnowledgeHubSortingPreference(AVAILABLE_COLUMNS),
            )

            expect(result.current.sortState).toEqual(DEFAULT_SORT)
        })

        it('should load valid sort state from localStorage', () => {
            const customSort: SortingState = [
                { id: COLUMN_IDS.TITLE, desc: false },
            ]
            localStorage.setItem(STORAGE_KEY, JSON.stringify(customSort))

            const { result } = renderHook(() =>
                useKnowledgeHubSortingPreference(AVAILABLE_COLUMNS),
            )

            expect(result.current.sortState).toEqual(customSort)
        })

        it('should return default sort when localStorage contains invalid JSON', () => {
            localStorage.setItem(STORAGE_KEY, 'invalid-json{')

            const { result } = renderHook(() =>
                useKnowledgeHubSortingPreference(AVAILABLE_COLUMNS),
            )

            expect(result.current.sortState).toEqual(DEFAULT_SORT)
        })

        it('should return default sort when localStorage contains malformed structure', () => {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({ id: COLUMN_IDS.TITLE }),
            )

            const { result } = renderHook(() =>
                useKnowledgeHubSortingPreference(AVAILABLE_COLUMNS),
            )

            expect(result.current.sortState).toEqual(DEFAULT_SORT)
        })

        it('should return default sort when localStorage contains empty array', () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify([]))

            const { result } = renderHook(() =>
                useKnowledgeHubSortingPreference(AVAILABLE_COLUMNS),
            )

            expect(result.current.sortState).toEqual(DEFAULT_SORT)
        })

        it('should return default sort when localStorage contains non-array value', () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify('not-an-array'))

            const { result } = renderHook(() =>
                useKnowledgeHubSortingPreference(AVAILABLE_COLUMNS),
            )

            expect(result.current.sortState).toEqual(DEFAULT_SORT)
        })
    })

    describe('Sort state validation', () => {
        it('should return sort state when column is in availableColumnIds', () => {
            const customSort: SortingState = [
                { id: COLUMN_IDS.TITLE, desc: false },
            ]
            localStorage.setItem(STORAGE_KEY, JSON.stringify(customSort))

            const { result } = renderHook(() =>
                useKnowledgeHubSortingPreference(AVAILABLE_COLUMNS),
            )

            expect(result.current.sortState).toEqual(customSort)
        })

        it('should return default sort when column is not in availableColumnIds', () => {
            const invalidSort: SortingState = [
                { id: 'nonexistent', desc: false },
            ]
            localStorage.setItem(STORAGE_KEY, JSON.stringify(invalidSort))

            const { result } = renderHook(() =>
                useKnowledgeHubSortingPreference(AVAILABLE_COLUMNS),
            )

            expect(result.current.sortState).toEqual(DEFAULT_SORT)
        })

        it('should allow metrics columns even when not in availableColumnIds', () => {
            const metricsSort: SortingState = [
                { id: COLUMN_IDS.METRICS_TICKETS, desc: true },
            ]
            localStorage.setItem(STORAGE_KEY, JSON.stringify(metricsSort))

            const { result } = renderHook(() =>
                useKnowledgeHubSortingPreference(AVAILABLE_COLUMNS),
            )

            expect(result.current.sortState).toEqual(metricsSort)
        })

        it('should return raw sort state when availableColumnIds is empty', () => {
            const customSort: SortingState = [{ id: 'anyColumn', desc: false }]
            localStorage.setItem(STORAGE_KEY, JSON.stringify(customSort))

            const { result } = renderHook(() =>
                useKnowledgeHubSortingPreference([]),
            )

            expect(result.current.sortState).toEqual(customSort)
        })

        it('should validate non-metrics columns strictly against availableColumnIds', () => {
            const invalidNonMetricsSort: SortingState = [
                { id: 'invalidColumn', desc: false },
            ]
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(invalidNonMetricsSort),
            )

            const { result } = renderHook(() =>
                useKnowledgeHubSortingPreference(AVAILABLE_COLUMNS),
            )

            expect(result.current.sortState).toEqual(DEFAULT_SORT)
        })

        it('should revalidate when availableColumnIds changes', () => {
            const metricsSort: SortingState = [
                { id: COLUMN_IDS.METRICS_TICKETS, desc: true },
            ]
            localStorage.setItem(STORAGE_KEY, JSON.stringify(metricsSort))

            const { result, rerender } = renderHook(
                ({ columns }) => useKnowledgeHubSortingPreference(columns),
                {
                    initialProps: { columns: AVAILABLE_COLUMNS },
                },
            )

            expect(result.current.sortState).toEqual(metricsSort)

            rerender({ columns: AVAILABLE_COLUMNS_WITH_METRICS })

            expect(result.current.sortState).toEqual(metricsSort)
        })
    })

    describe('Setting sort state', () => {
        it('should update sort state when setSortState is called', () => {
            const { result } = renderHook(() =>
                useKnowledgeHubSortingPreference(AVAILABLE_COLUMNS),
            )

            const newSort: SortingState = [
                { id: COLUMN_IDS.TITLE, desc: false },
            ]

            act(() => {
                result.current.setSortState(newSort)
            })

            expect(result.current.sortState).toEqual(newSort)
        })

        it('should save to localStorage when sort state changes', () => {
            const { result } = renderHook(() =>
                useKnowledgeHubSortingPreference(AVAILABLE_COLUMNS),
            )

            const newSort: SortingState = [
                { id: COLUMN_IDS.TITLE, desc: false },
            ]

            act(() => {
                result.current.setSortState(newSort)
            })

            const stored = localStorage.getItem(STORAGE_KEY)
            expect(stored).toBe(JSON.stringify(newSort))
        })

        it('should validate new sort state against availableColumnIds', () => {
            const { result } = renderHook(() =>
                useKnowledgeHubSortingPreference(AVAILABLE_COLUMNS),
            )

            const invalidSort: SortingState = [
                { id: 'nonexistent', desc: false },
            ]

            act(() => {
                result.current.setSortState(invalidSort)
            })

            const stored = localStorage.getItem(STORAGE_KEY)
            expect(stored).toBe(JSON.stringify(invalidSort))

            expect(result.current.sortState).toEqual(DEFAULT_SORT)
        })

        it('should allow setting metrics sort even without metrics in availableColumnIds', () => {
            const { result } = renderHook(() =>
                useKnowledgeHubSortingPreference(AVAILABLE_COLUMNS),
            )

            const metricsSort: SortingState = [
                { id: COLUMN_IDS.METRICS_CSAT, desc: true },
            ]

            act(() => {
                result.current.setSortState(metricsSort)
            })

            expect(result.current.sortState).toEqual(metricsSort)
        })
    })

    describe('localStorage persistence', () => {
        it('should save default sort to localStorage on mount', () => {
            renderHook(() =>
                useKnowledgeHubSortingPreference(AVAILABLE_COLUMNS),
            )

            const stored = localStorage.getItem(STORAGE_KEY)
            expect(stored).toBe(JSON.stringify(DEFAULT_SORT))
        })

        it('should save custom sort to localStorage on mount', () => {
            const customSort: SortingState = [
                { id: COLUMN_IDS.TITLE, desc: false },
            ]
            localStorage.setItem(STORAGE_KEY, JSON.stringify(customSort))

            renderHook(() =>
                useKnowledgeHubSortingPreference(AVAILABLE_COLUMNS),
            )

            const stored = localStorage.getItem(STORAGE_KEY)
            expect(stored).toBe(JSON.stringify(customSort))
        })

        it('should use correct storage key', () => {
            const { result } = renderHook(() =>
                useKnowledgeHubSortingPreference(AVAILABLE_COLUMNS),
            )

            const newSort: SortingState = [{ id: 'inUseByAI', desc: true }]

            act(() => {
                result.current.setSortState(newSort)
            })

            expect(localStorage.getItem(STORAGE_KEY)).toBe(
                JSON.stringify(newSort),
            )
            expect(localStorage.getItem('some-other-key')).toBeNull()
        })

        it('should handle localStorage write errors gracefully', () => {
            const { result } = renderHook(() =>
                useKnowledgeHubSortingPreference(AVAILABLE_COLUMNS),
            )

            const setItemSpy = jest
                .spyOn(Storage.prototype, 'setItem')
                .mockImplementation(() => {
                    throw new Error('QuotaExceededError')
                })

            const newSort: SortingState = [
                { id: COLUMN_IDS.TITLE, desc: false },
            ]

            act(() => {
                result.current.setSortState(newSort)
            })

            expect(result.current.sortState).toEqual(DEFAULT_SORT)

            setItemSpy.mockRestore()
        })

        it('should handle localStorage read errors gracefully', () => {
            jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
                throw new Error('SecurityError')
            })

            const { result } = renderHook(() =>
                useKnowledgeHubSortingPreference(AVAILABLE_COLUMNS),
            )

            expect(result.current.sortState).toEqual(DEFAULT_SORT)
        })
    })

    describe('Edge cases', () => {
        it('should handle metrics column sort when metrics become available', () => {
            const metricsSort: SortingState = [
                { id: COLUMN_IDS.METRICS_HANDOVER_TICKETS, desc: true },
            ]
            localStorage.setItem(STORAGE_KEY, JSON.stringify(metricsSort))

            const { result, rerender } = renderHook(
                ({ columns }) => useKnowledgeHubSortingPreference(columns),
                {
                    initialProps: { columns: AVAILABLE_COLUMNS },
                },
            )

            expect(result.current.sortState).toEqual(metricsSort)

            rerender({ columns: AVAILABLE_COLUMNS_WITH_METRICS })

            expect(result.current.sortState).toEqual(metricsSort)
        })

        it('should handle switching from metrics to non-metrics sort', () => {
            const metricsSort: SortingState = [
                { id: COLUMN_IDS.METRICS_TICKETS, desc: true },
            ]
            localStorage.setItem(STORAGE_KEY, JSON.stringify(metricsSort))

            const { result } = renderHook(() =>
                useKnowledgeHubSortingPreference(
                    AVAILABLE_COLUMNS_WITH_METRICS,
                ),
            )

            expect(result.current.sortState).toEqual(metricsSort)

            const nonMetricsSort: SortingState = [
                { id: COLUMN_IDS.TITLE, desc: false },
            ]

            act(() => {
                result.current.setSortState(nonMetricsSort)
            })

            expect(result.current.sortState).toEqual(nonMetricsSort)
        })

        it('should handle availableColumnIds changing from empty to populated', () => {
            const customSort: SortingState = [
                { id: COLUMN_IDS.TITLE, desc: false },
            ]
            localStorage.setItem(STORAGE_KEY, JSON.stringify(customSort))

            const { result, rerender } = renderHook(
                ({ columns }: { columns: string[] }) =>
                    useKnowledgeHubSortingPreference(columns),
                {
                    initialProps: { columns: [] as string[] },
                },
            )

            expect(result.current.sortState).toEqual(customSort)

            rerender({ columns: AVAILABLE_COLUMNS })

            expect(result.current.sortState).toEqual(customSort)
        })

        it('should handle availableColumnIds changing to exclude current sort column', () => {
            const titleSort: SortingState = [
                { id: COLUMN_IDS.TITLE, desc: false },
            ]
            localStorage.setItem(STORAGE_KEY, JSON.stringify(titleSort))

            const { result, rerender } = renderHook(
                ({ columns }) => useKnowledgeHubSortingPreference(columns),
                {
                    initialProps: { columns: AVAILABLE_COLUMNS },
                },
            )

            expect(result.current.sortState).toEqual(titleSort)

            const columnsWithoutTitle: string[] = [
                COLUMN_IDS.LAST_UPDATED_AT,
                COLUMN_IDS.IN_USE_BY_AI,
            ]
            rerender({ columns: columnsWithoutTitle })

            expect(result.current.sortState).toEqual(DEFAULT_SORT)
        })

        it('should handle corrupted localStorage data with missing properties', () => {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify([{ id: COLUMN_IDS.TITLE }]),
            )

            const { result } = renderHook(() =>
                useKnowledgeHubSortingPreference(AVAILABLE_COLUMNS),
            )

            expect(result.current.sortState).toEqual(DEFAULT_SORT)
        })

        it('should handle corrupted localStorage data with wrong property types', () => {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify([{ id: 123, desc: 'yes' }]),
            )

            const { result } = renderHook(() =>
                useKnowledgeHubSortingPreference(AVAILABLE_COLUMNS),
            )

            expect(result.current.sortState).toEqual(DEFAULT_SORT)
        })
    })
})

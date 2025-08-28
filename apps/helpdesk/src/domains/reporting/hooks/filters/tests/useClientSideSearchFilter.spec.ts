import { FeatureFlagKey } from '@repo/feature-flags'
import { useDebouncedValue } from '@repo/hooks'
import { act, assumeMock, renderHook } from '@repo/testing'

import { useFlag } from 'core/flags'
import { useClientSideFilterSearch } from 'domains/reporting/hooks/filters/useClientSideFilterSearch'
import { FilterOptionGroup } from 'domains/reporting/pages/types'

jest.mock('core/flags')
jest.mock('@repo/hooks', () => ({
    useDebouncedValue: jest.fn((value) => value),
}))

const useFlagMock = assumeMock(useFlag)
const useDebouncedValueMock = assumeMock(useDebouncedValue)

describe('useClientSideFilterSearch', () => {
    const mockFilterOptionGroups: FilterOptionGroup[] = [
        {
            title: 'Agents',
            options: [
                { label: 'John Doe', value: 'john-doe' },
                { label: 'Jane Smith', value: 'jane-smith' },
                { label: 'Bob Johnson', value: 'bob-johnson' },
            ],
        },
        {
            title: 'Tags',
            options: [
                { label: 'Bug Report', value: 'bug-report' },
                { label: 'Feature Request', value: 'feature-request' },
                { label: 'Support', value: 'support' },
            ],
        },
        {
            options: [
                { label: 'Priority High', value: 'priority-high' },
                { label: 'Priority Low', value: 'priority-low' },
            ],
        },
    ]

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('when feature flag is enabled', () => {
        beforeEach(() => {
            useFlagMock.mockReturnValue(true)
            useDebouncedValueMock.mockImplementation((value) => value)
        })

        it('should return initial state with empty search', () => {
            const { result } = renderHook(() =>
                useClientSideFilterSearch(mockFilterOptionGroups),
            )

            expect(result.current.value).toBe('')
            expect(result.current.result).toEqual(mockFilterOptionGroups)
            expect(typeof result.current.onSearch).toBe('function')
            expect(typeof result.current.onClear).toBe('function')
        })

        it('should return custom initial value', () => {
            const initialValue = 'john'
            const { result } = renderHook(() =>
                useClientSideFilterSearch(mockFilterOptionGroups, initialValue),
            )

            expect(result.current.value).toBe(initialValue)
        })

        it('should filter options based on search query', () => {
            const { result } = renderHook(() =>
                useClientSideFilterSearch(mockFilterOptionGroups),
            )

            act(() => {
                result.current.onSearch('john')
            })

            expect(result.current.value).toBe('john')
            expect(result.current.result).toEqual([
                {
                    title: 'Agents',
                    options: [
                        { label: 'John Doe', value: 'john-doe' },
                        { label: 'Bob Johnson', value: 'bob-johnson' },
                    ],
                },
                {
                    title: 'Tags',
                    options: [],
                },
                {
                    options: [],
                },
            ])
        })

        it('should perform case-insensitive search', () => {
            const { result } = renderHook(() =>
                useClientSideFilterSearch(mockFilterOptionGroups),
            )

            act(() => {
                result.current.onSearch('JANE')
            })

            expect(result.current.result).toEqual([
                {
                    title: 'Agents',
                    options: [{ label: 'Jane Smith', value: 'jane-smith' }],
                },
                {
                    title: 'Tags',
                    options: [],
                },
                {
                    options: [],
                },
            ])
        })

        it('should filter across multiple groups', () => {
            const { result } = renderHook(() =>
                useClientSideFilterSearch(mockFilterOptionGroups),
            )

            act(() => {
                result.current.onSearch('support')
            })

            expect(result.current.result).toEqual([
                {
                    title: 'Agents',
                    options: [],
                },
                {
                    title: 'Tags',
                    options: [{ label: 'Support', value: 'support' }],
                },
                {
                    options: [],
                },
            ])
        })

        it('should return empty results for non-matching query', () => {
            const { result } = renderHook(() =>
                useClientSideFilterSearch(mockFilterOptionGroups),
            )

            act(() => {
                result.current.onSearch('nonexistent')
            })

            expect(result.current.result).toEqual([
                {
                    title: 'Agents',
                    options: [],
                },
                {
                    title: 'Tags',
                    options: [],
                },
                {
                    options: [],
                },
            ])
        })

        it('should clear search query and reset results', () => {
            const { result } = renderHook(() =>
                useClientSideFilterSearch(mockFilterOptionGroups),
            )

            act(() => {
                result.current.onSearch('john')
            })

            expect(result.current.value).toBe('john')

            act(() => {
                result.current.onClear()
            })

            expect(result.current.value).toBe('')
            expect(result.current.result).toEqual(mockFilterOptionGroups)
        })

        it('should handle partial matches', () => {
            const { result } = renderHook(() =>
                useClientSideFilterSearch(mockFilterOptionGroups),
            )

            act(() => {
                result.current.onSearch('req')
            })

            expect(result.current.result).toEqual([
                {
                    title: 'Agents',
                    options: [],
                },
                {
                    title: 'Tags',
                    options: [
                        { label: 'Feature Request', value: 'feature-request' },
                    ],
                },
                {
                    options: [],
                },
            ])
        })

        it('should handle empty search query', () => {
            const { result } = renderHook(() =>
                useClientSideFilterSearch(mockFilterOptionGroups),
            )

            act(() => {
                result.current.onSearch('')
            })

            expect(result.current.value).toBe('')
            expect(result.current.result).toEqual(mockFilterOptionGroups)
        })

        it('should handle special characters in search', () => {
            const specialCharGroups: FilterOptionGroup[] = [
                {
                    title: 'Special',
                    options: [
                        { label: 'Test@email.com', value: 'test-email' },
                        { label: 'User-Name', value: 'user-name' },
                        { label: 'Item #123', value: 'item-123' },
                    ],
                },
            ]

            const { result } = renderHook(() =>
                useClientSideFilterSearch(specialCharGroups),
            )

            act(() => {
                result.current.onSearch('@email')
            })

            expect(result.current.result).toEqual([
                {
                    title: 'Special',
                    options: [{ label: 'Test@email.com', value: 'test-email' }],
                },
            ])
        })
    })

    describe('when feature flag is disabled', () => {
        beforeEach(() => {
            useFlagMock.mockReturnValue(false)
            useDebouncedValueMock.mockImplementation((value) => value)
        })

        it('should return disabled state', () => {
            const { result } = renderHook(() =>
                useClientSideFilterSearch(mockFilterOptionGroups),
            )

            expect(result.current.value).toBeUndefined()
            expect(result.current.result).toEqual(mockFilterOptionGroups)
            expect(result.current.onSearch('test')).toBeUndefined()
            expect(result.current.onClear()).toBeUndefined()
        })

        it('should ignore initial value when disabled', () => {
            const { result } = renderHook(() =>
                useClientSideFilterSearch(mockFilterOptionGroups, 'initial'),
            )

            expect(result.current.value).toBeUndefined()
            expect(result.current.result).toEqual(mockFilterOptionGroups)
        })

        it('should call useFlag with correct feature flag', () => {
            renderHook(() => useClientSideFilterSearch(mockFilterOptionGroups))

            expect(useFlagMock).toHaveBeenCalledWith(
                FeatureFlagKey.ReportingImprovementFilterSearch,
            )
        })
    })

    describe('edge cases', () => {
        beforeEach(() => {
            useFlagMock.mockReturnValue(true)
            useDebouncedValueMock.mockImplementation((value) => value)
        })

        it('should handle empty filter option groups', () => {
            const { result } = renderHook(() => useClientSideFilterSearch([]))

            act(() => {
                result.current.onSearch('test')
            })

            expect(result.current.result).toEqual([])
        })

        it('should handle groups with no options', () => {
            const emptyGroups: FilterOptionGroup[] = [
                { title: 'Empty Group', options: [] },
            ]

            const { result } = renderHook(() =>
                useClientSideFilterSearch(emptyGroups),
            )

            act(() => {
                result.current.onSearch('test')
            })

            expect(result.current.result).toEqual([
                { title: 'Empty Group', options: [] },
            ])
        })

        it('should preserve group structure even when no matches', () => {
            const { result } = renderHook(() =>
                useClientSideFilterSearch(mockFilterOptionGroups),
            )

            act(() => {
                result.current.onSearch('xyz')
            })

            expect(result.current.result).toHaveLength(3)
            expect(result.current.result[0].title).toBe('Agents')
            expect(result.current.result[1].title).toBe('Tags')
            expect(result.current.result[2].title).toBeUndefined()
        })
    })

    describe('debounced search behavior', () => {
        beforeEach(() => {
            useFlagMock.mockReturnValue(true)
            jest.useFakeTimers()
        })

        afterEach(() => {
            jest.useRealTimers()
        })

        it('should use debounced value for filtering', () => {
            // Mock useDebouncedValue to simulate debouncing behavior
            let debouncedValue = ''
            useDebouncedValueMock.mockImplementation((value, delay) => {
                expect(delay).toBe(250) // Verify correct delay is used
                return debouncedValue
            })

            const { result, rerender } = renderHook(() =>
                useClientSideFilterSearch(mockFilterOptionGroups),
            )

            // Initial state - no filtering yet
            expect(result.current.result).toEqual(mockFilterOptionGroups)

            // Set search query
            act(() => {
                result.current.onSearch('john')
            })

            // Query is set but debounced value hasn't changed yet
            expect(result.current.value).toBe('john')
            expect(result.current.result).toEqual(mockFilterOptionGroups) // Still unfiltered

            // Simulate debounced value update
            debouncedValue = 'john'
            rerender()

            // Now results should be filtered
            expect(result.current.result).toEqual([
                {
                    title: 'Agents',
                    options: [
                        { label: 'John Doe', value: 'john-doe' },
                        { label: 'Bob Johnson', value: 'bob-johnson' },
                    ],
                },
                {
                    title: 'Tags',
                    options: [],
                },
                {
                    options: [],
                },
            ])
        })

        it('should call useDebouncedValue with correct parameters', () => {
            renderHook(() => useClientSideFilterSearch(mockFilterOptionGroups))

            expect(useDebouncedValueMock).toHaveBeenCalledWith('', 250)
        })

        it('should call useDebouncedValue with initial value', () => {
            const initialValue = 'test'
            renderHook(() =>
                useClientSideFilterSearch(mockFilterOptionGroups, initialValue),
            )

            expect(useDebouncedValueMock).toHaveBeenCalledWith(
                initialValue,
                250,
            )
        })

        it('should update debounced value when search query changes', () => {
            const { result } = renderHook(() =>
                useClientSideFilterSearch(mockFilterOptionGroups),
            )

            act(() => {
                result.current.onSearch('new query')
            })

            // Verify useDebouncedValue was called with the new query
            expect(useDebouncedValueMock).toHaveBeenLastCalledWith(
                'new query',
                250,
            )
        })
    })
})

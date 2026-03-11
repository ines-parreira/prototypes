import { act, renderHook } from '@testing-library/react'

import type { TableV1Instance } from '@gorgias/axiom'

import { useMetafieldsFiltersHandler } from '../../../hooks/useMetafieldsFiltersHandler'
import type { Field } from '../../../MetafieldsTable/types'

describe('useMetafieldsFiltersHandler', () => {
    const mockSetFilterValue = jest.fn()
    const mockGetColumn = jest.fn()

    const createMockTable = () =>
        ({
            getColumn: mockGetColumn,
        }) as unknown as TableV1Instance<Field>

    beforeEach(() => {
        jest.clearAllMocks()
        mockGetColumn.mockReturnValue({
            setFilterValue: mockSetFilterValue,
        })
    })

    describe('single column filtering', () => {
        it('should call getColumn with "type" column name', () => {
            const mockTable = createMockTable()
            const { result } = renderHook(() =>
                useMetafieldsFiltersHandler({
                    table: mockTable,
                    filterColumns: ['type'],
                }),
            )

            act(() => {
                result.current({
                    type: {
                        id: 'single_line_text',
                        type: 'single_line_text',
                        label: 'Single line text',
                    },
                })
            })

            expect(mockGetColumn).toHaveBeenCalledWith('type')
        })

        it('should call setFilterValue with the type value', () => {
            const mockTable = createMockTable()
            const { result } = renderHook(() =>
                useMetafieldsFiltersHandler({
                    table: mockTable,
                    filterColumns: ['type'],
                }),
            )

            act(() => {
                result.current({
                    type: {
                        id: 'single_line_text',
                        type: 'single_line_text',
                        label: 'Single line text',
                    },
                })
            })

            expect(mockSetFilterValue).toHaveBeenCalledWith('single_line_text')
        })

        it('should call setFilterValue with undefined when type filter is not provided', () => {
            const mockTable = createMockTable()
            const { result } = renderHook(() =>
                useMetafieldsFiltersHandler({
                    table: mockTable,
                    filterColumns: ['type'],
                }),
            )

            act(() => {
                result.current({})
            })

            expect(mockSetFilterValue).toHaveBeenCalledWith(undefined)
        })

        it('should handle different filter types', () => {
            const mockTable = createMockTable()
            const { result } = renderHook(() =>
                useMetafieldsFiltersHandler({
                    table: mockTable,
                    filterColumns: ['type'],
                }),
            )

            const filterTypes = [
                {
                    input: {
                        type: {
                            id: 'integer',
                            type: 'integer',
                            label: 'Integer',
                        },
                    },
                    expected: 'integer',
                },
                {
                    input: {
                        type: {
                            id: 'boolean',
                            type: 'boolean',
                            label: 'Boolean',
                        },
                    },
                    expected: 'boolean',
                },
                {
                    input: {
                        type: { id: 'volume', type: 'volume', label: 'Volume' },
                    },
                    expected: 'volume',
                },
            ]

            filterTypes.forEach(({ input, expected }) => {
                mockSetFilterValue.mockClear()

                act(() => {
                    result.current(input)
                })

                expect(mockSetFilterValue).toHaveBeenCalledWith(expected)
            })
        })

        it('should not throw when getColumn returns null', () => {
            mockGetColumn.mockReturnValue(null)
            const mockTable = createMockTable()
            const { result } = renderHook(() =>
                useMetafieldsFiltersHandler({
                    table: mockTable,
                    filterColumns: ['type'],
                }),
            )

            expect(() => {
                act(() => {
                    result.current({
                        type: {
                            id: 'single_line_text',
                            type: 'single_line_text',
                            label: 'Single line text',
                        },
                    })
                })
            }).not.toThrow()

            expect(mockSetFilterValue).not.toHaveBeenCalled()
        })

        it('should not throw when getColumn returns undefined', () => {
            mockGetColumn.mockReturnValue(undefined)
            const mockTable = createMockTable()
            const { result } = renderHook(() =>
                useMetafieldsFiltersHandler({
                    table: mockTable,
                    filterColumns: ['type'],
                }),
            )

            expect(() => {
                act(() => {
                    result.current({
                        type: {
                            id: 'single_line_text',
                            type: 'single_line_text',
                            label: 'Single line text',
                        },
                    })
                })
            }).not.toThrow()

            expect(mockSetFilterValue).not.toHaveBeenCalled()
        })
    })

    describe('multiple column filtering', () => {
        it('should handle filtering by both type and category', () => {
            const mockTable = createMockTable()
            const { result } = renderHook(() =>
                useMetafieldsFiltersHandler({
                    table: mockTable,
                    filterColumns: ['type', 'category'],
                }),
            )

            act(() => {
                result.current({
                    type: {
                        id: 'single_line_text',
                        type: 'single_line_text',
                        label: 'Single line text',
                    },
                    category: {
                        id: 'customer',
                        category: 'customer',
                        label: 'Customer',
                    },
                })
            })

            expect(mockGetColumn).toHaveBeenCalledWith('type')
            expect(mockGetColumn).toHaveBeenCalledWith('category')
            expect(mockSetFilterValue).toHaveBeenCalledWith('single_line_text')
            expect(mockSetFilterValue).toHaveBeenCalledWith('customer')
        })

        it('should handle filtering when only one filter is provided', () => {
            const mockTable = createMockTable()
            const { result } = renderHook(() =>
                useMetafieldsFiltersHandler({
                    table: mockTable,
                    filterColumns: ['type', 'category'],
                }),
            )

            act(() => {
                result.current({
                    type: {
                        id: 'single_line_text',
                        type: 'single_line_text',
                        label: 'Single line text',
                    },
                })
            })

            expect(mockGetColumn).toHaveBeenCalledWith('type')
            expect(mockGetColumn).toHaveBeenCalledWith('category')
            expect(mockSetFilterValue).toHaveBeenNthCalledWith(
                1,
                'single_line_text',
            )
            expect(mockSetFilterValue).toHaveBeenNthCalledWith(2, undefined)
        })

        it('should ignore filters not in filterColumns', () => {
            const mockTable = createMockTable()
            const { result } = renderHook(() =>
                useMetafieldsFiltersHandler({
                    table: mockTable,
                    filterColumns: ['type'],
                }),
            )

            act(() => {
                result.current({
                    type: {
                        id: 'single_line_text',
                        type: 'single_line_text',
                        label: 'Single line text',
                    },
                    category: {
                        id: 'customer',
                        category: 'customer',
                        label: 'Customer',
                    },
                })
            })

            expect(mockGetColumn).toHaveBeenCalledWith('type')
            expect(mockGetColumn).not.toHaveBeenCalledWith('category')
            expect(mockSetFilterValue).toHaveBeenCalledTimes(1)
            expect(mockSetFilterValue).toHaveBeenCalledWith('single_line_text')
        })
    })

    describe('fallback resolution', () => {
        it.each([
            {
                description:
                    'should use column-specific property when available',
                columnName: 'type',
                filterValue: {
                    id: 'fallback-id',
                    type: 'specific-value',
                    label: 'Test',
                },
                expected: 'specific-value',
            },
            {
                description:
                    'should fallback to id when column-specific property is missing',
                columnName: 'category',
                filterValue: {
                    id: 'fallback-id',
                    label: 'Test Category',
                },
                expected: 'fallback-id',
            },
            {
                description:
                    'should fallback to id when column-specific property is undefined',
                columnName: 'status',
                filterValue: {
                    id: 'active-status',
                    status: undefined,
                    label: 'Active',
                },
                expected: 'active-status',
            },
            {
                description:
                    'should use undefined when both column-specific property and id are missing',
                columnName: 'custom',
                filterValue: {
                    label: 'Custom',
                },
                expected: undefined,
            },
            {
                description:
                    'should prioritize column-specific property over id even when both exist',
                columnName: 'type',
                filterValue: {
                    id: 'should-not-use-this',
                    type: 'should-use-this',
                    label: 'Priority Test',
                },
                expected: 'should-use-this',
            },
        ])('$description', ({ columnName, filterValue, expected }) => {
            const mockTable = createMockTable()
            const { result } = renderHook(() =>
                useMetafieldsFiltersHandler({
                    table: mockTable,
                    filterColumns: [columnName],
                }),
            )

            act(() => {
                result.current({
                    [columnName]: filterValue,
                })
            })

            expect(mockSetFilterValue).toHaveBeenCalledWith(expected)
        })
    })
})

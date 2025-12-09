import { act, renderHook } from '@testing-library/react'

import type { Table } from '@gorgias/axiom'

import type { Field } from '../../../MetafieldsTable/types'
import { useMetafieldsFiltersHandler } from '../useMetafieldsFiltersHandler'

describe('useMetafieldsFiltersHandler', () => {
    const mockSetFilterValue = jest.fn()
    const mockGetColumn = jest.fn()

    const createMockTable = () =>
        ({
            getColumn: mockGetColumn,
        }) as unknown as Table<Field>

    beforeEach(() => {
        jest.clearAllMocks()
        mockGetColumn.mockReturnValue({
            setFilterValue: mockSetFilterValue,
        })
    })

    describe('filter change handling', () => {
        it('should call getColumn with "type" column name', () => {
            const mockTable = createMockTable()
            const { result } = renderHook(() =>
                useMetafieldsFiltersHandler({ table: mockTable }),
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
                useMetafieldsFiltersHandler({ table: mockTable }),
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
                useMetafieldsFiltersHandler({ table: mockTable }),
            )

            act(() => {
                result.current({})
            })

            expect(mockSetFilterValue).toHaveBeenCalledWith(undefined)
        })

        it('should handle different filter types', () => {
            const mockTable = createMockTable()
            const { result } = renderHook(() =>
                useMetafieldsFiltersHandler({ table: mockTable }),
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
                useMetafieldsFiltersHandler({ table: mockTable }),
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
                useMetafieldsFiltersHandler({ table: mockTable }),
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

    describe('filter object structure', () => {
        it('should only process the type filter', () => {
            const mockTable = createMockTable()
            const { result } = renderHook(() =>
                useMetafieldsFiltersHandler({ table: mockTable }),
            )

            act(() => {
                result.current({
                    someOtherFilter: 'value',
                })
            })

            expect(mockGetColumn).toHaveBeenCalledWith('type')
            expect(mockSetFilterValue).toHaveBeenCalledWith(undefined)
        })
    })
})

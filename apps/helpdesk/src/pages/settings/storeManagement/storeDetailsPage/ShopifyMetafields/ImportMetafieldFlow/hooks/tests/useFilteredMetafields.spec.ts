import { renderHook } from '@testing-library/react'

import type { Field } from '../../../MetafieldsTable/types'
import { useFilteredMetafields } from '../useFilteredMetafields'

describe('useFilteredMetafields', () => {
    const mockCustomerField: Field = {
        id: 'customer-1',
        name: 'Customer Field',
        type: 'single_line_text_field',
        category: 'Customer',
        isVisible: true,
    }

    const mockOrderField: Field = {
        id: 'order-1',
        name: 'Order Field',
        type: 'number_integer',
        category: 'Order',
        isVisible: true,
    }

    const mockDraftOrderField: Field = {
        id: 'draft-order-1',
        name: 'Draft Order Field',
        type: 'boolean',
        category: 'DraftOrder',
        isVisible: false,
    }

    const mockData: Field[] = [
        mockCustomerField,
        mockOrderField,
        mockDraftOrderField,
        { ...mockCustomerField, id: 'customer-2', name: 'Customer Field 2' },
        { ...mockOrderField, id: 'order-2', name: 'Order Field 2' },
    ]

    describe('filtering by category', () => {
        it('should filter data by customer category', () => {
            const { result } = renderHook(() =>
                useFilteredMetafields({
                    data: mockData,
                    category: 'Customer',
                }),
            )

            expect(result.current).toHaveLength(2)
            expect(result.current).toEqual([
                mockCustomerField,
                {
                    ...mockCustomerField,
                    id: 'customer-2',
                    name: 'Customer Field 2',
                },
            ])
        })

        it('should filter data by order category', () => {
            const { result } = renderHook(() =>
                useFilteredMetafields({
                    data: mockData,
                    category: 'Order',
                }),
            )

            expect(result.current).toHaveLength(2)
            expect(result.current).toEqual([
                mockOrderField,
                { ...mockOrderField, id: 'order-2', name: 'Order Field 2' },
            ])
        })

        it('should filter data by draft_order category', () => {
            const { result } = renderHook(() =>
                useFilteredMetafields({
                    data: mockData,
                    category: 'DraftOrder',
                }),
            )

            expect(result.current).toHaveLength(1)
            expect(result.current).toEqual([mockDraftOrderField])
        })
    })

    describe('edge cases', () => {
        it('should return empty array when no fields match the category', () => {
            const { result } = renderHook(() =>
                useFilteredMetafields({
                    data: [mockCustomerField],
                    category: 'Order',
                }),
            )

            expect(result.current).toEqual([])
        })

        it('should handle empty data array', () => {
            const { result } = renderHook(() =>
                useFilteredMetafields({
                    data: [],
                    category: 'Customer',
                }),
            )

            expect(result.current).toEqual([])
        })

        it('should return all fields when all match the category', () => {
            const allCustomerFields = [
                mockCustomerField,
                { ...mockCustomerField, id: 'customer-2' },
                { ...mockCustomerField, id: 'customer-3' },
            ]

            const { result } = renderHook(() =>
                useFilteredMetafields({
                    data: allCustomerFields,
                    category: 'Customer',
                }),
            )

            expect(result.current).toHaveLength(3)
            expect(result.current).toEqual(allCustomerFields)
        })
    })
})

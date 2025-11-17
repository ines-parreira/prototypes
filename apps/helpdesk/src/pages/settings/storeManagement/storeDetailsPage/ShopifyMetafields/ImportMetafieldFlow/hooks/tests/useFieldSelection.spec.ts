import { act, renderHook } from '@testing-library/react'

import type { Field } from '../../../MetafieldsTable/types'
import { useFieldSelection } from '../useFieldSelection'

describe('useFieldSelection', () => {
    const mockCustomerField: Field = {
        id: 'customer-1',
        name: 'Customer Field',
        type: 'string',
        category: 'customer',
        isVisible: true,
    }

    const mockOrderField: Field = {
        id: 'order-1',
        name: 'Order Field',
        type: 'number',
        category: 'order',
        isVisible: true,
    }

    const mockDraftOrderField: Field = {
        id: 'draft-order-1',
        name: 'Draft Order Field',
        type: 'boolean',
        category: 'draft_order',
        isVisible: false,
    }

    describe('updateSelection', () => {
        it('should update selection for a single category', () => {
            const { result } = renderHook(() => useFieldSelection())

            act(() => {
                result.current.updateSelection('customer', [mockCustomerField])
            })

            expect(result.current.selectedFieldsByCategory.customer).toEqual([
                mockCustomerField,
            ])
            expect(result.current.selectedFieldsByCategory.order).toEqual([])
            expect(result.current.selectedFieldsByCategory.draft_order).toEqual(
                [],
            )
        })

        it('should update selection with multiple fields', () => {
            const { result } = renderHook(() => useFieldSelection())
            const multipleFields = [
                mockCustomerField,
                { ...mockCustomerField, id: 'customer-2' },
            ]

            act(() => {
                result.current.updateSelection('customer', multipleFields)
            })

            expect(result.current.selectedFieldsByCategory.customer).toEqual(
                multipleFields,
            )
            expect(result.current.getSelectionCount('customer')).toBe(2)
        })

        it('should handle empty array to clear selection', () => {
            const { result } = renderHook(() => useFieldSelection())

            act(() => {
                result.current.updateSelection('customer', [mockCustomerField])
            })

            act(() => {
                result.current.updateSelection('customer', [])
            })

            expect(result.current.selectedFieldsByCategory.customer).toEqual([])
            expect(result.current.getSelectionCount('customer')).toBe(0)
        })
    })

    describe('getSelectionForCategory', () => {
        it('should return empty array for category with no selection', () => {
            const { result } = renderHook(() => useFieldSelection())

            expect(result.current.getSelectionForCategory('customer')).toEqual(
                [],
            )
        })

        it('should return correct fields for a category', () => {
            const { result } = renderHook(() => useFieldSelection())

            act(() => {
                result.current.updateSelection('order', [mockOrderField])
            })

            expect(result.current.getSelectionForCategory('order')).toEqual([
                mockOrderField,
            ])
        })

        it('should return only fields for the requested category', () => {
            const { result } = renderHook(() => useFieldSelection())

            act(() => {
                result.current.updateSelection('customer', [mockCustomerField])
                result.current.updateSelection('order', [mockOrderField])
            })

            expect(result.current.getSelectionForCategory('customer')).toEqual([
                mockCustomerField,
            ])
            expect(result.current.getSelectionForCategory('order')).toEqual([
                mockOrderField,
            ])
        })
    })

    describe('getSelectionCount', () => {
        it('should return 0 for category with no selection', () => {
            const { result } = renderHook(() => useFieldSelection())

            expect(result.current.getSelectionCount('customer')).toBe(0)
        })

        it('should return correct count for category with selection', () => {
            const { result } = renderHook(() => useFieldSelection())

            act(() => {
                result.current.updateSelection('customer', [
                    mockCustomerField,
                    { ...mockCustomerField, id: 'customer-2' },
                    { ...mockCustomerField, id: 'customer-3' },
                ])
            })

            expect(result.current.getSelectionCount('customer')).toBe(3)
        })

        it('should update count when selection changes', () => {
            const { result } = renderHook(() => useFieldSelection())

            act(() => {
                result.current.updateSelection('order', [mockOrderField])
            })

            expect(result.current.getSelectionCount('order')).toBe(1)

            act(() => {
                result.current.updateSelection('order', [
                    mockOrderField,
                    { ...mockOrderField, id: 'order-2' },
                ])
            })

            expect(result.current.getSelectionCount('order')).toBe(2)
        })
    })

    describe('allSelectedFields', () => {
        it('should return empty array when no selections exist', () => {
            const { result } = renderHook(() => useFieldSelection())

            expect(result.current.allSelectedFields).toEqual([])
        })

        it('should return all fields from a single category', () => {
            const { result } = renderHook(() => useFieldSelection())

            act(() => {
                result.current.updateSelection('customer', [mockCustomerField])
            })

            expect(result.current.allSelectedFields).toEqual([
                mockCustomerField,
            ])
        })

        it('should return all fields from multiple categories', () => {
            const { result } = renderHook(() => useFieldSelection())

            act(() => {
                result.current.updateSelection('customer', [mockCustomerField])
                result.current.updateSelection('order', [mockOrderField])
                result.current.updateSelection('draft_order', [
                    mockDraftOrderField,
                ])
            })

            const allFields = result.current.allSelectedFields

            expect(allFields).toHaveLength(3)
            expect(allFields).toContainEqual(mockCustomerField)
            expect(allFields).toContainEqual(mockOrderField)
            expect(allFields).toContainEqual(mockDraftOrderField)
        })
    })

    describe('clearSelectionForCategory', () => {
        it('should clear selection for the specified category', () => {
            const { result } = renderHook(() => useFieldSelection())

            act(() => {
                result.current.updateSelection('customer', [mockCustomerField])
            })

            act(() => {
                result.current.clearSelectionForCategory('customer')
            })

            expect(result.current.selectedFieldsByCategory.customer).toEqual([])
            expect(result.current.getSelectionCount('customer')).toBe(0)
        })

        it('should be safe to call on already empty category', () => {
            const { result } = renderHook(() => useFieldSelection())

            act(() => {
                result.current.clearSelectionForCategory('customer')
            })

            expect(result.current.selectedFieldsByCategory.customer).toEqual([])
        })
    })

    describe('clearAllSelections', () => {
        it('should clear all selections for all categories', () => {
            const { result } = renderHook(() => useFieldSelection())

            act(() => {
                result.current.updateSelection('customer', [mockCustomerField])
                result.current.updateSelection('order', [mockOrderField])
                result.current.updateSelection('draft_order', [
                    mockDraftOrderField,
                ])
            })

            act(() => {
                result.current.clearAllSelections()
            })

            expect(result.current.selectedFieldsByCategory).toEqual({
                customer: [],
                order: [],
                draft_order: [],
            })
            expect(result.current.allSelectedFields).toEqual([])
        })

        it('should be safe to call when no selections exist', () => {
            const { result } = renderHook(() => useFieldSelection())

            act(() => {
                result.current.clearAllSelections()
            })

            expect(result.current.selectedFieldsByCategory).toEqual({
                customer: [],
                order: [],
                draft_order: [],
            })
        })
    })
})

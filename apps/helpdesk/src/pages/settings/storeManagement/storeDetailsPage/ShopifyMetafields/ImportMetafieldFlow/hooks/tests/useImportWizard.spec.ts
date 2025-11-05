import { act, renderHook } from '@testing-library/react'

import { useImportWizard, wizardReducer } from '../useImportWizard'

describe('useImportWizard', () => {
    describe('initial state', () => {
        it('should initialize with categories step and no selected category', () => {
            const { result } = renderHook(() => useImportWizard())

            expect(result.current.step).toBe('categories')
            expect(result.current.selectedCategory).toBeNull()
        })
    })

    describe('selectCategory', () => {
        it('should set selected category and move to metafields step', () => {
            const { result } = renderHook(() => useImportWizard())

            act(() => {
                result.current.selectCategory('customer')
            })

            expect(result.current.selectedCategory).toBe('customer')
            expect(result.current.step).toBe('metafields')
        })

        it('should handle order category selection', () => {
            const { result } = renderHook(() => useImportWizard())

            act(() => {
                result.current.selectCategory('order')
            })

            expect(result.current.selectedCategory).toBe('order')
            expect(result.current.step).toBe('metafields')
        })

        it('should handle draft_order category selection', () => {
            const { result } = renderHook(() => useImportWizard())

            act(() => {
                result.current.selectCategory('draft_order')
            })

            expect(result.current.selectedCategory).toBe('draft_order')
            expect(result.current.step).toBe('metafields')
        })

        it('should update category when called multiple times', () => {
            const { result } = renderHook(() => useImportWizard())

            act(() => {
                result.current.selectCategory('customer')
            })

            expect(result.current.selectedCategory).toBe('customer')

            act(() => {
                result.current.selectCategory('order')
            })

            expect(result.current.selectedCategory).toBe('order')
            expect(result.current.step).toBe('metafields')
        })
    })

    describe('backToCategories', () => {
        it('should reset to categories step and clear selected category', () => {
            const { result } = renderHook(() => useImportWizard())

            act(() => {
                result.current.selectCategory('customer')
            })

            expect(result.current.step).toBe('metafields')
            expect(result.current.selectedCategory).toBe('customer')

            act(() => {
                result.current.backToCategories()
            })

            expect(result.current.step).toBe('categories')
            expect(result.current.selectedCategory).toBeNull()
        })

        it('should work when called from initial state', () => {
            const { result } = renderHook(() => useImportWizard())

            act(() => {
                result.current.backToCategories()
            })

            expect(result.current.step).toBe('categories')
            expect(result.current.selectedCategory).toBeNull()
        })
    })

    describe('reset', () => {
        it('should reset to initial state from metafields step', () => {
            const { result } = renderHook(() => useImportWizard())

            act(() => {
                result.current.selectCategory('customer')
            })

            expect(result.current.step).toBe('metafields')
            expect(result.current.selectedCategory).toBe('customer')

            act(() => {
                result.current.reset()
            })

            expect(result.current.step).toBe('categories')
            expect(result.current.selectedCategory).toBeNull()
        })

        it('should work when called from initial state', () => {
            const { result } = renderHook(() => useImportWizard())

            act(() => {
                result.current.reset()
            })

            expect(result.current.step).toBe('categories')
            expect(result.current.selectedCategory).toBeNull()
        })
    })

    describe('wizard navigation flow', () => {
        it('should navigate through complete wizard flow', () => {
            const { result } = renderHook(() => useImportWizard())

            expect(result.current.step).toBe('categories')

            act(() => {
                result.current.selectCategory('customer')
            })

            expect(result.current.step).toBe('metafields')
            expect(result.current.selectedCategory).toBe('customer')

            act(() => {
                result.current.backToCategories()
            })

            expect(result.current.step).toBe('categories')
            expect(result.current.selectedCategory).toBeNull()

            act(() => {
                result.current.selectCategory('order')
            })

            expect(result.current.step).toBe('metafields')
            expect(result.current.selectedCategory).toBe('order')
        })
    })

    describe('wizardReducer', () => {
        it('should return current state for unknown action types', () => {
            const currentState = {
                step: 'metafields' as const,
                selectedCategory: 'customer' as const,
            }

            const result = wizardReducer(currentState, {
                type: 'UNKNOWN_ACTION',
            } as any)

            expect(result).toBe(currentState)
        })
    })
})

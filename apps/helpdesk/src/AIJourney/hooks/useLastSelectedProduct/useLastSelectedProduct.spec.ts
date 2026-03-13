import { act, renderHook } from '@testing-library/react'

import type { Product } from 'constants/integrations/types/shopify'

import { useLastSelectedProduct } from './useLastSelectedProduct'

const STORAGE_KEY = 'ai-journey-last-selected-product'

const makeProduct = (id: number, title = `Product ${id}`): Product =>
    ({ id, title }) as Product

describe('useLastSelectedProduct', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    describe('resolveProduct', () => {
        it('should return undefined when availableProducts is empty', () => {
            const { result } = renderHook(() => useLastSelectedProduct())

            let resolved: Product | undefined
            act(() => {
                resolved = result.current.resolveProduct([])
            })

            expect(resolved).toBeUndefined()
        })

        it('should return stored product when it exists in available products', () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(2))

            const { result } = renderHook(() => useLastSelectedProduct())

            let resolved: Product | undefined
            act(() => {
                resolved = result.current.resolveProduct([
                    makeProduct(1),
                    makeProduct(2),
                    makeProduct(3),
                ])
            })

            expect(resolved).toEqual(makeProduct(2))
        })

        it('should return first product when no stored preference exists', () => {
            const { result } = renderHook(() => useLastSelectedProduct())

            let resolved: Product | undefined
            act(() => {
                resolved = result.current.resolveProduct([
                    makeProduct(1),
                    makeProduct(2),
                ])
            })

            expect(resolved).toEqual(makeProduct(1))
        })

        it('should save first product id to localStorage when no stored preference exists', () => {
            const { result } = renderHook(() => useLastSelectedProduct())

            act(() => {
                result.current.resolveProduct([
                    makeProduct(10),
                    makeProduct(20),
                ])
            })

            expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(10))
        })

        it('should fall back to first product when stored product is not in available products', () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(999))

            const { result } = renderHook(() => useLastSelectedProduct())

            let resolved: Product | undefined
            act(() => {
                resolved = result.current.resolveProduct([
                    makeProduct(1),
                    makeProduct(2),
                ])
            })

            expect(resolved).toEqual(makeProduct(1))
        })

        it('should update localStorage when falling back to first product', () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(999))

            const { result } = renderHook(() => useLastSelectedProduct())

            act(() => {
                result.current.resolveProduct([makeProduct(1), makeProduct(2)])
            })

            expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(1))
        })

        it('should not update localStorage when returning stored product', () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(2))

            const { result } = renderHook(() => useLastSelectedProduct())

            act(() => {
                result.current.resolveProduct([makeProduct(1), makeProduct(2)])
            })

            expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(2))
        })
    })

    describe('setLastSelectedProductId', () => {
        it('should save product id to localStorage', () => {
            const { result } = renderHook(() => useLastSelectedProduct())

            act(() => {
                result.current.setLastSelectedProductId(42)
            })

            expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(42))
        })

        it('should update subsequent resolveProduct calls', () => {
            const { result } = renderHook(() => useLastSelectedProduct())

            act(() => {
                result.current.setLastSelectedProductId(3)
            })

            let resolved: Product | undefined
            act(() => {
                resolved = result.current.resolveProduct([
                    makeProduct(1),
                    makeProduct(2),
                    makeProduct(3),
                ])
            })

            expect(resolved).toEqual(makeProduct(3))
        })

        it('should allow setting null to clear preference', () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(1))

            const { result } = renderHook(() => useLastSelectedProduct())

            act(() => {
                result.current.setLastSelectedProductId(null)
            })

            expect(localStorage.getItem(STORAGE_KEY)).toBe('null')
        })
    })
})

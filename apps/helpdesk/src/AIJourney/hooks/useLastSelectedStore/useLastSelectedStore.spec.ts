import { act, renderHook } from '@testing-library/react'

import { useLastSelectedStore } from './useLastSelectedStore'

const STORAGE_KEY = 'ai-journey-last-selected-store'

describe('useLastSelectedStore', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    describe('resolveStore', () => {
        it('should return undefined when availableStoreNames is empty', () => {
            const { result } = renderHook(() => useLastSelectedStore())

            let resolved: string | undefined
            act(() => {
                resolved = result.current.resolveStore([])
            })

            expect(resolved).toBeUndefined()
        })

        it('should return stored store when it exists in available stores', () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify('store-b'))

            const { result } = renderHook(() => useLastSelectedStore())

            let resolved: string | undefined
            act(() => {
                resolved = result.current.resolveStore([
                    'store-a',
                    'store-b',
                    'store-c',
                ])
            })

            expect(resolved).toBe('store-b')
        })

        it('should return first store when no stored preference exists', () => {
            const { result } = renderHook(() => useLastSelectedStore())

            let resolved: string | undefined
            act(() => {
                resolved = result.current.resolveStore(['store-a', 'store-b'])
            })

            expect(resolved).toBe('store-a')
        })

        it('should save first store to localStorage when no stored preference exists', () => {
            const { result } = renderHook(() => useLastSelectedStore())

            act(() => {
                result.current.resolveStore(['store-a', 'store-b'])
            })

            expect(localStorage.getItem(STORAGE_KEY)).toBe(
                JSON.stringify('store-a'),
            )
        })

        it('should fall back to first store when stored store is not in available stores', () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify('deleted-store'))

            const { result } = renderHook(() => useLastSelectedStore())

            let resolved: string | undefined
            act(() => {
                resolved = result.current.resolveStore(['store-a', 'store-b'])
            })

            expect(resolved).toBe('store-a')
        })

        it('should update localStorage when falling back to first store', () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify('deleted-store'))

            const { result } = renderHook(() => useLastSelectedStore())

            act(() => {
                result.current.resolveStore(['store-a', 'store-b'])
            })

            expect(localStorage.getItem(STORAGE_KEY)).toBe(
                JSON.stringify('store-a'),
            )
        })

        it('should not update localStorage when returning stored store', () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify('store-b'))

            const { result } = renderHook(() => useLastSelectedStore())

            act(() => {
                result.current.resolveStore(['store-a', 'store-b'])
            })

            expect(localStorage.getItem(STORAGE_KEY)).toBe(
                JSON.stringify('store-b'),
            )
        })
    })

    describe('setLastSelectedStore', () => {
        it('should save store to localStorage', () => {
            const { result } = renderHook(() => useLastSelectedStore())

            act(() => {
                result.current.setLastSelectedStore('my-store')
            })

            expect(localStorage.getItem(STORAGE_KEY)).toBe(
                JSON.stringify('my-store'),
            )
        })

        it('should update subsequent resolveStore calls', () => {
            const { result } = renderHook(() => useLastSelectedStore())

            act(() => {
                result.current.setLastSelectedStore('store-c')
            })

            let resolved: string | undefined
            act(() => {
                resolved = result.current.resolveStore([
                    'store-a',
                    'store-b',
                    'store-c',
                ])
            })

            expect(resolved).toBe('store-c')
        })

        it('should allow setting null to clear preference', () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify('store-a'))

            const { result } = renderHook(() => useLastSelectedStore())

            act(() => {
                result.current.setLastSelectedStore(null)
            })

            expect(localStorage.getItem(STORAGE_KEY)).toBe('null')
        })
    })
})

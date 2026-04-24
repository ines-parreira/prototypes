import { act, renderHook } from '@testing-library/react'

import { useAiAgentLastSelectedShop } from '../useAiAgentLastSelectedShop'

const STORAGE_KEY = `ai-agent:last-selected-shop:${window.location.hostname}`

describe('useAiAgentLastSelectedShop', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    describe('resolveShop', () => {
        it('should return undefined when availableShopNames is empty', () => {
            const { result } = renderHook(() => useAiAgentLastSelectedShop())

            let resolved: string | undefined
            act(() => {
                resolved = result.current.resolveShop([])
            })

            expect(resolved).toBeUndefined()
        })

        it('should return stored shop when it exists in available shops', () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify('shop-b'))

            const { result } = renderHook(() => useAiAgentLastSelectedShop())

            let resolved: string | undefined
            act(() => {
                resolved = result.current.resolveShop([
                    'shop-a',
                    'shop-b',
                    'shop-c',
                ])
            })

            expect(resolved).toBe('shop-b')
        })

        it('should return first shop when no stored preference exists', () => {
            const { result } = renderHook(() => useAiAgentLastSelectedShop())

            let resolved: string | undefined
            act(() => {
                resolved = result.current.resolveShop(['shop-a', 'shop-b'])
            })

            expect(resolved).toBe('shop-a')
        })

        it('should save first shop to localStorage when no stored preference exists', () => {
            const { result } = renderHook(() => useAiAgentLastSelectedShop())

            act(() => {
                result.current.resolveShop(['shop-a', 'shop-b'])
            })

            expect(localStorage.getItem(STORAGE_KEY)).toBe(
                JSON.stringify('shop-a'),
            )
        })

        it('should fall back to first shop when stored shop is not in available shops', () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify('deleted-shop'))

            const { result } = renderHook(() => useAiAgentLastSelectedShop())

            let resolved: string | undefined
            act(() => {
                resolved = result.current.resolveShop(['shop-a', 'shop-b'])
            })

            expect(resolved).toBe('shop-a')
        })

        it('should update localStorage when falling back to first shop', () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify('deleted-shop'))

            const { result } = renderHook(() => useAiAgentLastSelectedShop())

            act(() => {
                result.current.resolveShop(['shop-a', 'shop-b'])
            })

            expect(localStorage.getItem(STORAGE_KEY)).toBe(
                JSON.stringify('shop-a'),
            )
        })

        it('should not update localStorage when returning stored shop', () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify('shop-b'))

            const { result } = renderHook(() => useAiAgentLastSelectedShop())

            act(() => {
                result.current.resolveShop(['shop-a', 'shop-b'])
            })

            expect(localStorage.getItem(STORAGE_KEY)).toBe(
                JSON.stringify('shop-b'),
            )
        })
    })

    describe('setLastSelectedShop', () => {
        it('should save shop to localStorage', () => {
            const { result } = renderHook(() => useAiAgentLastSelectedShop())

            act(() => {
                result.current.setLastSelectedShop('my-shop')
            })

            expect(localStorage.getItem(STORAGE_KEY)).toBe(
                JSON.stringify('my-shop'),
            )
        })

        it('should update subsequent resolveShop calls', () => {
            const { result } = renderHook(() => useAiAgentLastSelectedShop())

            act(() => {
                result.current.setLastSelectedShop('shop-c')
            })

            let resolved: string | undefined
            act(() => {
                resolved = result.current.resolveShop([
                    'shop-a',
                    'shop-b',
                    'shop-c',
                ])
            })

            expect(resolved).toBe('shop-c')
        })

        it('should allow setting null to clear preference', () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify('shop-a'))

            const { result } = renderHook(() => useAiAgentLastSelectedShop())

            act(() => {
                result.current.setLastSelectedShop(null)
            })

            expect(localStorage.getItem(STORAGE_KEY)).toBe('null')
        })
    })
})

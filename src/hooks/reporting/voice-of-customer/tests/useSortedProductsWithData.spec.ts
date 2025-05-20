import { useSortedProductsWithData } from 'hooks/reporting/voice-of-customer/useSortedProductsWithData'
import { renderHook } from 'utils/testing/renderHook'

describe('useSortedProductsWithData', () => {
    it('returns products array', () => {
        const { result } = renderHook(() => useSortedProductsWithData())

        expect(Array.isArray(result.current.products)).toBeTruthy()
    })

    it('returns isLoading', () => {
        const { result } = renderHook(() => useSortedProductsWithData())

        expect(typeof result.current.isLoading).toBe('boolean')
    })
})

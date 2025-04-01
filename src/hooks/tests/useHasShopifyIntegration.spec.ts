import { renderHook } from '@testing-library/react-hooks'

import useAppSelector from 'hooks/useAppSelector'
import { useHasShopifyIntegration } from 'hooks/useHasShopifyIntegration'

jest.mock('hooks/useAppSelector', () => jest.fn())
const useAppSelectorMock = useAppSelector as jest.Mock

describe('useHasShopifyIntegration', () => {
    it('should return false if the account has no shopify integration', () => {
        useAppSelectorMock.mockReturnValue(false)
        const { result } = renderHook(() => useHasShopifyIntegration())
        expect(result.current).toBe(false)
    })

    it('should return true if the account has a shopify integration', () => {
        useAppSelectorMock.mockReturnValue(true)
        const { result } = renderHook(() => useHasShopifyIntegration())
        expect(result.current).toBe(true)
    })
})

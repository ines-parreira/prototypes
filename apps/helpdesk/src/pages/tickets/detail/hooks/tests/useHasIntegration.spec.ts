import { renderHook } from '@repo/testing'
import { fromJS } from 'immutable'

import { IntegrationType } from '@gorgias/helpdesk-queries'

import useAppSelector from 'hooks/useAppSelector'

import useHasIntegration from '../useHasIntegration'

jest.mock('hooks/useAppSelector', () => jest.fn())

const useAppSelectorMock = useAppSelector as jest.Mock

describe('useHasIntegration', () => {
    it('should return false when the customer has no matching integration', () => {
        useAppSelectorMock.mockReturnValueOnce(fromJS({ 1: {} }))
        useAppSelectorMock.mockReturnValueOnce([{ id: 2 }])

        const { result } = renderHook(() =>
            useHasIntegration(IntegrationType.Recharge),
        )

        expect(result.current).toBe(false)
    })

    it('should return true when the customer has a matching integration', () => {
        useAppSelectorMock.mockReturnValueOnce(fromJS({ 2: {} }))
        useAppSelectorMock.mockReturnValueOnce([{ id: 2 }])

        const { result } = renderHook(() =>
            useHasIntegration(IntegrationType.Recharge),
        )

        expect(result.current).toBe(true)
    })

    it('should work with BigCommerce integration type', () => {
        useAppSelectorMock.mockReturnValueOnce(fromJS({ 5: {} }))
        useAppSelectorMock.mockReturnValueOnce([{ id: 5 }])

        const { result } = renderHook(() =>
            useHasIntegration(IntegrationType.Bigcommerce),
        )

        expect(result.current).toBe(true)
    })

    it('should work with Magento2 integration type', () => {
        useAppSelectorMock.mockReturnValueOnce(fromJS({ 10: {} }))
        useAppSelectorMock.mockReturnValueOnce([{ id: 10 }])

        const { result } = renderHook(() =>
            useHasIntegration(IntegrationType.Magento2),
        )

        expect(result.current).toBe(true)
    })

    it('should return false when integrations list is empty', () => {
        useAppSelectorMock.mockReturnValueOnce(fromJS({ 1: {} }))
        useAppSelectorMock.mockReturnValueOnce([])

        const { result } = renderHook(() =>
            useHasIntegration(IntegrationType.Bigcommerce),
        )

        expect(result.current).toBe(false)
    })
})

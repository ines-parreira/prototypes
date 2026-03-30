import { renderHook } from '@repo/testing'
import { fromJS } from 'immutable'

import useAppSelector from 'hooks/useAppSelector'

import useHasCustomIntegrations from '../useHasCustomIntegrations'

jest.mock('hooks/useAppSelector', () => jest.fn())

const useAppSelectorMock = useAppSelector as jest.Mock

function mockWidgets(types: string[]) {
    useAppSelectorMock.mockReturnValueOnce(
        fromJS(types.map((type) => ({ type, context: 'ticket' }))),
    )
}

describe('useHasCustomIntegrations', () => {
    it('should return false when there are no widgets', () => {
        mockWidgets([])

        const { result } = renderHook(() => useHasCustomIntegrations())

        expect(result.current).toBe(false)
    })

    it('should return false when all widgets are named integration types', () => {
        mockWidgets(['shopify', 'recharge', 'bigcommerce'])

        const { result } = renderHook(() => useHasCustomIntegrations())

        expect(result.current).toBe(false)
    })

    it('should return true when a widget has a custom type', () => {
        mockWidgets(['shopify', 'custom'])

        const { result } = renderHook(() => useHasCustomIntegrations())

        expect(result.current).toBe(true)
    })

    it('should return true when a widget has a standalone type', () => {
        mockWidgets(['standalone'])

        const { result } = renderHook(() => useHasCustomIntegrations())

        expect(result.current).toBe(true)
    })

    it('should return true when a widget has a customer_external_data type', () => {
        mockWidgets(['customer_external_data'])

        const { result } = renderHook(() => useHasCustomIntegrations())

        expect(result.current).toBe(true)
    })

    it('should return true when there is a mix of named and custom types', () => {
        mockWidgets(['shopify', 'woocommerce', 'standalone', 'recharge'])

        const { result } = renderHook(() => useHasCustomIntegrations())

        expect(result.current).toBe(true)
    })

    it('should return false for each named integration type individually', () => {
        const namedTypes = [
            'shopify',
            'recharge',
            'woocommerce',
            'bigcommerce',
            'magento2',
            'yotpo',
            'smile',
        ]

        for (const type of namedTypes) {
            mockWidgets([type])

            const { result } = renderHook(() => useHasCustomIntegrations())

            expect(result.current).toBe(false)
        }
    })

    it('should return true for an unknown integration type', () => {
        mockWidgets(['some_unknown_type'])

        const { result } = renderHook(() => useHasCustomIntegrations())

        expect(result.current).toBe(true)
    })
})

import { renderHook } from '@repo/testing'
import { fromJS } from 'immutable'

import useAppSelector from 'hooks/useAppSelector'

import useHasWooCommerce from '../useHasWooCommerce'

jest.mock('hooks/useAppSelector', () => jest.fn())

const useAppSelectorMock = useAppSelector as jest.Mock

describe('useHasWooCommerce', () => {
    it('should return false when there is no ecommerce_data', () => {
        useAppSelectorMock.mockReturnValueOnce(
            fromJS({
                ticket: {
                    customer: {},
                },
            }),
        )

        const { result } = renderHook(() => useHasWooCommerce())

        expect(result.current).toBe(false)
    })

    it('should return false when ecommerce_data has no woocommerce entries', () => {
        useAppSelectorMock.mockReturnValueOnce(
            fromJS({
                ticket: {
                    customer: {
                        ecommerce_data: {
                            'store-1': {
                                store: { type: 'shopify' },
                            },
                        },
                    },
                },
            }),
        )

        const { result } = renderHook(() => useHasWooCommerce())

        expect(result.current).toBe(false)
    })

    it('should return true when ecommerce_data has a woocommerce entry', () => {
        useAppSelectorMock.mockReturnValueOnce(
            fromJS({
                ticket: {
                    customer: {
                        ecommerce_data: {
                            'store-uuid': {
                                store: { type: 'woocommerce' },
                            },
                        },
                    },
                },
            }),
        )

        const { result } = renderHook(() => useHasWooCommerce())

        expect(result.current).toBe(true)
    })

    it('should return true when one of multiple entries is woocommerce', () => {
        useAppSelectorMock.mockReturnValueOnce(
            fromJS({
                ticket: {
                    customer: {
                        ecommerce_data: {
                            'store-1': {
                                store: { type: 'shopify' },
                            },
                            'store-2': {
                                store: { type: 'woocommerce' },
                            },
                        },
                    },
                },
            }),
        )

        const { result } = renderHook(() => useHasWooCommerce())

        expect(result.current).toBe(true)
    })
})

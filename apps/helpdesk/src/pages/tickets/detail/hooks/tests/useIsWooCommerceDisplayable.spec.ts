import { renderHook } from '@repo/testing'
import { fromJS } from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import { WOOCOMMERCE_WIDGET_TYPE } from 'state/widgets/constants'
import { WidgetEnvironment } from 'state/widgets/types'

import useIsWooCommerceDisplayable from '../useIsWooCommerceDisplayable'

jest.mock('hooks/useAppSelector', () => jest.fn())

const useAppSelectorMock = useAppSelector as jest.Mock

function mockSelectors({
    widgetItems,
    ecommerceData,
}: {
    widgetItems: Array<Record<string, unknown>>
    ecommerceData: Record<string, unknown> | null
}) {
    useAppSelectorMock.mockReturnValueOnce(fromJS({ items: widgetItems }))
    useAppSelectorMock.mockReturnValueOnce(
        fromJS({
            ticket: {
                customer: ecommerceData
                    ? { ecommerce_data: ecommerceData }
                    : {},
            },
        }),
    )
}

const wooTemplate = {
    type: 'wrapper',
    widgets: [
        {
            type: 'card',
            path: 'customer',
            widgets: [
                {
                    type: 'text',
                    path: 'email',
                    title: 'Email',
                },
            ],
        },
    ],
}

function buildWooWidget(
    integrationId: number,
    overrides: Record<string, unknown> = {},
) {
    return {
        id: integrationId,
        type: WOOCOMMERCE_WIDGET_TYPE,
        context: WidgetEnvironment.Ticket,
        integration_id: integrationId,
        template: wooTemplate,
        ...overrides,
    }
}

describe('useIsWooCommerceDisplayable', () => {
    it('should return false when ecommerce_data is missing', () => {
        mockSelectors({
            widgetItems: [buildWooWidget(1)],
            ecommerceData: null,
        })

        const { result } = renderHook(() => useIsWooCommerceDisplayable())

        expect(result.current).toBe(false)
    })

    it('should return false when no ticket-context woocommerce widget exists', () => {
        mockSelectors({
            widgetItems: [
                buildWooWidget(1, { context: WidgetEnvironment.User }),
            ],
            ecommerceData: {
                'store-uuid': {
                    store: {
                        type: 'woocommerce',
                        helpdesk_integration_id: 1,
                    },
                    customer: { email: 'woo@example.com' },
                },
            },
        })

        const { result } = renderHook(() => useIsWooCommerceDisplayable())

        expect(result.current).toBe(false)
    })

    it('should return false when no store has helpdesk_integration_id matching a widget', () => {
        mockSelectors({
            widgetItems: [buildWooWidget(1)],
            ecommerceData: {
                'store-uuid': {
                    store: {
                        type: 'woocommerce',
                        helpdesk_integration_id: 999,
                    },
                    customer: { email: 'woo@example.com' },
                },
            },
        })

        const { result } = renderHook(() => useIsWooCommerceDisplayable())

        expect(result.current).toBe(false)
    })

    it('should return false when the matched store has empty data', () => {
        mockSelectors({
            widgetItems: [buildWooWidget(1)],
            ecommerceData: {
                'store-uuid': {
                    store: {
                        type: 'woocommerce',
                        helpdesk_integration_id: 1,
                    },
                    customer: {},
                },
            },
        })

        const { result } = renderHook(() => useIsWooCommerceDisplayable())

        expect(result.current).toBe(false)
    })

    it('should return true when a widget matches a store with displayable data', () => {
        mockSelectors({
            widgetItems: [buildWooWidget(1)],
            ecommerceData: {
                'store-uuid': {
                    store: {
                        type: 'woocommerce',
                        helpdesk_integration_id: 1,
                    },
                    customer: { email: 'woo@example.com' },
                },
            },
        })

        const { result } = renderHook(() => useIsWooCommerceDisplayable())

        expect(result.current).toBe(true)
    })

    it('should return true when any of multiple widget-store pairs is displayable', () => {
        mockSelectors({
            widgetItems: [buildWooWidget(1), buildWooWidget(2)],
            ecommerceData: {
                'store-a': {
                    store: {
                        type: 'woocommerce',
                        helpdesk_integration_id: 1,
                    },
                    customer: {},
                },
                'store-b': {
                    store: {
                        type: 'woocommerce',
                        helpdesk_integration_id: 2,
                    },
                    customer: { email: 'second@example.com' },
                },
            },
        })

        const { result } = renderHook(() => useIsWooCommerceDisplayable())

        expect(result.current).toBe(true)
    })
})

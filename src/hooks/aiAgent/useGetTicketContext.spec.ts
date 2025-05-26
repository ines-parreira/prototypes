import { fromJS } from 'immutable'

import { IntegrationType } from '@gorgias/helpdesk-types'

import { ShopifyIntegration } from 'models/integration/types'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'
import { getTicketState } from 'state/ticket/selectors'
import { renderHook } from 'utils/testing/renderHook'

import { useGetTicketContext } from './useGetTicketContext'

jest.mock('state/currentAccount/selectors')
jest.mock('state/integrations/selectors')
jest.mock('state/ticket/selectors')
jest.mock('hooks/useAppSelector', () => (selector: Function) => selector())

const mockGetCurrentAccountId = jest.mocked(getCurrentAccountId)
const mockGetShopifyIntegrationsSortedByName = jest.mocked(
    getShopifyIntegrationsSortedByName,
)
const mockGetTicketState = jest.mocked(getTicketState)

describe('useGetTicketContext', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        mockGetCurrentAccountId.mockReturnValue(123)
        mockGetShopifyIntegrationsSortedByName.mockReturnValue([])
    })

    it('should return empty arrays when no Shopify integrations exist', () => {
        mockGetTicketState.mockReturnValue(
            fromJS({
                customer: {
                    integrations: {},
                },
            }),
        )

        const { result } = renderHook(() => useGetTicketContext())

        expect(result.current).toEqual({
            accountId: 123,
            customerIds: [],
            orders: [],
            shopifyIntegrations: [],
        })
    })

    it('should return customer IDs and orders from Shopify integrations', () => {
        const mockShopifyIntegrations = [
            { id: 1, name: 'Shop 1' },
            { id: 2, name: 'Shop 2' },
        ] as unknown as ShopifyIntegration[]

        mockGetShopifyIntegrationsSortedByName.mockReturnValue(
            mockShopifyIntegrations,
        )
        mockGetTicketState.mockReturnValue(
            fromJS({
                customer: {
                    integrations: {
                        '1': {
                            __integration_type__: IntegrationType.Shopify,
                            customer: { id: 456 },
                            orders: [{ id: 'order1' }],
                        },
                        '2': {
                            __integration_type__: IntegrationType.Shopify,
                            customer: { id: 789 },
                            orders: [{ id: 'order2' }],
                        },
                    },
                },
            }),
        )

        const { result } = renderHook(() => useGetTicketContext())

        expect(result.current).toEqual({
            accountId: 123,
            customerIds: [456, 789],
            orders: [{ id: 'order1' }, { id: 'order2' }],
            shopifyIntegrations: mockShopifyIntegrations,
        })
    })

    it('should filter out non-Shopify integrations', () => {
        const mockShopifyIntegrations = [
            { id: 1, name: 'Shop 1' },
        ] as unknown as ShopifyIntegration[]

        mockGetShopifyIntegrationsSortedByName.mockReturnValue(
            mockShopifyIntegrations,
        )
        mockGetTicketState.mockReturnValue(
            fromJS({
                customer: {
                    integrations: {
                        '1': {
                            __integration_type__: IntegrationType.Shopify,
                            customer: { id: 456 },
                            orders: [{ id: 'order1' }],
                        },
                        '2': {
                            __integration_type__: 'other',
                            customer: { id: 789 },
                            orders: [{ id: 'order2' }],
                        },
                    },
                },
            }),
        )

        const { result } = renderHook(() => useGetTicketContext())

        expect(result.current).toEqual({
            accountId: 123,
            customerIds: [456],
            orders: [{ id: 'order1' }],
            shopifyIntegrations: mockShopifyIntegrations,
        })
    })

    it.each([undefined, null])(
        "shouldn't throw an error when the customer object is %s",
        (customerValue) => {
            mockGetTicketState.mockReturnValue(
                fromJS({
                    customer: customerValue,
                }),
            )

            const { result } = renderHook(() => useGetTicketContext())

            expect(result.current).toEqual({
                accountId: 123,
                customerIds: [],
                orders: [],
                shopifyIntegrations: [],
            })
        },
    )
})

import type { QueryObserverSuccessResult } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import type { InfluencedOrderData } from 'hooks/aiAgent/useFetchInfluencedOrders'
import { useFetchInfluencedOrdersForCurrentTicket } from 'hooks/aiAgent/useFetchInfluencedOrdersForCurrentTicket'
import { IntegrationType } from 'models/integration/constants'
import { EditionContext } from 'providers/infobar/EditionContext'
import { IntegrationContext } from 'providers/infobar/IntegrationContext'
import { initialState as cancelInitialState } from 'state/infobarActions/shopify/cancelOrder/reducers'
import { initialState } from 'state/infobarActions/shopify/createOrder/reducers'
import { CustomizationContext } from 'Widgets/modules/Template'

import { OrderContext, orderCustomization, Wrapper } from '../Order'

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('state/notifications/actions')

jest.mock('hooks/aiAgent/useFetchInfluencedOrdersForCurrentTicket')
const mockUseFetchInfluencedOrdersForCurrentTicket = jest.mocked(
    useFetchInfluencedOrdersForCurrentTicket,
)

const TitleWrapper = orderCustomization.TitleWrapper!
const AfterTitle = orderCustomization.AfterTitle!

describe('<TitleWrapper/>', () => {
    const accountId = 1234
    const mockStore = configureMockStore()
    const integrationId = 1
    const integration = {
        id: integrationId,
        name: 'My Shopify Integration',
        total_spent: '100.0',
        currency: 'USD',
        admin_graphql_api_id: 'https://test.myshopify.com',
        meta: {
            currency: 'GBP',
            store_url: 'https://test.myshopify.com',
            shop_name: 'shopify.gorgi.us',
        },
        integrationType: IntegrationType.Shopify,
        shopify: IntegrationType.Shopify,
    }

    const mockTicketContext = {
        accountId,
        customers: [{ id: 456, created_at: '2024-01-01T00:00:00Z' }],
        ticketId: 999,
        orders: [],
        shopifyIntegrations: [],
        createdAt: '2021-01-01T00:00:00.000Z',
    }

    beforeEach(() => {
        jest.resetAllMocks()
        mockUseFetchInfluencedOrdersForCurrentTicket.mockReturnValue({
            influencedOrders: {
                data: [],
            } as unknown as QueryObserverSuccessResult<InfluencedOrderData[]>,
            ticketContext: mockTicketContext,
        })
    })

    describe('render()', () => {
        it('should render copy button if not editing', () => {
            const store = mockStore({
                integrations: fromJS({
                    integrations: [integration],
                }),
                infobarActions: {
                    [IntegrationType.Shopify]: {
                        createOrder: initialState,
                    },
                },
                currentAccount: fromJS({
                    id: accountId,
                    domain: 'test.domain.com',
                }),
            })

            const { container } = render(
                <Provider store={store}>
                    <IntegrationContext.Provider
                        value={{
                            integration: fromJS(integration),
                            integrationId: integrationId,
                        }}
                    >
                        <TitleWrapper
                            source={fromJS({
                                order_number: 123,
                                name: 'name',
                                id: 456,
                                customer: {
                                    id: 789,
                                },
                                meta: {
                                    shop_name: 'shopify.gorgi.us',
                                    admin_url_suffix: 'admin_12df',
                                },
                            })}
                        >
                            <div>foo bar</div>
                        </TitleWrapper>
                    </IntegrationContext.Provider>
                </Provider>,
            )
            expect(screen.getByRole('button')).toBeVisible()

            expect(container).toMatchSnapshot()
        })

        it('should return null if isEditing is true', () => {
            const store = mockStore({
                integrations: fromJS({
                    integrations: [integration],
                }),
                infobarActions: {
                    [IntegrationType.Shopify]: {
                        createOrder: initialState,
                    },
                },
                currentAccount: fromJS({
                    id: 123,
                    domain: 'test.domain.com',
                }),
            })
            render(
                <Provider store={store}>
                    <EditionContext.Provider value={{ isEditing: true }}>
                        <IntegrationContext.Provider
                            value={{
                                integration: fromJS(integration),
                                integrationId: integrationId,
                            }}
                        >
                            <TitleWrapper
                                source={fromJS({
                                    order_number: 123,
                                    id: 456,
                                    customer: {
                                        id: 789,
                                    },
                                    meta: {
                                        shop_name: 'shopify.gorgi.us',
                                        admin_url_suffix: 'admin_12df',
                                    },
                                })}
                            >
                                <div>foo bar</div>
                            </TitleWrapper>
                        </IntegrationContext.Provider>
                    </EditionContext.Provider>
                </Provider>,
            )

            expect(screen.queryByRole('button')).toBeNull()
        })

        it('should show AI influenced badge when order is influenced by AI', () => {
            mockUseFetchInfluencedOrdersForCurrentTicket.mockReturnValue({
                influencedOrders: {
                    data: [{ id: 456, integrationId: 2, orderId: 'order1' }],
                } as unknown as QueryObserverSuccessResult<
                    InfluencedOrderData[]
                >,
                ticketContext: mockTicketContext,
            })

            const store = mockStore({
                integrations: fromJS({
                    integrations: [integration],
                }),
                infobarActions: {
                    [IntegrationType.Shopify]: {
                        createOrder: initialState,
                    },
                },
                currentAccount: fromJS({
                    id: accountId,
                    domain: 'test.domain.com',
                }),
            })

            render(
                <Provider store={store}>
                    <OrderContext.Provider
                        value={{
                            order: fromJS({}),
                            orderId: 456,
                            isOrderCancelled: false,
                            isOrderRefunded: false,
                            isOrderFulfilled: false,
                            isOrderPartiallyFulfilled: false,
                            isOldOrder: false,
                            integrationId,
                            integration: fromJS(integration),
                        }}
                    >
                        <IntegrationContext.Provider
                            value={{
                                integration: fromJS(integration),
                                integrationId: integrationId,
                            }}
                        >
                            <TitleWrapper
                                source={fromJS({
                                    order_number: 123,
                                    name: 'name',
                                    id: 456,
                                    fulfillment_status: 'fulfilled',
                                    financial_status: 'paid',
                                    customer: {
                                        id: 789,
                                    },
                                    meta: {
                                        shop_name: 'shopify.gorgi.us',
                                        admin_url_suffix: 'admin_12df',
                                    },
                                })}
                            >
                                <div>foo bar</div>
                            </TitleWrapper>
                        </IntegrationContext.Provider>
                    </OrderContext.Provider>
                </Provider>,
            )

            expect(screen.getByText('Influenced by AI')).toBeInTheDocument()
        })

        it('should not show AI influenced badge when order is not influenced by AI', () => {
            mockUseFetchInfluencedOrdersForCurrentTicket.mockReturnValue({
                influencedOrders: {
                    data: [],
                } as unknown as QueryObserverSuccessResult<
                    InfluencedOrderData[]
                >,
                ticketContext: mockTicketContext,
            })

            const store = mockStore({
                integrations: fromJS({
                    integrations: [integration],
                }),
                infobarActions: {
                    [IntegrationType.Shopify]: {
                        createOrder: initialState,
                    },
                },
                currentAccount: fromJS({
                    id: accountId,
                    domain: 'test.domain.com',
                }),
            })

            render(
                <Provider store={store}>
                    <OrderContext.Provider
                        value={{
                            order: fromJS({}),
                            orderId: 456,
                            isOrderCancelled: false,
                            isOrderRefunded: false,
                            isOrderFulfilled: false,
                            isOrderPartiallyFulfilled: false,
                            isOldOrder: false,
                            integrationId,
                            integration: fromJS(integration),
                        }}
                    >
                        <IntegrationContext.Provider
                            value={{
                                integration: fromJS(integration),
                                integrationId: integrationId,
                            }}
                        >
                            <TitleWrapper
                                source={fromJS({
                                    order_number: 123,
                                    name: 'name',
                                    id: 456,
                                    fulfillment_status: 'fulfilled',
                                    financial_status: 'paid',
                                    customer: {
                                        id: 789,
                                    },
                                    meta: {
                                        shop_name: 'shopify.gorgi.us',
                                        admin_url_suffix: 'admin_12df',
                                    },
                                })}
                            >
                                <div>foo bar</div>
                            </TitleWrapper>
                        </IntegrationContext.Provider>
                    </OrderContext.Provider>
                </Provider>,
            )

            expect(
                screen.queryByText('Influenced by AI'),
            ).not.toBeInTheDocument()
        })
    })
})

describe('<AfterTitle/>', () => {
    const mockStore = configureMockStore()
    const integrationId = 1
    const integration = {
        id: integrationId,
        name: 'My Shopify Integration',
        total_spent: '100.0',
        currency: 'USD',
        admin_graphql_api_id: 'https://test.myshopify.com',
        meta: {
            currency: 'GBP',
            store_url: 'https://test.myshopify.com',
        },
        integrationType: IntegrationType.Shopify,
        shopify: IntegrationType.Shopify,
    }
    beforeEach(() => {
        jest.resetAllMocks()
    })
    describe('render()', () => {
        it('should render null if integrationId is missing', () => {
            const store = mockStore({
                integrations: fromJS({
                    integrations: undefined,
                }),
                infobarActions: {
                    [IntegrationType.Shopify]: {
                        createOrder: initialState,
                    },
                },
            })
            render(
                <Provider store={store}>
                    <EditionContext.Provider value={{ isEditing: false }}>
                        <IntegrationContext.Provider
                            value={{
                                integrationId: null,
                                integration: fromJS({
                                    meta: {
                                        shop_name: 'test-shop',
                                    },
                                }),
                            }}
                        >
                            <AfterTitle source={fromJS({ id: 123 })}>
                                <div>foo bar</div>
                            </AfterTitle>
                        </IntegrationContext.Provider>
                    </EditionContext.Provider>
                </Provider>,
            )

            expect(screen.queryByRole('button')).toBeNull()
        })

        it.each([
            ['voided', 0],
            ['refunded', 0],
            ['paid', 1],
        ])(
            'should not render refund button if not refundable',
            (financial_status, expected) => {
                const store = mockStore({
                    integrations: fromJS({
                        integrations: [integration],
                    }),
                    infobarActions: {
                        [IntegrationType.Shopify]: {
                            createOrder: initialState,
                            editOrder: initialState,
                            refundOrder: initialState,
                            cancelOrder: cancelInitialState,
                        },
                    },
                })
                render(
                    <Provider store={store}>
                        <IntegrationContext.Provider
                            value={{
                                integration: fromJS(integration),
                                integrationId: integrationId,
                            }}
                        >
                            <Wrapper
                                source={fromJS({
                                    financial_status: financial_status,
                                    id: 123,
                                })}
                            >
                                <AfterTitle
                                    isEditing={false}
                                    source={fromJS({
                                        order_number: 123,
                                        name: 'name',
                                        meta: {
                                            shop_name: 'shopify.gorgi.us',
                                            admin_url_suffix: 'admin_12df',
                                        },
                                    })}
                                >
                                    <div>foo bar</div>
                                </AfterTitle>
                            </Wrapper>
                        </IntegrationContext.Provider>
                    </Provider>,
                )
                expect(
                    screen.queryAllByRole('button', { name: /Refund/ }).length,
                ).toBe(expected)
            },
        )

        it('should hide actions when hideActionsForCustomer is true', () => {
            const store = mockStore({
                integrations: fromJS({
                    integrations: [integration],
                }),
                infobarActions: {
                    [IntegrationType.Shopify]: {
                        createOrder: initialState,
                    },
                },
            })

            const mockOrder = fromJS({
                id: 123,
                name: '#1001',
                created_at: '2024-01-01',
                current_total_price_set: {
                    shop_money: {
                        amount: '100.00',
                        currency_code: 'USD',
                    },
                },
            })

            render(
                <Provider store={store}>
                    <CustomizationContext.Provider
                        value={{ hideActionsForCustomer: true }}
                    >
                        <OrderContext.Provider
                            value={{
                                order: mockOrder,
                                orderId: 123,
                                isOrderCancelled: false,
                                isOrderRefunded: false,
                                isOrderFulfilled: false,
                                isOrderPartiallyFulfilled: false,
                                isOldOrder: false,
                                integrationId: 1,
                                integration: fromJS(integration),
                            }}
                        >
                            <AfterTitle isEditing={false} source={mockOrder} />
                        </OrderContext.Provider>
                    </CustomizationContext.Provider>
                </Provider>,
            )

            // Verify no action buttons are present
            expect(screen.queryByText('Duplicate')).not.toBeInTheDocument()
            expect(screen.queryByText('Refund')).not.toBeInTheDocument()
            expect(screen.queryByText('Cancel')).not.toBeInTheDocument()
            expect(screen.queryByText('Edit')).not.toBeInTheDocument()
        })
    })
})

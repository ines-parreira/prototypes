import {render, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {IntegrationType} from 'models/integration/constants'
import {EditionContext} from 'providers/infobar/EditionContext'
import {IntegrationContext} from 'providers/infobar/IntegrationContext'
import {initialState as cancelInitialState} from 'state/infobarActions/shopify/cancelOrder/reducers'
import {initialState} from 'state/infobarActions/shopify/createOrder/reducers'
import {CustomizationContext} from 'Widgets/modules/Template'

import {Wrapper, orderCustomization, OrderContext} from '../Order'

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('state/notifications/actions')

const TitleWrapper = orderCustomization.TitleWrapper!
const AfterTitle = orderCustomization.AfterTitle!

describe('<TitleWrapper/>', () => {
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
            })
            const {container} = render(
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
                                meta: {
                                    shop_name: 'shopify.gorgi.us',
                                    admin_url_suffix: 'admin_12df',
                                },
                            })}
                        >
                            <div>foo bar</div>
                        </TitleWrapper>
                    </IntegrationContext.Provider>
                </Provider>
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
            })
            render(
                <Provider store={store}>
                    <EditionContext.Provider value={{isEditing: true}}>
                        <IntegrationContext.Provider
                            value={{
                                integration: fromJS(integration),
                                integrationId: integrationId,
                            }}
                        >
                            <TitleWrapper
                                source={fromJS({
                                    order_number: 123,
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
                </Provider>
            )

            expect(screen.queryByRole('button')).toBeNull()
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
                    <EditionContext.Provider value={{isEditing: false}}>
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
                            <AfterTitle source={fromJS({id: 123})}>
                                <div>foo bar</div>
                            </AfterTitle>
                        </IntegrationContext.Provider>
                    </EditionContext.Provider>
                </Provider>
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
                    </Provider>
                )
                expect(
                    screen.queryAllByRole('button', {name: /Refund/}).length
                ).toBe(expected)
            }
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
                        value={{hideActionsForCustomer: true}}
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
                </Provider>
            )

            // Verify no action buttons are present
            expect(screen.queryByText('Duplicate')).not.toBeInTheDocument()
            expect(screen.queryByText('Refund')).not.toBeInTheDocument()
            expect(screen.queryByText('Cancel')).not.toBeInTheDocument()
            expect(screen.queryByText('Edit')).not.toBeInTheDocument()
        })
    })
})

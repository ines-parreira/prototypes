import React from 'react'
import {render, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'

import {IntegrationContext} from 'providers/infobar/IntegrationContext'
import {initialState} from 'state/infobarActions/shopify/createOrder/reducers'
import {initialState as cancelInitialState} from 'state/infobarActions/shopify/cancelOrder/reducers'
import {IntegrationType} from 'models/integration/constants'
import {EditionContext} from 'providers/infobar/EditionContext'

import {Wrapper, orderCustomization} from '../Order'

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

        it('should not render copy button if editing', () => {
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

            expect(container).toMatchSnapshot()
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
    })
})

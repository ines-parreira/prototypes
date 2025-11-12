import React from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { fireEvent, render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { IntegrationType } from 'models/integration/constants'
import { EditionContext } from 'providers/infobar/EditionContext'
import { IntegrationContext } from 'providers/infobar/IntegrationContext'

import { draftOrderCustomization } from '../DraftOrder'

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('state/notifications/actions')
jest.mock('@repo/logging')
const logEventMock = logEvent as jest.MockedFunction<typeof logEvent>

const TitleWrapper = draftOrderCustomization.TitleWrapper!
const AfterTitle = draftOrderCustomization.AfterTitle!

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

    it('should render the invoice sent status', () => {
        const store = mockStore({
            integrations: fromJS({
                integrations: [integration],
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
                            invoice_sent_at: 'something',
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
            </Provider>,
        )
        expect(screen.getByRole('button')).toBeVisible()

        expect(container).toMatchSnapshot()
    })

    it('should render the open status', () => {
        const store = mockStore({
            integrations: fromJS({
                integrations: [integration],
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

    it('should send an event when the link is clicked', () => {
        const store = mockStore({
            integrations: fromJS({
                integrations: [integration],
            }),
            currentAccount: fromJS({
                domain: 'test',
            }),
        })
        render(
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
                            invoice_sent_at: 'something',
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
            </Provider>,
        )
        expect(screen.getByRole('button')).toBeVisible()

        const link = screen.getByRole('link')
        fireEvent.click(link)

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.ShopifyDraftOrderClicked,
            expect.objectContaining({
                account_domain: 'test',
            }),
        )
    })

    it('should not render copy button if editing', () => {
        const store = mockStore({
            integrations: fromJS({
                integrations: [integration],
            }),
        })
        const { container } = render(
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

        expect(container).toMatchSnapshot()
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

    it('should match the snapshot', () => {
        const store = mockStore({
            integrations: fromJS({
                integrations: [integration],
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
                    <AfterTitle
                        isEditing={false}
                        source={fromJS({
                            order_number: 123,
                            name: 'name',
                            meta: {
                                shop_name: 'shopify.gorgi.us',
                                admin_url_suffix: 'admin_12df',
                            },
                            created_at: '2021-02-08',
                            total_price: '20.00',
                            currency: 'USD',
                        })}
                    />
                </IntegrationContext.Provider>
            </Provider>,
        )
        const [created, total] = container.children
        expect(created).toHaveTextContent('Created: 02/08/2021')
        expect(total).toHaveTextContent('Total: $20.00')
    })

    it('should not render without integration', () => {
        const store = mockStore({
            integrations: fromJS({
                integrations: [integration],
            }),
        })
        const { container } = render(
            <Provider store={store}>
                <IntegrationContext.Provider
                    value={{
                        integration: fromJS(integration),
                        integrationId: null,
                    }}
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
                    />
                </IntegrationContext.Provider>
            </Provider>,
        )
        expect(container).toMatchSnapshot()
    })

    it('should not render with eding', () => {
        const store = mockStore({
            integrations: fromJS({
                integrations: [integration],
            }),
        })
        const { container } = render(
            <Provider store={store}>
                <EditionContext.Provider value={{ isEditing: true }}>
                    <IntegrationContext.Provider
                        value={{
                            integration: fromJS(integration),
                            integrationId: null,
                        }}
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
                        />
                    </IntegrationContext.Provider>
                </EditionContext.Provider>
            </Provider>,
        )
        expect(container).toMatchSnapshot()
    })
})

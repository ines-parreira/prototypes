import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'
import {screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import _cloneDeep from 'lodash/cloneDeep'

import {IntegrationType} from 'models/integration/types'
import {renderWithRouter} from 'utils/testing'
import {billingState} from 'fixtures/billing'
import {
    basicMonthlyHelpdeskPrice,
    HELPDESK_PRODUCT_ID,
    products,
    proMonthlyHelpdeskPrice,
} from 'fixtures/productPrices'
import Magento2 from '../Magento2'

const mockStore = configureMockStore([thunk])
const store = mockStore({
    billing: fromJS(billingState),
    currentAccount: fromJS({
        current_subscription: {
            products: {
                [HELPDESK_PRODUCT_ID]: proMonthlyHelpdeskPrice.price_id,
            },
        },
    }),
})

describe('<Magento2/>', () => {
    const minProps: ComponentProps<typeof Magento2> = {
        integration: fromJS({}),
        integrations: fromJS([
            {
                id: '1',
                type: IntegrationType.Magento2,
                name: 'myShop1',
                meta: {shop_url: 'mystore.com/admin'},
            },
        ]),
        loading: fromJS({}),
        redirectUri: '',
    }

    describe('Detail', () => {
        it('should render a detail view', () => {
            const {container} = renderWithRouter(
                <Provider store={store}>
                    <Magento2 {...minProps} />
                </Provider>
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe('Integration', () => {
        it('should render', () => {
            const {container} = renderWithRouter(
                <Provider store={store}>
                    <Magento2 {...minProps} />
                </Provider>,
                {
                    path: '/:integrationType/:integrationId?',
                    route: `/magento2/1/`,
                }
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe('New', () => {
        it('should render', () => {
            const {container} = renderWithRouter(
                <Provider store={store}>
                    <Magento2 {...minProps} />
                </Provider>,
                {
                    path: '/:integrationType/:integrationId?',
                    route: `/magento2/new/`,
                }
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe('List', () => {
        it('should render', () => {
            const {container} = renderWithRouter(
                <Provider store={store}>
                    <Magento2 {...minProps} />
                </Provider>,
                {
                    path: '/:integrationType/:integrationId?',
                    route: `/magento2/connections/`,
                }
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should show no integrations', () => {
            renderWithRouter(
                <Provider store={store}>
                    <Magento2 {...minProps} integrations={fromJS([])} />
                </Provider>,
                {
                    path: '/:integrationType/:integrationId?',
                    route: `/magento2/connections/`,
                }
            )
            expect(screen.getByText(/You have no integration/))
        })

        it('should have a reconnect button', () => {
            renderWithRouter(
                <Provider store={store}>
                    <Magento2
                        {...minProps}
                        integrations={fromJS([
                            {
                                id: '1',
                                type: IntegrationType.Magento2,
                                name: 'myShop1',
                                meta: {shop_url: 'mystore.com/admin'},
                                deactivated_datetime: true,
                            },
                        ])}
                    />
                </Provider>,
                {
                    path: '/:integrationType/:integrationId?',
                    route: `/magento2/connections/`,
                }
            )
            expect(screen.getByRole('button', {name: 'Reconnect'}))
        })
    })

    describe('Not in plan', () => {
        const productsWithMagentoDisabled = _cloneDeep(products)
        const basicPriceWithMagentoDisabled = basicMonthlyHelpdeskPrice
        basicPriceWithMagentoDisabled.features.magento_integration.enabled =
            false
        productsWithMagentoDisabled[0].prices[0] = basicPriceWithMagentoDisabled

        const noEnabledFeatureStore = mockStore({
            billing: fromJS({
                ...billingState,
                products: productsWithMagentoDisabled,
            }),
            currentAccount: fromJS({
                current_subscription: {
                    products: {
                        [HELPDESK_PRODUCT_ID]:
                            basicPriceWithMagentoDisabled.price_id,
                    },
                },
            }),
        })

        it.each([
            '/magento2/',
            '/magento2/new/',
            '/magento2/1/',
            '/magento2/connections/',
        ])(
            'should render the detail page with a disabled connect and disabled notice in any case',
            (integrationType) => {
                renderWithRouter(
                    <Provider store={noEnabledFeatureStore}>
                        <Magento2 {...minProps} integrations={fromJS([])} />
                    </Provider>,
                    {
                        path: '/:integrationType/:integrationId?',
                        route: `/integrations/${integrationType}/new`,
                    }
                )
                expect(
                    screen.getByText(
                        'App is not available on your current plan.'
                    )
                )
            }
        )
    })
})

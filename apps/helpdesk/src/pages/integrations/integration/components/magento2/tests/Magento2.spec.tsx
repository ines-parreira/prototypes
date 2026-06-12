import type { ComponentProps } from 'react'
import React from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { cloneDeep } from '@gorgias/toolkit'

import { billingState } from 'fixtures/billing'
import {
    basicMonthlyHelpdeskPlan,
    HELPDESK_PRODUCT_ID,
    products,
    proMonthlyHelpdeskPlan,
} from 'fixtures/plans'
import { IntegrationType } from 'models/integration/types'

import { Magento2 } from '../Magento2'

const mockStore = configureMockStore([thunk])
const store = mockStore({
    billing: fromJS(billingState),
    currentAccount: fromJS({
        current_subscription: {
            products: {
                [HELPDESK_PRODUCT_ID]: proMonthlyHelpdeskPlan.plan_id,
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
                meta: { shop_url: 'mystore.com/admin' },
            },
        ]),
        loading: fromJS({}),
        redirectUri: '',
    }
    describe('Detail', () => {
        it('should render a detail view', () => {
            const { container } = render(<Magento2 {...minProps} />, {
                storeState: store.getState() as object,
            })
            expect(container.firstChild).toMatchSnapshot()
        })
    })
    describe('Integration', () => {
        it('should render', () => {
            const { container } = render(<Magento2 {...minProps} />, {
                path: '/:integrationType/:integrationId?',
                initialEntries: [`/magento2/1/`],
                storeState: store.getState() as object,
            })
            expect(container.firstChild).toMatchSnapshot()
        })
    })
    describe('New', () => {
        it('should render', () => {
            const { container } = render(<Magento2 {...minProps} />, {
                path: '/:integrationType/:integrationId?',
                initialEntries: [`/magento2/new/`],
                storeState: store.getState() as object,
            })
            expect(container.firstChild).toMatchSnapshot()
        })
    })
    describe('List', () => {
        it('should render', () => {
            const { container } = render(<Magento2 {...minProps} />, {
                path: '/:integrationType/:integrationId?',
                initialEntries: [`/magento2/connections/`],
                storeState: store.getState() as object,
            })
            expect(container.firstChild).toMatchSnapshot()
        })
        it('should show no integrations', () => {
            render(<Magento2 {...minProps} integrations={fromJS([])} />, {
                path: '/:integrationType/:integrationId?',
                initialEntries: [`/magento2/connections/`],
                storeState: store.getState() as object,
            })
            expect(screen.getByText(/You have no integration/))
        })
        it('should have a reconnect button', () => {
            render(
                <Magento2
                    {...minProps}
                    integrations={fromJS([
                        {
                            id: '1',
                            type: IntegrationType.Magento2,
                            name: 'myShop1',
                            meta: { shop_url: 'mystore.com/admin' },
                            deactivated_datetime: true,
                        },
                    ])}
                />,
                {
                    path: '/:integrationType/:integrationId?',
                    initialEntries: [`/magento2/connections/`],
                    storeState: store.getState() as object,
                },
            )
            expect(screen.getByRole('button', { name: 'Reconnect' }))
        })
    })
    describe('Not in price', () => {
        const productsWithMagentoDisabled = cloneDeep(products)
        const basicPlanWithMagentoDisabled = basicMonthlyHelpdeskPlan
        basicPlanWithMagentoDisabled.features.magento_integration.enabled = false
        productsWithMagentoDisabled[0].prices[0] = basicPlanWithMagentoDisabled
        const noEnabledFeatureStore = mockStore({
            billing: fromJS({
                ...billingState,
                products: productsWithMagentoDisabled,
            }),
            currentAccount: fromJS({
                current_subscription: {
                    products: {
                        [HELPDESK_PRODUCT_ID]:
                            basicPlanWithMagentoDisabled.plan_id,
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
                render(<Magento2 {...minProps} integrations={fromJS([])} />, {
                    path: '/:integrationType/:integrationId?',
                    initialEntries: [`/integrations/${integrationType}/new`],
                    storeState: noEnabledFeatureStore.getState() as object,
                })
                expect(
                    screen.getByText(
                        'App is not available on your current plan.',
                    ),
                )
            },
        )
    })
})

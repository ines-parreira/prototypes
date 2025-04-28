import React from 'react'

import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { billingState } from 'fixtures/billing'
import { IntegrationType } from 'models/integration/constants'
import { useSelfServiceStoreIntegrationMultiStore } from 'pages/automate/common/hooks/useSelfServiceStoreIntegration'
import { renderHook } from 'utils/testing/renderHook'

describe('useSelfServiceStoreIntegrationMultiStore', () => {
    const SHOP_NAME_1 = 'My Shop'
    const SHOP_NAME_2 = 'My Other Shop'
    const shopNames = [SHOP_NAME_1, SHOP_NAME_2]

    it('should return undefined when no integration found for the requested type', () => {
        const store = configureMockStore()({
            billing: fromJS(billingState),
            integrations: fromJS({
                integrations: [{ id: 1, type: 'email' }],
            }),
        })

        const hook = renderHook(
            () =>
                useSelfServiceStoreIntegrationMultiStore('shopify', shopNames),
            {
                wrapper: ({ children }) => (
                    <Provider store={store}>{children}</Provider>
                ),
            },
        )

        expect(hook.result.current).toEqual({
            [SHOP_NAME_1]: undefined,
            [SHOP_NAME_2]: undefined,
        })
    })

    it('should return undefined when no integration found for the requested name', () => {
        const store = configureMockStore()({
            billing: fromJS(billingState),
            integrations: fromJS({
                integrations: [
                    { id: 1, type: 'email' },
                    {
                        id: 2,
                        name: 'Shopify Store 1',
                        type: IntegrationType.Shopify,
                        meta: { shop_name: 'Some shop' },
                    },
                ],
            }),
        })

        const hook = renderHook(
            () =>
                useSelfServiceStoreIntegrationMultiStore('shopify', shopNames),
            {
                wrapper: ({ children }) => (
                    <Provider store={store}>{children}</Provider>
                ),
            },
        )

        expect(hook.result.current).toEqual({
            [SHOP_NAME_1]: undefined,
            [SHOP_NAME_2]: undefined,
        })
    })

    it('should return the integration when found for type + shopName', () => {
        const store = configureMockStore()({
            billing: fromJS(billingState),
            integrations: fromJS({
                integrations: [
                    { id: 1, type: 'email' },
                    {
                        id: 2,
                        name: 'Shopify Store 1',
                        type: IntegrationType.Shopify,
                        meta: { shop_name: SHOP_NAME_1 },
                    },
                ],
            }),
        })

        const hook = renderHook(
            () =>
                useSelfServiceStoreIntegrationMultiStore('shopify', shopNames),
            {
                wrapper: ({ children }) => (
                    <Provider store={store}>{children}</Provider>
                ),
            },
        )

        expect(hook.result.current).toEqual({
            [SHOP_NAME_1]: {
                id: 2,
                name: 'Shopify Store 1',
                type: IntegrationType.Shopify,
                meta: { shop_name: SHOP_NAME_1 },
            },
            [SHOP_NAME_2]: undefined,
        })
    })
})

import React, { ComponentType } from 'react'

import { renderHook } from '@testing-library/react-hooks'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { createStore } from 'redux'

import { IntegrationType } from 'models/integration/types'
import { useGetNamespacedShopNameForStore } from 'pages/stats/convert/hooks/useGetNamespacedShopNameForStore'
import { RootState } from 'state/types'

const defaultState = {
    integrations: fromJS({
        integrations: [
            {
                id: 1,
                type: IntegrationType.Shopify,
                meta: {
                    shop_name: 'mighty-bacteria-store',
                },
            },
            {
                id: 2,
                type: IntegrationType.Shopify,
                meta: {
                    shop_name: 'dry-drop-shop',
                },
            },
            {
                id: 3,
                type: IntegrationType.BigCommerce,
                meta: {
                    shop_name: 'big-nonprofit-shop',
                },
            },
        ],
    }),
} as RootState

describe('useGetShopNameForStore', () => {
    describe('customer has several integrations', () => {
        const store = createStore((state) => state as RootState, defaultState)
        const hookOptions = {
            wrapper: (({ children }) => (
                <Provider store={store}>{children}</Provider>
            )) as ComponentType,
        }

        it.each([
            [[2], `${IntegrationType.Shopify}:dry-drop-shop`],
            [[1, 2], `${IntegrationType.Shopify}:mighty-bacteria-store`],
            [[100, 200], ''],
            [[], ''],
            [[3], ''], // for now, we allow only Shopify integrations
        ])(
            'For integration IDs "%p" returns namespaced shop name %p',
            (integrationIds, expectedName) => {
                const { result } = renderHook(
                    () => useGetNamespacedShopNameForStore(integrationIds),
                    hookOptions,
                )

                expect(result.current).toStrictEqual(expectedName)
            },
        )
    })

    describe('customer has no integrations', () => {
        it('returns empty string', () => {
            const store = createStore((state) => state as RootState, {
                ...defaultState,
                integrations: fromJS({
                    integrations: [],
                }),
            })
            const hookOptions = {
                wrapper: (({ children }) => (
                    <Provider store={store}>{children}</Provider>
                )) as ComponentType,
            }
            const { result } = renderHook(
                () => useGetNamespacedShopNameForStore([1, 2]),
                hookOptions,
            )

            expect(result.current).toStrictEqual('')
        })
    })
})

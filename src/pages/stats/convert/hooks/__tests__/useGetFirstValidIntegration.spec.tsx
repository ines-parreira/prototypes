import React, {ComponentType} from 'react'
import {createStore} from 'redux'
import {Provider} from 'react-redux'

import {fromJS} from 'immutable'

import {renderHook} from '@testing-library/react-hooks'

import {RootState} from 'state/types'

import {IntegrationType} from 'models/integration/types'
import {useGetFirstValidIntegration} from 'pages/stats/convert/hooks/useGetFirstValidIntegration'

const integrationBigCommerce = {
    id: 3,
    type: IntegrationType.BigCommerce,
    meta: {
        shop_name: 'big-nonprofit-shop',
    },
}

const integrationFirstShopify = {
    id: 1,
    type: IntegrationType.Shopify,
    meta: {
        shop_name: 'mighty-bacteria-store',
    },
}

const integrationSecondShopify = {
    id: 2,
    type: IntegrationType.Shopify,
    meta: {
        shop_name: 'dry-drop-shop',
    },
}

const defaultState = {
    integrations: fromJS({
        integrations: [
            integrationBigCommerce,
            integrationFirstShopify,
            integrationSecondShopify,
        ],
    }),
} as RootState

describe('useGetFirstValidIntegration', () => {
    describe('customer has several integrations', () => {
        const store = createStore((state) => state as RootState, defaultState)
        const hookOptions = {
            wrapper: (({children}) => (
                <Provider store={store}>{children}</Provider>
            )) as ComponentType,
        }

        it.each([
            [[integrationSecondShopify.id], integrationSecondShopify],
            [
                [integrationFirstShopify.id, integrationSecondShopify.id],
                integrationFirstShopify,
            ],
            [[100, 200], null],
            [[], null],
            [[3], null], // for now, we allow only Shopify integrations
        ])(
            'For integration IDs "%p" returns only one selected integration ID %p',
            (integrationIds, expectedIntegration) => {
                const {result} = renderHook(
                    () => useGetFirstValidIntegration(integrationIds),
                    hookOptions
                )

                expect(result.current).toStrictEqual(expectedIntegration)
            }
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
                wrapper: (({children}) => (
                    <Provider store={store}>{children}</Provider>
                )) as ComponentType,
            }
            const {result} = renderHook(
                () => useGetFirstValidIntegration([1, 2]),
                hookOptions
            )

            expect(result.current).toStrictEqual(null)
        })
    })
})

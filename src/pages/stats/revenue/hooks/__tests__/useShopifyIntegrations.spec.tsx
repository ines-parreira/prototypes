import React, {ComponentType} from 'react'
import {createStore} from 'redux'
import {Provider} from 'react-redux'

import {fromJS} from 'immutable'

import {renderHook} from '@testing-library/react-hooks'

import {RootState} from 'state/types'

import {IntegrationType} from 'models/integration/types'

import {useShopifyIntegrations} from '../useShopifyIntegrations'

const defaultState = {
    integrations: fromJS({
        integrations: [
            {
                id: 1,
                name: 'Microsoft',
                type: IntegrationType.Gmail,
            },
            {
                id: 2,
                name: 'Meta',
                type: IntegrationType.Shopify,
            },
            {
                id: 3,
                name: 'Alphabet',
                type: IntegrationType.Shopify,
            },
        ],
    }),
} as RootState

describe('useShopifyIntegrations', () => {
    describe('customer has several integrations', () => {
        it('returns only the ordered shopify integrations', () => {
            const store = createStore(
                (state) => state as RootState,
                defaultState
            )
            const hookOptions = {
                wrapper: (({children}) => (
                    <Provider store={store}>{children}</Provider>
                )) as ComponentType,
            }
            const {result} = renderHook(
                () => useShopifyIntegrations(),
                hookOptions
            )

            expect(result.current).toStrictEqual([
                {
                    id: 3,
                    name: 'Alphabet',
                    type: IntegrationType.Shopify,
                },
                {
                    id: 2,
                    name: 'Meta',
                    type: IntegrationType.Shopify,
                },
            ])
        })
    })

    describe('customer has no integrations', () => {
        it('returns an empty list', () => {
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
                () => useShopifyIntegrations(),
                hookOptions
            )

            expect(result.current).toStrictEqual([])
        })
    })
})

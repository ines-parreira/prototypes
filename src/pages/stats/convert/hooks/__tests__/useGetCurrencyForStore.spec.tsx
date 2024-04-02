import React, {ComponentType} from 'react'
import {createStore} from 'redux'
import {Provider} from 'react-redux'

import {fromJS} from 'immutable'

import {renderHook} from '@testing-library/react-hooks'

import {RootState} from 'state/types'

import {IntegrationType} from 'models/integration/types'

import {useGetCurrencyForStore} from 'pages/stats/convert/hooks/useGetCurrencyForStore'

const defaultState = {
    integrations: fromJS({
        integrations: [
            {
                id: 1,
                type: IntegrationType.Shopify,
                meta: {
                    currency: 'EUR',
                },
            },
            {
                id: 2,
                type: IntegrationType.Shopify,
                meta: {
                    currency: 'JPY',
                },
            },
        ],
    }),
} as RootState

describe('useGetCurrencyForStore', () => {
    describe('customer has several integrations', () => {
        it('returns correct currency', () => {
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
                () => useGetCurrencyForStore([2]),
                hookOptions
            )

            expect(result.current).toStrictEqual('JPY')
        })

        it('returns only first currency', () => {
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
                () => useGetCurrencyForStore([1, 2]),
                hookOptions
            )

            expect(result.current).toStrictEqual('EUR')
        })

        it('returns default currency USD when wrong integrations selected', () => {
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
                () => useGetCurrencyForStore([100, 200]),
                hookOptions
            )

            expect(result.current).toStrictEqual('USD')
        })

        it('returns default currency USD when no integrations selected', () => {
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
                () => useGetCurrencyForStore([]),
                hookOptions
            )

            expect(result.current).toStrictEqual('USD')
        })
    })

    describe('customer has no integrations', () => {
        it('returns default currency USD', () => {
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
                () => useGetCurrencyForStore([1, 2]),
                hookOptions
            )

            expect(result.current).toStrictEqual('USD')
        })
    })
})

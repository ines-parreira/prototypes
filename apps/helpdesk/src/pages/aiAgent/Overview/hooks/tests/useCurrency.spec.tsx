import React from 'react'

import { renderHook } from '@repo/testing'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { createStore, Store } from 'redux'

import { IntegrationType } from 'models/integration/constants'
import { RootState } from 'state/types'

import { useCurrency } from '../useCurrency'

const renderUseCurrency = (store: Store) => {
    return renderHook(() => useCurrency(), {
        wrapper: ({ children }) => (
            <Provider store={store}>{children}</Provider>
        ),
    })
}
describe('useCurrency', () => {
    describe('when customer has no integration', () => {
        it('should return USD', () => {
            const store = createStore((state) => state as RootState, {
                integrations: fromJS({
                    integrations: [],
                }),
            })

            const { result } = renderUseCurrency(store)
            expect(result.current).toEqual({
                currency: 'USD',
                isCurrencyUSD: true,
            })
        })
    })

    describe('when customer has one integration', () => {
        it('should return store currency when store has a currency that is not USD', () => {
            const store = createStore((state) => state as RootState, {
                integrations: fromJS({
                    integrations: [
                        {
                            id: 1,
                            type: IntegrationType.Shopify,
                            meta: {
                                currency: 'EUR',
                            },
                        },
                    ],
                }),
            })

            const { result } = renderUseCurrency(store)
            expect(result.current).toEqual({
                currency: 'EUR',
                isCurrencyUSD: false,
            })
        })

        it('should return store currency when store has a currency that is USD', () => {
            const store = createStore((state) => state as RootState, {
                integrations: fromJS({
                    integrations: [
                        {
                            id: 1,
                            type: IntegrationType.Shopify,
                            meta: {
                                currency: 'USD',
                            },
                        },
                    ],
                }),
            })

            const { result } = renderUseCurrency(store)
            expect(result.current).toEqual({
                currency: 'USD',
                isCurrencyUSD: true,
            })
        })

        it('should return USD when store has no currency', () => {
            const store = createStore((state) => state as RootState, {
                integrations: fromJS({
                    integrations: [
                        {
                            id: 1,
                            type: IntegrationType.Shopify,
                            meta: {
                                currency: undefined,
                            },
                        },
                    ],
                }),
            })

            const { result } = renderUseCurrency(store)
            expect(result.current).toEqual({
                currency: 'USD',
                isCurrencyUSD: true,
            })
        })
    })

    describe('when customer has multiple integration', () => {
        it('should return store currency when all store have the same currency', () => {
            const store = createStore((state) => state as RootState, {
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
                                currency: 'EUR',
                            },
                        },
                    ],
                }),
            })

            const { result } = renderUseCurrency(store)
            expect(result.current).toEqual({
                currency: 'EUR',
                isCurrencyUSD: false,
            })
        })

        it('should return USD when all store do not have the same currency (all currency defined)', () => {
            const store = createStore((state) => state as RootState, {
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
            })

            const { result } = renderUseCurrency(store)
            expect(result.current).toEqual({
                currency: 'USD',
                isCurrencyUSD: true,
            })
        })

        it('should return USD when all store do not have the same currency (not all currency defined)', () => {
            const store = createStore((state) => state as RootState, {
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
                                currency: undefined,
                            },
                        },
                    ],
                }),
            })

            const { result } = renderUseCurrency(store)
            expect(result.current).toEqual({
                currency: 'USD',
                isCurrencyUSD: true,
            })
        })
    })
})

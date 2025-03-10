import React from 'react'

import { renderHook } from '@testing-library/react-hooks'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'

import { useShouldShowProfileSync } from '../helpers'

const mockStore = configureStore([])

describe('useShouldShowProfileSync', () => {
    const store = mockStore({
        integrations: fromJS({
            integrations: [{ type: 'shopify' }],
        }),
    })

    it('should return false if shopifyCustomerProfileCreationFeatureEnabled is false', () => {
        const { result } = renderHook(
            () => useShouldShowProfileSync(false, false, Map()),
            {
                wrapper: ({ children }) => (
                    <Provider store={store}>{children}</Provider>
                ),
            },
        )
        expect(result.current).toBe(false)
    })

    it('should return false if isEditing is true', () => {
        const { result } = renderHook(
            () => useShouldShowProfileSync(true, true, Map()),
            {
                wrapper: ({ children }) => (
                    <Provider store={store}>{children}</Provider>
                ),
            },
        )
        expect(result.current).toBe(false)
    })

    it('should return false if there are no shopify integrations', () => {
        const store = mockStore({
            integrations: fromJS({
                integrations: [],
            }),
        })
        const { result } = renderHook(
            () => useShouldShowProfileSync(true, false, Map()),
            {
                wrapper: ({ children }) => (
                    <Provider store={store}>{children}</Provider>
                ),
            },
        )
        expect(result.current).toBe(false)
    })

    it('should return false if customerIntegrationsData is not empty', () => {
        const { result } = renderHook(
            () =>
                useShouldShowProfileSync(
                    true,
                    false,
                    Map({ integration: 'data' }),
                ),
            {
                wrapper: ({ children }) => (
                    <Provider store={store}>{children}</Provider>
                ),
            },
        )
        expect(result.current).toBe(false)
    })

    it('should return true if there is a shopify integration, flag is on, editing is false and customerIntegrationsData is  empty', () => {
        const { result } = renderHook(
            () => useShouldShowProfileSync(true, false, Map()),
            {
                wrapper: ({ children }) => (
                    <Provider store={store}>{children}</Provider>
                ),
            },
        )
        expect(result.current).toBe(true)
    })
})

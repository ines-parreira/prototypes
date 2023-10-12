import React from 'react'
import {renderHook} from '@testing-library/react-hooks'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import {RootState, StoreDispatch} from 'state/types'
import {useShopifyIntegrationAndScope} from '../useShopifyIntegrationAndScope'

const mockedStore = configureMockStore<Partial<RootState>, StoreDispatch>()

const defaultState: Partial<RootState> = {
    integrations: fromJS({}),
}

describe('useShopifyIntegrationAndScope', () => {
    it('returns integrationId null and needScopeUpdate false if no integration is found for the shop', () => {
        const {result} = renderHook(
            () => useShopifyIntegrationAndScope('shopName'),
            {
                wrapper: ({children}) => (
                    <Provider store={mockedStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            }
        )

        expect(result.current).toEqual({
            integrationId: null,
            needScopeUpdate: false,
        })
    })

    it('returns integrationId and needScopeUpdate if an integration is found for the shop', () => {
        const store = {
            ...defaultState,
            integrations: fromJS({
                integrations: [
                    {
                        id: 1,
                        type: 'shopify',
                        meta: {
                            shop_name: 'shopWithScopeUpdate',
                            need_scope_update: true,
                        },
                    },
                    {
                        id: 2,
                        type: 'shopify',
                        meta: {
                            shop_name: 'bar',
                        },
                    },
                    {
                        id: 3,
                        type: 'facebook',
                        meta: {
                            shop_name: 'bar',
                        },
                    },
                ],
            }),
        }

        const {result} = renderHook(
            () => useShopifyIntegrationAndScope('bar'),
            {
                wrapper: ({children}) => (
                    <Provider store={mockedStore(store)}>{children}</Provider>
                ),
            }
        )

        expect(result.current).toEqual({
            integrationId: 2,
            needScopeUpdate: false,
        })

        const {result: resultWithScopeUpdate} = renderHook(
            () => useShopifyIntegrationAndScope('shopWithScopeUpdate'),
            {
                wrapper: ({children}) => (
                    <Provider store={mockedStore(store)}>{children}</Provider>
                ),
            }
        )

        expect(resultWithScopeUpdate.current).toEqual({
            integrationId: 1,
            needScopeUpdate: true,
        })
    })
})

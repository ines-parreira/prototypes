import React from 'react'
import {fromJS} from 'immutable'
import {renderHook} from '@testing-library/react-hooks'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {RootState, StoreDispatch} from 'state/types'
import useGetActionAppIntegration from '../useGetActionAppIntegration'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('useGetActionAppIntegration', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should get action app integration', () => {
        const storeState = {
            integrations: fromJS({
                integrations: [
                    {
                        type: 'shopify',
                        meta: {
                            shop_name: 'shop-name',
                            oauth: {status: 'success'},
                        },
                    },
                ],
            }),
        } as RootState

        const {result} = renderHook(
            () =>
                useGetActionAppIntegration({
                    shopName: 'shop-name',
                    appType: 'shopify',
                }),
            {
                wrapper: ({children}) => (
                    <Provider store={mockStore(storeState)}>
                        {children}
                    </Provider>
                ),
            }
        )

        expect(result.current).toEqual({
            type: 'shopify',
            meta: {shop_name: 'shop-name', oauth: {status: 'success'}},
        })
    })
})

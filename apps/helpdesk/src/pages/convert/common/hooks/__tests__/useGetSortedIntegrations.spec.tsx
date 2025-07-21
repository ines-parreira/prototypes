import React from 'react'

import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { RootState, StoreDispatch } from 'state/types'
import { renderHook } from 'utils/testing/renderHook'

import { useGetSortedIntegrations } from '../useGetSortedIntegrations'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const defaultState: Partial<RootState> = {
    integrations: fromJS({
        integrations: [
            { type: 'gorgias_chat', name: 'Best chat' },
            { type: 'gorgias_chat', name: 'Absolutely best chat' },
            { type: 'gorgias_chat', name: 'Absent-minded chat' },
            { type: 'shopify', name: 'Absolutely does not matter' },
        ],
    }),
}

const renderHookWithStore = (store: any) =>
    renderHook(() => useGetSortedIntegrations(), {
        wrapper: ({ children }) => (
            <Provider store={store}>{children}</Provider>
        ),
    })

describe('useGetSortedIntegrations', () => {
    it('should return sorted integrations', () => {
        const { result } = renderHookWithStore(mockStore(defaultState))

        expect(result.current.length).toBe(3)

        const names = result.current.map((integration) => integration.name)
        expect(names).toEqual([
            'Absent-minded chat',
            'Absolutely best chat',
            'Best chat',
        ])
    })
})

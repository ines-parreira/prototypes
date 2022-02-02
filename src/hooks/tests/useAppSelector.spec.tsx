import React, {ComponentType} from 'react'
import _keyBy from 'lodash/keyBy'
import {Provider} from 'react-redux'
import {act, renderHook} from 'react-hooks-testing-library'
import configureMockStore from 'redux-mock-store'
import {createStore} from 'redux'

import {tags} from 'fixtures/tag'
import useAppSelector from 'hooks/useAppSelector'
import {RootState, StoreDispatch} from 'state/types'

const mockStore = configureMockStore<RootState, StoreDispatch>()

describe('useAppSelector', () => {
    const defaultState = {
        entities: {
            tags: _keyBy(tags, 'id'),
        },
    } as RootState

    it('should select value from the store', () => {
        const {result} = renderHook(
            () => useAppSelector((state) => state.entities.tags['1']),
            {
                wrapper: (({children}) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                )) as ComponentType,
            }
        )

        expect(result.current).toMatchSnapshot()
    })

    it('should accept equality function argument', () => {
        const store = createStore((state) => state as RootState, defaultState)
        const equalityFn = jest.fn()
        const selector = (state: RootState) => state.entities.tags['1']

        renderHook(() => useAppSelector(selector, equalityFn), {
            wrapper: (({children}) => (
                <Provider store={store}>{children}</Provider>
            )) as ComponentType,
        })

        equalityFn.mockReset()
        act(() => {
            store.dispatch({type: 'foo'})
        })

        expect(equalityFn.mock.calls).toMatchSnapshot()
    })
})

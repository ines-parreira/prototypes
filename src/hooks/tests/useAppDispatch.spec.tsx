import React, {ReactNode} from 'react'
import {renderHook} from 'react-hooks-testing-library'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import {StoreDispatch, RootState} from '../../state/types'
import useAppDispatch from '../useAppDispatch'

describe('useAppDispatch', () => {
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])
    let store = mockStore({})

    beforeEach(() => {
        jest.resetAllMocks
        store = mockStore({})
    })

    it('should dispatch a sync action', () => {
        const {
            result: {current: dispatch},
        } = renderHook(useAppDispatch, {
            wrapper: ({children}: {children?: ReactNode}) => (
                <Provider store={store}>{children}</Provider>
            ),
        })

        dispatch((() => ({type: 'Foo', payload: 'foo'}))())
        expect(store.getActions()).toMatchSnapshot()
    })

    it('should dispatch an async action', async () => {
        const {
            result: {current: dispatch},
        } = renderHook(useAppDispatch, {
            wrapper: ({children}: {children?: ReactNode}) => (
                <Provider store={store}>{children}</Provider>
            ),
        })

        await dispatch(
            (() => async (dispatch: StoreDispatch) => {
                await new Promise<void>((resolve) => {
                    resolve()
                })
                dispatch({type: 'Bar', payload: 'bar'})
            })()
        )
        expect(store.getActions()).toMatchSnapshot()
    })
})

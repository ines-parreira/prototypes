import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'
import _keyBy from 'lodash/keyBy'
import { Provider } from 'react-redux'
import { createStore } from 'redux'

import { tags } from 'fixtures/tag'
import useAppSelector from 'hooks/useAppSelector'
import type { RootState } from 'state/types'

describe('useAppSelector', () => {
    const defaultState = {
        entities: {
            tags: _keyBy(tags, 'id'),
        },
    } as RootState

    it('should select value from the store', () => {
        const { result } = renderHook(
            () => useAppSelector((state) => state.entities.tags['1']),
            {
                storeState: defaultState,
            },
        )

        expect(result.current).toMatchSnapshot()
    })

    it('should accept equality function argument', () => {
        const store = createStore((state) => state as RootState, defaultState)
        const equalityFn = jest.fn()
        const selector = (state: RootState) => state.entities.tags['1']

        renderHook(() => useAppSelector(selector, equalityFn), {
            wrapper: ({ children }) => (
                <Provider store={store}>{children}</Provider>
            ),
        })

        equalityFn.mockReset()
        act(() => {
            store.dispatch({ type: 'foo' })
        })

        expect(equalityFn.mock.calls).toMatchSnapshot()
    })
})

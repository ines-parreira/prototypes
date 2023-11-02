import {act, renderHook} from '@testing-library/react-hooks'

import usePersistedState from '../usePersistedState'

const PERSIST_KEY = 'persist-key'
const INITIAL_VALUE = true

describe('usePersistedState', () => {
    let getItemMock: jest.SpyInstance

    beforeEach(() => {
        getItemMock = jest.spyOn(localStorage, 'getItem').mockReturnValue(null)
        jest.spyOn(localStorage, 'setItem')
    })

    it('should return the given initial value and set it if there is no persisted value', () => {
        const {result} = renderHook(() =>
            usePersistedState(PERSIST_KEY, INITIAL_VALUE)
        )

        expect(localStorage.getItem).toHaveBeenCalledWith(PERSIST_KEY)
        expect(localStorage.setItem).toHaveBeenCalledWith(PERSIST_KEY, 'true')
        expect(result.current).toEqual([INITIAL_VALUE, expect.any(Function)])
    })

    it('should prefer a persisted value over the given initial value', () => {
        getItemMock.mockReturnValue('false')
        const {result} = renderHook(() =>
            usePersistedState(PERSIST_KEY, INITIAL_VALUE)
        )

        expect(result.current).toEqual([false, expect.any(Function)])
    })

    it('should change the value when the setter is called', () => {
        const {result} = renderHook(() =>
            usePersistedState(PERSIST_KEY, INITIAL_VALUE)
        )

        expect(result.current).toEqual([true, expect.any(Function)])

        const [, setter] = result.current
        act(() => {
            setter(false)
        })

        expect(result.current).toEqual([false, expect.any(Function)])
    })
})

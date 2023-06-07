import {renderHook} from '@testing-library/react-hooks'

import {useActiveState} from '../useActiveState'

const setSearch = jest.fn()

describe('useActiveState', () => {
    it('should return the correct state', () => {
        const {result} = renderHook(() => useActiveState(setSearch))

        expect(result.current).toEqual([false, expect.any(Function)])
    })

    it('should set the state to active and not call the provided function', () => {
        const {result} = renderHook(() => useActiveState(setSearch))

        result.current[1](true)

        expect(result.current).toEqual([true, expect.any(Function)])
        expect(setSearch).not.toHaveBeenCalled()
    })

    it('should set the state to inactive and call the provided function', () => {
        const {result} = renderHook(() => useActiveState(setSearch))

        result.current[1](true)
        result.current[1](false)

        expect(result.current).toEqual([false, expect.any(Function)])
        expect(setSearch).toHaveBeenCalledWith('')
    })
})

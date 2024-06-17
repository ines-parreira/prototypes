import {renderHook} from '@testing-library/react-hooks'
import {useImmerState} from '../useImmerState'

describe('useImmerState', () => {
    it('should return the initial state', () => {
        const initialState = {key: {nestedKey: 'value'}}
        const {result} = renderHook(() => useImmerState(initialState))
        expect(result.current[0]).toEqual(initialState)
    })

    it('should update the state with the new value, and let previous state untouched', () => {
        const initialState = {key: 'value'}
        const newValue = 'newValue'
        const {result} = renderHook(() => useImmerState(initialState))
        result.current[1]('key.nestedKey', newValue)
        expect(result.current[0]).toEqual({key: {nestedKey: newValue}})
        expect(initialState).toEqual({key: 'value'})
    })
})

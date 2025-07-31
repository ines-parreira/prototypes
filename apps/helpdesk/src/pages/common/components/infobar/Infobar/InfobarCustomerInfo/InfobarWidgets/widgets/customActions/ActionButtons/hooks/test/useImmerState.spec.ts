import { renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'

import { useImmerState } from '../useImmerState'

describe('useImmerState', () => {
    it('should return the initial state', async () => {
        const initialState = { key: { nestedKey: 'value' } }
        const { result } = renderHook(() => useImmerState(initialState))

        await waitFor(() => {
            expect(result.current[0]).toEqual(initialState)
        })
    })

    it('should update the state with the new value, and let previous state untouched', async () => {
        const initialState = { key: 'value' }
        const newValue = 'newValue'
        const { result } = renderHook(() => useImmerState(initialState))
        result.current[1]('key.nestedKey', newValue)

        await waitFor(() => {
            expect(result.current[0]).toEqual({ key: { nestedKey: newValue } })
            expect(initialState).toEqual({ key: 'value' })
        })
    })
})

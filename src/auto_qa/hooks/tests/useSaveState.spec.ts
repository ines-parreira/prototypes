import { act } from '@testing-library/react'

import { renderHook } from 'utils/testing/renderHook'

import useSaveState from '../useSaveState'

describe('useSaveState', () => {
    it('should return idle by default', () => {
        const { result } = renderHook(() => useSaveState(false))
        expect(result.current).toBe('idle')
    })

    it('should return saving when the saving state changes', () => {
        const { rerender, result } = renderHook((isSaving: boolean) =>
            useSaveState(isSaving),
        )

        act(() => {
            rerender(true)
        })
        expect(result.current).toBe('saving')
    })

    it('should return saved when the saving state changes from true to false', () => {
        const { rerender, result } = renderHook((isSaving: boolean) =>
            useSaveState(isSaving),
        )

        act(() => {
            rerender(true)
        })
        act(() => {
            rerender(false)
        })
        expect(result.current).toBe('saved')
    })

    it('should return idle after the state changed to saved for 3 seconds', () => {
        jest.useFakeTimers()

        const { rerender, result } = renderHook((isSaving: boolean) =>
            useSaveState(isSaving),
        )

        act(() => {
            rerender(true)
        })
        act(() => {
            rerender(false)
        })
        act(() => {
            jest.advanceTimersByTime(3000)
        })
        expect(result.current).toBe('idle')
    })
})

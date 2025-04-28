import { act } from '@testing-library/react-hooks'

import { renderHook } from 'utils/testing/renderHook'

import { EmbedMode } from '../types'
import { DEFAULT_VALUES, usePageEmbedmentForm } from '../usePageEmbedmentForm'

describe('usePageEmbedmentForm()', () => {
    it('should initialize with default values', () => {
        const { result } = renderHook(() => usePageEmbedmentForm())
        const { state } = result.current

        expect(state).toEqual(DEFAULT_VALUES)
    })

    it('should dispatch actions and update state correctly', () => {
        const { result } = renderHook(() => usePageEmbedmentForm())
        const { dispatch, reset, isPristine } = result.current

        expect(isPristine).toBe(true)

        // edit the form values
        act(() => {
            dispatch({
                type: 'setEmbedMode',
                payload: EmbedMode.EXISTING_PAGE,
            })
        })

        const {
            state: stateAfterDispatch,
            isPristine: isPristineAfterDispatch,
        } = result.current
        expect(isPristineAfterDispatch).toBe(false)
        expect(stateAfterDispatch.embedMode).toBe(EmbedMode.EXISTING_PAGE)

        // reset the form
        act(() => {
            reset()
        })

        const { state: stateAfterReset, isPristine: isPristineAfterReset } =
            result.current
        expect(stateAfterReset.embedMode).toBe(EmbedMode.NEW_PAGE)
        expect(isPristineAfterReset).toBe(true)
    })

    it('should reset the state correctly', () => {
        const { result } = renderHook(() => usePageEmbedmentForm())
        const { dispatch, reset } = result.current

        // Dispatch actions to update state
        act(() => {
            dispatch({
                type: 'setEmbedMode',
                payload: EmbedMode.NEW_PAGE,
            })

            dispatch({
                type: 'setPageName',
                payload: {
                    value: 'Test Page',
                    error: '',
                },
            })
        })

        // Validate if the state is updated correctly
        const { state, isPristine: isPristineAfterUpdate } = result.current
        expect(state.embedMode).toBe(EmbedMode.NEW_PAGE)
        expect(state.pageName).toEqual({
            value: 'Test Page',
            error: '',
        })
        expect(isPristineAfterUpdate).toBe(false)

        // Reset the state
        act(() => {
            reset()
        })

        // Validate if the state is reset to default values
        const { state: resetState, isPristine: isPristineAfterReset } =
            result.current
        expect(resetState).toEqual(DEFAULT_VALUES)
        expect(isPristineAfterReset).toBe(true)
    })
})

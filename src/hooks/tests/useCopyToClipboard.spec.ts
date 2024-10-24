import {act, renderHook} from '@testing-library/react-hooks'
import writeText from 'copy-to-clipboard'
import noop from 'lodash/noop'

import useCopyToClipboard from '../useCopyToClipboard'

const valueToRaiseMockException =
    'fake input causing exception in copy to clipboard'

jest.mock('copy-to-clipboard', () =>
    jest.fn().mockImplementation((input) => {
        if (input === valueToRaiseMockException) {
            throw new Error(input)
        }
        return true
    })
)

const consoleErrorSpy = jest
    .spyOn(global.console, 'error')
    .mockImplementation(noop)

describe('useCopyToClipboard', () => {
    it('should pass a given value to copy to clipboard and set state', () => {
        const hook = renderHook(() => useCopyToClipboard())

        const testValue = 'test'
        let [state, copyToClipboard] = hook.result.current
        act(() => copyToClipboard(testValue))
        ;[state, copyToClipboard] = hook.result.current

        expect(writeText).toBeCalled()
        expect(state.value).toBe(testValue)
        expect(state.noUserInteraction).toBe(true)
        expect(state.error).not.toBeDefined()
    })

    it('should not call writeText if passed an invalid input and set state', () => {
        const hook = renderHook(() => useCopyToClipboard())

        let invalidValue = {} as any
        let [state, copyToClipboard] = hook.result.current

        act(() => copyToClipboard(invalidValue))
        ;[state, copyToClipboard] = hook.result.current

        expect(writeText).not.toBeCalled()
        expect(state.value).toBe(invalidValue)
        expect(state.noUserInteraction).toBe(true)
        expect(state.error).toBeDefined()

        invalidValue = ''
        act(() => copyToClipboard(invalidValue))
        ;[state, copyToClipboard] = hook.result.current

        expect(writeText).not.toBeCalled()
        expect(state.value).toBe(invalidValue)
        expect(state.noUserInteraction).toBe(true)
        expect(state.error).toBeDefined()
    })

    it('should catch exception thrown by copy-to-clipboard and set state', () => {
        const hook = renderHook(() => useCopyToClipboard())

        let [state, copyToClipboard] = hook.result.current
        act(() => copyToClipboard(valueToRaiseMockException))
        ;[state, copyToClipboard] = hook.result.current

        expect(writeText).toBeCalledWith(valueToRaiseMockException)
        expect(state.value).toBe(valueToRaiseMockException)
        expect(state.noUserInteraction).not.toBeDefined()
        expect(state.error).toStrictEqual(new Error(valueToRaiseMockException))
    })

    it('should return initial state while unmounted', () => {
        const hook = renderHook(() => useCopyToClipboard())

        hook.unmount()
        const [state, copyToClipboard] = hook.result.current

        act(() => copyToClipboard('value'))

        expect(state.value).not.toBeDefined()
        expect(state.error).not.toBeDefined()
        expect(state.noUserInteraction).toBe(true)
    })

    it('should console error if in dev environment', () => {
        const ORIGINAL_NODE_ENV = process.env.NODE_ENV
        const invalidValue = {} as any
        process.env.NODE_ENV = 'development'

        const hook = renderHook(() => useCopyToClipboard())

        let [state, copyToClipboard] = hook.result.current
        act(() => copyToClipboard(invalidValue))
        process.env.NODE_ENV = ORIGINAL_NODE_ENV
        ;[state, copyToClipboard] = hook.result.current

        expect(writeText).not.toBeCalled()
        expect(consoleErrorSpy).toBeCalled()
        expect(state.value).toBe(invalidValue)
        expect(state.noUserInteraction).toBe(true)
        expect(state.error).toBeDefined()
    })
})

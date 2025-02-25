import { act, renderHook } from '@testing-library/react-hooks'

import useAsyncFn from '../useAsyncFn'

type AdderFn = (a?: number, b?: number) => Promise<number>

describe('useAsyncFn', () => {
    it('should be defined', () => {
        expect(useAsyncFn).toBeDefined()
    })

    it('should await the callback and return the value', async () => {
        const adder: AdderFn = (a, b) => {
            return Promise.resolve((a || 0) + (b || 0))
        }

        const hook = renderHook(() => useAsyncFn(adder))

        expect.assertions(3)

        const [, callback] = hook.result.current
        let result

        await act(async () => {
            result = await callback(5, 7)
        })

        expect(result).toEqual(12)

        const [state] = hook.result.current

        expect(state.value).toEqual(12)
        expect(result).toEqual(state.value)
    })

    describe('args can be passed to the function', () => {
        const adder: AdderFn = jest.fn((a, b) => {
            return Promise.resolve((a || 0) + (b || 0))
        })

        const renderUseAsyncFn = () =>
            renderHook(({ fn }) => useAsyncFn(fn), {
                initialProps: { fn: adder },
            })

        it('should not have a value initially', () => {
            const hook = renderUseAsyncFn()
            const [state] = hook.result.current

            expect(state.value).toEqual(undefined)
            expect(state.loading).toEqual(false)
            expect(state.error).toEqual(undefined)
            expect(adder).toBeCalledTimes(0)
        })

        it('should resolve a value derived from args when invoked', async () => {
            const hook = renderUseAsyncFn()

            expect.assertions(4)

            const [, callback] = hook.result.current

            act(() => {
                void callback(2, 7)
            })
            hook.rerender({ fn: (...args) => adder(...args) })
            await hook.waitForNextUpdate()

            const [state] = hook.result.current

            expect(adder).toBeCalledTimes(1)
            expect(state.loading).toEqual(false)
            expect(state.error).toEqual(undefined)
            expect(state.value).toEqual(9)
        })
    })

    it('should only consider last call and discard previous ones', async () => {
        const queuedPromises: { id: number; resolve: () => void }[] = []
        const delayedFunction1 = () => {
            return new Promise<number>((resolve) =>
                queuedPromises.push({ id: 1, resolve: () => resolve(1) }),
            )
        }
        const delayedFunction2 = () => {
            return new Promise<number>((resolve) =>
                queuedPromises.push({ id: 2, resolve: () => resolve(2) }),
            )
        }

        const hook = renderHook(({ fn }) => useAsyncFn(fn, [fn]), {
            initialProps: { fn: delayedFunction1 },
        })
        act(() => {
            void hook.result.current[1]() // invoke 1st callback
        })

        hook.rerender({ fn: delayedFunction2 })
        act(() => {
            void hook.result.current[1]() // invoke 2nd callback
        })

        act(() => {
            queuedPromises[1].resolve()
            queuedPromises[0].resolve()
        })
        await hook.waitForNextUpdate()
        expect(hook.result.current[0]).toEqual({ loading: false, value: 2 })
    })

    it('should keep the value of initialState when loading', async () => {
        const fetch = () => Promise.resolve('new state')
        const initialState = { loading: false, value: 'init state' }

        const hook = renderHook(
            ({ fn }) => useAsyncFn(fn, [fn], initialState),
            {
                initialProps: { fn: fetch },
            },
        )

        const [state, callback] = hook.result.current
        expect(state.loading).toBe(false)
        expect(state.value).toBe('init state')

        act(() => {
            void callback()
        })

        expect(hook.result.current[0].loading).toBe(true)
        expect(hook.result.current[0].value).toBe('init state')

        await hook.waitForNextUpdate()
        expect(hook.result.current[0].loading).toBe(false)
        expect(hook.result.current[0].value).toBe('new state')
    })
})

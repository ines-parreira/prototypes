import {DependencyList, useCallback, useRef, useState} from 'react'
import useIsMounted from './useIsMounted'

export type AsyncFnState<T> =
    | {
          loading: boolean
          error?: undefined
          value?: undefined
      }
    | {
          loading: true
          error?: Error | undefined
          value?: T
      }
    | {
          loading: false
          error: Error
          value?: undefined
      }
    | {
          loading: false
          error?: undefined
          value: T
      }

type FunctionReturningPromise = (...args: any[]) => Promise<any>

type StateFromFunctionReturningPromise<T extends FunctionReturningPromise> =
    AsyncFnState<Awaited<ReturnType<T>>>

type AsyncFnResult<
    T extends FunctionReturningPromise = FunctionReturningPromise,
> = [StateFromFunctionReturningPromise<T>, T]

export default function useAsyncFn<T extends FunctionReturningPromise>(
    fn: T,
    deps: DependencyList = [],
    initialState: StateFromFunctionReturningPromise<T> = {loading: false}
): AsyncFnResult<T> {
    const lastCallId = useRef(0)
    const isMounted = useIsMounted()
    const [state, set] =
        useState<StateFromFunctionReturningPromise<T>>(initialState)

    const callback = useCallback(
        (...args: Parameters<T>): ReturnType<T> => {
            const callId = ++lastCallId.current

            set((prevState) => ({...prevState, loading: true}))

            return fn(...args).then(
                (value) => {
                    isMounted() &&
                        callId === lastCallId.current &&
                        set({value, loading: false})

                    return value as unknown
                },
                (error) => {
                    isMounted() &&
                        callId === lastCallId.current &&
                        set({error, loading: false})

                    return error as unknown
                }
            ) as ReturnType<T>
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        deps
    )

    return [state, callback as unknown as T]
}

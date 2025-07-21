import { useCallback, useEffect, useRef } from 'react'

import axios, { CancelToken, CancelTokenSource } from 'axios'

type FnReturningPromise = (...args: any[]) => Promise<unknown>

const useCancellableRequest = <T extends FnReturningPromise>(
    fn: (cancelToken: CancelToken) => T,
): [T, () => void] => {
    const cancelTokenSourceRef = useRef<Maybe<CancelTokenSource>>()
    const cancel = useCallback(() => {
        if (cancelTokenSourceRef.current) {
            cancelTokenSourceRef.current.cancel()
        }
    }, [])
    const request = useCallback(
        async (...args: Parameters<T>): Promise<ReturnType<T> | undefined> => {
            const cancelTokenSource = axios.CancelToken.source()

            cancel()
            cancelTokenSourceRef.current = cancelTokenSource
            try {
                const res = (await fn(cancelTokenSource.token)(
                    ...args,
                )) as ReturnType<T>
                return res
            } catch (error) {
                if (!axios.isCancel(error)) {
                    throw error
                }
            }
        },
        [fn, cancel],
    )
    useEffect(() => cancel, [cancel])

    return [request as T, cancel]
}

export default useCancellableRequest

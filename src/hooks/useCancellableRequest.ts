import axios, {CancelTokenSource, CancelToken} from 'axios'
import {useRef, useEffect, useCallback} from 'react'

type FnReturningPromise = (...args: any[]) => Promise<any>

const useCancellableRequest = <T extends FnReturningPromise>(
    fn: (cancelToken: CancelToken) => T
): [T, () => void] => {
    const cancelTokenSourceRef = useRef<Maybe<CancelTokenSource>>()
    const cancel = useCallback(() => {
        if (cancelTokenSourceRef.current) {
            cancelTokenSourceRef.current.cancel()
        }
    }, [])
    const request = useCallback(
        async (...args) => {
            const cancelTokenSource = axios.CancelToken.source()

            cancel()
            cancelTokenSourceRef.current = cancelTokenSource
            try {
                const res = (await fn(cancelTokenSource.token)(
                    ...args
                )) as ReturnType<T>
                return res
            } catch (error) {
                if (!axios.isCancel(error)) {
                    throw error
                }
            }
        },
        [fn]
    )
    useEffect(() => cancel, [cancel])

    return [request as T, cancel]
}

export default useCancellableRequest

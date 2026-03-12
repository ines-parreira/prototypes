import { useCallback, useEffect, useRef } from 'react'

import type { CancelToken, CancelTokenSource } from 'axios'
import axios, { isCancel } from 'axios'

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
            // oxlint-disable-next-line import/no-named-as-default-member -- axios exposes CancelToken.source() on the default export at runtime.
            const cancelTokenSource = axios.CancelToken.source()

            cancel()
            cancelTokenSourceRef.current = cancelTokenSource
            try {
                const res = (await fn(cancelTokenSource.token)(
                    ...args,
                )) as ReturnType<T>
                return res
            } catch (error) {
                if (!isCancel(error)) {
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

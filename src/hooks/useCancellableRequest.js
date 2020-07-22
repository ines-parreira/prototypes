//@flow
import axios, {
    CancelToken,
    type CancelTokenSource,
    type CancelToken as CancelTokenType,
} from 'axios'
//$FlowFixMe
import {useRef, useEffect, useCallback} from 'react'

const useCancellableRequest = <T: Function>(
    fn: (cancelToken: CancelTokenType) => T
): [T, () => void] => {
    const cancelTokenSourceRef = useRef<?CancelTokenSource>()
    const cancel = useCallback(() => {
        if (cancelTokenSourceRef.current) {
            cancelTokenSourceRef.current.cancel()
        }
    }, [])
    const request = useCallback(
        async (
            ...args: $Call<<A: $ReadOnlyArray<mixed>>((...A) => mixed) => A, T>
        ) => {
            const cancelTokenSource = CancelToken.source()

            cancel()
            cancelTokenSourceRef.current = cancelTokenSource
            try {
                return await fn(cancelTokenSource.token)(...args)
            } catch (error) {
                if (!axios.isCancel(error)) {
                    throw error
                }
            }
        },
        [fn]
    )
    useEffect(() => cancel, [cancel])

    return [request, cancel]
}

export default useCancellableRequest

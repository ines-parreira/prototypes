import { useEffect, useRef } from 'react'

import { isEqual } from 'lodash'

/**
 * A custom hook that runs a side effect only when the deep comparison of dependencies changes.
 * Unlike React's default `useEffect`, which does a shallow comparison of dependencies,
 * this hook uses deep equality checks (via lodash's `isEqual`) to determine whether
 * the effect should run.
 *
 * @param callback - The side effect function to run when dependencies change.
 * @param dependencies - An array of dependencies that will be deeply compared.
 *
 * @example
 * useDeepEffect(() => {
 *   // Side effect logic here
 * }, [complexObject]);
 */

export const useDeepEffect = (callback: () => void, dependencies: any[]) => {
    const previousDepsRef = useRef<any[]>()

    useEffect(() => {
        if (
            !previousDepsRef.current ||
            !isEqual(previousDepsRef.current, dependencies)
        ) {
            previousDepsRef.current = dependencies
            callback()
        }
    }, [callback, dependencies])
}

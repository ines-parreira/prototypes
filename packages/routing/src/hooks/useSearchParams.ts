import { useCallback, useMemo, useRef } from 'react'

import { useHistory, useLocation } from 'react-router-dom'

/**
 * Mirrors the useSearchParams hook from react-router-dom v7
 * with a small QoL improvement (Additional "draft" object available in the setSearchParams callback)
 */

type URLSearchParamsInit =
    | string
    | Record<string, string | string[]>
    | URLSearchParams
    | Array<[string, string]>

/**
 * Set the search params.
 *
 * @param nextInit - Either a URLSearchParamsInit or a function that receives the current params
 *
 * @example
 * Delete a search param:
 * ```typescript
 * setSearchParams((sp) => {
 *   sp.delete('param')
 *   return sp
 * })
 * ```
 *
 * @example
 * Add/update search params while preserving existing ones:
 * ```typescript
 * setSearchParams((prev, draft) => ({
 *     ...draft,
 *     newParam: 'newValue',
 * }))
 * ```
 */
type NextInitFn = ({
    prev,
    draft,
}: {
    prev: URLSearchParams
    draft: Record<string, string | string[]>
}) => URLSearchParamsInit

type NextInit = URLSearchParamsInit | NextInitFn

type SetURLSearchParams = (nextInit: NextInit) => void

export const useSearchParams = (
    defaultInit?: URLSearchParamsInit,
): [URLSearchParams, SetURLSearchParams] => {
    const history = useHistory()
    const { search } = useLocation()
    const hasSetInitialParams = useRef(false)

    const searchParams = useMemo(() => {
        const params = new URLSearchParams(search)

        if (!hasSetInitialParams.current && defaultInit && !search) {
            hasSetInitialParams.current = true
            return createSearchParams(defaultInit)
        }

        return params
    }, [search, defaultInit])

    const setSearchParams = useCallback<SetURLSearchParams>(
        (nextInit) => {
            const nextSearchParams =
                typeof nextInit === 'function'
                    ? createSearchParams(
                          nextInit({
                              prev: searchParams,
                              draft: Object.fromEntries(searchParams),
                          }),
                      )
                    : createSearchParams(nextInit)

            history.replace({ search: nextSearchParams.toString() })
        },
        [history, searchParams],
    )

    return [searchParams, setSearchParams]
}

function createSearchParams(init: URLSearchParamsInit): URLSearchParams {
    if (typeof init === 'string') {
        return new URLSearchParams(init)
    }

    if (init instanceof URLSearchParams) {
        return new URLSearchParams(init)
    }

    if (Array.isArray(init)) {
        return new URLSearchParams(init)
    }

    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(init)) {
        if (Array.isArray(value)) {
            for (const item of value) {
                params.append(key, item)
            }
        } else {
            params.set(key, value)
        }
    }

    return params
}

import { useCallback, useMemo } from 'react'

import type { MetricTrend } from 'domains/reporting/hooks/useMetricTrend'

const useGenericTrend = (
    hooks: { [key: string]: MetricTrend },
    transformer: (data: { [key: string]: any }) => any,
    enabled: boolean = true,
) => {
    const data = Object.entries(hooks).reduce(
        (acc, [key, hook]) => {
            acc[key] = hook
            return acc
        },
        {} as { [key: string]: any },
    )

    const calculateValues = useCallback(
        (data: { [key: string]: any }) => {
            if (Object.values(data).some((d) => !d.data)) {
                return undefined
            }

            const values = Object.entries(data).reduce(
                (acc, [key, d]) => {
                    acc[key] = d.data.value
                    return acc
                },
                {} as { [key: string]: any },
            )

            const prevValues = Object.entries(data).reduce(
                (acc, [key, d]) => {
                    acc[key] = d.data.prevValue
                    return acc
                },
                {} as { [key: string]: any },
            )

            const value = transformer(values)
            const prevValue = transformer(prevValues)

            return { value, prevValue }
        },
        [transformer],
    )

    const memoizedData = useMemo(() => {
        if (!enabled) return undefined
        return calculateValues(data)
    }, [data, calculateValues, enabled])

    const isFetching = enabled && Object.values(data).some((d) => d.isFetching)
    const isError = enabled && Object.values(data).some((d) => d.isError)

    return {
        data: memoizedData,
        isFetching,
        isError,
    }
}

const fetchGenericTrend = (
    fetchFunctions: { [key: string]: Promise<MetricTrend> },
    transformer: (data: { [key: string]: any }) => any,
) => {
    return Promise.all(
        Object.entries(fetchFunctions).map(([key, fetchFunction]) => {
            const result = fetchFunction
            if (result && typeof result.then === 'function') {
                return result.then((data) => ({ key, data }))
            }
            return { key, data: result }
        }),
    )
        .then((results) => {
            const data = results.reduce(
                (acc, { key, data }) => {
                    acc[key] = data
                    return acc
                },
                {} as { [key: string]: any },
            )

            const values = Object.entries(data).reduce(
                (acc, [key, d]) => {
                    acc[key] = d.data.value
                    return acc
                },
                {} as { [key: string]: any },
            )

            const prevValues = Object.entries(data).reduce(
                (acc, [key, d]) => {
                    acc[key] = d.data.prevValue
                    return acc
                },
                {} as { [key: string]: any },
            )

            return {
                isFetching: false,
                isError: false,
                data: {
                    value: transformer(values),
                    prevValue: transformer(prevValues),
                },
            }
        })
        .catch(() => ({
            isFetching: false,
            isError: true,
            data: undefined,
        }))
}

export { useGenericTrend, fetchGenericTrend }

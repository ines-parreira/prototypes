import {
    TicketQAScoreDimension,
    TicketQAScoreDimensionName,
    useListTicketQaScoreDimensions,
} from '@gorgias/api-queries'
import {useCallback, useEffect, useMemo, useState} from 'react'

import {dimensionOrder} from '../config'
import type {DimensionSummary} from '../types'

const defaultValues = dimensionOrder.reduce(
    (acc, name) => ({
        ...acc,
        [name]: {
            explanation: '',
            prediction: 0,
        },
    }),
    {} as Record<TicketQAScoreDimensionName, DimensionSummary>
)

export default function useAutoQA(ticketId: number) {
    const {data, isError, isLoading} = useListTicketQaScoreDimensions(ticketId)

    const [values, setValues] =
        useState<Record<TicketQAScoreDimensionName, DimensionSummary>>(
            defaultValues
        )

    useEffect(() => {
        if (!data?.data.data) return

        setValues(
            data.data.data.dimensions.reduce(
                (acc, dim) => ({
                    ...acc,
                    [dim.name]: {
                        explanation: dim.explanation,
                        prediction: dim.prediction,
                    },
                }),
                {} as Record<TicketQAScoreDimensionName, DimensionSummary>
            )
        )
    }, [data])

    const lastUpdated = useMemo(() => {
        if (!data?.data.data) return null

        const timestamps = data.data.data.dimensions.map(
            (dim) => dim.updated_datetime || dim.created_datetime
        )
        if (!timestamps.length) return null

        return Math.max(...timestamps.map((t) => new Date(t).getTime()))
    }, [data])

    const handleChange = useCallback(
        (name: string, prediction: number, explanation: string) => {
            setValues((dims) => ({
                ...dims,
                [name]: {explanation, prediction},
            }))
        },
        []
    )

    const changeHandlers = useMemo(
        () =>
            Object.values(TicketQAScoreDimensionName).reduce(
                (acc, name) => ({
                    ...acc,
                    [name]: (prediction: number, explanation: string) => {
                        handleChange(name, prediction, explanation)
                    },
                }),
                {} as Record<
                    TicketQAScoreDimensionName,
                    (prediction: number, explanation: string) => void
                >
            ),
        [handleChange]
    )

    const dimensionsMap = useMemo(
        () =>
            !data?.data.data
                ? ({} as Record<
                      TicketQAScoreDimensionName,
                      TicketQAScoreDimension
                  >)
                : data.data.data.dimensions.reduce(
                      (acc, dim) => ({
                          ...acc,
                          [dim.name]: dim,
                      }),
                      {} as Record<
                          TicketQAScoreDimensionName,
                          TicketQAScoreDimension
                      >
                  ),
        [data]
    )

    const dimensions = useMemo(
        () =>
            dimensionOrder
                .filter((name) => !!dimensionsMap[name])
                .map(
                    (name) =>
                        ({
                            ...dimensionsMap[name],
                            ...values[name],
                        } as TicketQAScoreDimension)
                ),
        [dimensionsMap, values]
    )

    return useMemo(
        () => ({changeHandlers, dimensions, isError, isLoading, lastUpdated}),
        [changeHandlers, dimensions, isError, isLoading, lastUpdated]
    )
}

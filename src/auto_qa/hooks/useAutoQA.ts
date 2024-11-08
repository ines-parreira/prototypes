import {
    TicketQAScoreDimension,
    TicketQAScoreDimensionName,
    useListTicketQaScoreDimensions,
    useUpsertTicketQaScoreDimension,
} from '@gorgias/api-queries'
import {useCallback, useMemo, useRef, useState} from 'react'

import useDebouncedEffect from 'hooks/useDebouncedEffect'

import {dimensionOrder, SupportedTicketQAScoreDimension} from '../config'
import type {DimensionSummary} from '../types'

import useSaveState from './useSaveState'

export default function useAutoQA(ticketId: number) {
    const {data, isError, isLoading, refetch} =
        useListTicketQaScoreDimensions(ticketId)
    const {isLoading: isSaving, mutateAsync: upsertTicketQaScoreDimension} =
        useUpsertTicketQaScoreDimension()

    const [values, setValues] = useState<{
        [key in TicketQAScoreDimensionName]?: DimensionSummary
    }>({})
    const [newDimensionValue, setNewDimensionValue] = useState<
        {name: TicketQAScoreDimensionName} & DimensionSummary
    >()
    const dirtyRef = useRef(false)
    const saveState = useSaveState(isSaving)

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
            dirtyRef.current = true
            setValues((dims) => ({
                ...dims,
                [name]: {explanation, prediction},
            }))
            setNewDimensionValue({
                name: name as TicketQAScoreDimensionName,
                explanation,
                prediction,
            })
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

    const dimensions: SupportedTicketQAScoreDimension[] = useMemo(
        () =>
            dimensionOrder
                .filter((name) => !!dimensionsMap[name])
                .map(
                    (name) =>
                        ({
                            ...dimensionsMap[name],
                            ...values[name],
                        }) as SupportedTicketQAScoreDimension
                ),
        [dimensionsMap, values]
    )

    useDebouncedEffect(
        () => {
            if (!dirtyRef.current) return
            dirtyRef.current = false

            void (async () => {
                await upsertTicketQaScoreDimension(
                    {
                        data: {
                            dimensions: [
                                newDimensionValue as TicketQAScoreDimension,
                            ],
                        },
                        ticketId,
                    },
                    {
                        onSuccess: () => {
                            void refetch()
                        },
                    }
                )
            })()
        },
        [newDimensionValue, ticketId, upsertTicketQaScoreDimension],
        1500
    )

    return useMemo(
        () => ({
            changeHandlers,
            dimensions,
            isError,
            isLoading,
            lastUpdated,
            saveState,
        }),
        [changeHandlers, dimensions, isError, isLoading, lastUpdated, saveState]
    )
}

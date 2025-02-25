import { useCallback, useMemo, useRef, useState } from 'react'

import {
    TicketQAScoreDimension,
    TicketQAScoreDimensionName,
    useListTicketQaScoreDimensions,
    useUpsertTicketQaScoreDimension,
} from '@gorgias/api-queries'

import useDebouncedEffect from 'hooks/useDebouncedEffect'

import {
    dimensionOrderOfManualDimensions,
    SupportedTicketQAScoreDimension,
} from '../config'
import type { DimensionSummary } from '../types'
import useSaveState from './useSaveState'

export default function useAutoQA(ticketId: number) {
    const { data, isError, isLoading, refetch } =
        useListTicketQaScoreDimensions(ticketId)
    const { isLoading: isSaving, mutate: upsertTicketQaScoreDimension } =
        useUpsertTicketQaScoreDimension()

    const [values, setValues] = useState<{
        [key in TicketQAScoreDimensionName]?: DimensionSummary
    }>({})
    const [newDimensionValue, setNewDimensionValue] = useState<
        { name: TicketQAScoreDimensionName } & DimensionSummary
    >()
    const dirtyRef = useRef(false)
    const saveState = useSaveState(isSaving)

    const lastUpdated = useMemo(() => {
        if (!data?.data.data) return null

        const timestamps = data.data.data.dimensions.map(
            (dim) => dim.updated_datetime || dim.created_datetime,
        )
        if (!timestamps.length) return null

        return Math.max(...timestamps.map((t) => new Date(t).getTime()))
    }, [data])

    const handleChange = useCallback(
        (
            name: string,
            prediction: number,
            explanation: string | undefined | null,
        ) => {
            dirtyRef.current = true
            setValues((dims) => ({
                ...dims,
                [name]: { explanation, prediction },
            }))
            const explanationText =
                explanation === null || explanation === undefined
                    ? ''
                    : explanation
            setNewDimensionValue({
                name: name as TicketQAScoreDimensionName,
                explanation: explanationText,
                prediction,
            })
        },
        [],
    )

    const changeHandlers = useMemo(
        () =>
            Object.values(TicketQAScoreDimensionName).reduce(
                (acc, name) => ({
                    ...acc,
                    [name]: (
                        prediction: number,
                        explanation: string | undefined | null,
                    ) => {
                        handleChange(name, prediction, explanation)
                    },
                }),
                {} as Record<
                    TicketQAScoreDimensionName,
                    (
                        prediction: number,
                        explanation: string | undefined | null,
                    ) => void
                >,
            ),
        [handleChange],
    )

    const dimensionsMap = useMemo(() => {
        const baseMap: Record<
            TicketQAScoreDimensionName,
            TicketQAScoreDimension | undefined
        > = !data?.data.data
            ? ({} as Record<
                  TicketQAScoreDimensionName,
                  TicketQAScoreDimension | undefined
              >)
            : data.data.data.dimensions.reduce(
                  (acc, dim) => ({
                      ...acc,
                      [dim.name]: dim,
                  }),
                  {} as Record<
                      TicketQAScoreDimensionName,
                      TicketQAScoreDimension
                  >,
              )
        // Ensure all supported dimensions are present in the map
        return baseMap
    }, [data])

    const dimensions: SupportedTicketQAScoreDimension[] = useMemo(
        () =>
            // Ensure all manually scored dimensions are present in the map
            dimensionOrderOfManualDimensions.map(
                (name) =>
                    (!dimensionsMap[name]
                        ? { name, value: null }
                        : {
                              ...dimensionsMap[name],
                              ...values[name],
                          }) as SupportedTicketQAScoreDimension,
            ),
        [dimensionsMap, values],
    )

    useDebouncedEffect(
        () => {
            if (!dirtyRef.current) return
            dirtyRef.current = false

            upsertTicketQaScoreDimension(
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
                },
            )
        },
        [newDimensionValue, ticketId, upsertTicketQaScoreDimension],
        1500,
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
        [
            changeHandlers,
            dimensions,
            isError,
            isLoading,
            lastUpdated,
            saveState,
        ],
    )
}

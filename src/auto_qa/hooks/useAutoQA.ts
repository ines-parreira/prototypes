import {useCallback, useMemo, useState} from 'react'

import {dimensionOrder} from '../config'
import type {Dimension, DimensionSummary} from '../types'

export default function useAutoQA(ticketId: number) {
    const [response] = useState<{dimensions: Dimension[]}>({
        dimensions: [
            {
                id: 1,
                ticket_id: ticketId,
                user_id: 801087805,
                created_datetime: '2024-01-20T10:00:00Z',
                updated_datetime: '2024-09-16T08:00:00Z',
                name: 'resolution',
                prediction: 0,
                explanation: 'Beep-boop',
            },
            {
                id: 2,
                ticket_id: ticketId,
                user_id: null,
                created_datetime: '2024-01-20T10:00:00Z',
                updated_datetime: '2024-01-21T10:00:00Z',
                name: 'communication_skills',
                prediction: 4,
                explanation: 'Beepity-boopity',
            },
        ],
    })

    const [values, setValues] = useState<
        Record<Dimension['name'], DimensionSummary>
    >(() =>
        response.dimensions.reduce(
            (acc, dim) => ({
                ...acc,
                [dim.name]: {
                    explanation: dim.explanation,
                    prediction: dim.prediction,
                },
            }),
            {} as Record<Dimension['name'], DimensionSummary>
        )
    )

    const lastUpdated = useMemo(
        () =>
            Math.max(
                ...response.dimensions.map((dim) =>
                    new Date(dim.updated_datetime).getTime()
                )
            ),
        [response]
    )

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
            response.dimensions.reduce(
                (acc, dim) => ({
                    ...acc,
                    [dim.name]: (prediction: number, explanation: string) => {
                        handleChange(dim.name, prediction, explanation)
                    },
                }),
                {} as Record<
                    Dimension['name'],
                    (prediction: number, explanation: string) => void
                >
            ),
        [handleChange, response]
    )

    const dimensionsMap = useMemo(
        () =>
            response.dimensions.reduce(
                (acc, dim) => ({
                    ...acc,
                    [dim.name]: dim,
                }),
                {} as Record<Dimension['name'], Dimension>
            ),
        [response]
    )

    const dimensions = useMemo(
        () =>
            dimensionOrder.map((name) => ({
                ...dimensionsMap[name],
                ...values[name],
            })),
        [dimensionsMap, values]
    )

    return useMemo(
        () => ({changeHandlers, dimensions, lastUpdated}),
        [changeHandlers, dimensions, lastUpdated]
    )
}

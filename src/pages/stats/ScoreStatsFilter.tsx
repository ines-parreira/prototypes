import React, {ComponentProps, useCallback, useMemo} from 'react'

import {mergeStatsFilters} from 'state/stats/actions'
import useAppDispatch from 'hooks/useAppDispatch'
import {StatsFilters} from 'models/stat/types'

import SelectFilter from './common/SelectFilter'

type Props = {
    value: StatsFilters['score']
    minValue: number
    maxValue: number
    isDescending?: boolean
}

export function ScoreStatsFilter({
    value = [],
    minValue,
    maxValue,
    isDescending,
}: Props) {
    const dispatch = useAppDispatch()

    const scores = useMemo(() => {
        return Array.from({length: maxValue - minValue + 1}, (value, index) => {
            const scoreValue = isDescending
                ? maxValue - index
                : index + minValue
            return {
                value: scoreValue.toString(),
                label:
                    Array(minValue + scoreValue - 1)
                        .fill('★')
                        .join('') +
                    Array(maxValue - scoreValue)
                        .fill('☆')
                        .join(''),
            }
        })
    }, [minValue, maxValue, isDescending])

    const handleFilterChange: ComponentProps<typeof SelectFilter>['onChange'] =
        useCallback(
            (values) => {
                dispatch(mergeStatsFilters({score: values as string[]}))
            },
            [dispatch]
        )

    return (
        <SelectFilter
            plural="scores"
            singular="score"
            onChange={handleFilterChange}
            value={value}
        >
            {scores.map((score) => (
                <SelectFilter.Item
                    key={score.value}
                    label={score.label}
                    value={score.value}
                />
            ))}
        </SelectFilter>
    )
}

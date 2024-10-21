import React, {useCallback} from 'react'
import {connect} from 'react-redux'
import {emptyFilter, logSegmentEvent} from 'pages/stats/common/filters/helpers'
import {RemovableFilter} from 'pages/stats/common/filters/types'

import useAppDispatch from 'hooks/useAppDispatch'
import {mergeStatsFiltersWithLogicalOperator} from 'state/stats/statsSlice'
import {FilterKey, StatsFiltersWithLogicalOperator} from 'models/stat/types'

import Filter from 'pages/stats/common/components/Filter'
import {
    LogicalOperatorEnum,
    LogicalOperatorLabel,
} from 'pages/stats/common/components/Filter/constants'
import {
    FilterLabels,
    scoreFilterLogicalOperators,
} from 'pages/stats/common/filters/constants'
import {DropdownOption} from 'pages/stats/types'
import {statFiltersClean, statFiltersDirty} from 'state/ui/stats/actions'
import {RootState} from 'state/types'
import {getPageStatsFiltersWithLogicalOperators} from 'state/stats/selectors'
import {
    getScoreLabelByValue,
    getScoreLabelsAndValues,
} from 'pages/stats/common/filters/utils'

export const MAX_SCORE_VALUE = 5

type Props = {
    value: StatsFiltersWithLogicalOperator[FilterKey.Score]
} & RemovableFilter

export function ScoreFilter({
    value = emptyFilter,
    initializeAsOpen = false,
    onRemove,
}: Props) {
    const dispatch = useAppDispatch()
    const scores = getScoreLabelsAndValues(MAX_SCORE_VALUE, true)

    const handleFilterValuesChange = useCallback(
        (values: string[]) => {
            dispatch(
                mergeStatsFiltersWithLogicalOperator({
                    score: {
                        values,
                        operator: value.operator,
                    },
                })
            )
        },
        [dispatch, value.operator]
    )

    const filterOptions = [
        {
            options: scores,
        },
    ]

    const selectedScoreOption = value.values.map((score) => ({
        value: score.toString(),
        label: getScoreLabelByValue(Number(score), MAX_SCORE_VALUE),
    }))

    const onOptionChange = (opt: DropdownOption) => {
        if (value.values.includes(opt.value)) {
            handleFilterValuesChange(
                value.values.filter((score) => score !== opt.value)
            )
        } else {
            handleFilterValuesChange([...value.values, opt.value])
        }
    }

    const handleFilterOperatorChange = useCallback(
        (operator: LogicalOperatorEnum) => {
            dispatch(
                mergeStatsFiltersWithLogicalOperator({
                    score: {
                        values: value.values,
                        operator: operator,
                    },
                })
            )
        },
        [dispatch, value.values]
    )

    const handleDropdownOpen = () => {
        dispatch(statFiltersDirty())
    }
    const handleDropdownClosed = () => {
        logSegmentEvent(FilterKey.Score, LogicalOperatorLabel[value.operator])
        dispatch(statFiltersClean())
    }

    return (
        <Filter
            filterName={FilterLabels[FilterKey.Score]}
            selectedOptions={selectedScoreOption}
            selectedLogicalOperator={value.operator}
            logicalOperators={scoreFilterLogicalOperators}
            filterOptionGroups={filterOptions}
            onChangeOption={onOptionChange}
            onSelectAll={() => {
                handleFilterValuesChange(scores.map((score) => score.value))
            }}
            onRemoveAll={() => {
                handleFilterValuesChange([])
            }}
            onRemove={() => {
                dispatch(
                    mergeStatsFiltersWithLogicalOperator({score: emptyFilter})
                )

                onRemove?.()
            }}
            onChangeLogicalOperator={handleFilterOperatorChange}
            onDropdownOpen={handleDropdownOpen}
            onDropdownClosed={handleDropdownClosed}
            initializeAsOpen={initializeAsOpen}
            showSearch={false}
        />
    )
}

export const ScoreFiltersWithState = connect((state: RootState) => ({
    value: getPageStatsFiltersWithLogicalOperators(state)[FilterKey.Score],
}))(ScoreFilter)

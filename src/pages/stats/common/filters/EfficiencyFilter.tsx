import React, { useCallback } from 'react'

import noop from 'lodash/noop'
import { connect } from 'react-redux'

import { FilterKey, StatsFiltersWithLogicalOperator } from 'models/stat/types'
import Filter from 'pages/stats/common/components/Filter'
import {
    LogicalOperatorEnum,
    LogicalOperatorLabel,
} from 'pages/stats/common/components/Filter/constants'
import {
    efficiencyFilterLogicalOperators,
    FilterLabels,
} from 'pages/stats/common/filters/constants'
import {
    emptyFilter,
    logSegmentEvent,
} from 'pages/stats/common/filters/helpers'
import {
    OptionalFilterProps,
    RemovableFilter,
} from 'pages/stats/common/filters/types'
import {
    getScoreLabelByValue,
    getScoreLabelsAndValues,
} from 'pages/stats/common/filters/utils'
import { DropdownOption } from 'pages/stats/types'
import {
    getPageStatsFiltersWithLogicalOperators,
    getSavedFiltersWithLogicalOperators,
} from 'state/stats/selectors'
import { mergeStatsFiltersWithLogicalOperator } from 'state/stats/statsSlice'
import { RootState } from 'state/types'
import { statFiltersClean, statFiltersDirty } from 'state/ui/stats/actions'
import {
    removeFilterFromSavedFilterDraft,
    upsertSavedFilterFilter,
} from 'state/ui/stats/filtersSlice'

export const MAX_SCORE_VALUE = 5

type Props = {
    value: StatsFiltersWithLogicalOperator[FilterKey.Efficiency]
    dispatchUpdate: (
        value: Exclude<
            StatsFiltersWithLogicalOperator[FilterKey.Efficiency],
            undefined
        >,
    ) => void
    dispatchRemove: () => void
    dispatchStatFiltersDirty?: () => void
    dispatchStatFiltersClean?: () => void
} & RemovableFilter &
    OptionalFilterProps

export function EfficiencyFilter({
    value = emptyFilter,
    initializeAsOpen = false,
    onRemove,
    dispatchUpdate,
    dispatchRemove,
    dispatchStatFiltersDirty = noop,
    dispatchStatFiltersClean = noop,
    warningType,
    isDisabled,
}: Props) {
    const efficiency = getScoreLabelsAndValues(MAX_SCORE_VALUE, true)

    const handleFilterValuesChange = useCallback(
        (values: string[]) => {
            dispatchUpdate({
                values,
                operator: value.operator,
            })
        },
        [dispatchUpdate, value.operator],
    )

    const filterOptions = [
        {
            options: efficiency,
        },
    ]

    const selectedScoreOption = value.values.map((score) => ({
        value: score.toString(),
        label: getScoreLabelByValue(Number(score), MAX_SCORE_VALUE),
    }))

    const onOptionChange = (opt: DropdownOption) => {
        if (value.values.includes(opt.value)) {
            handleFilterValuesChange(
                value.values.filter((score) => score !== opt.value),
            )
        } else {
            handleFilterValuesChange([...value.values, opt.value])
        }
    }

    const handleFilterOperatorChange = useCallback(
        (operator: LogicalOperatorEnum) => {
            dispatchUpdate({
                values: value.values,
                operator: operator,
            })
        },
        [dispatchUpdate, value.values],
    )

    const handleDropdownOpen = () => {
        dispatchStatFiltersDirty()
    }
    const handleDropdownClosed = () => {
        logSegmentEvent(
            FilterKey.Efficiency,
            LogicalOperatorLabel[value.operator],
        )
        dispatchStatFiltersClean()
    }

    return (
        <Filter
            filterName={FilterLabels[FilterKey.Efficiency]}
            filterErrors={{ warningType }}
            selectedOptions={selectedScoreOption}
            selectedLogicalOperator={value.operator}
            logicalOperators={efficiencyFilterLogicalOperators}
            filterOptionGroups={filterOptions}
            onChangeOption={onOptionChange}
            onSelectAll={() => {
                handleFilterValuesChange(efficiency.map((score) => score.value))
            }}
            onRemoveAll={() => {
                handleFilterValuesChange([])
            }}
            onRemove={() => {
                dispatchRemove()

                onRemove?.()
            }}
            onChangeLogicalOperator={handleFilterOperatorChange}
            onDropdownOpen={handleDropdownOpen}
            onDropdownClosed={handleDropdownClosed}
            initializeAsOpen={initializeAsOpen}
            showSearch={false}
            isDisabled={isDisabled}
        />
    )
}

export const EfficiencyFilterWithState = connect(
    (state: RootState) => ({
        value: getPageStatsFiltersWithLogicalOperators(state)[
            FilterKey.Efficiency
        ],
    }),
    {
        dispatchUpdate: (filter: Props['value']) =>
            mergeStatsFiltersWithLogicalOperator({
                efficiency: filter,
            }),
        dispatchRemove: () =>
            mergeStatsFiltersWithLogicalOperator({
                efficiency: emptyFilter,
            }),
        dispatchStatFiltersDirty: statFiltersDirty,
        dispatchStatFiltersClean: statFiltersClean,
    },
)(EfficiencyFilter)

export const EfficiencyFilterWithSavedState = connect(
    (state: RootState) => ({
        value: getSavedFiltersWithLogicalOperators(state)[FilterKey.Efficiency],
    }),
    {
        dispatchUpdate: (filter: Exclude<Props['value'], undefined>) =>
            upsertSavedFilterFilter({
                member: FilterKey.Efficiency,
                operator: filter.operator,
                values: filter.values,
            }),
        dispatchRemove: () =>
            removeFilterFromSavedFilterDraft({
                filterKey: FilterKey.Efficiency,
            }),
    },
)(EfficiencyFilter)

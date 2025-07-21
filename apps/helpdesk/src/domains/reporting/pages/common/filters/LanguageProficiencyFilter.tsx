import React, { useCallback } from 'react'

import { connect } from 'react-redux'

import {
    FilterKey,
    StatsFiltersWithLogicalOperator,
} from 'domains/reporting/models/stat/types'
import Filter from 'domains/reporting/pages/common/components/Filter'
import {
    LogicalOperatorEnum,
    LogicalOperatorLabel,
} from 'domains/reporting/pages/common/components/Filter/constants'
import {
    FilterLabels,
    languageProficiencyFilterLogicalOperators,
} from 'domains/reporting/pages/common/filters/constants'
import {
    emptyFilter,
    logSegmentEvent,
} from 'domains/reporting/pages/common/filters/helpers'
import {
    OptionalFilterProps,
    RemovableFilter,
} from 'domains/reporting/pages/common/filters/types'
import {
    getScoreLabelByValue,
    getScoreLabelsAndValues,
} from 'domains/reporting/pages/common/filters/utils'
import { DropdownOption } from 'domains/reporting/pages/types'
import {
    getPageStatsFiltersWithLogicalOperators,
    getSavedFiltersWithLogicalOperators,
} from 'domains/reporting/state/stats/selectors'
import { mergeStatsFiltersWithLogicalOperator } from 'domains/reporting/state/stats/statsSlice'
import {
    statFiltersClean,
    statFiltersDirty,
} from 'domains/reporting/state/ui/stats/actions'
import {
    removeFilterFromSavedFilterDraft,
    upsertSavedFilterFilter,
} from 'domains/reporting/state/ui/stats/filtersSlice'
import { RootState } from 'state/types'

export const MAX_SCORE_VALUE = 5

type Props = {
    value: StatsFiltersWithLogicalOperator[FilterKey.LanguageProficiency]
    dispatchUpdate: (
        value: Exclude<
            StatsFiltersWithLogicalOperator[FilterKey.LanguageProficiency],
            undefined
        >,
    ) => void
    dispatchRemove: () => void
    dispatchStatFiltersDirty: () => void
    dispatchStatFiltersClean: () => void
} & RemovableFilter &
    OptionalFilterProps

export function LanguageProficiencyFilter({
    value = emptyFilter,
    initializeAsOpen = false,
    onRemove,
    dispatchUpdate,
    dispatchRemove,
    dispatchStatFiltersDirty,
    dispatchStatFiltersClean,
    warningType,
    isDisabled,
}: Props) {
    const languageProficiency = getScoreLabelsAndValues(MAX_SCORE_VALUE, true)

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
            options: languageProficiency,
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
            FilterKey.LanguageProficiency,
            LogicalOperatorLabel[value.operator],
        )
        dispatchStatFiltersClean()
    }

    return (
        <Filter
            filterName={FilterLabels[FilterKey.LanguageProficiency]}
            filterErrors={{ warningType }}
            selectedOptions={selectedScoreOption}
            selectedLogicalOperator={value.operator}
            logicalOperators={languageProficiencyFilterLogicalOperators}
            filterOptionGroups={filterOptions}
            onChangeOption={onOptionChange}
            onSelectAll={() => {
                handleFilterValuesChange(
                    languageProficiency.map((score) => score.value),
                )
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

export const LanguageProficiencyFilterWithState = connect(
    (state: RootState) => ({
        value: getPageStatsFiltersWithLogicalOperators(state)[
            FilterKey.LanguageProficiency
        ],
    }),
    {
        dispatchUpdate: (filter: Props['value']) =>
            mergeStatsFiltersWithLogicalOperator({
                languageProficiency: filter,
            }),
        dispatchRemove: () =>
            mergeStatsFiltersWithLogicalOperator({
                languageProficiency: emptyFilter,
            }),
        dispatchStatFiltersDirty: statFiltersDirty,
        dispatchStatFiltersClean: statFiltersClean,
    },
)(LanguageProficiencyFilter)

export const LanguageProficiencyFilterWithSavedState = connect(
    (state: RootState) => ({
        value: getSavedFiltersWithLogicalOperators(state)[
            FilterKey.LanguageProficiency
        ],
    }),
    {
        dispatchUpdate: (filter: Exclude<Props['value'], undefined>) =>
            upsertSavedFilterFilter({
                member: FilterKey.LanguageProficiency,
                operator: filter.operator,
                values: filter.values,
            }),
        dispatchRemove: () =>
            removeFilterFromSavedFilterDraft({
                filterKey: FilterKey.LanguageProficiency,
            }),
        dispatchStatFiltersDirty: statFiltersDirty,
        dispatchStatFiltersClean: statFiltersClean,
    },
)(LanguageProficiencyFilter)

import React, { useCallback } from 'react'

import noop from 'lodash/noop'
import { connect } from 'react-redux'

import { FilterKey, StatsFiltersWithLogicalOperator } from 'models/stat/types'
import Filter from 'pages/stats/common/components/Filter'
import { LogicalOperatorEnum } from 'pages/stats/common/components/Filter/constants'
import {
    FilterLabels,
    resolutionCompletenessFilterLogicalOperators,
} from 'pages/stats/common/filters/constants'
import {
    emptyFilter,
    logSegmentEvent,
} from 'pages/stats/common/filters/helpers'
import {
    OptionalFilterProps,
    RemovableFilter,
} from 'pages/stats/common/filters/types'
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

const COMPLETION_OPTIONS = [
    { value: '1', label: 'Complete' },
    { value: '0', label: 'Incomplete' },
]

type Props = {
    value: StatsFiltersWithLogicalOperator[FilterKey.ResolutionCompleteness]
    dispatchUpdate: (
        value: Exclude<
            StatsFiltersWithLogicalOperator[FilterKey.ResolutionCompleteness],
            undefined
        >,
    ) => void
    dispatchRemove: () => void
    dispatchStatFiltersDirty?: () => void
    dispatchStatFiltersClean?: () => void
} & RemovableFilter &
    OptionalFilterProps

export function ResolutionCompletenessFilter({
    value = emptyFilter,
    initializeAsOpen = false,
    dispatchUpdate,
    dispatchRemove,
    dispatchStatFiltersDirty = noop,
    dispatchStatFiltersClean = noop,
    warningType,
    isDisabled,
    onRemove,
}: Props) {
    const filterOptions = [
        {
            options: COMPLETION_OPTIONS,
        },
    ]

    const handleFilterValuesChange = useCallback(
        (values: string[]) => {
            dispatchUpdate({
                values,
                operator: value.operator,
            })
        },
        [dispatchUpdate, value.operator],
    )

    const onOptionChange = (opt: DropdownOption) => {
        if (value.values.includes(opt.value)) {
            handleFilterValuesChange(
                value.values.filter((val) => val !== opt.value),
            )
        } else {
            handleFilterValuesChange([...value.values, opt.value])
        }
    }

    const selectedOptions = COMPLETION_OPTIONS.filter((option) =>
        value.values.includes(option.value),
    )

    const handleDropdownClosed = () => {
        logSegmentEvent(FilterKey.ResolutionCompleteness, null)
        dispatchStatFiltersClean()
    }

    const handleFilterOperatorChange = useCallback(
        (operator: LogicalOperatorEnum) => {
            dispatchUpdate({
                values: value.values,
                operator: operator,
            })
        },
        [dispatchUpdate, value?.values],
    )

    return (
        <Filter
            filterName={FilterLabels[FilterKey.ResolutionCompleteness]}
            filterErrors={{ warningType }}
            selectedOptions={selectedOptions}
            filterOptionGroups={filterOptions}
            onChangeOption={onOptionChange}
            logicalOperators={resolutionCompletenessFilterLogicalOperators}
            onChangeLogicalOperator={handleFilterOperatorChange}
            onSelectAll={() => {
                handleFilterValuesChange(
                    COMPLETION_OPTIONS.map((option) => option.value),
                )
            }}
            onRemoveAll={() => {
                handleFilterValuesChange([])
            }}
            onDropdownOpen={dispatchStatFiltersDirty}
            onDropdownClosed={handleDropdownClosed}
            initializeAsOpen={initializeAsOpen}
            showSearch={false}
            isMultiple={true}
            showQuickSelect={true}
            onRemove={() => {
                dispatchRemove()

                onRemove?.()
            }}
            selectedLogicalOperator={value.operator}
            isDisabled={isDisabled}
        />
    )
}

export const ResolutionCompletenessFilterWithState = connect(
    (state: RootState) => ({
        value: getPageStatsFiltersWithLogicalOperators(state)[
            FilterKey.ResolutionCompleteness
        ],
    }),
    {
        dispatchUpdate: (filter: Props['value']) =>
            mergeStatsFiltersWithLogicalOperator({
                resolutionCompleteness: filter,
            }),
        dispatchRemove: () =>
            mergeStatsFiltersWithLogicalOperator({
                resolutionCompleteness: emptyFilter,
            }),
        dispatchStatFiltersDirty: statFiltersDirty,
        dispatchStatFiltersClean: statFiltersClean,
    },
)(ResolutionCompletenessFilter)

export const ResolutionCompletenessFilterWithSavedState = connect(
    (state: RootState) => ({
        value: getSavedFiltersWithLogicalOperators(state)[
            FilterKey.ResolutionCompleteness
        ],
    }),
    {
        dispatchUpdate: (filter: Exclude<Props['value'], undefined>) =>
            upsertSavedFilterFilter({
                member: FilterKey.ResolutionCompleteness,
                operator: filter.operator,
                values: filter.values,
            }),
        dispatchRemove: () =>
            removeFilterFromSavedFilterDraft({
                filterKey: FilterKey.ResolutionCompleteness,
            }),
    },
)(ResolutionCompletenessFilter)

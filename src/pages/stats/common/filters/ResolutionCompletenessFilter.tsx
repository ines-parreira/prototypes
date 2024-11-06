import noop from 'lodash/noop'
import React, {useCallback, useMemo} from 'react'
import {connect} from 'react-redux'

import {withLogicalOperator} from 'models/reporting/queryFactories/utils'
import {FilterKey, StatsFiltersWithLogicalOperator} from 'models/stat/types'
import Filter from 'pages/stats/common/components/Filter'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'
import {
    FilterLabels,
    resolutionCompletenessFilterLogicalOperators,
} from 'pages/stats/common/filters/constants'
import {emptyFilter, logSegmentEvent} from 'pages/stats/common/filters/helpers'
import {RemovableFilter} from 'pages/stats/common/filters/types'
import {DropdownOption} from 'pages/stats/types'
import {
    getPageStatsFiltersWithLogicalOperators,
    getSavedFiltersWithLogicalOperators,
} from 'state/stats/selectors'
import {mergeStatsFiltersWithLogicalOperator} from 'state/stats/statsSlice'
import {RootState} from 'state/types'
import {statFiltersClean, statFiltersDirty} from 'state/ui/stats/actions'
import {upsertSavedFilterFilter} from 'state/ui/stats/filtersSlice'

const COMPLETION_OPTIONS = [
    {value: '1', label: 'Complete'},
    {value: '0', label: 'Incomplete'},
]

type Props = {
    value: StatsFiltersWithLogicalOperator[FilterKey.ResolutionCompleteness]
    dispatchUpdate: (
        value: Exclude<
            StatsFiltersWithLogicalOperator[FilterKey.ResolutionCompleteness],
            undefined
        >
    ) => void
    dispatchStatFiltersDirty?: () => void
    dispatchStatFiltersClean?: () => void
} & RemovableFilter

export function ResolutionCompletenessFilter({
    value = emptyFilter,
    initializeAsOpen = false,
    dispatchUpdate,
    dispatchStatFiltersDirty = noop,
    dispatchStatFiltersClean = noop,
    onRemove,
}: Props) {
    const filterOptions = [
        {
            options: COMPLETION_OPTIONS,
        },
    ]

    const selectedOptions: DropdownOption[] = useMemo(
        () =>
            COMPLETION_OPTIONS.filter(
                (option) => option.value === value.values[0]
            ),
        [value]
    )

    const handleFilterValuesChange = useCallback(
        (filterValues: DropdownOption | undefined) => {
            dispatchUpdate(
                withLogicalOperator(
                    [String(filterValues?.value)],
                    value.operator
                )
            )
        },
        [dispatchUpdate, value]
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
        [dispatchUpdate, value?.values]
    )

    return (
        <Filter
            filterName={FilterLabels[FilterKey.ResolutionCompleteness]}
            selectedOptions={selectedOptions}
            filterOptionGroups={filterOptions}
            onChangeOption={handleFilterValuesChange}
            logicalOperators={resolutionCompletenessFilterLogicalOperators}
            onChangeLogicalOperator={handleFilterOperatorChange}
            onSelectAll={noop}
            onRemoveAll={noop}
            onDropdownOpen={dispatchStatFiltersDirty}
            onDropdownClosed={handleDropdownClosed}
            initializeAsOpen={initializeAsOpen}
            showSearch={false}
            isMultiple={false}
            showQuickSelect={false}
            onRemove={() => {
                dispatchUpdate(emptyFilter)

                onRemove?.()
            }}
            selectedLogicalOperator={value.operator}
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
        dispatchStatFiltersDirty: statFiltersDirty,
        dispatchStatFiltersClean: statFiltersClean,
    }
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
                values: filter.values.map(String),
            }),
    }
)(ResolutionCompletenessFilter)

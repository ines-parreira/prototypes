import _noop from 'lodash/noop'
import React, {useCallback, useMemo} from 'react'
import {connect} from 'react-redux'

import {
    AggregationWindow,
    FilterKey,
    StatsFiltersWithLogicalOperator,
} from 'models/stat/types'
import Filter from 'pages/stats/common/components/Filter'
import {
    FilterLabels,
    ReportingGranularityLabels,
} from 'pages/stats/common/filters/constants'
import {logSegmentEvent} from 'pages/stats/common/filters/helpers'
import {DropdownOption} from 'pages/stats/types'
import {getStatsFiltersWithLogicalOperators} from 'state/stats/selectors'
import {mergeStatsFiltersWithLogicalOperator} from 'state/stats/statsSlice'
import {getAllowedAggregationWindows} from 'state/stats/utils'
import {RootState} from 'state/types'
import {getCleanStatsFiltersWithLogicalOperatorsWithTimezone} from 'state/ui/stats/selectors'

type Props = {
    value?: StatsFiltersWithLogicalOperator[FilterKey.AggregationWindow]
    period: StatsFiltersWithLogicalOperator[FilterKey.Period]
    dispatchUpdate: (
        value: StatsFiltersWithLogicalOperator[FilterKey.AggregationWindow]
    ) => void
}

export const AggregationWindowFilter = ({
    value,
    period,
    dispatchUpdate,
}: Props) => {
    const allowedAggregationWindows = useMemo(
        () =>
            getAllowedAggregationWindows(period).map((granularity) => ({
                value: `${granularity}`,
                label: ReportingGranularityLabels[granularity],
            })),
        [period]
    )

    const filterOptions = [
        {
            options: allowedAggregationWindows,
        },
    ]

    const selectedOptions: DropdownOption[] = useMemo(
        () =>
            allowedAggregationWindows.filter(
                (option) => option.value === value
            ),
        [allowedAggregationWindows, value]
    )

    const handleFilterValuesChange = useCallback(
        (value: DropdownOption | undefined) => {
            dispatchUpdate(value?.value as AggregationWindow)
        },
        [dispatchUpdate]
    )

    const handleDropdownClosed = () => {
        logSegmentEvent(FilterKey.AggregationWindow, null)
    }

    return (
        <Filter
            filterName={FilterLabels[FilterKey.AggregationWindow]}
            filterOptionGroups={filterOptions}
            selectedOptions={selectedOptions}
            onChangeOption={handleFilterValuesChange}
            logicalOperators={[]}
            onChangeLogicalOperator={_noop}
            onSelectAll={_noop}
            onRemoveAll={_noop}
            onDropdownClosed={handleDropdownClosed}
            isMultiple={false}
            showSearch={false}
            showQuickSelect={false}
            isPersistent
        />
    )
}

export const AggregationWindowFilterWithState = connect(
    (state: RootState) => ({
        value: getCleanStatsFiltersWithLogicalOperatorsWithTimezone(state)
            .granularity,
        period: getStatsFiltersWithLogicalOperators(state)[FilterKey.Period],
    }),
    {
        dispatchUpdate: (
            filter: StatsFiltersWithLogicalOperator[FilterKey.AggregationWindow]
        ) =>
            mergeStatsFiltersWithLogicalOperator({
                aggregationWindow: filter,
            }),
    }
)(AggregationWindowFilter)

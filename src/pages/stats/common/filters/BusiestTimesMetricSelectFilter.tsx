import React, { useMemo } from 'react'

import _noop from 'lodash/noop'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { FilterComponentKey } from 'models/stat/types'
import Filter from 'pages/stats/common/components/Filter'
import { FilterLabels } from 'pages/stats/common/filters/constants'
import { logSegmentEvent } from 'pages/stats/common/filters/helpers'
import {
    metricLabels,
    metrics,
} from 'pages/stats/support-performance/busiest-times-of-days/utils'
import { DropdownOption } from 'pages/stats/types'
import {
    getSelectedMetric,
    setSelectedMetric,
} from 'state/ui/stats/busiestTimesSlice'

export const BusiestTimesMetricSelectFilter = () => {
    const dispatch = useAppDispatch()
    const selectedMetric = useAppSelector(getSelectedMetric)

    const availableMetrics = metrics

    const options = useMemo(
        () =>
            availableMetrics.map((metric) => ({
                value: metric,
                label: metricLabels[metric],
            })),
        [availableMetrics],
    )
    const selectedOptions = useMemo(() => {
        const option = options.find((option) => option.value === selectedMetric)
        return [{ value: selectedMetric, label: String(option?.label) }]
    }, [options, selectedMetric])

    const onOptionChange = (option: DropdownOption) => {
        dispatch(setSelectedMetric(option.value))
    }

    const handleDropdownClosed = () => {
        logSegmentEvent(FilterComponentKey.BusiestTimesMetricSelectFilter, null)
    }

    return (
        <Filter
            filterName={
                FilterLabels[FilterComponentKey.BusiestTimesMetricSelectFilter]
            }
            isPersistent
            isMultiple={false}
            showSearch={false}
            showQuickSelect={false}
            filterOptionGroups={[{ options }]}
            selectedOptions={selectedOptions}
            logicalOperators={[]}
            selectedLogicalOperator={null}
            onChangeOption={onOptionChange}
            onSelectAll={_noop}
            onRemoveAll={_noop}
            onChangeLogicalOperator={_noop}
            onDropdownClosed={handleDropdownClosed}
        />
    )
}

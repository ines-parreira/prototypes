import React, { useMemo } from 'react'

import _noop from 'lodash/noop'

import { FilterComponentKey } from 'domains/reporting/models/stat/types'
import Filter from 'domains/reporting/pages/common/components/Filter'
import { FilterLabels } from 'domains/reporting/pages/common/filters/constants'
import { logSegmentEvent } from 'domains/reporting/pages/common/filters/helpers'
import {
    metricLabels,
    metrics,
} from 'domains/reporting/pages/support-performance/busiest-times-of-days/utils'
import type { DropdownOption } from 'domains/reporting/pages/types'
import {
    getSelectedMetric,
    setSelectedMetric,
} from 'domains/reporting/state/ui/stats/busiestTimesSlice'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'

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

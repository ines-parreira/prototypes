import React, {useMemo} from 'react'
import _noop from 'lodash/noop'
import {useDispatch} from 'react-redux'
import useAppSelector from 'hooks/useAppSelector'
import Filter from 'pages/stats/common/components/Filter'
import {DropdownOption} from 'pages/stats/types'
import {
    metricLabels,
    metrics,
} from 'pages/stats/support-performance/busiest-times-of-days/utils'
import {
    getSelectedMetric,
    setSelectedMetric,
} from 'state/ui/stats/busiestTimesSlice'

export const BUSIEST_TIMES_METRIC_SELECT_FILTER_NAME = 'Report on'

export const BusiestTimesMetricSelectFilter = () => {
    const dispatch = useDispatch()
    const selectedMetric = useAppSelector(getSelectedMetric)

    const options = useMemo(
        () =>
            metrics.map((metric) => ({
                value: metric,
                label: metricLabels[metric],
            })),
        []
    )
    const selectedOptions = useMemo(() => {
        const option = options.find((option) => option.value === selectedMetric)
        return [{value: selectedMetric, label: String(option?.label)}]
    }, [options, selectedMetric])

    const onOptionChange = (option: DropdownOption) => {
        dispatch(setSelectedMetric(option.value))
    }

    return (
        <Filter
            filterName={BUSIEST_TIMES_METRIC_SELECT_FILTER_NAME}
            isPersistent={true}
            isMultiple={false}
            showSearch={false}
            showQuickSelect={false}
            filterOptionGroups={[{options}]}
            selectedOptions={selectedOptions}
            logicalOperators={[]}
            selectedLogicalOperator={null}
            onChangeOption={onOptionChange}
            onSelectAll={_noop}
            onRemoveAll={_noop}
            onChangeLogicalOperator={_noop}
        />
    )
}

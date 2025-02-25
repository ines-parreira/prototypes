import {useFlags} from 'launchdarkly-react-client-sdk'
import _noop from 'lodash/noop'
import moment from 'moment'
import React, {useEffect, useState} from 'react'
// eslint-disable-next-line no-restricted-imports
import {useDispatch} from 'react-redux'

import {FeatureFlagKey} from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import useEffectOnce from 'hooks/useEffectOnce'
import Filter from 'pages/stats/common/components/Filter'
import {PeriodFilter} from 'pages/stats/common/filters/PeriodFilter'
import {DropdownOption} from 'pages/stats/types'
import {getPageStatsFilters} from 'state/stats/selectors'
import {setStatsFilters} from 'state/stats/statsSlice'

import css from './ActionEventsHeader.less'
import BackToActionFormButton from './BackToActionFormButton'

type Props = {
    initialStartDate: Date
    initialEndDate: Date
    onChange: (filter: {
        from: Date
        to: Date
        success?: boolean
        status?: ('success' | 'error' | 'partial_success')[]
    }) => void
}

export default function ActionEventsHeader({
    onChange,
    initialEndDate,
    initialStartDate,
}: Props) {
    const dispatch = useDispatch()
    const pageStatsFilters = useAppSelector(getPageStatsFilters)
    const isActionEventLogsWIthPartialSuccess =
        useFlags()[FeatureFlagKey.ActionEventLogsWIthPartialSuccess]

    const [statusValues, setStatusValues] = useState<DropdownOption[]>([])
    const [statusFilterOptions, setStatusFilterOptions] = useState<
        DropdownOption[]
    >([])
    const [startDateFilter, setStartDate] = useState(initialStartDate)
    const [endDateFilter, setEndDateFilter] = useState(initialEndDate)
    const [isPeriodFilterSet, setIsPeriodFilterSet] = useState(false)
    useEffectOnce(() => {
        dispatch(
            setStatsFilters({
                period: {
                    start_datetime: moment(initialStartDate).format(),
                    end_datetime: moment(initialEndDate).format(),
                },
            })
        )
        setIsPeriodFilterSet(true)
    })

    useEffect(() => {
        if (isPeriodFilterSet) {
            setEndDateFilter(new Date(pageStatsFilters.period.end_datetime))
            setStartDate(new Date(pageStatsFilters.period.start_datetime))
        }
    }, [
        isPeriodFilterSet,
        pageStatsFilters.period.end_datetime,
        pageStatsFilters.period.start_datetime,
    ])

    useEffect(() => {
        const statusFilters = [
            {
                label: 'Success',
                value: 'success',
            },
            {
                label: 'Error',
                value: 'error',
            },
        ]

        if (isActionEventLogsWIthPartialSuccess) {
            statusFilters.push({
                label: 'Partial Success',
                value: 'partial_success',
            })
        }
        setStatusValues(statusFilters)
        setStatusFilterOptions(statusFilters)
    }, [isActionEventLogsWIthPartialSuccess])

    useEffect(() => {
        if (isActionEventLogsWIthPartialSuccess) {
            onChange({
                from: startDateFilter,
                to: endDateFilter,
                status: statusFilterOptions.map(
                    (dropDownValue) => dropDownValue.value
                ) as ('success' | 'error' | 'partial_success')[],
            })
        } else {
            onChange({
                from: startDateFilter,
                to: endDateFilter,
                success:
                    statusFilterOptions.length === statusValues.length
                        ? undefined
                        : statusFilterOptions.some(
                              (option) => option.value === 'success'
                          ),
            })
        }
    }, [
        endDateFilter,
        isActionEventLogsWIthPartialSuccess,
        onChange,
        startDateFilter,
        statusValues,
        statusFilterOptions,
    ])

    const handleFilterChange = (option: DropdownOption) => {
        if (statusFilterOptions.find((opt) => opt.value === option.value)) {
            setStatusFilterOptions(
                statusFilterOptions.filter(
                    (statusFilterOption) =>
                        statusFilterOption.value !== option.value
                )
            )
        } else {
            setStatusFilterOptions([...statusFilterOptions, option])
        }
    }

    return (
        <div className={css.container}>
            <BackToActionFormButton />
            <p>
                View all events when this Action has been performed, and select
                an event to view details which can help with troubleshooting
                errors.
            </p>
            <div className={css.filterSelector}>
                <PeriodFilter
                    value={{
                        end_datetime: moment(endDateFilter).format(),
                        start_datetime: moment(startDateFilter).format(),
                    }}
                />
                <Filter
                    filterName="Status"
                    filterOptionGroups={[
                        {
                            options: statusValues,
                        },
                    ]}
                    onChangeOption={handleFilterChange}
                    onRemoveAll={_noop}
                    onSelectAll={_noop}
                    onChangeLogicalOperator={_noop}
                    selectedOptions={statusFilterOptions}
                    selectedLogicalOperator={null}
                    isMultiple={true}
                    showQuickSelect={false}
                    showSearch={false}
                    logicalOperators={[]}
                />
            </div>
        </div>
    )
}

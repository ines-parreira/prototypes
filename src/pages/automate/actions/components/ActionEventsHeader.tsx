import _noop from 'lodash/noop'
import moment from 'moment'
import React, {useEffect, useState} from 'react'
import {useDispatch} from 'react-redux'

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
    onChange: (filter: {from: Date; to: Date; success?: boolean}) => void
}

export default function ActionEventsHeader({
    onChange,
    initialEndDate,
    initialStartDate,
}: Props) {
    const dispatch = useDispatch()
    const pageStatsFilters = useAppSelector(getPageStatsFilters)
    const [successFilterOptions, setSuccessFilterOptions] = useState<
        DropdownOption[]
    >([
        {
            label: 'Success',
            value: 'success',
        },
        {
            label: 'Error',
            value: 'error',
        },
    ])
    const [startDateFilter, setStartDate] = useState(initialStartDate)
    const [endDateFilter, setEndDateFilter] = useState(initialEndDate)

    useEffectOnce(() => {
        dispatch(
            setStatsFilters({
                period: {
                    start_datetime: moment(initialStartDate).format(),
                    end_datetime: moment(initialEndDate).format(),
                },
            })
        )
    })

    useEffect(() => {
        setEndDateFilter(new Date(pageStatsFilters.period.end_datetime))
        setStartDate(new Date(pageStatsFilters.period.start_datetime))
    }, [
        pageStatsFilters.period.end_datetime,
        pageStatsFilters.period.start_datetime,
    ])

    useEffect(() => {
        onChange({
            from: startDateFilter,
            to: endDateFilter,
            success:
                successFilterOptions.length === 2
                    ? undefined
                    : successFilterOptions.some(
                          (option) => option.value === 'success'
                      ),
        })
    }, [endDateFilter, onChange, startDateFilter, successFilterOptions])

    const handleFilterChange = (option: DropdownOption) => {
        if (successFilterOptions.some((opt) => opt.value === option.value)) {
            const newOptions = successFilterOptions.filter(
                (opt) => opt.value !== option.value
            )
            if (newOptions.length === 0) {
                return
            }

            setSuccessFilterOptions(newOptions)
        } else {
            setSuccessFilterOptions([...successFilterOptions, option])
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
                            options: [
                                {
                                    label: 'Success',
                                    value: 'success',
                                },
                                {
                                    label: 'Error',
                                    value: 'error',
                                },
                            ],
                        },
                    ]}
                    onChangeOption={handleFilterChange}
                    onRemove={() => {
                        setSuccessFilterOptions([
                            {
                                label: 'Success',
                                value: 'success',
                            },
                            {
                                label: 'Error',
                                value: 'error',
                            },
                        ])
                    }}
                    onRemoveAll={_noop}
                    onSelectAll={_noop}
                    onChangeLogicalOperator={_noop}
                    selectedOptions={successFilterOptions}
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

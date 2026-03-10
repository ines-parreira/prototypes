import { useEffect, useState } from 'react'

import { useEffectOnce } from '@repo/hooks'
import _noop from 'lodash/noop'
import moment from 'moment'

import Filter from 'domains/reporting/pages/common/components/Filter'
import { PeriodFilter } from 'domains/reporting/pages/common/filters/PeriodFilter'
import type { DropdownOption } from 'domains/reporting/pages/types'
import { getPageStatsFilters } from 'domains/reporting/state/stats/selectors'
import { setStatsFilters } from 'domains/reporting/state/stats/statsSlice'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'

import BackToActionFormButton from './BackToActionFormButton'

import css from './ActionEventsHeader.less'

type Props = {
    initialStartDate: Date
    initialEndDate: Date
    initialUserJourneyId?: number
    onChange: (filter: {
        from: Date
        to: Date
        success?: boolean
        status?: ('success' | 'error' | 'partial_success')[]
        userJourneyId?: number
    }) => void
}
const statusFilters = [
    {
        label: 'Success',
        value: 'success',
    },
    {
        label: 'Error',
        value: 'error',
    },
    {
        label: 'Partial Success',
        value: 'partial_success',
    },
]
export default function ActionEventsHeader({
    onChange,
    initialEndDate,
    initialStartDate,
    initialUserJourneyId,
}: Props) {
    const dispatch = useAppDispatch()
    const pageStatsFilters = useAppSelector(getPageStatsFilters)

    const [statusValues, setStatusValues] = useState<DropdownOption[]>([])
    const [statusFilterOptions, setStatusFilterOptions] = useState<
        DropdownOption[]
    >([])
    const [startDateFilter, setStartDate] = useState(initialStartDate)
    const [endDateFilter, setEndDateFilter] = useState(initialEndDate)
    const [isPeriodFilterSet, setIsPeriodFilterSet] = useState(false)
    const [userJourneyId, setUserJourneyId] = useState<number | undefined>(
        initialUserJourneyId,
    )
    useEffectOnce(() => {
        dispatch(
            setStatsFilters({
                period: {
                    start_datetime: moment(initialStartDate).format(),
                    end_datetime: moment(initialEndDate).format(),
                },
            }),
        )
        setIsPeriodFilterSet(true)
        setStatusValues(statusFilters)
        setStatusFilterOptions(statusFilters)
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
        onChange({
            from: startDateFilter,
            to: endDateFilter,
            status: statusFilterOptions.map(
                (dropDownValue) => dropDownValue.value,
            ) as ('success' | 'error' | 'partial_success')[],
            userJourneyId,
        })
    }, [
        endDateFilter,
        onChange,
        startDateFilter,
        statusValues,
        statusFilterOptions,
        userJourneyId,
    ])

    const handleFilterChange = (option: DropdownOption) => {
        if (statusFilterOptions.find((opt) => opt.value === option.value)) {
            setStatusFilterOptions(
                statusFilterOptions.filter(
                    (statusFilterOption) =>
                        statusFilterOption.value !== option.value,
                ),
            )
        } else {
            setStatusFilterOptions([...statusFilterOptions, option])
        }
    }

    const handleUserJourneyIdChange = () => {
        onChange({
            from: startDateFilter,
            to: endDateFilter,
            userJourneyId: userJourneyId || undefined,
        })
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
                <div className={css.ticketIdFilter}>
                    <label htmlFor="ticketId">Ticket ID</label>
                    <input
                        id="ticketId"
                        type="number"
                        placeholder="Enter Ticket ID"
                        value={userJourneyId || ''}
                        onChange={(e) =>
                            setUserJourneyId(Number(e.target.value))
                        }
                        onBlur={handleUserJourneyIdChange}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleUserJourneyIdChange()
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

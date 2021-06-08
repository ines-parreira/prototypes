import React, {useEffect, useCallback, useMemo, useRef, useState} from 'react'
import {connect} from 'react-redux'
import moment, {Moment} from 'moment-timezone'
import DateRangePicker, {EventHandler} from 'react-bootstrap-daterangepicker'
import {Button, Tooltip} from 'reactstrap'

import {RootState} from '../../../state/types'
import {getTimezone} from '../../../state/currentUser/selectors'

import css from './PeriodPicker.less'

type Props = {
    isDisabled: boolean
    endDatetime: Moment
    onChange: ({
        start_datetime,
        end_datetime,
    }: {
        start_datetime: string
        end_datetime: string
    }) => void
    startDatetime: Moment
    userTimezone: Maybe<string>
}

export const PeriodPickerContainer = ({
    endDatetime,
    isDisabled = false,
    onChange,
    startDatetime,
    userTimezone,
}: Props) => {
    const [startDate, setStartDate] = useState(startDatetime)
    const [endDate, setEndDate] = useState(endDatetime)
    const datePickerRef = useRef<DateRangePicker>(null)
    const dateRangerPickerElement = useRef<HTMLElement>()
    const [isTooltipOpen, setIsTooltipOpen] = useState(false)
    const [tooltipTarget, setTooltipTarget] = useState<HTMLElement | null>(null)

    useEffect(() => {
        return endHandlingTooltipHover
    }, [])

    const someDaysAgoStartOfDay = (days: number) =>
        startOfToday().subtract(days - 1, 'days')
    const startOfToday = () => moment().startOf('day')
    const endOfToday = () => moment().endOf('day')
    const today = moment()

    const showDatePicker = () => {
        if (!datePickerRef.current) {
            return
        }

        // there are no API/attributes that enable us
        // to show and hide the date picker component,
        // so we simulate a click on it to open it
        datePickerRef.current?.$picker?.trigger('click')
    }

    const ranges: {[label: string]: [Moment, Moment]} = useMemo(() => {
        return {
            Today: [startOfToday(), endOfToday()],
            'Last 7 days': [someDaysAgoStartOfDay(7), endOfToday()],
            'Last 30 days': [someDaysAgoStartOfDay(30), endOfToday()],
            'Last 60 days': [someDaysAgoStartOfDay(60), endOfToday()],
            'Last 90 days': [someDaysAgoStartOfDay(90), endOfToday()],
        }
    }, [])

    const label = useMemo(() => {
        const start = startDate.format('MMM DD, YYYY')
        const end = endDate.format('MMM DD, YYYY')

        if (start === end) {
            return start
        }

        return `${start} - ${end}`
    }, [endDate, startDate])

    useEffect(() => {
        setStartDate(startDatetime)
        setEndDate(endDatetime)
    }, [endDatetime, startDatetime])

    const handleApply: EventHandler = (event, picker) => {
        const startDatetime = moment(
            picker.startDate.startOf('day').format('YYYY-MM-DD HH:mm:ss')
        )
        const endDatetime = moment(
            picker.endDate.endOf('day').format('YYYY-MM-DD HH:mm:ss')
        )

        onChange({
            start_datetime: (userTimezone
                ? startDatetime.tz(userTimezone)
                : startDatetime
            ).format(),
            end_datetime: (userTimezone
                ? endDatetime.tz(userTimezone)
                : endDatetime
            ).format(),
        })
    }

    const showTooltip = useCallback(
        (event: Event) => {
            if ((event.target as HTMLElement).classList.contains('disabled')) {
                setIsTooltipOpen(true)
                setTooltipTarget(event.target as HTMLElement)
            }
        },
        [setIsTooltipOpen, setTooltipTarget]
    )

    const hideTooltip = useCallback(
        (event: Event) => {
            if ((event.target as HTMLElement).classList.contains('disabled')) {
                setTooltipTarget(null)
                setIsTooltipOpen(false)
            }
        },
        [setIsTooltipOpen, setTooltipTarget]
    )

    const startHandlingTooltipHover = () => {
        dateRangerPickerElement.current
            ?.querySelectorAll('tbody')
            .forEach((element: Element) => {
                element.addEventListener('mouseover', showTooltip)
            })

        dateRangerPickerElement.current
            ?.querySelectorAll('.off.disabled')
            .forEach((element: Element) => {
                element.addEventListener('mouseleave', hideTooltip)
            })
    }

    const endHandlingTooltipHover = () => {
        dateRangerPickerElement.current
            ?.querySelectorAll('tbody')
            .forEach((element: Element) => {
                element.removeEventListener('mouseover', showTooltip)
            })

        dateRangerPickerElement.current
            ?.querySelectorAll('.off.disabled')
            .forEach((element: Element) => {
                element.removeEventListener('mouseleave', hideTooltip)
            })
    }

    return (
        <>
            {!isDisabled && (
                <>
                    <DateRangePicker
                        ref={datePickerRef}
                        onApply={handleApply}
                        onEvent={(event) => {
                            if (event.type === 'cancel') {
                                showDatePicker()
                            }
                        }}
                        initialSettings={{
                            alwaysShowCalendars: true,
                            applyButtonClasses: 'btn-success mr-2',
                            cancelButtonClasses: 'btn-secondary',
                            endDate,
                            isCustomDate: (date: Moment) => {
                                if (date.isAfter()) {
                                    return 'future-date'
                                }
                            },
                            linkedCalendars: false,
                            opens: 'left',
                            maxDate: today,
                            minDate: someDaysAgoStartOfDay(90),
                            ranges,
                            startDate,
                            showCustomRangeLabel: false,
                        }}
                        onShow={(event, target) => {
                            dateRangerPickerElement.current = target.container?.get(
                                0
                            )
                            dateRangerPickerElement.current.classList.add(
                                'displayed'
                            )

                            const cancelBtn = target.container
                                .get(0)
                                .querySelector('.cancelBtn')
                            if (cancelBtn) {
                                ;(cancelBtn as HTMLElement).innerText = 'Clear'
                            }
                            startHandlingTooltipHover()

                            // calendar from the daterangepicker is recreated on each prev/next month
                            // so event listeners to display the tooltip on days hover are put back
                            // each time user navigates to the previous or next month
                            const observer = new MutationObserver(
                                startHandlingTooltipHover
                            )
                            observer.observe(dateRangerPickerElement.current, {
                                childList: true,
                                subtree: true,
                            })

                            const ranges = dateRangerPickerElement.current?.querySelector(
                                '.ranges ul'
                            )
                            if (ranges) {
                                ranges.setAttribute('label', 'Shortcuts')
                                ranges.classList.add('with-label')
                            }
                        }}
                        onHide={() => {
                            endHandlingTooltipHover()
                            dateRangerPickerElement.current?.classList.remove(
                                'displayed'
                            )
                        }}
                    >
                        <div>
                            <Button type="button" disabled={isDisabled}>
                                <i className="material-icons mr-2">
                                    calendar_today
                                </i>
                                <span>{label}</span>
                                <i className="material-icons md-2 strong ml-1">
                                    arrow_drop_down
                                </i>
                            </Button>
                        </div>
                    </DateRangePicker>
                    {tooltipTarget && (
                        <Tooltip
                            placement="top-start"
                            isOpen={isTooltipOpen}
                            target={tooltipTarget}
                            fade={false}
                            innerClassName={css.innerTooltip}
                            arrowClassName={css.arrowTooltip}
                        >
                            {tooltipTarget?.classList.contains('future-date')
                                ? 'There is no data available on this date yet.'
                                : 'There is no data available on this date because it’s past 90 days'}
                        </Tooltip>
                    )}
                </>
            )}
        </>
    )
}

const connector = connect((state: RootState) => ({
    userTimezone: getTimezone(state),
}))

export default connector(PeriodPickerContainer)

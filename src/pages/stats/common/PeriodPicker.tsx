import React, {useEffect, useCallback, useMemo, useRef, useState} from 'react'
import {connect} from 'react-redux'
import moment, {Moment} from 'moment-timezone'
import DateRangePicker, {
    EventHandler,
    Props as DateRangeProps,
} from 'react-bootstrap-daterangepicker'
import {Tooltip} from 'reactstrap'

import Button, {ButtonIntent} from 'pages/common/components/button/Button'
import ButtonIconLabel, {
    ButtonIconPosition,
} from 'pages/common/components/button/ButtonIconLabel'
import {RootState} from '../../../state/types'
import {getTimezone} from '../../../state/currentUser/selectors'

import css from './PeriodPicker.less'

type Props = {
    endDatetime: Moment
    formatMaxSpan?: (
        maxSpan?: moment.MomentInput | moment.Duration
    ) => moment.Duration
    isDisabled?: boolean
    labelDateFormat?: string
    onChange: ({
        startDatetime,
        endDatetime,
    }: {
        startDatetime: string
        endDatetime: string
    }) => void
    startDatetime: Moment
    userTimezone?: string | null
}

export const PeriodPickerContainer = ({
    endDatetime,
    formatMaxSpan,
    initialSettings,
    isDisabled = false,
    labelDateFormat = 'MMM DD, YYYY',
    onChange,
    startDatetime,
    userTimezone,
}: Props & Partial<DateRangeProps>) => {
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
        const start = startDate.format(labelDateFormat)
        const end = endDate.format(labelDateFormat)

        if (start === end) {
            return start
        }

        return `${start} - ${end}`
    }, [endDate, labelDateFormat, startDate])

    useEffect(() => {
        setStartDate(startDatetime)
        setEndDate(endDatetime)
    }, [endDatetime, startDatetime])

    const handleApply: EventHandler = (event, picker) => {
        const startDatetime = moment(picker.startDate.format())
        const endDatetime = moment(picker.endDate.format())

        onChange({
            startDatetime: (userTimezone
                ? startDatetime.tz(userTimezone)
                : startDatetime
            ).format(),
            endDatetime: (userTimezone
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
                            ranges,
                            startDate,
                            showCustomRangeLabel: false,
                            ...initialSettings,
                            ...(formatMaxSpan !== undefined && {
                                maxSpan: formatMaxSpan(
                                    ...(initialSettings &&
                                    initialSettings.maxSpan
                                        ? [initialSettings.maxSpan]
                                        : [])
                                ),
                            }),
                        }}
                        onShow={(event, target) => {
                            dateRangerPickerElement.current =
                                target.container?.get(0)
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

                            const ranges =
                                dateRangerPickerElement.current?.querySelector(
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
                            <Button
                                intent={ButtonIntent.Secondary}
                                isDisabled={isDisabled}
                            >
                                <ButtonIconLabel icon="calendar_today">
                                    <ButtonIconLabel
                                        icon="arrow_drop_down"
                                        position={ButtonIconPosition.Right}
                                    >
                                        {label}
                                    </ButtonIconLabel>
                                </ButtonIconLabel>
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
                                : `You can't select a period longer than ${
                                      initialSettings?.maxSpan as string
                                  } days.`}
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

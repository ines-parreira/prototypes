import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useUpdateEffect } from '@repo/hooks'
import type { Moment } from 'moment-timezone'
import moment from 'moment-timezone'
import { Tooltip } from 'reactstrap'

import { useTheme } from 'core/theme'
import { useAxiomMigration } from 'hooks/useAxiomMigration'
import type {
    BaseDateRangePicker,
    Props as DateRangeProps,
    EventHandler,
} from 'utils/wrappers/DateRangePicker'
import { DateRangePicker } from 'utils/wrappers/DateRangePicker'

import css from './DatePicker.less'

type Props = {
    children?: ReactNode
    onSubmit: (start: Moment, end: Moment) => void
    isOpen?: boolean
    rangesLabel?: string
    toggle?: () => void
    unavailableDateMessage?: string
    pickerV2Styles?: boolean
    rangesOnLeft?: boolean
    showRangesLabel?: boolean
    actionButtonsOnTheBottom?: boolean
    changeButtonColorsToV2?: boolean
    rangeDatesInFooter?: boolean
    shouldShowMonthAndYearDropdowns?: boolean
    additionalPickerClassName?: string
    userTimezone?: string | null
    onHide?: () => void
    onClear?: () => void
}

export type DatePickerProps = Props & Partial<DateRangeProps>

export const DatePicker = ({
    children,
    onSubmit,
    onHide,
    onClear,
    initialSettings: {
        alwaysShowCalendars = true,
        applyButtonClasses = 'btn-primary',
        cancelButtonClasses = 'btn-secondary',
        opens = 'left',
        showCustomRangeLabel = false,
        singleDatePicker = true,
        timePicker = true,
        startDate,
        ...otherInitialSettings
    } = {},
    isOpen,
    rangesLabel,
    toggle,
    unavailableDateMessage = '',
    pickerV2Styles = true,
    rangesOnLeft = true,
    showRangesLabel = false,
    actionButtonsOnTheBottom = true,
    rangeDatesInFooter = false,
    shouldShowMonthAndYearDropdowns = true,
    additionalPickerClassName,
    userTimezone,
}: DatePickerProps) => {
    const datePickerRef = useRef<BaseDateRangePicker>(null)
    const [isTooltipOpen, setIsTooltipOpen] = useState(false)
    const [tooltipTarget, setTooltipTarget] = useState<HTMLElement | null>(null)
    const dateRangerPickerElement = useRef<HTMLElement>()
    const [shouldToggle, setShouldToggle] = useState(true)
    const isOpenRef = useRef(isOpen)
    const timezone = useMemo(() => {
        if (userTimezone) {
            return userTimezone
        }

        return moment.isMoment(startDate)
            ? startDate.tz() || moment().tz()
            : moment().tz()
    }, [startDate, userTimezone])

    const theme = useTheme()
    const { isEnabled: isAxiomMigrationEnabled } = useAxiomMigration()

    useEffect(() => {
        isOpenRef.current = isOpen
    })

    useEffect(() => {
        if (datePickerRef.current && timePicker === false) {
            datePickerRef.current?.$picker?.find('.calendar').hide()
        }
    }, [timePicker])

    useEffect(() => {
        isOpen && triggerDateRangePickerClick()
        return endHandlingTooltipHover
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useUpdateEffect(() => {
        if (shouldToggle) {
            triggerDateRangePickerClick()
        } else {
            setShouldToggle(true)
        }
    }, [isOpen])

    const triggerDateRangePickerClick = () => {
        if (!datePickerRef.current) {
            return
        }

        // there are no API/attributes that enable us
        // to show and hide the date picker component,
        // so we simulate a click on it to open it
        datePickerRef.current?.$picker?.trigger('click')
    }

    const handleEvent: EventHandler = (event) => {
        if (
            toggle &&
            ((event.type === 'hide' && isOpenRef.current) ||
                (event.type === 'show' && !isOpenRef.current))
        ) {
            setShouldToggle(false)
            toggle()
        }
        if (event.type === 'cancel') {
            if (toggle) {
                toggle()
            } else {
                triggerDateRangePickerClick()
            }
        }
    }

    const showTooltip = useCallback(
        (event: Event) => {
            if ((event.target as HTMLElement).classList.contains('disabled')) {
                setIsTooltipOpen(true)
                setTooltipTarget(event.target as HTMLElement)
            }
        },
        [setIsTooltipOpen, setTooltipTarget],
    )

    const hideTooltip = useCallback(
        (event: Event) => {
            if ((event.target as HTMLElement).classList.contains('disabled')) {
                setTooltipTarget(null)
                setIsTooltipOpen(false)
            }
        },
        [setIsTooltipOpen, setTooltipTarget],
    )

    const startHandlingTooltipHover = () => {
        dateRangerPickerElement.current
            ?.querySelector('tbody')
            ?.addEventListener('mouseover', showTooltip)

        dateRangerPickerElement.current
            ?.querySelectorAll('.off.disabled')
            .forEach((element: Element) => {
                element.addEventListener('mouseleave', hideTooltip)
            })
    }

    const endHandlingTooltipHover = () => {
        dateRangerPickerElement.current
            ?.querySelector('tbody')
            ?.removeEventListener('mouseover', showTooltip)

        dateRangerPickerElement.current
            ?.querySelectorAll('.off.disabled')
            .forEach((element: Element) => {
                element.removeEventListener('mouseleave', hideTooltip)
            })
    }

    return (
        <>
            <DateRangePicker
                ref={datePickerRef}
                onEvent={handleEvent}
                onApply={(event, picker) => {
                    if (timezone) {
                        const strippedTimeStartDate =
                            picker.startDate.format('YYYY-MM-DDTHH:mm')
                        const strippedTimeEndDate =
                            picker.endDate.format('YYYY-MM-DDTHH:mm')
                        const startDate = moment(strippedTimeStartDate).tz(
                            timezone,
                            true,
                        )
                        const endDate = moment(strippedTimeEndDate).tz(
                            timezone,
                            true,
                        )
                        onSubmit(startDate, endDate)
                    } else {
                        onSubmit(picker.startDate, picker.endDate)
                    }
                }}
                initialSettings={{
                    alwaysShowCalendars,
                    applyButtonClasses,
                    cancelButtonClasses,
                    opens,
                    showCustomRangeLabel,
                    singleDatePicker,
                    timePicker,
                    startDate,
                    showDropdowns: shouldShowMonthAndYearDropdowns,
                    ...otherInitialSettings,
                }}
                onShow={(event, target) => {
                    dateRangerPickerElement.current = target.container?.get(0)
                    const classesToAdd = [theme.resolvedName, 'displayed']
                    if (isAxiomMigrationEnabled) {
                        classesToAdd.push('axiom')
                    }
                    dateRangerPickerElement.current.classList.add(
                        ...classesToAdd,
                    )

                    if (pickerV2Styles) {
                        dateRangerPickerElement.current.classList.add(
                            'picker-v2',
                            'apply-v2-styles',
                        )
                    }

                    if (rangesOnLeft) {
                        dateRangerPickerElement.current.classList.add(
                            'picker-v2',
                            'ranges-on-left',
                        )
                    }

                    if (actionButtonsOnTheBottom) {
                        dateRangerPickerElement.current.classList.add(
                            'picker-v2',
                            'action-buttons-on-the-bottom',
                        )

                        if (rangeDatesInFooter) {
                            dateRangerPickerElement.current.classList.add(
                                'range-dates-in-footer',
                            )
                        }
                    }

                    if (additionalPickerClassName) {
                        dateRangerPickerElement.current.classList.add(
                            additionalPickerClassName,
                        )
                    }

                    const cancelBtn =
                        dateRangerPickerElement.current?.querySelector(
                            '.cancelBtn',
                        )
                    if (cancelBtn) {
                        ;(cancelBtn as HTMLElement).innerText = 'Clear'
                    }

                    startHandlingTooltipHover()

                    // calendar from the daterangepicker is recreated on each prev/next month
                    // so event listeners to display the tooltip on days hover are put back
                    // each time user navigates to the previous or next month
                    const observer = new MutationObserver(
                        startHandlingTooltipHover,
                    )
                    observer.observe(dateRangerPickerElement.current, {
                        childList: true,
                        subtree: true,
                    })

                    const ranges =
                        dateRangerPickerElement.current?.querySelector(
                            '.ranges ul',
                        )
                    if (ranges && rangesLabel) {
                        if (showRangesLabel) {
                            ranges.classList.add('with-label')
                            ranges.setAttribute('label', rangesLabel)
                        }
                    }
                }}
                onHide={() => {
                    endHandlingTooltipHover()
                    const classesToRemove = [theme.resolvedName, 'displayed']
                    if (isAxiomMigrationEnabled) {
                        classesToRemove.push('axiom')
                    }
                    dateRangerPickerElement.current?.classList.remove(
                        ...classesToRemove,
                    )
                    onHide?.()
                }}
                onCancel={(event, picker) => {
                    onClear?.()
                    picker.setStartDate(
                        otherInitialSettings.minDate || new Date(),
                    )
                    picker.setEndDate(
                        otherInitialSettings.endDate || new Date(),
                    )
                    triggerDateRangePickerClick()
                }}
            >
                {children || <span />}
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
                    {unavailableDateMessage}
                </Tooltip>
            )}
        </>
    )
}

export default DatePicker

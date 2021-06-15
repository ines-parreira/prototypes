import React, {
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import {useUpdateEffect} from 'react-use'
import DateRangePicker, {
    EventHandler,
    Props as DateRangeProps,
} from 'react-bootstrap-daterangepicker'
import {Tooltip} from 'reactstrap'
import moment, {Moment} from 'moment-timezone'

import css from './DatePicker.less'

type Props = {
    children?: ReactNode
    onSubmit: (start: Moment, end: Moment) => void
    isOpen?: boolean
    rangesLabel?: string
    toggle?: () => void
    unavailableDateMessage: string
}

export const DatePicker = ({
    children,
    onSubmit,
    initialSettings,
    isOpen,
    rangesLabel,
    toggle,
    unavailableDateMessage,
}: Props & Partial<DateRangeProps>) => {
    const datePickerRef = useRef<DateRangePicker>(null)
    const [isTooltipOpen, setIsTooltipOpen] = useState(false)
    const [tooltipTarget, setTooltipTarget] = useState<HTMLElement | null>(null)
    const dateRangerPickerElement = useRef<HTMLElement>()
    const [shouldToggle, setShouldToggle] = useState(true)
    const isOpenRef = useRef(isOpen)
    const timezone = useMemo(
        () =>
            moment.isMoment(initialSettings?.startDate)
                ? initialSettings?.startDate.tz() || moment().tz()
                : moment().tz(),
        [initialSettings]
    )

    useEffect(() => {
        isOpenRef.current = isOpen
    })

    useEffect(() => {
        isOpen && triggerDateRangePickerClick()
        return endHandlingTooltipHover
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
                        const strippedTimeStartDate = picker.startDate.format(
                            'YYYY-MM-DDTHH:mm'
                        )
                        const strippedTimeEndDate = picker.endDate.format(
                            'YYYY-MM-DDTHH:mm'
                        )
                        const startDate = moment(strippedTimeStartDate).tz(
                            timezone,
                            true
                        )
                        const endDate = moment(strippedTimeEndDate).tz(
                            timezone,
                            true
                        )
                        onSubmit(startDate, endDate)
                    } else {
                        onSubmit(picker.startDate, picker.endDate)
                    }
                }}
                initialSettings={initialSettings}
                onShow={(event, target) => {
                    dateRangerPickerElement.current = target.container?.get(0)
                    dateRangerPickerElement.current.classList.add('displayed')

                    const cancelBtn = dateRangerPickerElement.current?.querySelector(
                        '.cancelBtn'
                    )
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
                    if (ranges && rangesLabel) {
                        ranges.classList.add('with-label')
                        ranges.setAttribute('label', rangesLabel)
                    }
                }}
                onHide={() => {
                    endHandlingTooltipHover()
                    dateRangerPickerElement.current?.classList.remove(
                        'displayed'
                    )
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

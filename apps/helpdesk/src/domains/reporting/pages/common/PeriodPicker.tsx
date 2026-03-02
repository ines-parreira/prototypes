import type React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { DateTimeFormatMapper, DateTimeFormatType } from '@repo/utils'
import type { DateTimeResultFormatType } from '@repo/utils'
import type { Moment } from 'moment-timezone'
import moment from 'moment-timezone'
import { connect } from 'react-redux'
import { Tooltip } from 'reactstrap'

import { LegacyButton as Button } from '@gorgias/axiom'
import type { LegacyButtonFillStyle as ButtonFillStyle } from '@gorgias/axiom'

import { useTheme } from 'core/theme'
import css from 'domains/reporting/pages/common/PeriodPicker.less'
import {
    getDateRangePickerLabel,
    periodPickerMaxSpanDays,
} from 'domains/reporting/pages/common/utils'
import { getDefaultSetOfRanges } from 'domains/reporting/pages/constants'
import { useAxiomMigration } from 'hooks/useAxiomMigration'
import { getTimezone } from 'state/currentUser/selectors'
import type { RootState } from 'state/types'
import type {
    BaseDateRangePicker,
    Props as DateRangeProps,
    EventHandler,
} from 'utils/wrappers/DateRangePicker'
import { DateRangePicker } from 'utils/wrappers/DateRangePicker'

export type Props = {
    endDatetime: Moment
    formatMaxSpan?: (
        maxSpan?: moment.MomentInput | moment.Duration,
    ) => moment.Duration
    isDisabled?: boolean
    labelDateFormat?: DateTimeResultFormatType
    onChange: ({
        startDatetime,
        endDatetime,
    }: {
        startDatetime: string
        endDatetime: string
    }) => void
    startDatetime: Moment
    userTimezone?: string | null
    onOpen?: () => void
    toggleProps?: { fillStyle?: ButtonFillStyle }
    dateRanges?: { [label: string]: [Moment, Moment] }
    pickerV2Styles?: boolean
    rangesOnLeft?: boolean
    showRangesLabel?: boolean
    actionButtonsOnTheBottom?: boolean
    changeButtonColorsToV2?: boolean
    rangeDatesInFooter?: boolean
    shouldShowMonthAndYearDropdowns?: boolean
    children?: React.ReactNode
    tooltipMessageForPreviousPeriod?: string
}

export const CALENDAR_ICON = 'calendar_today'

export const PeriodPickerContainer = ({
    endDatetime,
    formatMaxSpan,
    initialSettings,
    isDisabled = false,
    labelDateFormat = DateTimeFormatMapper[
        DateTimeFormatType.SHORT_DATE_WITH_YEAR_EN_US
    ],
    onChange,
    onOpen,
    startDatetime,
    toggleProps,
    userTimezone,
    dateRanges,
    pickerV2Styles = true,
    rangesOnLeft = true,
    showRangesLabel = false,
    actionButtonsOnTheBottom = true,
    changeButtonColorsToV2 = true,
    rangeDatesInFooter = true,
    shouldShowMonthAndYearDropdowns = true,
    children,
    tooltipMessageForPreviousPeriod,
}: Props & Partial<DateRangeProps>) => {
    const [startDate, setStartDate] = useState(startDatetime)
    const [endDate, setEndDate] = useState(endDatetime)
    const datePickerRef = useRef<BaseDateRangePicker>(null)
    const dateRangerPickerElement = useRef<HTMLElement>()
    const [isTooltipOpen, setIsTooltipOpen] = useState(false)
    const [tooltipTarget, setTooltipTarget] = useState<HTMLElement | null>(null)
    const theme = useTheme()
    const { isEnabled: isAxiomMigrationEnabled } = useAxiomMigration()

    useEffect(() => {
        return endHandlingTooltipHover
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const maxSpanDays = useMemo(
        () =>
            periodPickerMaxSpanDays(
                initialSettings?.maxSpan,
                initialSettings?.minDate,
            ),
        [initialSettings?.maxSpan, initialSettings?.minDate],
    )

    const showDatePicker = () => {
        if (!datePickerRef.current) {
            return
        }

        // there are no API/attributes that enable us
        // to show and hide the date picker component,
        // so we simulate a click on it to open it
        datePickerRef.current?.$picker?.trigger('click')
    }

    const ranges: { [label: string]: [Moment, Moment] } | undefined =
        useMemo(() => {
            if (dateRanges !== undefined) {
                return dateRanges
            }
            return getDefaultSetOfRanges()
        }, [dateRanges])

    const label = useMemo(
        () => getDateRangePickerLabel(startDate, endDate, labelDateFormat),
        [endDate, labelDateFormat, startDate],
    )

    useEffect(() => {
        setStartDate(startDatetime)
        setEndDate(endDatetime)
    }, [endDate, endDatetime, startDate, startDatetime])

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

    const dateRangePickerChildren = () => {
        if (children) {
            return children
        }
        return (
            <Button
                intent="secondary"
                isDisabled={isDisabled}
                leadingIcon={CALENDAR_ICON}
                trailingIcon="arrow_drop_down"
                {...toggleProps}
            >
                {label}
            </Button>
        )
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
                            applyButtonClasses: `${
                                changeButtonColorsToV2
                                    ? 'btn-primary'
                                    : 'btn-success mr-2'
                            }`,
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
                                        : []),
                                ),
                            }),
                            showDropdowns: shouldShowMonthAndYearDropdowns,
                        }}
                        onShow={(event, target) => {
                            onOpen?.()
                            dateRangerPickerElement.current =
                                target.container?.get(0)

                            const classesToAdd = [
                                theme.resolvedName,
                                'displayed',
                            ]
                            if (isAxiomMigrationEnabled) {
                                classesToAdd.unshift('axiom')
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
                            if (ranges) {
                                if (showRangesLabel) {
                                    ranges.classList.add('with-label')
                                    ranges.setAttribute('label', 'Shortcuts')
                                }
                            }
                        }}
                        onHide={() => {
                            endHandlingTooltipHover()
                            const classesToRemove = [
                                theme.resolvedName,
                                'displayed',
                            ]
                            if (isAxiomMigrationEnabled) {
                                classesToRemove.unshift('axiom')
                            }
                            dateRangerPickerElement.current?.classList.remove(
                                ...classesToRemove,
                            )
                        }}
                    >
                        <div>{dateRangePickerChildren()}</div>
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
                                : (tooltipMessageForPreviousPeriod ??
                                  `You can't select a period longer than ${maxSpanDays} days.`)}
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

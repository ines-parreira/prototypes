import React, {useState, MouseEvent, useMemo} from 'react'
import moment, {Moment} from 'moment-timezone'

import {formatDatetime} from 'utils'

import InputField from 'pages/common/forms/input/InputField'
import IconInput from 'pages/common/forms/input/IconInput'
import DatePicker, {DatePickerProps} from 'pages/common/forms/DatePicker'
import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import {DateAndTimeFormatting} from 'constants/datetime'

import css from './CampaignSchedulePicker.less'

type Props = {
    timezone: string
    startDate: string
    endDate?: string | null
    onChange: ({
        startDate,
        endDate,
    }: {
        startDate?: Moment
        endDate?: Moment | null
    }) => void
}

const CampaignSchedulePicker: React.FC<Props> = ({
    timezone,
    startDate,
    endDate,
    onChange,
}) => {
    const shortDateBasedOnUserPreferences = useGetDateAndTimeFormat(
        DateAndTimeFormatting.ShortDateWithYear
    )

    const [isCalendarOpen, setIsCalendarOpen] = useState(false)

    const cleanEndDate = (event: MouseEvent) => {
        event.preventDefault()
        event.stopPropagation()

        onChange({
            endDate: null,
        })
    }

    const minDate = useMemo(() => {
        const currentDate = moment.utc()
        const startDateAsMinDate = moment(
            moment.utc(startDate).tz(timezone, false).format('YYYY-MM-DD')
        )

        return startDateAsMinDate.isBefore(currentDate)
            ? currentDate
            : startDateAsMinDate
    }, [startDate, timezone])

    const defaultDatePickerProps: Partial<DatePickerProps> = {
        initialSettings: {
            timePicker: false,
            singleDatePicker: true,
            showDropdowns: false,
            opens: 'right',
            minDate: moment(),
            startDate: moment.utc(startDate).tz(timezone),
        },
        showRangesLabel: false,
        shouldShowMonthAndYearDropdowns: false,
        rangeDatesInFooter: false,
        unavailableDateMessage: 'You can select future dates',
        userTimezone: timezone,
    }

    const endDatePickerProps: Partial<DatePickerProps> = {
        ...defaultDatePickerProps,
        initialSettings: {
            ...defaultDatePickerProps.initialSettings,
            minDate: minDate,
            startDate: moment.utc(endDate || startDate).tz(timezone),
        },
    }

    return (
        <>
            <div className={css.calendarWrapper}>
                <div className={css.inputWrapper}>
                    <DatePicker
                        {...defaultDatePickerProps}
                        onSubmit={(start) => {
                            onChange({
                                startDate: start,
                            })
                        }}
                    >
                        <div>
                            <InputField
                                label="From"
                                name="from"
                                value={formatDatetime(
                                    startDate,
                                    shortDateBasedOnUserPreferences,
                                    timezone
                                ).toString()}
                                prefix={
                                    <IconInput
                                        className={css.calendarIcon}
                                        icon="calendar_today"
                                    />
                                }
                            />
                        </div>
                    </DatePicker>
                </div>
                <div className={css.inputWrapper}>
                    {/* It has a different structure, because we have a cancel
                    button for the endDate input, and if we would added this
                    input as a children element to the date selector, 
                    it would not work properly - it would trigger the date selector
                    when you click cancel */}
                    <InputField
                        label="To"
                        name="to"
                        value={(endDate
                            ? formatDatetime(
                                  endDate,
                                  shortDateBasedOnUserPreferences,
                                  timezone
                              ).toString()
                            : 'No end date'
                        ).toString()}
                        onFocus={() => setIsCalendarOpen(true)}
                        prefix={
                            <IconInput
                                icon="calendar_today"
                                className={css.calendarIcon}
                            />
                        }
                        suffix={
                            endDate && (
                                <IconInput
                                    icon="cancel"
                                    className={css.removeDateBtn}
                                    onClick={cleanEndDate}
                                />
                            )
                        }
                    />
                    {!endDate && (
                        <span className={css.endDateWarning}>
                            The campaign will run indefinitely if no end date is
                            set.
                        </span>
                    )}
                    <DatePicker
                        key={startDate}
                        {...endDatePickerProps}
                        isOpen={isCalendarOpen}
                        onSubmit={(start, end) => {
                            onChange({
                                endDate: end,
                            })
                        }}
                        toggle={() => setIsCalendarOpen((s) => !s)}
                    ></DatePicker>
                </div>
            </div>
        </>
    )
}

export default CampaignSchedulePicker

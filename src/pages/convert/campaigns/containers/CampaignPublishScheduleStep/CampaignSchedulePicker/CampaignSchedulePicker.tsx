import React, {useState, MouseEvent} from 'react'
import moment from 'moment-timezone'

import {DateTimeFormatType, DateTimeFormatMapper} from 'constants/datetime'
import {formatDatetime} from 'utils'

import InputField from 'pages/common/forms/input/InputField'
import IconInput from 'pages/common/forms/input/IconInput'
import DatePicker, {DatePickerProps} from 'pages/common/forms/DatePicker'

import css from './CampaignSchedulePicker.less'

type Props = {
    scheduleConfiguration: Record<string, string>
    onChange: (data: Record<string, any>) => void
}

const CampaignSchedulePicker: React.FC<Props> = ({
    scheduleConfiguration,
    onChange,
}) => {
    const dateLabel =
        DateTimeFormatMapper[DateTimeFormatType.SHORT_DATE_WITH_YEAR_EN_US]

    const [isCalendarOpen, setIsCalendarOpen] = useState(false)

    const cleanEndDate = (event: MouseEvent) => {
        event.preventDefault()
        event.stopPropagation()

        onChange({
            ...scheduleConfiguration,
            endDate: null,
        } as Record<string, any>)
    }

    const defaultDatePickerProps: Partial<DatePickerProps> = {
        initialSettings: {
            timePicker: false,
            singleDatePicker: true,
            showDropdowns: false,
            opens: 'right',
            minDate: moment(),
            startDate: moment(scheduleConfiguration.startDate),
        },
        showRangesLabel: false,
        shouldShowMonthAndYearDropdowns: false,
        rangeDatesInFooter: false,
        unavailableDateMessage: 'You can select future dates',
    }

    const endDatePickerProps: Partial<DatePickerProps> = {
        ...defaultDatePickerProps,
        initialSettings: {
            ...defaultDatePickerProps.initialSettings,
            minDate: scheduleConfiguration.startDate ?? null,
            startDate: moment(
                scheduleConfiguration.endDate || scheduleConfiguration.startDate
            ),
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
                                ...scheduleConfiguration,
                                startDate: start,
                            })
                        }}
                    >
                        <div>
                            <InputField
                                label="From"
                                name="from"
                                value={formatDatetime(
                                    scheduleConfiguration.startDate,
                                    dateLabel
                                ).toString()}
                                prefix={<IconInput icon="calendar_today" />}
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
                        value={(scheduleConfiguration.endDate
                            ? formatDatetime(
                                  scheduleConfiguration.endDate,
                                  dateLabel
                              ).toString()
                            : 'No end date'
                        ).toString()}
                        onFocus={() => setIsCalendarOpen(true)}
                        prefix={<IconInput icon="calendar_today" />}
                        suffix={
                            scheduleConfiguration.endDate && (
                                <IconInput
                                    icon="cancel"
                                    className={css.removeDateBtn}
                                    onClick={cleanEndDate}
                                />
                            )
                        }
                    />
                    {!scheduleConfiguration.endDate && (
                        <span>
                            The campaign will run indefinitely if no end date is
                            set.
                        </span>
                    )}
                    <DatePicker
                        key={scheduleConfiguration.startDate}
                        {...endDatePickerProps}
                        isOpen={isCalendarOpen}
                        onSubmit={(start, end) => {
                            onChange({
                                ...scheduleConfiguration,
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

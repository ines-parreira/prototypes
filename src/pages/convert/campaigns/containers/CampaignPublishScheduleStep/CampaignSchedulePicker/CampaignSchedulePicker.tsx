import React, {useState, MouseEvent} from 'react'
import moment from 'moment-timezone'

import {DateTimeFormatType, DateTimeFormatMapper} from 'constants/datetime'
import {formatDatetime} from 'utils'

import InputField from 'pages/common/forms/input/InputField'
import IconInput from 'pages/common/forms/input/IconInput'
import DatePicker from 'pages/common/forms/DatePicker'

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

    return (
        <>
            <div className={css.calendarWrapper}>
                <div className={css.inputWrapper}>
                    <InputField
                        label="From"
                        name="from"
                        value={formatDatetime(
                            scheduleConfiguration.startDate,
                            dateLabel
                        ).toString()}
                        onFocus={() => setIsCalendarOpen(true)}
                        prefix={<IconInput icon="calendar_today" />}
                    />
                </div>
                <div className={css.inputWrapper}>
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
                </div>
            </div>
            <DatePicker
                isOpen={isCalendarOpen}
                initialSettings={{
                    timePicker: false,
                    singleDatePicker: false,
                    showDropdowns: false,
                    opens: 'right',
                    minDate: moment(),
                }}
                showRangesLabel={false}
                shouldShowMonthAndYearDropdowns={false}
                rangeDatesInFooter={true}
                onSubmit={(start, end) => {
                    onChange({
                        ...scheduleConfiguration,
                        startDate: start,
                        endDate: end,
                    })
                }}
                toggle={() => setIsCalendarOpen((s) => !s)}
                unavailableDateMessage="You can select future dates"
            ></DatePicker>
        </>
    )
}

export default CampaignSchedulePicker

import { ReactNode } from 'react'

import moment, { Moment } from 'moment-timezone'

import DatePicker from 'pages/common/forms/DatePicker'

type TimespanSelectorProps = {
    children?: ReactNode
    onSubmit: (startDate: Moment, endDate: Moment) => void
    onCancel: () => void
    isOpen: boolean
    toggle?: () => void
}

const createDateRange = (monthsBack: number): [Moment, Moment] => {
    const start = new Date()
    start.setMonth(start.getMonth() - monthsBack)
    start.setHours(0, 0, 0, 0)

    const end = new Date()
    end.setHours(23, 59, 59, 999)

    return [moment(start), moment(end)]
}

export const TimeFrameSelector = ({
    children,
    onSubmit,
    onCancel,
    isOpen,
    toggle,
}: TimespanSelectorProps) => {
    const today = new Date()
    const twoYearsAgo = new Date()
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const ranges: { [label: string]: [Moment, Moment] } = {
        'Last 6 months': createDateRange(6),
        'Last 12 months': createDateRange(12),
        'Last 24 months': createDateRange(24),
    }

    const handleClear = () => {
        const defaultStartDate = moment(sevenDaysAgo)
        const defaultEndDate = moment(today)

        onSubmit(defaultStartDate, defaultEndDate)

        onCancel()
    }

    return (
        <DatePicker
            isOpen={isOpen}
            onSubmit={onSubmit}
            onClear={handleClear}
            onCancel={handleClear}
            initialSettings={{
                startDate: moment(sevenDaysAgo),
                endDate: moment(today),
                minDate: moment(twoYearsAgo),
                maxDate: moment(today),
                opens: 'center',
                drops: 'up',
                timePicker: false,
                singleDatePicker: false,
                linkedCalendars: false,
                ranges,
                showDropdowns: true,
            }}
            showRangesLabel
            toggle={toggle}
            rangesLabel="Import timeframe"
            unavailableDateMessage="You can only select date ranges from the past 2 years up to today."
        >
            {children}
        </DatePicker>
    )
}

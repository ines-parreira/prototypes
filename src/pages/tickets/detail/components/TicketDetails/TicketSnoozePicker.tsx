import React from 'react'
import moment, {Moment} from 'moment-timezone'

import DatePicker from '../../../../common/forms/DatePicker'

type Props = {
    datetime?: string
    onSubmit: (date: Moment) => void
    isOpen: boolean
    timezone: string | null
    toggle: () => void
}

const TicketSnoozePicker = ({
    datetime,
    onSubmit,
    isOpen,
    timezone,
    toggle,
}: Props) => {
    const formattedDate = moment.tz(datetime, timezone!)
    const snoozeDatetime = formattedDate.isValid() ? formattedDate : moment()
    const ranges: {[label: string]: [Moment, Moment]} = {
        '1 hour': [moment().add(1, 'hours'), moment().add(1, 'hours')],
        '3 hours': [moment().add(3, 'hours'), moment().add(3, 'hours')],
        '6 hours': [moment().add(6, 'hours'), moment().add(6, 'hours')],
        '1 day': [moment().add(1, 'days'), moment().add(1, 'days')],
        '3 days': [moment().add(3, 'days'), moment().add(3, 'days')],
        '1 week': [moment().add(7, 'days'), moment().add(7, 'days')],
    }

    if (datetime && !formattedDate.isValid()) {
        console.error('Received invalid datetime', datetime)
    }

    return (
        <DatePicker
            isOpen={isOpen}
            onSubmit={onSubmit}
            initialSettings={{
                minDate: moment(),
                startDate: snoozeDatetime,
                endDate: snoozeDatetime,
                ranges,
            }}
            toggle={toggle}
            rangesLabel="Remind me in"
            unavailableDateMessage="You can’t select a time before current time to snooze a ticket."
        />
    )
}

export default TicketSnoozePicker

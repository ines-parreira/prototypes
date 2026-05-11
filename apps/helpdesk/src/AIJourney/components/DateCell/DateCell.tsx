import { formatDatetime } from '@repo/utils'
// eslint-disable-next-line react-doctor/no-moment
import moment from 'moment-timezone'

import { Text } from '@gorgias/axiom'

import type { DateFormatPreference } from 'AIJourney/hooks'

const ABSOLUTE_FORMAT = 'MMM D, YYYY h:mm A'
const EMPTY_PLACEHOLDER = '—'

type DateCellProps = {
    value: string | null | undefined
    format: DateFormatPreference
}

export const DateCell = ({ value, format }: DateCellProps) => {
    if (!value) {
        return <Text>{EMPTY_PLACEHOLDER}</Text>
    }

    const parsed = moment.utc(value)
    if (!parsed.isValid()) {
        return <Text>{EMPTY_PLACEHOLDER}</Text>
    }

    if (format === 'relative') {
        return <Text>{parsed.fromNow()}</Text>
    }

    return (
        <Text>{formatDatetime(value, ABSOLUTE_FORMAT, moment.tz.guess())}</Text>
    )
}

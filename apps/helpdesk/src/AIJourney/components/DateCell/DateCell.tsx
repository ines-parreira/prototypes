import { formatDatetime } from '@repo/utils'
import moment from 'moment'

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

    if (format === 'relative') {
        return <Text>{moment.utc(value).fromNow()}</Text>
    }

    return <Text>{formatDatetime(value, ABSOLUTE_FORMAT)}</Text>
}

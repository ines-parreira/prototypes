import { TicketCompact } from '@gorgias/helpdesk-types'

import DatetimeLabel from 'pages/common/utils/DatetimeLabel'

import { FALLBACK_SORT_KEY, SORTABLE_KEY_TO_LABEL } from './constants'
import { SortOption } from './types'

export default function DisplayedDate(
    sortOption: SortOption,
    ticket: TicketCompact,
) {
    const getTicketDateValue = (key: SortOption['key']): string | null => {
        switch (key) {
            case 'last_updated':
                return ticket.updated_datetime
            case 'last_message_datetime':
                return ticket.last_message_datetime
            case 'last_received_message_datetime':
                return ticket.last_received_message_datetime
            case 'created_datetime':
                return ticket.created_datetime
            default:
                return null
        }
    }

    const dateValue =
        getTicketDateValue(sortOption.key) || ticket[FALLBACK_SORT_KEY]

    return (
        <>
            {Boolean(sortOption.key === 'created_datetime') && (
                <>
                    {SORTABLE_KEY_TO_LABEL[sortOption.key]}
                    &nbsp;
                </>
            )}
            <DatetimeLabel dateTime={dateValue as string} />
        </>
    )
}

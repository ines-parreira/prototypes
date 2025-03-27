import { TicketSummary } from '@gorgias/api-types'

import DatetimeLabel from 'pages/common/utils/DatetimeLabel'

import { FALLBACK_SORT_KEY, SORTABLE_KEY_TO_LABEL } from './constants'
import { SortOption } from './types'

export default function DisplayedDate(
    sortOption: SortOption,
    ticket: TicketSummary,
) {
    return (
        <>
            {Boolean(sortOption.key === 'created_datetime') && (
                <>
                    {SORTABLE_KEY_TO_LABEL[sortOption.key]}
                    &nbsp;
                </>
            )}
            <DatetimeLabel
                dateTime={
                    ticket[sortOption.key] ||
                    (ticket[FALLBACK_SORT_KEY] as string)
                }
            />
        </>
    )
}

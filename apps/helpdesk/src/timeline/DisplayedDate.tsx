import DatetimeLabel from 'pages/common/utils/DatetimeLabel'
import * as timelineItem from 'timeline/helpers/timelineItem'

import { SORTABLE_KEY_TO_LABEL } from './constants'
import { SortOption, TimelineItem } from './types'

export default function DisplayedDate(
    sortOption: SortOption,
    item: TimelineItem,
) {
    const getTicketDateValue = (key: SortOption['key']): string | null => {
        switch (key) {
            case 'last_message_datetime':
                return timelineItem.getDateTimeField(
                    item,
                    'last_message_datetime',
                )
            case 'last_received_message_datetime':
                return timelineItem.getDateTimeField(
                    item,
                    'last_received_message_datetime',
                )
            case 'created_datetime':
                return timelineItem.getDateTimeField(item, 'created_datetime')
            default:
                return null
        }
    }

    const dateValue =
        getTicketDateValue(sortOption.key) ||
        timelineItem.getDateTimeField(item, 'created_datetime')

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

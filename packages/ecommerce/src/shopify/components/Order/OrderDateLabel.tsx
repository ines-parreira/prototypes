import { useUserDateTimePreferences } from '@repo/preferences'
import {
    DateAndTimeFormatting,
    formatDatetime,
    getDateAndTimeFormat,
} from '@repo/utils'

import { Text, Tooltip, TooltipContent } from '@gorgias/axiom'

import { formatOrderDate } from '../../utils/formatOrderDate'

type OrderDateLabelProps = {
    createdAt: string
}

export function OrderDateLabel({ createdAt }: OrderDateLabelProps) {
    const { dateFormat, timeFormat, timezone } = useUserDateTimePreferences()

    const displayDate = formatOrderDate(
        createdAt,
        dateFormat,
        timeFormat,
        timezone,
    )
    const exactDate = formatDatetime(
        createdAt,
        getDateAndTimeFormat(
            dateFormat,
            timeFormat,
            DateAndTimeFormatting.CompactDateWithTime,
        ),
        timezone,
    )

    return (
        <Tooltip trigger={<Text>{displayDate}</Text>}>
            <TooltipContent title={exactDate} />
        </Tooltip>
    )
}

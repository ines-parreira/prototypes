import { formatDatetime } from '@repo/utils'

import { Text, Tooltip } from '@gorgias/axiom'

import { useTicketThreadDateTimeFormat } from '../../../../../shared/hooks/useTicketThreadDateTimeFormat'
import { DateTooltipContent } from './DateTooltipContent'

export type MessageTimestampProps = {
    createdDatetime: string
}

export function MessageTimestamp({ createdDatetime }: MessageTimestampProps) {
    const { format, timezone } = useTicketThreadDateTimeFormat()
    const relativeDatetime = formatDatetime(
        createdDatetime,
        format.relative,
        timezone,
    )
    const compactDatetime = formatDatetime(
        createdDatetime,
        format.compact,
        timezone,
    )

    return (
        <Tooltip
            delay={0}
            trigger={
                <Text size="sm" color="content-neutral-secondary" wrap="nowrap">
                    {relativeDatetime}
                </Text>
            }
        >
            <DateTooltipContent datetime={compactDatetime} />
        </Tooltip>
    )
}

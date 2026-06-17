import { formatDatetime } from '@repo/utils'

import { Box, Dot, Text, Tooltip } from '@gorgias/axiom'

import { useTicketThreadDateTimeFormat } from '#shared/hooks/useTicketThreadDateTimeFormat'
import { DateTooltipContent } from '#ticket-messages/components/MessageBubble/components/MessageHeader/DateTooltipContent'

type TicketThreadEventDateTimeProps = {
    datetime: string
}

export function TicketThreadEventDateTime({
    datetime,
}: TicketThreadEventDateTimeProps) {
    const { format, timezone } = useTicketThreadDateTimeFormat()
    const relativeDatetime = formatDatetime(datetime, format.relative, timezone)
    const compactDatetime = formatDatetime(datetime, format.compact, timezone)

    return (
        <Tooltip
            delay={0}
            trigger={
                <Box gap="xxxs" alignItems="center" justifyContent="flex-end">
                    <Dot color="grey" size="sm" />
                    <Text size="sm" color="content-neutral-tertiary">
                        {relativeDatetime}
                    </Text>
                </Box>
            }
        >
            <DateTooltipContent datetime={compactDatetime} />
        </Tooltip>
    )
}

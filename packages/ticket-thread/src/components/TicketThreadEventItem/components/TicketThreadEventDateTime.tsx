import { formatDatetime } from '@repo/utils'

import { Box, Dot, Text } from '@gorgias/axiom'

import { useTicketThreadDateTimeFormat } from '../../../hooks/shared/useTicketThreadDateTimeFormat'

type TicketThreadEventDateTimeProps = {
    datetime: string
}

export function TicketThreadEventDateTime({
    datetime,
}: TicketThreadEventDateTimeProps) {
    const { format, timezone } = useTicketThreadDateTimeFormat()
    return (
        <Box gap="xxxs" alignItems="center" justifyContent="flex-end">
            <Dot color="grey" size="sm" />
            <Text size="sm" color="content-neutral-tertiary">
                {formatDatetime(datetime, format.relative, timezone)}
            </Text>
        </Box>
    )
}

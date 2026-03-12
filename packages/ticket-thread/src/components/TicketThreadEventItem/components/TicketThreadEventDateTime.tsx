import { formatDatetime } from '@repo/utils'

import { Box, Dot, Text } from '@gorgias/axiom'

import { useTicketThreadDateTimeFormat } from '../../../hooks/shared/useTicketThreadDateTimeFormat'

type TicketThreadEventDateTimeProps = {
    datetime: string
}

export function TicketThreadEventDateTime({
    datetime,
}: TicketThreadEventDateTimeProps) {
    const { datetimeFormat, timezone } = useTicketThreadDateTimeFormat()
    return (
        <Box gap="xxxs" alignItems="center" justifyContent="flex-end">
            <Dot color="grey" size="sm" />
            <Text size="sm" color="">
                {formatDatetime(datetime, datetimeFormat, timezone)}
            </Text>
        </Box>
    )
}

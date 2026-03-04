import { formatDatetime } from '@repo/utils'

import { Box, Dot, Text } from '@gorgias/axiom'

import { useTicketThreadLegacyBridge } from '../../../utils/LegacyBridge'

type TicketThreadEventDateTimeProps = {
    datetime: string
}

export function TicketThreadEventDateTime({
    datetime,
}: TicketThreadEventDateTimeProps) {
    const { datetimeFormat } = useTicketThreadLegacyBridge()
    return (
        <Box gap="xxxs" alignItems="center" justifyContent="flex-end">
            <Dot color="grey" size="sm" />
            <Text size="sm" color="">
                {formatDatetime(datetime, datetimeFormat)}
            </Text>
        </Box>
    )
}

import { formatDatetime } from '@repo/utils'

import { Text } from '@gorgias/axiom'

import { useTicketThreadDateTimeFormat } from '../../../../hooks/shared/useTicketThreadDateTimeFormat'

export type MessageTimestampProps = {
    createdDatetime: string
}

export function MessageTimestamp({ createdDatetime }: MessageTimestampProps) {
    const { format, timezone } = useTicketThreadDateTimeFormat()

    return (
        <Text size="sm" color="content-neutral-secondary">
            {formatDatetime(createdDatetime, format.relative, timezone)}
        </Text>
    )
}

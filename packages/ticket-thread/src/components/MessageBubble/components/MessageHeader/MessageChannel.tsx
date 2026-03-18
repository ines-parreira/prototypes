import { formatDatetime } from '@repo/utils'

import type { IconName } from '@gorgias/axiom'
import { Box, Icon, Text, Tooltip, TooltipContent } from '@gorgias/axiom'

import { useTicketThreadDateTimeFormat } from '../../../../hooks/shared/useTicketThreadDateTimeFormat'

export type MessageChannelProps = {
    channel?: string | null
    channelIcon?: string | null
    channelName?: string | null
    createdDatetime?: string | null
}

export function MessageChannel({
    channel,
    channelIcon,
    channelName,
    createdDatetime,
}: MessageChannelProps) {
    const { format, timezone } = useTicketThreadDateTimeFormat()
    const resolvedChannelIcon =
        channelIcon ?? (channel === 'email' ? 'comm-mail' : null)
    const resolvedChannelName = channelName ?? channel ?? null

    if (!resolvedChannelIcon) return null

    if (!resolvedChannelName) {
        return <Icon name={resolvedChannelIcon as IconName} size="sm" />
    }

    return (
        <Tooltip
            trigger={() => (
                <Icon name={resolvedChannelIcon as IconName} size="sm" />
            )}
        >
            <TooltipContent>
                <Box flexDirection="column" gap="xxs">
                    <Text size="xs">
                        Channel:{' '}
                        <Text size="xs" variant="bold">
                            {resolvedChannelName}
                        </Text>
                    </Text>
                    {createdDatetime && (
                        <Text size="xs">
                            Date:{' '}
                            <Text size="xs" variant="bold">
                                {formatDatetime(
                                    createdDatetime,
                                    format.compact,
                                    timezone,
                                )}
                            </Text>
                        </Text>
                    )}
                </Box>
            </TooltipContent>
        </Tooltip>
    )
}

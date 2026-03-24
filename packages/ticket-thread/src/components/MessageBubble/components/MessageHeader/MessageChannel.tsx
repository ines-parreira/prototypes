import { ticketMessageSourceToIconName } from '@repo/tickets'
import { formatDatetime } from '@repo/utils'

import type { IconName } from '@gorgias/axiom'
import { Box, Icon, Text, Tooltip, TooltipContent } from '@gorgias/axiom'

import type { TicketMessageChannel } from '../../../../hooks/messages/schemas'
import { useTicketThreadDateTimeFormat } from '../../../../hooks/shared/useTicketThreadDateTimeFormat'

export type MessageChannelProps = {
    channel?: TicketMessageChannel | null
    channelIcon?: string | null
    channelName?: string | null
    createdDatetime?: string | null
    variant?: 'regular' | 'internal-note'
    from?: string | null
    to?: string | null
}

export function MessageChannel({
    channel,
    channelIcon,
    channelName,
    createdDatetime,
    variant = 'regular',
    from,
    to,
}: MessageChannelProps) {
    const { format, timezone } = useTicketThreadDateTimeFormat()
    const resolvedChannelIcon =
        channelIcon ?? (channel ? ticketMessageSourceToIconName(channel) : null)
    const resolvedChannelName = channelName ?? channel ?? null
    const channelIconColor =
        variant === 'internal-note'
            ? 'content-additional-yellow'
            : 'content-neutral-secondary'

    if (!resolvedChannelIcon) return null

    if (!resolvedChannelName) {
        return (
            <Icon
                name={resolvedChannelIcon as IconName}
                size="sm"
                color={channelIconColor}
            />
        )
    }

    return (
        <Tooltip
            trigger={() => (
                <Icon
                    name={resolvedChannelIcon as IconName}
                    size="sm"
                    color={channelIconColor}
                />
            )}
        >
            <TooltipContent>
                <Box flexDirection="column" gap="xxs">
                    {from && (
                        <Text size="xs">
                            From:{' '}
                            <Text size="xs" variant="bold">
                                {from}
                            </Text>
                        </Text>
                    )}
                    {to && (
                        <Text size="xs">
                            To:{' '}
                            <Text size="xs" variant="bold">
                                {to}
                            </Text>
                        </Text>
                    )}
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

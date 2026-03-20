import { formatDatetime } from '@repo/utils'

import type { IconName } from '@gorgias/axiom'
import { Box, Icon, Text, Tooltip, TooltipContent } from '@gorgias/axiom'

import { useTicketThreadDateTimeFormat } from '../../../../hooks/shared/useTicketThreadDateTimeFormat'

export type MessageChannelProps = {
    channel?: string | null
    channelIcon?: string | null
    channelName?: string | null
    createdDatetime?: string | null
    variant?: 'regular' | 'internal-note'
}

export function MessageChannel({
    channel,
    channelIcon,
    channelName,
    createdDatetime,
    variant = 'regular',
}: MessageChannelProps) {
    const { format, timezone } = useTicketThreadDateTimeFormat()
    const resolvedChannelIcon =
        channelIcon ?? (channel === 'email' ? 'comm-mail' : null)
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

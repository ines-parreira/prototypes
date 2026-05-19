import { ticketMessageSourceToIconName } from '@repo/tickets'
import { formatDatetime } from '@repo/utils'

import type { IconName } from '@gorgias/axiom'
import { Box, Icon, Text, Tooltip, TooltipContent } from '@gorgias/axiom'

import type { TicketMessageChannel } from '../../../../hooks/messages/schemas'
import { useTicketThreadDateTimeFormat } from '../../../../hooks/shared/useTicketThreadDateTimeFormat'
import css from './MessageChannel.less'

export type MessageChannelProps = {
    channel?: TicketMessageChannel | null
    channelIcon?: string | null
    channelName?: string | null
    createdDatetime?: string | null
    variant?: 'regular' | 'internal-note'
    from?: string | null
    to?: string | null
    cc?: string | null
    bcc?: string | null
    currentPageUrl?: string | null
}

export function MessageChannel({
    channel,
    channelIcon,
    channelName,
    createdDatetime,
    variant = 'regular',
    from,
    to,
    cc,
    bcc,
    currentPageUrl,
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
            <TooltipContent maxWidth={360}>
                <Box
                    className={css.tooltipContent}
                    flexDirection="column"
                    gap="xxs"
                >
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
                    {cc && (
                        <Text size="xs">
                            Cc:{' '}
                            <Text size="xs" variant="bold">
                                {cc}
                            </Text>
                        </Text>
                    )}
                    {bcc && (
                        <Text size="xs">
                            Bcc:{' '}
                            <Text size="xs" variant="bold">
                                {bcc}
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
                    {currentPageUrl && (
                        <Text size="xs">
                            Url:{' '}
                            <a
                                href={currentPageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={currentPageUrl}
                            >
                                <Text
                                    size="xs"
                                    variant="bold"
                                    color="content-inverted-default"
                                >
                                    {currentPageUrl}
                                </Text>
                            </a>
                        </Text>
                    )}
                </Box>
            </TooltipContent>
        </Tooltip>
    )
}

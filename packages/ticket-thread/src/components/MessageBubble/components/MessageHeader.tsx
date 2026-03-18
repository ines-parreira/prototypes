import { formatDatetime } from '@repo/utils'

import {
    Avatar,
    Box,
    Icon,
    Text,
    TextVariant,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'

import { useTicketThreadDateTimeFormat } from '../../../hooks/shared/useTicketThreadDateTimeFormat'
import type { DeliveryStatus } from './DeliveryStatusIcon'
import { DeliveryStatusIcon } from './DeliveryStatusIcon'

import css from './MessageHeader.less'

export type MessageHeaderProps = {
    senderName: string
    senderAvatarUrl?: string
    channelIcon?: string | null
    channelName?: string
    openedDatetime?: string | null
    createdDatetime: string
    shouldShowStatus?: boolean
    deliveryStatus?: DeliveryStatus
}

export function MessageHeader({
    senderName,
    senderAvatarUrl,
    channelIcon,
    channelName,
    openedDatetime,
    createdDatetime,
    shouldShowStatus,
    deliveryStatus,
}: MessageHeaderProps) {
    const { datetimeFormat, timezone } = useTicketThreadDateTimeFormat()

    return (
        <Box justifyContent="space-between" alignItems="center">
            <Box alignItems="center" gap="xs">
                <Avatar name={senderName} size="md" url={senderAvatarUrl} />
                <Text size="md" variant={TextVariant.Bold}>
                    {senderName}
                </Text>
            </Box>
            <Box alignItems="center" gap="xs" className={css.meta}>
                {channelIcon && channelName ? (
                    <Tooltip
                        trigger={
                            <Icon name={channelIcon as IconName} size="sm" />
                        }
                    >
                        <TooltipContent>
                            <Box flexDirection="column" gap="xxs">
                                <Text size="xs">
                                    Channel:{' '}
                                    <Text size="xs" variant={TextVariant.Bold}>
                                        {channelName}
                                    </Text>
                                </Text>
                                {openedDatetime && (
                                    <Text size="xs">
                                        Date:{' '}
                                        <Text
                                            size="xs"
                                            variant={TextVariant.Bold}
                                        >
                                            {formatDatetime(
                                                openedDatetime,
                                                datetimeFormat,
                                            )}
                                        </Text>
                                    </Text>
                                )}
                            </Box>
                        </TooltipContent>
                    </Tooltip>
                ) : (
                    channelIcon && (
                        <Icon name={channelIcon as IconName} size="sm" />
                    )
                )}
                {shouldShowStatus && deliveryStatus && (
                    <DeliveryStatusIcon status={deliveryStatus} />
                )}
                <Text size="sm">
                    {formatDatetime(createdDatetime, datetimeFormat, timezone)}
                </Text>
            </Box>
        </Box>
    )
}

import { formatDatetime } from '@repo/utils'

import { Avatar, Box, Icon, Text, TextVariant } from '@gorgias/axiom'

import type { TicketThreadRegularMessageItem } from '../../hooks/messages/types'
import { useTicketThreadDateTimeFormat } from '../../hooks/shared/useTicketThreadDateTimeFormat'
import { getDeliveryStatusIcon } from './getDeliveryStatusIcon'

import css from './MessageHeader.less'

type MessageHeaderProps = {
    item: TicketThreadRegularMessageItem
    shouldShowStatus: boolean
}

export function MessageHeader({ item, shouldShowStatus }: MessageHeaderProps) {
    const { datetimeFormat, timezone } = useTicketThreadDateTimeFormat()
    const senderName = item.data.sender.name ?? item.data.sender.email ?? ''
    const senderProfilePictureUrl = (
        item.data.sender.meta as { profile_picture_url?: string } | null
    )?.profile_picture_url
    const channelIcon = item.data.channel === 'email' ? 'comm-mail' : null

    return (
        <Box justifyContent="space-between" alignItems="center">
            <Box alignItems="center" gap="xs">
                <Avatar
                    name={senderName}
                    size="md"
                    url={senderProfilePictureUrl}
                />
                <Text size="md" variant={TextVariant.Bold}>
                    {senderName}
                </Text>
            </Box>
            <Box alignItems="center" gap="xs" className={css.meta}>
                {channelIcon && <Icon name={channelIcon} size="sm" />}
                {shouldShowStatus && getDeliveryStatusIcon(item)}
                <Text size="sm">
                    {formatDatetime(
                        item.data.created_datetime,
                        datetimeFormat,
                        timezone,
                    )}
                </Text>
            </Box>
        </Box>
    )
}

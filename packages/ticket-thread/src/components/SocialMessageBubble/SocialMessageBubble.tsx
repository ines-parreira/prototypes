import type { ReactNode } from 'react'

import type { GoToLink } from '../../utils/buildGoToLink'
import type { DeliveryStatus } from '../MessageBubble/DeliveryStatusIcon'
import { MessageBubble } from '../MessageBubble/MessageBubble'
import { MessageHeader } from '../MessageBubble/MessageHeader'
import { GoToLinkFooter } from './GoToLinkFooter'

export type SocialMessageBubbleProps = {
    senderName: string
    senderAvatarUrl?: string
    channelIcon: string
    channelName?: string
    openedDatetime?: string | null
    createdDatetime: string
    shouldShowStatus?: boolean
    deliveryStatus?: DeliveryStatus
    goToLink?: GoToLink | null
    children: ReactNode
    className?: string
}

export function SocialMessageBubble({
    senderName,
    senderAvatarUrl,
    channelIcon,
    channelName,
    openedDatetime,
    createdDatetime,
    shouldShowStatus,
    deliveryStatus,
    goToLink,
    children,
    className,
}: SocialMessageBubbleProps) {
    return (
        <MessageBubble className={className}>
            <MessageHeader
                senderName={senderName}
                senderAvatarUrl={senderAvatarUrl}
                channelIcon={channelIcon}
                channelName={channelName}
                openedDatetime={openedDatetime}
                createdDatetime={createdDatetime}
                shouldShowStatus={shouldShowStatus}
                deliveryStatus={deliveryStatus}
            />
            {children}
            {goToLink && <GoToLinkFooter goToLink={goToLink} />}
        </MessageBubble>
    )
}

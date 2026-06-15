import {
    Avatar,
    AvatarStatusIndicator,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'
import type { TicketMessageUserOrCustomer } from '@gorgias/helpdesk-types'

import { useMessageAvatarTooltip } from './useMessageAvatarTooltip'

import css from './MessageAvatar.less'

export type MessageAvatarProps = {
    sender: TicketMessageUserOrCustomer
    fromAgent?: boolean
    showCustomerLastSeenStatus?: boolean
}

export function MessageAvatar({
    sender,
    fromAgent = false,
    showCustomerLastSeenStatus = false,
}: MessageAvatarProps) {
    const name = sender.name ?? sender.email ?? '??'
    const url =
        (sender.meta as { profile_picture_url?: string } | null)
            ?.profile_picture_url ?? ''

    const { tooltipText, isActive, showStatusIndicator } =
        useMessageAvatarTooltip({
            sender,
            fromAgent,
            showCustomerLastSeenStatus,
        })

    const status = showStatusIndicator ? (
        <AvatarStatusIndicator color={isActive ? 'green' : 'grey'} />
    ) : undefined

    return (
        <div className={css.messageAvatar}>
            {tooltipText ? (
                <Tooltip
                    trigger={
                        <Avatar
                            name={name}
                            size="md"
                            url={url}
                            status={status}
                        />
                    }
                >
                    <TooltipContent title={tooltipText} />
                </Tooltip>
            ) : (
                <Avatar name={name} size="md" url={url} status={status} />
            )}
        </div>
    )
}

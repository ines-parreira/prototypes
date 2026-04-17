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
}

export function MessageAvatar({
    sender,
    fromAgent = false,
}: MessageAvatarProps) {
    const name = sender.name ?? sender.email ?? '??'
    const url =
        (sender.meta as { profile_picture_url?: string } | null)
            ?.profile_picture_url ?? ''

    const { tooltipText, isActive } = useMessageAvatarTooltip({
        sender,
        fromAgent,
    })

    const status = <AvatarStatusIndicator color={isActive ? 'green' : 'grey'} />

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

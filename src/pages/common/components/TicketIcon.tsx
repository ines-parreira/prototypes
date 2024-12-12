import {Tooltip} from '@gorgias/merchant-ui-kit'
import classnames from 'classnames'
import React from 'react'

import {TicketStatus} from 'business/types/ticket'
import useId from 'hooks/useId'
import type {ChannelLike} from 'models/channel/types'
import SourceIcon, {AI_AGENT_ICON} from 'pages/common/components/SourceIcon'

import css from 'pages/common/components/TicketIcon.less'

export default function TicketIcon({
    channel,
    className,
    status,
}: {
    channel: ChannelLike
    className?: string
    status: TicketStatus
}) {
    const id = useId()
    const iconTargetId = 'icon-' + id + '-tooltip-target'
    const isOpen = status === TicketStatus.Open
    const isAiAgentIcon = channel === AI_AGENT_ICON
    return (
        <div
            className={classnames(
                css.ticketIconWrapper,
                {
                    [css.isOpen]: isOpen,
                    [css.isAiAgentIcon]: isAiAgentIcon,
                },
                className
            )}
            id={iconTargetId}
        >
            <SourceIcon type={channel} className={css.ticketIcon} />
            <Tooltip placement="top" target={iconTargetId}>
                This ticket is {isOpen ? 'open' : 'closed'}
            </Tooltip>
        </div>
    )
}

export function NullTicketIcon() {
    return (
        <div className={classnames(css.ticketIconWrapper)}>
            <i className={classnames('material-icons', css.ticketIcon)}>
                delete
            </i>
        </div>
    )
}

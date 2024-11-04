import {Tooltip} from '@gorgias/merchant-ui-kit'
import classnames from 'classnames'
import React from 'react'

import {TicketChannel, TicketStatus} from 'business/types/ticket'
import useId from 'hooks/useId'
import SourceIcon from 'pages/common/components/SourceIcon'

import css from 'pages/common/components/TicketIcon.less'

export default function TicketIcon({
    channel,
    className,
    status,
}: {
    channel: TicketChannel
    className?: string
    status: TicketStatus
}) {
    const id = useId()
    const iconTargetId = 'icon-' + id + '-tooltip-target'
    const isOpen = status === TicketStatus.Open
    return (
        <div
            className={classnames(
                css.ticketIconWrapper,
                {
                    [css.isOpen]: isOpen,
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

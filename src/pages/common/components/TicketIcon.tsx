import React from 'react'
import classnames from 'classnames'

import {TicketChannel} from 'business/types/ticket'
import useId from 'hooks/useId'
import SourceIcon from 'pages/common/components/SourceIcon'
import Tooltip from 'pages/common/components/Tooltip'

import css from './TicketIcon.less'

export default function TicketIcon({
    channel,
    className,
    isOpen = false,
}: {
    channel: TicketChannel
    className?: string
    isOpen?: boolean
}) {
    const id = useId()
    const iconTargetId = 'icon-' + id + '-tooltip-target'
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

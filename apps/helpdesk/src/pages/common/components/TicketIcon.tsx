import { useId } from '@repo/hooks'
import classnames from 'classnames'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import { TicketStatus } from 'business/types/ticket'
import type { ChannelLike } from 'models/channel/types'
import SourceIcon, {
    AI_AGENT_ICON,
    ERROR_ICON,
    WARNING_ICON,
} from 'pages/common/components/SourceIcon'
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
    const isWarningIcon = channel === WARNING_ICON
    const isErrorIcon = channel === ERROR_ICON

    return (
        <div
            className={classnames(
                css.ticketIconWrapper,
                {
                    [css.isOpen]: isOpen,
                    [css.isAiAgentIcon]: isAiAgentIcon,
                    [css.isWarningIcon]: isWarningIcon,
                    [css.isErrorIcon]: isErrorIcon,
                },
                className,
            )}
            id={iconTargetId}
        >
            <SourceIcon type={channel} className={css.ticketIcon} />
            {!isWarningIcon && (
                <Tooltip placement="top" target={iconTargetId}>
                    This ticket is {isOpen ? 'open' : 'closed'}
                </Tooltip>
            )}
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

import React from 'react'
import classNames from 'classnames'
import {Tooltip} from '@gorgias/ui-kit'
import Avatar from 'pages/common/components/Avatar/Avatar'
import {User} from 'config/types/user'
import css from 'pages/stats/common/AgentAvatar.less'

export const AgentAvatar = ({
    agent,
    avatarSize = 36,
    className,
}: {
    agent: {id: number} & Partial<User>
    avatarSize?: number
    className?: string
}) => {
    const agentName = agent?.name || agent?.email
    const tooltipTargetID = `agent-${agent.id}`

    return (
        <div className={classNames(css.wrapper, className)}>
            <Avatar
                name={agentName}
                url={agent.meta?.profile_picture_url}
                size={avatarSize}
                shape="round"
                className={css.avatar}
            />
            <span className={css.agent} id={tooltipTargetID}>
                {agentName}
            </span>
            <Tooltip target={tooltipTargetID} trigger={['hover']}>
                {agentName}
            </Tooltip>
        </div>
    )
}

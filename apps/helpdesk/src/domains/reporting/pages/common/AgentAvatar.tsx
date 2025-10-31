import classNames from 'classnames'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import { User } from 'config/types/user'
import css from 'domains/reporting/pages/common/AgentAvatar.less'
import Avatar from 'pages/common/components/Avatar/Avatar'

export const AgentAvatar = ({
    agent,
    avatarSize = 36,
    className,
}: {
    agent: { id: number } & Partial<User>
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

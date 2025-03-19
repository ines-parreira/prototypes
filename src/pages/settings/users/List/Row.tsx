import cs from 'classnames'
import { Link } from 'react-router-dom'

import { Badge } from '@gorgias/merchant-ui-kit'

import { AvailabilityStatusTag, User, UserRole } from 'config/types/user'
import Avatar from 'pages/common/components/Avatar/Avatar'
import { RoleLabel } from 'pages/common/utils/labels'
import { toJS } from 'utils'

import css from './List.less'

type Props = {
    agent: User
    isAccountOwner?: boolean
}

type BadgeType = 'light-grey' | 'light-success' | 'light-error'

const getBadgeConfig = (
    isBot: boolean,
    has2Fa: boolean,
): { type: BadgeType; text: string } => {
    if (isBot) {
        return {
            type: 'light-grey',
            text: 'N/A',
        }
    }

    return {
        type: has2Fa ? 'light-success' : 'light-error',
        text: has2Fa ? 'Enabled' : 'Disabled',
    }
}

const Row = ({ agent, isAccountOwner = false }: Props) => {
    const editLink = `/app/settings/users/${agent.id}`
    const has2FaEnabled = agent.has_2fa_enabled
    const availability = agent.availability_status?.status

    const badgeConfig = getBadgeConfig(
        agent.role.name === UserRole.Bot,
        has2FaEnabled,
    )

    return (
        <li className={css.row}>
            <Link to={editLink} className={css.link}>
                <span className={cs(css.cell, css.avatar)}>
                    <Avatar
                        name={agent.name || agent.email}
                        url={agent.meta?.profile_picture_url}
                        size={36}
                        shape="round"
                        badgeColor={
                            agent.role.name === UserRole.Bot
                                ? ''
                                : !availability ||
                                    availability ===
                                        AvailabilityStatusTag.Offline
                                  ? 'var(--neutral-grey-4)'
                                  : availability === AvailabilityStatusTag.Busy
                                    ? 'var(--feedback-warning)'
                                    : 'var(--feedback-success)'
                        }
                    />
                    <div className={css.name}>{agent.name}</div>
                </span>
                <span className={cs(css.cell, css.email)}>{agent.email}</span>
                <span className={cs(css.cell, css.role)}>
                    {isAccountOwner ? (
                        <Badge type={'blue'}>Account Owner</Badge>
                    ) : (
                        <RoleLabel role={toJS(agent.role)} />
                    )}
                </span>
                <span className={cs(css.cell, css.twoFA)}>
                    <Badge type={badgeConfig.type}>{badgeConfig.text}</Badge>
                </span>
            </Link>
        </li>
    )
}

export default Row

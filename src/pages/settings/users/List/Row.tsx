import React from 'react'
import {Link} from 'react-router-dom'
import cs from 'classnames'

import {toJS} from 'utils'
import {AvailabilityStatusTag, User} from 'config/types/user'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import {RoleLabel} from 'pages/common/utils/labels'
import Avatar from 'pages/common/components/Avatar/Avatar'

import css from './List.less'

type Props = {
    agent: User
    isAccountOwner?: boolean
}

const Row = ({agent, isAccountOwner = false}: Props) => {
    const editLink = `/app/settings/users/${agent.id}`
    const has2FaEnabled = agent.has_2fa_enabled
    const availability = agent.availability_status?.status

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
                            !availability ||
                            availability === AvailabilityStatusTag.Offline
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
                        <Badge type={ColorType.Blue}>Account Owner</Badge>
                    ) : (
                        <RoleLabel role={toJS(agent.role)} />
                    )}
                </span>
                <span className={cs(css.cell, css.twoFA)}>
                    <Badge
                        type={
                            has2FaEnabled
                                ? ColorType.LightSuccess
                                : ColorType.LightError
                        }
                    >
                        {has2FaEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                </span>
            </Link>
        </li>
    )
}

export default Row

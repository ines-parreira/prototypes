import React, {useCallback} from 'react'
import {Link} from 'react-router-dom'
import classnames from 'classnames'
import {Map} from 'immutable'

import useAppDispatch from 'hooks/useAppDispatch'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import IconButton from 'pages/common/components/button/IconButton'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import {RoleLabel} from 'pages/common/utils/labels'
import Avatar from 'pages/common/components/Avatar/Avatar'
import {EventNavDirection} from 'pages/settings/audit/constants'
import {deleteAgent} from 'state/agents/actions'
import {toJS} from 'utils'

import css from './Row.less'

type Props = {
    agent: Map<any, any>
    isAccountOwner: boolean
    cursorToRefresh?: string | null
    refreshData: (
        direction?: EventNavDirection,
        cursor?: string | null
    ) => Promise<{type: string; error: unknown; reason: string} | undefined>
}

const Row = ({agent, cursorToRefresh, isAccountOwner, refreshData}: Props) => {
    const dispatch = useAppDispatch()

    const handleDeleteAgent = useCallback(async () => {
        await dispatch(deleteAgent(agent.get('id')))
        await refreshData(undefined, cursorToRefresh)
    }, [agent, cursorToRefresh, refreshData, dispatch])

    const editLink = `/app/settings/users/${agent.get('id') as number}`
    const has2FaEnabled = agent.get('has_2fa_enabled')

    return (
        <Link to={editLink} className={css.component}>
            <span className="d-flex align-items-center">
                <Avatar
                    name={agent.get('name') || agent.get('email')}
                    url={agent.getIn(['meta', 'profile_picture_url'])}
                    size={36}
                    className={classnames(css.avatar, 'd-none d-md-block')}
                />
                <span className={css.meta}>
                    <p className={css.name}>
                        {agent.get('name') || agent.get('email')}
                    </p>
                    {agent.get('name') != null && (
                        <p className={classnames(css.email, 'text-faded')}>
                            {agent.get('email')}
                        </p>
                    )}
                </span>
                <span className={css.role}>
                    <RoleLabel role={toJS(agent.get('role'))} />
                    {isAccountOwner && (
                        <Badge type={ColorType.Dark}>Account Owner</Badge>
                    )}
                </span>
                <span className={css.twoFa}>
                    <Badge
                        type={
                            has2FaEnabled ? ColorType.Success : ColorType.Error
                        }
                    >
                        {has2FaEnabled ? 'Yes' : 'No'}
                    </Badge>
                </span>
                <span className={css.delete}>
                    <ConfirmationPopover
                        buttonProps={{
                            intent: 'destructive',
                        }}
                        id={`delete-agent-${agent.get('id') as number}`}
                        content={
                            <span>
                                You are about to <b>delete</b> this user. This
                                action is <b>irreversible</b>. This will
                                unassign this user from all their tickets, open
                                or closed, and delete their statistics.
                            </span>
                        }
                        onConfirm={handleDeleteAgent}
                    >
                        {({uid, onDisplayConfirmation}) => (
                            <IconButton
                                onClick={onDisplayConfirmation}
                                fillStyle="ghost"
                                intent="destructive"
                                id={uid}
                            >
                                delete
                            </IconButton>
                        )}
                    </ConfirmationPopover>
                </span>
            </span>
        </Link>
    )
}

export default Row

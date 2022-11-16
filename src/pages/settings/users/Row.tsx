import React, {Component} from 'react'
import {Link} from 'react-router-dom'
import classnames from 'classnames'
import {Map} from 'immutable'
import {connect, ConnectedProps} from 'react-redux'

import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import IconButton from 'pages/common/components/button/IconButton'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import {RoleLabel} from 'pages/common/utils/labels'
import Avatar from 'pages/common/components/Avatar/Avatar'
import {deleteAgent, fetchAgents} from 'state/agents/actions'
import {toJS} from 'utils'

import {User} from 'config/types/user'
import css from './Row.less'
import Status from './Status/Status'
import {getAvailabilityStatus} from './utils'

type Props = {
    agent: Map<any, any>
    currentPage: number
    isAccountOwner: boolean
    last: boolean
} & ConnectedProps<typeof connector>

export class RowContainer extends Component<Props> {
    _deleteAgent = () => {
        const {agent, currentPage, deleteAgent, fetchAgents, last} = this.props
        return deleteAgent(agent.get('id')).then(() => {
            // if last agent on page was deleted,
            // reload the previous page.
            const page = last && currentPage > 1 ? currentPage - 1 : currentPage
            return fetchAgents(page) as Promise<void>
        })
    }

    render() {
        const {agent: agentMap, isAccountOwner} = this.props
        const agent: User = agentMap.toJS()

        const editLink = `/app/settings/users/${agent.id}`
        const has2FaEnabled = agent.has_2fa_enabled

        const availabilityStatus = agent.availability_status
            ? getAvailabilityStatus(agent.availability_status)
            : null

        return (
            <Link to={editLink} className={css.component}>
                <span className="d-flex align-items-center">
                    <Avatar
                        name={agent.name || agent.email}
                        url={
                            (agent.meta?.profile_picture_url ??
                                '') as unknown as string
                        }
                        size={36}
                        className={classnames(css.avatar, 'd-none d-md-block')}
                    />
                    <span className={css.meta}>
                        <p className={css.name}>{agent.name || agent.email}</p>
                        {agent.name != null && (
                            <p className={classnames(css.email, 'text-faded')}>
                                {agent.email}
                            </p>
                        )}
                    </span>
                    {availabilityStatus && (
                        <Status
                            {...availabilityStatus}
                            className={css.status}
                        />
                    )}
                    <span className={css.role}>
                        <RoleLabel role={toJS(agent.role)} />
                        {isAccountOwner && (
                            <Badge type={ColorType.Dark}>Account Owner</Badge>
                        )}
                    </span>
                    <span className={css.twoFa}>
                        <Badge
                            type={
                                has2FaEnabled
                                    ? ColorType.Success
                                    : ColorType.Error
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
                            id={`delete-agent-${agent.id}`}
                            content={
                                <span>
                                    You are about to <b>delete</b> this user.
                                    This action is <b>irreversible</b>. This
                                    will unassign this user from all their
                                    tickets, open or closed, and delete their
                                    statistics.
                                </span>
                            }
                            onConfirm={this._deleteAgent}
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
}

const connector = connect(null, {
    fetchAgents,
    deleteAgent,
})

export default connector(RowContainer)

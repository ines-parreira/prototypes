import React, {Component} from 'react'
import {Link} from 'react-router-dom'
import classnames from 'classnames'
import {Map} from 'immutable'
import {connect, ConnectedProps} from 'react-redux'

import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import IconButton from 'pages/common/components/button/IconButton'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import {RoleLabel} from '../../common/utils/labels'
import Avatar from '../../common/components/Avatar/Avatar'
import {fetchPagination, deleteAgent} from '../../../state/agents/actions'

import css from './Row.less'

type Props = {
    agent: Map<any, any>
    currentPage: number
    isAccountOwner: boolean
    hasAccessTo2FA: boolean
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
        const {agent, isAccountOwner, hasAccessTo2FA} = this.props
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
                        <RoleLabel roles={agent.get('roles')} />
                        {isAccountOwner && (
                            <Badge type={ColorType.Dark}>Account Owner</Badge>
                        )}
                    </span>
                    {hasAccessTo2FA && (
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
                    )}
                    <span className={css.delete}>
                        <ConfirmationPopover
                            buttonProps={{
                                intent: 'destructive',
                            }}
                            id={`delete-agent-${agent.get('id') as number}`}
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
    fetchAgents: fetchPagination,
    deleteAgent,
})

export default connector(RowContainer)

// @flow
import React from 'react'
import {Link} from 'react-router-dom'
import classnames from 'classnames'
import {Badge} from 'reactstrap'

import type {Map} from 'immutable'

import {RoleLabel} from '../../common/utils/labels.tsx'
import Avatar from '../../common/components/Avatar'

import DeleteUser from './DeleteUser'

import css from './Row.less'

type Props = {
    agent: Map<*, *>,
    currentPage: number,
    isAccountOwner: boolean,
    deleteAgent: (id: string, currentPage: number) => Promise<*>,
    fetchAgents: (T: number) => Promise<*>,
    last: boolean,
}

export default class Row extends React.Component<Props> {
    _deleteAgent = () => {
        const {agent, currentPage, deleteAgent, fetchAgents, last} = this.props
        return deleteAgent(agent.get('id'), currentPage).then(() => {
            // if last agent on page was deleted,
            // reload the previous page.
            const page = last && currentPage > 1 ? currentPage - 1 : currentPage
            return fetchAgents(page)
        })
    }

    render() {
        const {agent, isAccountOwner} = this.props
        const editLink = `/app/settings/users/${agent.get('id')}`

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
                            <Badge color="dark" pill>
                                Account Owner
                            </Badge>
                        )}
                    </span>
                    <span className={css.delete}>
                        <DeleteUser
                            action={this._deleteAgent}
                            buttonClassName="btn-transparent"
                        >
                            <i className="material-icons md-2">delete</i>
                        </DeleteUser>
                    </span>
                </span>
            </Link>
        )
    }
}

// @flow
import React from 'react'
import {Link} from 'react-router'
import classnames from 'classnames'

import {RoleLabel} from '../../common/utils/labels'
import Avatar from '../../common/components/Avatar'
import DeleteAgent from './DeleteAgent'

import css from './Row.less'

import type {Map} from 'immutable'

type Props = {
    agent: Map<*,*>,
    currentPage: number,
    deleteAgent: (id: string, currentPage: number) => Promise<*>,
    fetchAgents: (T: number) => Promise<*>,
    last: boolean,
}

export default class Row extends React.Component<Props> {
    _deleteAgent = () => {
        const {
            agent,
            currentPage,
            deleteAgent,
            fetchAgents,
            last,
        } = this.props
        return deleteAgent(agent.get('id'), currentPage)
            .then(() => {
                // if last agent on page was deleted,
                // reload the previous page.
                const page = (last && currentPage > 1) ? currentPage - 1 : currentPage
                return fetchAgents(page)
            })
    }

    render() {
        const {agent} = this.props
        const editLink = `/app/settings/team/update/${agent.get('id')}`

        return (
            <Link
                to={editLink}
                className={css.component}
            >
                <span className="d-flex align-items-center">
                    <Avatar
                        name={agent.get('name')}
                        email={agent.get('email')}
                        url={agent.getIn(['meta', 'profile_picture_url'])}
                        size={36}
                        className={classnames(css.avatar, 'd-none d-md-block')}
                    />
                    <span className={css.meta}>
                        <p className={css.name}>
                            {agent.get('name')}
                        </p>
                        <p className={classnames(css.email, 'text-faded')}>
                            {agent.get('email')}
                        </p>
                    </span>
                    <span className={css.role}>
                        <RoleLabel
                            roles={agent.get('roles')}
                        />
                    </span>
                    <span className={css.delete}>
                        <DeleteAgent
                            action={this._deleteAgent}
                            buttonClassName="btn-transparent"
                        >
                            <i className="material-icons md-2">
                                delete
                            </i>
                        </DeleteAgent>
                    </span>
                </span>
            </Link>
        )
    }
}

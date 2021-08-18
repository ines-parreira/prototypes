import React, {Component} from 'react'
import {Link} from 'react-router-dom'
import classnames from 'classnames'
import {Badge} from 'reactstrap'
import {Map} from 'immutable'
import {connect, ConnectedProps} from 'react-redux'

import {RoleLabel} from '../../common/utils/labels'
import Avatar from '../../common/components/Avatar/Avatar'
import {fetchPagination, deleteAgent} from '../../../state/agents/actions'

import DeleteUser from './DeleteUser'
import css from './Row.less'

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
        const {agent, isAccountOwner} = this.props
        const editLink = `/app/settings/users/${agent.get('id') as number}`

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

const connector = connect(null, {
    fetchAgents: fetchPagination,
    deleteAgent,
})

export default connector(RowContainer)

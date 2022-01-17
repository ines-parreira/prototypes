import React, {Component, SyntheticEvent} from 'react'
import {Badge} from 'reactstrap'
import classnames from 'classnames'
import {Link} from 'react-router-dom'
import {Map} from 'immutable'

import {ButtonIntent} from 'pages/common/components/button/Button'
import IconButton from 'pages/common/components/button/IconButton'
import {RoleLabel} from '../../../common/utils/labels'
import Avatar from '../../../common/components/Avatar/Avatar'

import css from './Row.less'

type Props = {
    member: Map<any, any>
    isAccountOwner: boolean
    deleteTeamMember: () => Promise<void>
    select: (memberId: number) => void
    isSelected: boolean
}

type State = {
    isDeleting: boolean
}

export default class Row extends Component<Props, State> {
    state = {
        isDeleting: false,
    }

    _deleteTeamMember = (event: SyntheticEvent) => {
        event.preventDefault()
        this.setState({isDeleting: true})
        return this.props.deleteTeamMember().catch(() => {
            this.setState({isDeleting: false})
        })
    }

    render() {
        const {member, isAccountOwner, select, isSelected} = this.props
        const isDeleting = this.state.isDeleting
        const editLink = `/app/settings/users/${member.get('id') as number}`
        return (
            <Link to={editLink} className={css.component}>
                <span className="d-flex align-items-center">
                    <input
                        type="checkbox"
                        className="mr-4"
                        checked={isSelected}
                        onClick={(event) => event.stopPropagation()}
                        onChange={() => select(member.get('id'))}
                    />
                    <Avatar
                        name={member.get('name')}
                        url={member.getIn(['meta', 'profile_picture_url'])}
                        size={36}
                        className={classnames(css.avatar, 'd-none d-md-block')}
                    />
                    <span className={css.meta}>
                        <p className={css.name}>{member.get('name')}</p>
                        <p className={classnames(css.email, 'text-faded')}>
                            {member.get('email')}
                        </p>
                    </span>
                    <span className={css.role}>
                        <RoleLabel roles={member.get('roles')} />
                        {isAccountOwner && (
                            <Badge color="dark" pill>
                                Account Owner
                            </Badge>
                        )}
                    </span>
                    <span className={css.delete}>
                        <IconButton
                            className={css.deleteButton}
                            intent={ButtonIntent.Text}
                            onClick={this._deleteTeamMember}
                            isLoading={isDeleting}
                            type="button"
                        >
                            delete
                        </IconButton>
                    </span>
                </span>
            </Link>
        )
    }
}

import React, {Component, SyntheticEvent} from 'react'
import classnames from 'classnames'
import {Link} from 'react-router-dom'
import {Map} from 'immutable'

import CheckBox from 'pages/common/forms/CheckBox'
import Avatar from 'pages/common/components/Avatar/Avatar'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import IconButton from 'pages/common/components/button/IconButton'
import {RoleLabel} from 'pages/common/utils/labels'

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
                    <CheckBox
                        className="mr-4"
                        isChecked={isSelected}
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
                            <Badge type={ColorType.Dark}>Account Owner</Badge>
                        )}
                    </span>
                    <span className={css.delete}>
                        <IconButton
                            fillStyle="ghost"
                            intent="destructive"
                            onClick={this._deleteTeamMember}
                            isLoading={isDeleting}
                        >
                            delete
                        </IconButton>
                    </span>
                </span>
            </Link>
        )
    }
}

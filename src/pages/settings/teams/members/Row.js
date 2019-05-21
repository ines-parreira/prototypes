// @flow
import React, {Component} from 'react'
import {Badge, Button} from 'reactstrap'
import classnames from 'classnames'

import type {Map} from 'immutable'

import {RoleLabel} from '../../../common/utils/labels'
import Avatar from '../../../common/components/Avatar'

import css from './Row.less'


type Props = {
    member: Map<*,*>,
    isAccountOwner: boolean,
    deleteTeamMember: () => Promise<*>,
    select: (memberId: number) => void,
    isSelected: boolean
}

type State = {
    isDeleting: boolean
}

export default class Row extends Component<Props, State> {
    state = {
        isDeleting: false
    }

    _deleteTeamMember = () => {
        this.setState({isDeleting: true})
        return this.props.deleteTeamMember().catch(() => {
            this.setState({isDeleting: false})
        })
    }

    render() {
        const {member, isAccountOwner, select, isSelected} = this.props
        const isDeleting = this.state.isDeleting
        return (
            <div className={css.component}>
                <span className="d-flex align-items-center">
                    <input
                        type="checkbox"
                        className="mr-4"
                        checked={isSelected}
                        onChange={() => select(member.get('id'))}
                    />
                    <Avatar
                        name={member.get('name')}
                        url={member.getIn(['meta', 'profile_picture_url'])}
                        size={36}
                        className={classnames(css.avatar, 'd-none d-md-block')}
                    />
                    <span className={css.meta}>
                        <p className={css.name}>
                            {member.get('name')}
                        </p>
                        <p className={classnames(css.email, 'text-faded')}>
                            {member.get('email')}
                        </p>
                    </span>
                    <span className={css.role}>
                        <RoleLabel
                            roles={member.get('roles')}
                        />
                        {
                            isAccountOwner && (
                                <Badge
                                    color='dark'
                                    pill
                                >
                                    Account Owner
                                </Badge>
                            )
                        }
                    </span>
                    <span className={css.delete}>
                        <Button
                            onClick={this._deleteTeamMember}
                            className={classnames('btn-transparent', {'btn-loading': isDeleting})}
                            disabled={isDeleting}
                        >
                            <i className="material-icons md-2">
                                delete
                            </i>
                        </Button>
                    </span>
                </span>
            </div>
        )
    }
}


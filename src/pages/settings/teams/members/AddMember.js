// @flow
import React, {Component} from 'react'
import {connect} from 'react-redux'
import {
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Input,
} from 'reactstrap'
import {type List, Map} from 'immutable'
import classnames from 'classnames'

import {AgentLabel} from '../../../common/utils/labels.tsx'
import type {teamType} from '../../../../state/teams/types'
import * as agentSelectors from '../../../../state/agents/selectors.ts'

import css from './AddMember.less'

type Props = {
    team: teamType,
    users: List<Map<*, *>>,
    addTeamMember: () => Promise<*>,
}

type State = {
    isOpen: boolean,
    isLoading: boolean,
    search: string,
}

export class AddMemberContainer extends Component<Props, State> {
    state = {
        isOpen: false,
        isLoading: false,
        search: '',
    }

    _toggle = () => this.setState({isOpen: !this.state.isOpen})

    _onSearch = (event: SyntheticInputEvent<HTMLInputElement>) =>
        this.setState({search: event.target.value})

    _addTeamMember = (userId: number) => {
        this.setState({isLoading: true})
        // $FlowFixMe
        this.props.addTeamMember(userId).finally(() => {
            this.setState({isLoading: false})
        })
    }

    render() {
        const {team, users} = this.props
        const isLoading = this.state.isLoading
        const search = this.state.search.trim().toLowerCase()
        const teamMemberIds = team
            .get('members', [])
            .map((member) => member.get('id'))
        const availableUsers = users.filter((user) => {
            return (
                ((user.get('name') || '').toLowerCase().includes(search) ||
                    user.get('email').toLowerCase().includes(search)) &&
                !teamMemberIds.includes(user.get('id'))
            )
        })

        return (
            <Dropdown isOpen={this.state.isOpen} toggle={this._toggle}>
                <DropdownToggle
                    color="success"
                    type="button"
                    className={classnames({'btn-loading': isLoading})}
                    disabled={isLoading}
                    caret
                >
                    Add team member
                </DropdownToggle>
                <DropdownMenu right style={{width: '230px'}}>
                    <DropdownItem header>
                        {
                            // rebuild input on each opening so "autoFocus" works
                            this.state.isOpen && (
                                <div className="input-icon input-icon-right">
                                    <i className="icon material-icons md-2">
                                        search
                                    </i>

                                    <Input
                                        placeholder="Search user..."
                                        autoFocus
                                        value={this.state.search}
                                        onChange={this._onSearch}
                                    />
                                </div>
                            )
                        }
                    </DropdownItem>
                    <DropdownItem divider />
                    <div className={css.content}>
                        {availableUsers.size ? (
                            availableUsers.map((user) => {
                                const userId = user.get('id')
                                return (
                                    <DropdownItem
                                        key={userId}
                                        onClick={() =>
                                            this._addTeamMember(userId)
                                        }
                                    >
                                        <AgentLabel
                                            name={
                                                user.get('name') ||
                                                user.get('email')
                                            }
                                            profilePictureUrl={user.getIn([
                                                'meta',
                                                'profile_picture_url',
                                            ])}
                                            shouldDisplayAvatar
                                        />
                                    </DropdownItem>
                                )
                            })
                        ) : (
                            <DropdownItem key="noUser" header>
                                Could not find any user to add
                            </DropdownItem>
                        )}
                    </div>
                </DropdownMenu>
            </Dropdown>
        )
    }
}

export default connect((state) => {
    return {
        users: agentSelectors.getAgents(state),
    }
})(AddMemberContainer)

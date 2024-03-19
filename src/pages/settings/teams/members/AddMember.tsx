import React, {Component} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from 'reactstrap'
import {Map} from 'immutable'
import classnames from 'classnames'

import {Team} from 'models/team/types'
import IconInput from 'pages/common/forms/input/IconInput'
import TextInput from 'pages/common/forms/input/TextInput'
import {AgentLabel} from 'pages/common/utils/labels'
import {getHumanAgents} from 'state/agents/selectors'
import {RootState} from 'state/types'

import css from './AddMember.less'

type Props = {
    team: Team
    addTeamMember: (userId: number) => Promise<unknown>
} & ConnectedProps<typeof connector>

type State = {
    isOpen: boolean
    isLoading: boolean
    search: string
}

export class AddMemberContainer extends Component<Props, State> {
    state = {
        isOpen: false,
        isLoading: false,
        search: '',
    }

    _toggle = () => this.setState({isOpen: !this.state.isOpen})

    _onSearch = (value: string) => this.setState({search: value})

    _addTeamMember = (userId: number) => {
        this.setState({isLoading: true})
        this.props.addTeamMember(userId).finally(() => {
            this.setState({isLoading: false})
        })
    }

    render() {
        const {team, users} = this.props
        const isLoading = this.state.isLoading
        const search = this.state.search.trim().toLowerCase()
        const teamMemberIds = team.members.map((member) => member.id)
        const availableUsers = users.filter((user: Map<any, any>) => {
            return (
                (((user.get('name') as string) || '')
                    .toLowerCase()
                    .includes(search) ||
                    (user.get('email') as string)
                        .toLowerCase()
                        .includes(search)) &&
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
                                    <TextInput
                                        placeholder="Search user..."
                                        autoFocus
                                        value={this.state.search}
                                        onChange={this._onSearch}
                                        suffix={<IconInput icon="search" />}
                                    />
                                </div>
                            )
                        }
                    </DropdownItem>
                    <DropdownItem divider />
                    <div className={css.content}>
                        {availableUsers.size ? (
                            availableUsers.map((user: Map<any, any>) => {
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

const connector = connect((state: RootState) => {
    return {
        users: getHumanAgents(state),
    }
})

export default connector(AddMemberContainer)

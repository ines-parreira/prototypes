// @flow
import React from 'react'
import classnames from 'classnames'
import {fromJS, Map} from 'immutable'
import {connect} from 'react-redux'
import {
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Input,
} from 'reactstrap'
import _isUndefined from 'lodash/isUndefined'

import * as currentUserSelectors from '../../../../../../state/currentUser/selectors'
import * as agentSelectors from '../../../../../../state/agents/selectors'
import * as teamsSelectors from '../../../../../../state/teams/selectors'

import shortcutManager from '../../../../../../services/shortcutManager/index'
import {AgentLabel, TeamLabel} from '../../../../../common/utils/labels'

import {setAgent, setTeam} from '../../../../../../state/ticket/actions'

import css from './TicketAssignee.less'

type Props = {
    handleTeams: boolean,
    handleUsers: boolean,
    users: Map<*, *>,
    teams: Map<*, *>,
    currentAssigneeUser: ?Map<*, *>,
    currentAssigneeTeam: ?Map<*, *>,
    currentUser: Map<*, *>,
    direction: string,
    setUser: typeof setAgent,
    setTeam: typeof setTeam,
    profilePictureUrl?: string,
    className?: string,
    transparent?: boolean,
}

type State = {
    dropdownOpen: boolean,
    users: Object,
    teams: Object,
    search: string,
}

// TODO(agent-null-names): remove fallbacks in this component when https://github.com/gorgias/gorgias/issues/4413 is fixed
export class TicketAssignee extends React.Component<Props, State> {
    static defaultProps = {
        handleTeams: true,
        handleUsers: true,
        direction: 'left',
        transparent: false,
    }

    constructor(props: Props) {
        super(props)
        this.state = {
            dropdownOpen: false,
            users: props.users,
            teams: props.teams,
            search: '',
        }
    }

    componentDidMount() {
        this._bindKeys()
    }

    componentWillUnmount() {
        shortcutManager.unbind('TicketDetailContainer')
    }

    _bindKeys = () => {
        shortcutManager.bind('TicketDetailContainer', {
            OPEN_ASSIGNEE: {
                action: (e) => {
                    // shortcut key gets typed in the search field otherwise
                    e.preventDefault()
                    this._toggle()
                },
            },
            CLOSE_ASSIGNEE: {
                key: 'esc',
                action: () => this._toggle(null, false),
            },
        })
    }

    _clearUser = () => {
        this.props.setUser(null)
        this.setState({search: ''})
    }

    _clearTeam = () => {
        this.props.setTeam(null)
        this.setState({search: ''})
    }

    _selectUser = (user: Map<*, *>) => {
        this.props.setUser({
            id: user.get('id'),
            name: user.get('name'),
            email: user.get('email'),
            meta: user.get('meta'),
        })
        this.setState({search: ''})
    }

    _selectTeam = (team: Map<*, *>) => {
        this.props.setTeam({
            id: team.get('id'),
            name: team.get('name'),
            decoration: team.get('decoration'),
        })
        this.setState({search: ''})
    }

    _toggle = (e?: any, visible?: boolean) => {
        const opens = !_isUndefined(visible)
            ? visible
            : !this.state.dropdownOpen

        this.setState({
            dropdownOpen: opens,
        })

        if (opens) {
            const search = ''
            this.setState({search})
            this._filterResults(search)
        }
    }

    _search = (search: string) => {
        this.setState({search})
        this._filterResults(search)
    }

    _filterResults = (search: string) => {
        this.setState({
            users: this.props.users.filter((user) => {
                const agentLabel = user.get('name') || user.get('email')
                return agentLabel.toLowerCase().includes(search.toLowerCase())
            }),
            teams: this.props.teams.filter((team) =>
                team.get('name').toLowerCase().includes(search.toLowerCase())
            ),
        })
    }

    _renderDropdownToggle() {
        const {
            currentAssigneeUser,
            currentAssigneeTeam,
            profilePictureUrl,
            transparent,
        } = this.props
        let label = null

        if (currentAssigneeUser) {
            label = (
                <AgentLabel
                    name={
                        currentAssigneeUser.get('name') ||
                        currentAssigneeUser.get('email')
                    }
                    profilePictureUrl={profilePictureUrl}
                    maxWidth="100"
                    shouldDisplayAvatar
                />
            )
        } else if (currentAssigneeTeam) {
            label = (
                <TeamLabel
                    name={currentAssigneeTeam.get('name')}
                    emoji={currentAssigneeTeam.getIn(['decoration', 'emoji'])}
                    maxWidth={100}
                    shouldDisplayAvatar
                />
            )
        } else {
            label = <span>Unassigned</span>
        }

        return (
            <DropdownToggle
                color="secondary"
                type="button"
                className={classnames(css.toggle, {
                    'btn-transparent': transparent,
                })}
                caret
            >
                {label}
            </DropdownToggle>
        )
    }

    _renderMenu = () => {
        const {
            handleTeams,
            handleUsers,
            teams,
            currentAssigneeTeam,
            currentAssigneeUser,
        } = this.props
        let options = fromJS([])

        const getDivider = (key) => <DropdownItem key={key} divider />

        options = options.concat(this._getMenuMainOptions())

        if (handleTeams && teams.size) {
            options = options.push(getDivider('dividerBeforeTeams'))
            options = options.concat(
                <TicketAssigneeTeamSection
                    key="teamSection"
                    currentAssigneeTeam={currentAssigneeTeam}
                    teams={this.state.teams}
                    selectTeam={this._selectTeam}
                />
            )
        }

        if (handleUsers) {
            options = options.push(getDivider('dividerBeforeUsers'))
            options = options.concat(
                <TicketAssigneeUserSection
                    key="userSection"
                    currentAssigneeUser={currentAssigneeUser}
                    users={this.state.users}
                    selectUser={this._selectUser}
                />
            )
        }

        return options
    }

    _getMenuMainOptions() {
        const {
            currentAssigneeUser,
            currentAssigneeTeam,
            currentUser,
            handleUsers,
        } = this.props
        const isCurrentUserAssigned =
            currentAssigneeUser &&
            currentUser &&
            currentUser.get('id') === currentAssigneeUser.get('id')
        let options = fromJS([])

        if (currentAssigneeTeam) {
            options = options.push(
                <DropdownItem
                    key="currentAssigneeTeam"
                    className={css.assigneeItem}
                >
                    <TeamLabel
                        name={currentAssigneeTeam.get('name')}
                        emoji={currentAssigneeTeam.getIn([
                            'decoration',
                            'emoji',
                        ])}
                        className={css.assigneeLabel}
                        shouldDisplayAvatar
                        shouldDisplayTeamIcon
                    />
                    <i
                        className="material-icons md-2"
                        onClick={() => this._clearTeam()}
                    >
                        close
                    </i>
                </DropdownItem>
            )
        }

        if (currentAssigneeUser) {
            options = options.push(
                <DropdownItem
                    key="currentAssigneeUser"
                    className={css.assigneeItem}
                >
                    <AgentLabel
                        name={
                            currentAssigneeUser.get('name') ||
                            currentAssigneeUser.get('email')
                        }
                        profilePictureUrl={currentAssigneeUser.getIn([
                            'meta',
                            'profile_picture_url',
                        ])}
                        className={css.assigneeLabel}
                        shouldDisplayAvatar
                    />
                    <i
                        className="material-icons md-2"
                        onClick={() => this._clearUser()}
                    >
                        close
                    </i>
                </DropdownItem>
            )
        }

        if (!isCurrentUserAssigned && handleUsers) {
            options = options.push(
                <DropdownItem
                    key="yourself"
                    type="button"
                    className={css.item}
                    onClick={() => this._selectUser(currentUser)}
                >
                    Assign yourself
                </DropdownItem>
            )
        }

        return options
    }

    render() {
        const {direction, className} = this.props

        return (
            <Dropdown
                className={className}
                isOpen={this.state.dropdownOpen}
                toggle={this._toggle}
            >
                {this._renderDropdownToggle()}
                <DropdownMenu
                    right={direction === 'right'}
                    style={{width: '260px'}}
                >
                    <DropdownItem header>ASSIGN TO:</DropdownItem>
                    <DropdownItem header className="dropdown-item-input">
                        {
                            // rebuild input on each opening so "autoFocus" works
                            this.state.dropdownOpen && (
                                <div className="input-icon input-icon-right">
                                    <i className="icon material-icons md-2">
                                        search
                                    </i>

                                    <Input
                                        placeholder="Search users or teams..."
                                        autoFocus
                                        value={this.state.search}
                                        onChange={(e) =>
                                            this._search(e.target.value)
                                        }
                                        className={css.searchInput}
                                    />
                                </div>
                            )
                        }
                    </DropdownItem>
                    {this._renderMenu()}
                </DropdownMenu>
            </Dropdown>
        )
    }
}

const mapStateToProps = (state) => ({
    users: agentSelectors.getAgents(state),
    teams: teamsSelectors.getTeams(state),
    currentUser: currentUserSelectors.getCurrentUser(state),
})

export default connect(mapStateToProps)(TicketAssignee)

// Teams section
type TeamSectionProps = {
    currentAssigneeTeam: ?Map<*, *>,
    teams: Object,
    selectTeam: (team: Map<*, *>) => void,
}

export class TicketAssigneeTeamSection extends React.Component<TeamSectionProps> {
    render() {
        const {currentAssigneeTeam, teams, selectTeam} = this.props
        const availableTeams = currentAssigneeTeam
            ? teams.filter(
                  (team) => team.get('id') !== currentAssigneeTeam.get('id')
              )
            : teams

        let options = fromJS([])

        options = options.push(
            <DropdownItem key="teamsHeader" header>
                TEAMS
            </DropdownItem>
        )

        if (availableTeams.isEmpty()) {
            options = options.push(
                <DropdownItem key="noTeams" header>
                    Could not find any team
                </DropdownItem>
            )
        } else {
            options = options.concat(
                <div key="availableTeams" className={css.teams}>
                    {availableTeams.map((team) => {
                        return (
                            <DropdownItem
                                key={team.get('id')}
                                type="button"
                                className={css.item}
                                onClick={() => selectTeam(team)}
                            >
                                <TeamLabel
                                    name={team.get('name')}
                                    emoji={team.getIn(['decoration', 'emoji'])}
                                    shouldDisplayAvatar
                                />
                            </DropdownItem>
                        )
                    })}
                </div>
            )
        }

        return options
    }
}

// Users section
type UserSectionProps = {
    currentAssigneeUser: ?Map<*, *>,
    users: Object,
    selectUser: (user: Map<*, *>) => void,
}

export class TicketAssigneeUserSection extends React.Component<UserSectionProps> {
    render() {
        const {currentAssigneeUser, users, selectUser} = this.props
        const availableUsers = currentAssigneeUser
            ? users.filter(
                  (user) => user.get('id') !== currentAssigneeUser.get('id')
              )
            : users

        let options = fromJS([])

        options = options.push(
            <DropdownItem key="usersHeader" header>
                USERS
            </DropdownItem>
        )

        if (availableUsers.isEmpty()) {
            options = options.push(
                <DropdownItem key="noUsers" header>
                    Could not find any user
                </DropdownItem>
            )
        } else {
            options = options.concat(
                <div key="availableUsers" className={css.users}>
                    {availableUsers.map((user) => {
                        return (
                            <DropdownItem
                                key={user.get('id')}
                                type="button"
                                className={css.item}
                                onClick={() => selectUser(user)}
                            >
                                <AgentLabel
                                    name={user.get('name') || user.get('email')}
                                    profilePictureUrl={user.getIn([
                                        'meta',
                                        'profile_picture_url',
                                    ])}
                                    shouldDisplayAvatar
                                />
                            </DropdownItem>
                        )
                    })}
                </div>
            )
        }

        return options
    }
}

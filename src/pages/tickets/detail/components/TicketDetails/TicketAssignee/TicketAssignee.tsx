import React, {Component, createRef, KeyboardEvent} from 'react'
import classnames from 'classnames'
import {Map, List} from 'immutable'
import {connect, ConnectedProps} from 'react-redux'
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from 'reactstrap'
import _isUndefined from 'lodash/isUndefined'

import {Direction} from 'reactstrap/lib/Dropdown'
import {getCurrentUser} from '../../../../../../state/currentUser/selectors'
import {getAgents} from '../../../../../../state/agents/selectors'
import {getTeams} from '../../../../../../state/teams/selectors'
import {RootState} from '../../../../../../state/types'
import shortcutManager from '../../../../../../services/shortcutManager/index'
import {AgentLabel, TeamLabel} from '../../../../../common/utils/labels'
import {setAgent, setTeam} from '../../../../../../state/ticket/actions'
import PeopleSearchInput from '../../../../../common/forms/PeopleSearchInput/PeopleSearchInput'
import PeopleSearchResults from '../../../../../common/forms/PeopleSearchInput/PeopleSearchResults'

import css from './TicketAssignee.less'

type Props = {
    handleTeams: boolean
    handleUsers: boolean
    currentAssigneeUser: Map<any, any> | null
    currentAssigneeTeam: Map<any, any> | null
    direction?: Direction
    menuDirection?: string
    dropdownContainer?: HTMLElement
    setUser: (
        ...args: ArgumentsOf<typeof setAgent>
    ) => ReturnType<ReturnType<typeof setAgent>> | void
    setTeam: (
        ...args: ArgumentsOf<typeof setTeam>
    ) => ReturnType<ReturnType<typeof setTeam>> | void
    profilePictureUrl?: string
    className?: string
    transparent?: boolean
} & ConnectedProps<typeof connector>

type State = {
    dropdownOpen: boolean
    users: List<any>
    teams: List<any>
    search: string
}

// TODO(agent-null-names): remove fallbacks in this component when https://github.com/gorgias/gorgias/issues/4413 is fixed
export class TicketAssigneeContainer extends Component<Props, State> {
    static defaultProps: Pick<
        Props,
        | 'handleTeams'
        | 'handleUsers'
        | 'menuDirection'
        | 'transparent'
        | 'direction'
    > = {
        handleTeams: true,
        handleUsers: true,
        menuDirection: 'left',
        transparent: false,
        direction: 'down',
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
        void this.props.setUser(null)
        this.setState({search: ''})
    }

    _clearTeam = () => {
        void this.props.setTeam(null)
        this.setState({search: ''})
    }

    _selectUser = (user: Map<any, any>) => {
        void this.props.setUser({
            id: user.get('id'),
            name: user.get('name'),
            email: user.get('email'),
            meta: user.get('meta'),
        })
        this.setState({search: ''})
    }

    _selectTeam = (team: Map<any, any>) => {
        void this.props.setTeam({
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
            users: this.props.users.filter((user: Map<any, any>) => {
                const agentLabel: string = user.get('name') || user.get('email')
                return agentLabel.toLowerCase().includes(search.toLowerCase())
            }) as List<any>,
            teams: this.props.teams.filter((team: Map<any, any>) =>
                (team.get('name') as string)
                    .toLowerCase()
                    .includes(search.toLowerCase())
            ) as List<any>,
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

    searchRef = createRef<HTMLDivElement>()

    handleSearchKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowDown' && this.searchRef.current) {
            const firstChild = this.searchRef.current
                .firstChild as HTMLInputElement
            firstChild.focus()
        }
    }

    _renderMenu = () => {
        const {
            handleTeams,
            handleUsers,
            teams,
            currentAssigneeTeam,
            currentAssigneeUser,
        } = this.props

        const {teams: filteredTeams, users: filteredUsers} = this.state

        const availableTeams = currentAssigneeTeam
            ? (filteredTeams.filter(
                  (team: Map<any, any>) =>
                      team.get('id') !== currentAssigneeTeam.get('id')
              ) as List<any>)
            : filteredTeams

        const availableUsers = currentAssigneeUser
            ? (filteredUsers.filter(
                  (user: Map<any, any>) =>
                      user.get('id') !== currentAssigneeUser.get('id')
              ) as List<any>)
            : filteredUsers

        return (
            <div ref={this.searchRef}>
                <PeopleSearchResults
                    handleTeams={handleTeams && !!teams.size}
                    handleUsers={handleUsers}
                    teams={availableTeams}
                    users={availableUsers}
                    onTeamClick={this._selectTeam}
                    onUserClick={this._selectUser}
                >
                    {this._renderMenuMainOptions()}
                </PeopleSearchResults>
            </div>
        )
    }

    _renderMenuMainOptions() {
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

        return (
            <>
                {currentAssigneeTeam && (
                    <DropdownItem className={css.assigneeItem}>
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
                )}
                {currentAssigneeUser && (
                    <DropdownItem className={css.assigneeItem}>
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
                )}
                {!isCurrentUserAssigned && handleUsers && (
                    <DropdownItem
                        type="button"
                        className={css.item}
                        onClick={() => this._selectUser(currentUser)}
                    >
                        Assign yourself
                    </DropdownItem>
                )}
            </>
        )
    }

    render() {
        const {direction, menuDirection, className, dropdownContainer} =
            this.props
        const {search, dropdownOpen} = this.state

        return (
            <Dropdown
                className={className}
                isOpen={dropdownOpen}
                toggle={this._toggle}
                a11y={false}
                direction={direction}
            >
                {this._renderDropdownToggle()}
                <DropdownMenu
                    right={menuDirection === 'right'}
                    style={{width: '260px', zIndex: 1051}}
                    container={dropdownContainer}
                    modifiers={{
                        preventOverflow: {boundariesElement: 'viewport'},
                    }}
                >
                    <DropdownItem header>ASSIGN TO:</DropdownItem>
                    <DropdownItem header className="dropdown-item-input">
                        {
                            // rebuild input on each opening so "autoFocus" works
                            dropdownOpen && (
                                <PeopleSearchInput
                                    autoFocus
                                    value={search}
                                    className={css.searchInput}
                                    onChange={this._search}
                                    onKeyDown={this.handleSearchKeyDown}
                                />
                            )
                        }
                    </DropdownItem>
                    {this._renderMenu()}
                </DropdownMenu>
            </Dropdown>
        )
    }
}

const connector = connect((state: RootState) => ({
    users: getAgents(state),
    teams: getTeams(state) as List<any>,
    currentUser: getCurrentUser(state),
}))

export default connector(TicketAssigneeContainer)

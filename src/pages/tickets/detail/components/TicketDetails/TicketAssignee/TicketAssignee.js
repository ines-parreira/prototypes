// @flow
import React from 'react'
import classnames from 'classnames'
import {Map} from 'immutable'
import {connect} from 'react-redux'
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from 'reactstrap'
import _isUndefined from 'lodash/isUndefined'

import * as currentUserSelectors from '../../../../../../state/currentUser/selectors.ts'
import * as agentSelectors from '../../../../../../state/agents/selectors.ts'
import * as teamsSelectors from '../../../../../../state/teams/selectors.ts'

import shortcutManager from '../../../../../../services/shortcutManager/index.ts'
import {AgentLabel, TeamLabel} from '../../../../../common/utils/labels'
import {setAgent, setTeam} from '../../../../../../state/ticket/actions.ts'
import PeopleSearchInput from '../../../../../common/forms/PeopleSearchInput'
import PeopleSearchResults from '../../../../../common/forms/PeopleSearchInput/PeopleSearchResults'

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

    searchRef = React.createRef()

    handleSearchKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowDown' && this.searchRef.current) {
            const firstChild = this.searchRef.current.firstChild
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
            ? filteredTeams.filter(
                  (team) => team.get('id') !== currentAssigneeTeam.get('id')
              )
            : filteredTeams

        const availableUsers = currentAssigneeUser
            ? filteredUsers.filter(
                  (user) => user.get('id') !== currentAssigneeUser.get('id')
              )
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
        const {direction, className} = this.props
        const {search, dropdownOpen} = this.state

        return (
            <Dropdown
                className={className}
                isOpen={dropdownOpen}
                toggle={this._toggle}
                a11y={false}
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

const mapStateToProps = (state) => ({
    users: agentSelectors.getAgents(state),
    teams: teamsSelectors.getTeams(state),
    currentUser: currentUserSelectors.getCurrentUser(state),
})

export default connect(mapStateToProps)(TicketAssignee)

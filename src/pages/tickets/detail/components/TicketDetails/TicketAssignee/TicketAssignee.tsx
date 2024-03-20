import React, {
    ComponentProps,
    KeyboardEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import classnames from 'classnames'
import {Map, List} from 'immutable'
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from 'reactstrap'
import _isUndefined from 'lodash/isUndefined'
import {Direction} from 'reactstrap/lib/Dropdown'

import PeopleSearchInput from 'pages/common/forms/PeopleSearchInput/PeopleSearchInput'
import PeopleSearchResults from 'pages/common/forms/PeopleSearchInput/PeopleSearchResults'
import {AgentLabel, TeamLabel} from 'pages/common/utils/labels'
import shortcutManager from 'services/shortcutManager/index'
import {getHumanAgents} from 'state/agents/selectors'
import {getCurrentUser} from 'state/currentUser/selectors'
import {getTeams} from 'state/teams/selectors'
import {setAgent, setTeam} from 'state/ticket/actions'

import useAppSelector from 'hooks/useAppSelector'
import css from './TicketAssignee.less'

type Props = {
    handleTeams?: boolean
    handleUsers?: boolean
    currentAssigneeUser?: Map<any, any> | null
    currentAssigneeTeam?: Map<any, any> | null
    direction?: Direction
    menuDirection?: string
    dropdownContainer?: ComponentProps<typeof DropdownMenu>['container']
    setUser: (
        ...args: ArgumentsOf<typeof setAgent>
    ) => ReturnType<ReturnType<typeof setAgent>> | void
    setTeam: (
        ...args: ArgumentsOf<typeof setTeam>
    ) => ReturnType<ReturnType<typeof setTeam>> | void
    profilePictureUrl?: string
    className?: string
    transparent?: boolean
    bindKeys?: boolean
}

// TODO(agent-null-names): remove fallbacks in this component when https://github.com/gorgias/gorgias/issues/4413 is fixed
const TicketAssignee = ({
    bindKeys,
    className,
    currentAssigneeTeam,
    currentAssigneeUser,
    direction = 'down',
    dropdownContainer,
    handleTeams = true,
    handleUsers = true,
    menuDirection = 'left',
    profilePictureUrl,
    setUser,
    setTeam,
    transparent = false,
}: Props) => {
    const searchRef = useRef<HTMLDivElement>(null)

    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [search, setSearch] = useState('')

    const allUsers = useAppSelector(getHumanAgents)
    const allTeams = useAppSelector(getTeams)
    const currentUser = useAppSelector(getCurrentUser)

    const [teams, setTeams] = useState(allTeams)
    const [users, setUsers] = useState(allUsers)

    useEffect(() => {
        if (!bindKeys) return
        shortcutManager.bind('TicketDetailContainer', {
            OPEN_ASSIGNEE: {
                action: (e) => {
                    // shortcut key gets typed in the search field otherwise
                    e.preventDefault()
                    toggle()
                },
            },
            CLOSE_ASSIGNEE: {
                key: 'esc',
                action: () => toggle(null, false),
            },
        })
        return () => shortcutManager.unbind('TicketDetailContainer')
    })

    const clearUser = useCallback(() => {
        void setUser(null)
        setSearch('')
    }, [setUser])

    const clearTeam = useCallback(() => {
        void setTeam(null)
        setSearch('')
    }, [setTeam])

    const selectUser = useCallback(
        (user: Map<any, any>) => {
            void setUser({
                id: user.get('id'),
                name: user.get('name'),
                email: user.get('email'),
                meta: user.get('meta'),
            })
            setSearch('')
        },
        [setUser]
    )

    const selectTeam = useCallback(
        (team: Map<any, any>) => {
            void setTeam({
                id: team.get('id'),
                name: team.get('name'),
                decoration: team.get('decoration'),
            })
            setSearch('')
        },
        [setTeam]
    )

    const filterResults = useCallback(
        (search: string) => {
            setUsers(
                allUsers.filter((user: Map<any, any>) => {
                    const agentLabel: string =
                        user.get('name') || user.get('email')
                    return agentLabel
                        .toLowerCase()
                        .includes(search.toLowerCase())
                }) as List<any>
            )
            setTeams(
                allTeams.filter((team) =>
                    ((team as Map<any, any>).get('name') as string)
                        .toLowerCase()
                        .includes(search.toLowerCase())
                ) as List<any>
            )
        },
        [allTeams, allUsers]
    )

    const toggle = (e?: any, visible?: boolean) => {
        const opens = !_isUndefined(visible) ? visible : !isDropdownOpen

        setIsDropdownOpen(opens)

        if (opens) {
            setSearch('')
            filterResults(search)
        }
    }

    const handleSearch = useCallback(
        (search: string) => {
            setSearch(search)
            filterResults(search)
        },
        [filterResults]
    )

    const handleSearchKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'ArrowDown' && searchRef.current) {
            const firstChild = searchRef.current.firstChild as HTMLInputElement
            firstChild.focus()
        }
    }, [])

    const isCurrentUserAssigned = useMemo(
        () =>
            currentAssigneeUser &&
            currentUser &&
            currentUser.get('id') === currentAssigneeUser.get('id'),
        [currentAssigneeUser, currentUser]
    )

    const availableTeams = useMemo(
        () =>
            currentAssigneeTeam
                ? (teams.filter(
                      (team) =>
                          (team as Map<any, any>).get('id') !==
                          currentAssigneeTeam.get('id')
                  ) as List<any>)
                : teams,
        [currentAssigneeTeam, teams]
    )

    const availableUsers = useMemo(
        () =>
            currentAssigneeUser
                ? (users.filter(
                      (user: Map<any, any>) =>
                          user.get('id') !== currentAssigneeUser.get('id')
                  ) as List<any>)
                : users,
        [currentAssigneeUser, users]
    )

    return (
        <Dropdown
            className={classnames(css.dropdown, className)}
            isOpen={isDropdownOpen}
            toggle={toggle}
            a11y={false}
            direction={direction}
        >
            <DropdownToggle
                color="secondary"
                type="button"
                className={classnames(css.toggle, {
                    'btn-transparent': transparent,
                })}
                caret
            >
                {currentAssigneeUser ? (
                    <AgentLabel
                        name={
                            currentAssigneeUser.get('name') ||
                            currentAssigneeUser.get('email')
                        }
                        profilePictureUrl={profilePictureUrl}
                        maxWidth="100"
                        shouldDisplayAvatar
                        size={24}
                    />
                ) : currentAssigneeTeam ? (
                    <TeamLabel
                        name={currentAssigneeTeam.get('name')}
                        emoji={currentAssigneeTeam.getIn([
                            'decoration',
                            'emoji',
                        ])}
                        maxWidth={100}
                        shouldDisplayAvatar
                    />
                ) : (
                    <span>Unassigned</span>
                )}
            </DropdownToggle>
            <DropdownMenu
                className={css.menu}
                right={menuDirection === 'right'}
                container={dropdownContainer}
                modifiers={{
                    preventOverflow: {boundariesElement: 'viewport'},
                }}
            >
                <DropdownItem header>ASSIGN TO:</DropdownItem>
                <DropdownItem header className="dropdown-item-input">
                    {
                        // rebuild input on each opening so "autoFocus" works
                        isDropdownOpen && (
                            <PeopleSearchInput
                                autoFocus
                                value={search}
                                className={css.searchInput}
                                onChange={handleSearch}
                                onKeyDown={handleSearchKeyDown}
                            />
                        )
                    }
                </DropdownItem>
                <div ref={searchRef}>
                    <PeopleSearchResults
                        handleTeams={handleTeams && !!allTeams.size}
                        handleUsers={handleUsers}
                        teams={availableTeams}
                        users={availableUsers}
                        onTeamClick={selectTeam}
                        onUserClick={selectUser}
                    >
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
                                        onClick={() => clearTeam()}
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
                                        profilePictureUrl={currentAssigneeUser.getIn(
                                            ['meta', 'profile_picture_url']
                                        )}
                                        className={css.assigneeLabel}
                                        shouldDisplayAvatar
                                        size={24}
                                    />
                                    <i
                                        className="material-icons md-2"
                                        onClick={() => clearUser()}
                                    >
                                        close
                                    </i>
                                </DropdownItem>
                            )}
                            {!isCurrentUserAssigned && handleUsers && (
                                <DropdownItem
                                    type="button"
                                    className={css.item}
                                    onClick={() => selectUser(currentUser)}
                                >
                                    Assign yourself
                                </DropdownItem>
                            )}
                        </>
                    </PeopleSearchResults>
                </div>
            </DropdownMenu>
        </Dropdown>
    )
}

export default TicketAssignee

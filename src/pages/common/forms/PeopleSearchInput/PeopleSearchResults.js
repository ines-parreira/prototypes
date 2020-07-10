// @flow

import React, {type Node} from 'react'
import {DropdownItem} from 'reactstrap'
import type {Map, List} from 'immutable'

import {AgentLabel, TeamLabel} from '../../utils/labels'

import css from './PeopleSearchResults.less'

type Props = {
    handleTeams: boolean,
    handleUsers: boolean,
    teams: List<*>,
    users: List<*>,
    children?: Node,
    onTeamClick: (team: Map<*, *>) => void,
    onUserClick: (user: Map<*, *>) => void,
}

export default function PeopleSearchResults({
    handleTeams,
    handleUsers,
    children,
    teams,
    users,
    onTeamClick,
    onUserClick,
}: Props) {
    return (
        <>
            {children}
            {handleTeams && <DropdownItem divider />}
            {handleTeams && <TeamResults teams={teams} onClick={onTeamClick} />}
            {handleUsers && <DropdownItem divider />}
            {handleUsers && <UserResults users={users} onClick={onUserClick} />}
        </>
    )
}

type TeamResultsProps = {
    teams: List<*>,
    onClick: (team: Map<*, *>) => void,
}

function TeamResults({teams, onClick}: TeamResultsProps) {
    return (
        <>
            <DropdownItem header className="text-uppercase">
                Teams
            </DropdownItem>
            {teams.isEmpty() ? (
                <DropdownItem header>Could not find any team</DropdownItem>
            ) : (
                <div className={css.items}>
                    {teams.map((team) => (
                        <DropdownItem
                            key={team.get('id')}
                            type="button"
                            className={css.item}
                            onClick={() => onClick(team)}
                        >
                            <TeamLabel
                                name={team.get('name')}
                                emoji={team.getIn(['decoration', 'emoji'])}
                                shouldDisplayAvatar
                            />
                        </DropdownItem>
                    ))}
                </div>
            )}
        </>
    )
}

type UserResultsProps = {
    users: List<*>,
    onClick: (user: Map<*, *>) => void,
}

function UserResults({users, onClick}: UserResultsProps) {
    return (
        <>
            <DropdownItem header className="text-uppercase">
                Users
            </DropdownItem>
            {users.isEmpty() ? (
                <DropdownItem header>Could not find any user</DropdownItem>
            ) : (
                <div className={css.items}>
                    {users.map((user) => (
                        <DropdownItem
                            key={user.get('id')}
                            type="button"
                            className={css.item}
                            onClick={() => onClick(user)}
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
                    ))}
                </div>
            )}
        </>
    )
}

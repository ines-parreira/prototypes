import React, {ReactNode} from 'react'
import {DropdownItem} from 'reactstrap'
import {Map, List, Seq} from 'immutable'

import {AgentLabel, TeamLabel} from '../../utils/labels.js'

import css from './PeopleSearchResults.less'

type Props = {
    handleTeams: boolean
    handleUsers: boolean
    teams: List<Map<any, any>> | Seq.Indexed<Map<any, any>>
    users: List<Map<any, any>>
    children?: ReactNode
    onTeamClick: (team: Map<any, any>) => void
    onUserClick: (user: Map<any, any>) => void
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
    teams: List<Map<any, any>> | Seq.Indexed<Map<any, any>>
    onClick: (team: Map<any, any>) => void
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
                            key={team!.get('id')}
                            type="button"
                            className={css.item}
                            onClick={() => onClick(team!)}
                        >
                            <TeamLabel
                                name={team!.get('name')}
                                emoji={team!.getIn(['decoration', 'emoji'])}
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
    users: List<Map<any, any>>
    onClick: (user: Map<any, any>) => void
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
                            key={user!.get('id')}
                            type="button"
                            className={css.item}
                            onClick={() => onClick(user!)}
                        >
                            <AgentLabel
                                name={user!.get('name') || user!.get('email')}
                                profilePictureUrl={user!.getIn([
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

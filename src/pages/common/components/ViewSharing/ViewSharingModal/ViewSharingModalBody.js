// flow

import React, {useMemo} from 'react'
import {connect} from 'react-redux'
import {type List} from 'immutable'
import {Alert} from 'reactstrap'

import * as agentSelectors from '../../../../../state/agents/selectors.ts'
import * as teamsSelectors from '../../../../../state/teams/selectors.ts'
import type {teamType} from '../../../../../state/teams/types'
import RadioChoiceField from '../../../forms/RadioChoiceField'
import {ViewVisibility} from '../../../../../constants/view'
import Loader from '../../Loader'

import SharedBody from './SharedBody'
import PublicBody from './PublicBody'
import PrivateBody from './PrivateBody'
import ViewSharingModalWarning from './ViewSharingModalWarning'

type Props = {
    visibility: string,
    isLoading: boolean,
    error: Error,
    teams: List<teamType>,
    users: List<any>,
    initialTeams: List<teamType>,
    initialUsers: List<any>,
    selectedTeams: List<teamType>,
    selectedUsers: List<any>,
    setVisibility: (visibility: string) => void,
    onTeamClick: (team: teamType) => void,
    onUserClick: (user: any) => void,
    onRemoveTeam: (team: teamType) => void,
    onRemoveUser: (user: any) => void,
}

const choices = [
    {value: ViewVisibility.PUBLIC, label: 'Public'},
    {value: ViewVisibility.SHARED, label: 'Shared'},
    {value: ViewVisibility.PRIVATE, label: 'Private'},
]

function ViewSharingModalBody({
    visibility,
    isLoading,
    error,
    teams,
    users,
    initialTeams,
    initialUsers,
    selectedTeams,
    selectedUsers,
    setVisibility,
    onTeamClick,
    onUserClick,
    onRemoveTeam,
    onRemoveUser,
}: Props) {
    const isPublic = visibility === ViewVisibility.PUBLIC
    const isShared = visibility === ViewVisibility.SHARED
    const isPrivate = visibility === ViewVisibility.PRIVATE

    const availableTeams = useMemo(
        () =>
            teams.filter((team) =>
                selectedTeams.every(
                    (selectedTeam) => selectedTeam.get('id') !== team.get('id')
                )
            ),
        [teams, selectedTeams]
    )

    const availableUsers = useMemo(
        () =>
            users.filter((user) =>
                selectedUsers.every(
                    (selectedUser) => selectedUser.get('id') !== user.get('id')
                )
            ),
        [users, selectedUsers]
    )

    if (isLoading) {
        return (
            <div className="m-3">
                <Loader minHeight="110px" />
            </div>
        )
    }

    return (
        <>
            {error && (
                <div className="m-3">
                    <Alert
                        color="danger"
                        transition={{baseClass: '', timeout: 0}}
                    >
                        {error.toString()}
                    </Alert>
                </div>
            )}
            <div className="m-3">
                <RadioChoiceField
                    choices={choices}
                    value={visibility}
                    onChange={setVisibility}
                />
            </div>
            {isPublic && <PublicBody />}
            {isShared && (
                <>
                    <Alert
                        color="info"
                        className="m-3"
                        transition={{baseClass: '', timeout: 0}}
                    >
                        Lead agents and admins see all the shared views.
                    </Alert>
                    <ViewSharingModalWarning
                        visibility={visibility}
                        initialTeams={initialTeams}
                        initialUsers={initialUsers}
                        selectedTeams={selectedTeams}
                        selectedUsers={selectedUsers}
                    />
                    <SharedBody
                        availableTeams={availableTeams}
                        availableUsers={availableUsers}
                        selectedTeams={selectedTeams}
                        selectedUsers={selectedUsers}
                        onTeamClick={onTeamClick}
                        onUserClick={onUserClick}
                        onRemoveTeam={onRemoveTeam}
                        onRemoveUser={onRemoveUser}
                    />
                </>
            )}
            {isPrivate && <PrivateBody />}
        </>
    )
}

export default connect((state) => ({
    users: agentSelectors.getAgents(state),
    teams: teamsSelectors.getTeams(state).toList(),
}))(ViewSharingModalBody)

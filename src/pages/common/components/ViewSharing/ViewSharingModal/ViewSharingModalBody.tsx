import React, {useMemo} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {List, Map} from 'immutable'

import * as agentSelectors from '../../../../../state/agents/selectors'
import * as teamsSelectors from '../../../../../state/teams/selectors'
import RadioChoiceField from '../../../forms/RadioChoiceField'
import {ViewVisibility} from '../../../../../models/view/types'
import {RootState} from '../../../../../state/types'
import Loader from '../../Loader/Loader'
import Alert, {AlertType} from '../../Alert/Alert'

import SharedBody from './SharedBody'
import PublicBody from './PublicBody'
import PrivateBody from './PrivateBody'
import ViewSharingModalWarning from './ViewSharingModalWarning'

type OwnProps = {
    visibility: string
    isLoading: boolean
    error: Error | null
    initialTeams: List<any>
    initialUsers: List<any>
    selectedTeams: List<any>
    selectedUsers: List<any>
    setVisibility: (visibility: ViewVisibility) => void
    onTeamClick: (team: Map<any, any>) => void
    onUserClick: (user: Map<any, any>) => void
    onRemoveTeam: (team: Map<any, any>) => void
    onRemoveUser: (user: Map<any, any>) => void
}

type Props = OwnProps & ConnectedProps<typeof connector>

const choices = [
    {value: ViewVisibility.Public, label: 'Public'},
    {value: ViewVisibility.Shared, label: 'Shared'},
    {value: ViewVisibility.Private, label: 'Private'},
]

export function ViewSharingModalBodyContainer({
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
    const isPublic = visibility === ViewVisibility.Public
    const isShared = visibility === ViewVisibility.Shared
    const isPrivate = visibility === ViewVisibility.Private

    const availableTeams = useMemo(
        () =>
            teams.filter((team) =>
                selectedTeams.every(
                    (selectedTeam: Map<any, any>) =>
                        selectedTeam.get('id') !== team!.get('id')
                )
            ) as List<any>,
        [teams, selectedTeams]
    )

    const availableUsers = useMemo(
        () =>
            users.filter((user: Map<any, any>) =>
                selectedUsers.every(
                    (selectedUser: Map<any, any>) =>
                        selectedUser.get('id') !== user.get('id')
                )
            ) as List<any>,
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
                    <Alert type={AlertType.Error}>{error.toString()}</Alert>
                </div>
            )}
            <div className="m-3">
                <RadioChoiceField
                    choices={choices}
                    value={visibility}
                    onChange={setVisibility as (visibility: string) => void}
                />
            </div>
            {isPublic && <PublicBody />}
            {isShared && (
                <>
                    <Alert className="m-3">
                        Lead agents and admins see all the shared views
                    </Alert>
                    <ViewSharingModalWarning
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

const connector = connect((state: RootState) => ({
    users: agentSelectors.getAgents(state),
    teams: teamsSelectors.getTeams(state).toList(),
}))

export default connector(ViewSharingModalBodyContainer)

import React from 'react'
import {UncontrolledTooltip} from 'reactstrap'
import {List} from 'immutable'

import Alert, {AlertType} from '../../Alert/Alert'

import css from './ViewSharingModalWarning.less'

type Props = {
    initialTeams: List<any>
    initialUsers: List<any>
    selectedTeams: List<any>
    selectedUsers: List<any>
}

export default function ViewSharingModalWarning({
    initialTeams,
    initialUsers,
    selectedTeams,
    selectedUsers,
}: Props) {
    const missingTeams = initialTeams.filter((team: Map<any, any>) =>
        selectedTeams.every(
            (selectedTeam: Map<any, any>) =>
                selectedTeam.get('id') !== team.get('id')
        )
    )

    const missingUsers = initialUsers.filter((user: Map<any, any>) =>
        selectedUsers.every(
            (selectedUser: Map<any, any>) =>
                selectedUser.get('id') !== user.get('id')
        )
    )

    const isEmpty = !missingTeams.size && !missingUsers.size
    if (isEmpty) {
        return null
    }

    return (
        <div className="m-3">
            <Alert type={AlertType.Warning}>
                {!!missingTeams.size && (
                    <>
                        <span
                            id="missing-teams-tooltip"
                            className={css.totalItems}
                        >
                            {missingTeams.size} team
                            {missingTeams.size > 1 ? 's' : ''}
                        </span>
                        <UncontrolledTooltip
                            placement="top"
                            target="missing-teams-tooltip"
                        >
                            {missingTeams.map((team: Map<any, any>) => (
                                <span key={team.get('id')} className="d-block">
                                    {team.get('name')}
                                </span>
                            ))}
                        </UncontrolledTooltip>
                    </>
                )}
                {!!missingTeams.size && !!missingUsers.size && ' and '}
                {!!missingUsers.size && (
                    <>
                        <span
                            id="missing-users-tooltip"
                            className={css.totalItems}
                        >
                            {missingUsers.size} user
                            {missingUsers.size > 1 ? 's' : ''}
                        </span>
                        <UncontrolledTooltip
                            placement="top"
                            target="missing-users-tooltip"
                        >
                            {missingUsers.map((user: Map<any, any>) => (
                                <span key={user.get('id')} className="d-block">
                                    {user.get('name')}
                                </span>
                            ))}
                        </UncontrolledTooltip>
                    </>
                )}{' '}
                will no longer be able to access this view.
            </Alert>
        </div>
    )
}

// @flow

import React from 'react'
import {Alert, UncontrolledTooltip} from 'reactstrap'
import type {List} from 'immutable'

import type {teamType} from '../../../../../state/teams/types'
import type {userType} from '../../../../../utils'

import css from './ViewSharingModalWarning.less'

type Props = {
    initialTeams: List<teamType>,
    initialUsers: List<userType>,
    selectedTeams: List<teamType>,
    selectedUsers: List<userType>,
}

export default function ViewSharingModalWarning({
    initialTeams,
    initialUsers,
    selectedTeams,
    selectedUsers,
}: Props) {
    const missingTeams = initialTeams.filter((team) =>
        selectedTeams.every(
            (selectedTeam) => selectedTeam.get('id') !== team.get('id')
        )
    )

    const missingUsers = initialUsers.filter((user) =>
        selectedUsers.every(
            (selectedUser) => selectedUser.get('id') !== user.get('id')
        )
    )

    const isEmpty = !missingTeams.size && !missingUsers.size
    if (isEmpty) {
        return null
    }

    return (
        <div className="m-3">
            <Alert color="warning" transition={{baseClass: '', timeout: 0}}>
                {!!missingTeams.size && (
                    <>
                        <span
                            id="missing-teams-tooltip"
                            className={css.totalItems}
                            href="#"
                        >
                            {missingTeams.size} team
                            {missingTeams.size > 1 ? 's' : ''}
                        </span>
                        <UncontrolledTooltip
                            placement="top"
                            target="missing-teams-tooltip"
                        >
                            {missingTeams.map((team) => (
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
                            href="#"
                        >
                            {missingUsers.size} user
                            {missingUsers.size > 1 ? 's' : ''}
                        </span>
                        <UncontrolledTooltip
                            placement="top"
                            target="missing-users-tooltip"
                        >
                            {missingUsers.map((user) => (
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

// @flow

import React from 'react'
import type {List} from 'immutable'
import {Button, ListGroup, ListGroupItem} from 'reactstrap'
import classnames from 'classnames'

import {UncontrolledPeopleSearchInput} from '../../../forms/PeopleSearchInput'
import {AgentLabel, TeamLabel} from '../../../utils/labels'
import type {teamType} from '../../../../../state/teams/types'
import type {userType} from '../../../../../utils'

import css from './SharedBody.less'

type Props = {
    availableTeams: List<teamType>,
    availableUsers: List<userType>,
    selectedTeams: List<teamType>,
    selectedUsers: List<userType>,
    onTeamClick: (team: teamType) => void,
    onUserClick: (user: userType) => void,
    onRemoveTeam: (team: teamType) => void,
    onRemoveUser: (user: userType) => void,
}

export default function SharedBody({
    availableTeams,
    availableUsers,
    selectedTeams,
    selectedUsers,
    onTeamClick,
    onUserClick,
    onRemoveTeam,
    onRemoveUser,
}: Props) {
    return (
        <>
            <div className="mt-4 mr-3 mb-2 ml-3">
                <p>
                    <b>Sharing restricted to specific people or teams.</b>
                </p>
                <UncontrolledPeopleSearchInput
                    className="mb-4"
                    teams={availableTeams}
                    users={availableUsers}
                    onTeamClick={onTeamClick}
                    onUserClick={onUserClick}
                />
                <h6 className={css.selectedHeader}>Teams</h6>
            </div>
            <ListGroup>
                {selectedTeams.isEmpty() ? (
                    <ListGroupItem className={css.listGroupItem}>
                        No team selected
                    </ListGroupItem>
                ) : (
                    selectedTeams.map((team) => (
                        <ListGroupItem
                            key={team.get('id')}
                            className={css.listGroupItem}
                        >
                            <Button
                                color="link"
                                className="float-right text-danger"
                                onClick={() => onRemoveTeam(team)}
                            >
                                <i className="material-icons">close</i>
                            </Button>
                            <TeamLabel
                                name={team.get('name')}
                                emoji={team.getIn(['decoration', 'emoji'])}
                                shouldDisplayAvatar
                            />
                        </ListGroupItem>
                    ))
                )}
            </ListGroup>
            <div className="mt-4 mr-3 mb-2 ml-3">
                <h6 className={css.selectedHeader}>Users</h6>
            </div>
            <ListGroup>
                {selectedUsers.isEmpty() ? (
                    <ListGroupItem
                        className={classnames(
                            css.listGroupItem,
                            css.userListGroupItem
                        )}
                    >
                        No user selected
                    </ListGroupItem>
                ) : (
                    selectedUsers.map((user) => (
                        <ListGroupItem
                            key={user.get('id')}
                            className={classnames(
                                css.listGroupItem,
                                css.userListGroupItem
                            )}
                        >
                            <Button
                                color="link"
                                className="float-right text-danger"
                                onClick={() => onRemoveUser(user)}
                            >
                                <i className="material-icons">close</i>
                            </Button>
                            <AgentLabel
                                name={user.get('name') || user.get('email')}
                                profilePictureUrl={user.getIn([
                                    'meta',
                                    'profile_picture_url',
                                ])}
                                shouldDisplayAvatar
                            />
                        </ListGroupItem>
                    ))
                )}
            </ListGroup>
        </>
    )
}

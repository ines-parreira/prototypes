import React from 'react'
import {List, Map} from 'immutable'
import {ListGroup, ListGroupItem} from 'reactstrap'
import classnames from 'classnames'

import IconButton from 'pages/common/components/button/IconButton'

import UncontrolledPeopleSearchInput from '../../../forms/PeopleSearchInput/UncontrolledPeopleSearchInput'
import {AgentLabel, TeamLabel} from '../../../utils/labels'

import css from './SharedBody.less'

type Props = {
    availableTeams: List<any>
    availableUsers: List<any>
    selectedTeams: List<any>
    selectedUsers: List<any>
    onTeamClick: (team: Map<any, any>) => void
    onUserClick: (user: Map<any, any>) => void
    onRemoveTeam: (team: Map<any, any>) => void
    onRemoveUser: (user: Map<any, any>) => void
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
                    selectedTeams.map((team: Map<any, any>) => (
                        <ListGroupItem
                            key={team.get('id')}
                            className={css.listGroupItem}
                        >
                            <IconButton
                                className="float-right text-danger"
                                intent="text"
                                onClick={() => onRemoveTeam(team)}
                                size="small"
                            >
                                close
                            </IconButton>
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
                    selectedUsers.map((user: Map<any, any>) => (
                        <ListGroupItem
                            key={user.get('id')}
                            className={classnames(
                                css.listGroupItem,
                                css.userListGroupItem
                            )}
                        >
                            <IconButton
                                className="float-right text-danger"
                                intent="text"
                                onClick={() => onRemoveUser(user)}
                                size="small"
                            >
                                close
                            </IconButton>
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

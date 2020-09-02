// flow

import React, {useCallback, useEffect, useRef, useState} from 'react'
import {
    Button,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    UncontrolledTooltip,
} from 'reactstrap'
import {fromJS} from 'immutable'
import {connect} from 'react-redux'

import type {viewType} from '../../../../../state/views/types'
import GorgiasApi from '../../../../../services/gorgiasApi'
import type {notificationType} from '../../../../../state/notifications/actions.ts'
import {notify} from '../../../../../state/notifications/actions.ts'
import type {currentUserType} from '../../../../../state/types'
import {ViewVisibility} from '../../../../../constants/view'

import ViewSharingModalBody from './ViewSharingModalBody'
import css from './ViewSharingModal.less'

type Props = {
    view: viewType,
    isOpen: boolean,
    currentUser: currentUserType,
    toggle: () => void,
    notify: (message: notificationType) => void,
}

function ViewSharingModal({view, isOpen, currentUser, toggle, notify}: Props) {
    const {
        isSaving,
        isLoading,
        visibility,
        error,
        initialTeams,
        initialUsers,
        selectedTeams,
        selectedUsers,
        setVisibility,
        onTeamClick,
        onUserClick,
        onRemoveTeam,
        onRemoveUser,
        save,
    } = useViewSharing(view, currentUser)

    const isShared = visibility === ViewVisibility.SHARED
    const shouldSelectSomething =
        isShared && !selectedTeams.size && !selectedUsers.size
    const disabled = isLoading || isSaving || shouldSelectSomething

    const onSaveSuccess = () => {
        notify({
            status: 'success',
            message: "View's sharing options saved",
        })

        toggle()
    }

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>
                Update view sharing: <b>{view.get('name')}</b>
            </ModalHeader>
            <ModalBody className="p-0">
                <ViewSharingModalBody
                    visibility={visibility}
                    isLoading={isLoading}
                    error={error}
                    initialTeams={initialTeams}
                    initialUsers={initialUsers}
                    selectedTeams={selectedTeams}
                    selectedUsers={selectedUsers}
                    setVisibility={setVisibility}
                    onTeamClick={onTeamClick}
                    onUserClick={onUserClick}
                    onRemoveTeam={onRemoveTeam}
                    onRemoveUser={onRemoveUser}
                />
            </ModalBody>
            <ModalFooter>
                <Button
                    color="success"
                    id="view-sharing-submit"
                    className={css.submit}
                    disabled={disabled}
                    href="#"
                    onClick={() => save(onSaveSuccess)}
                >
                    Update view sharing
                </Button>
                <Button color="secondary" onClick={toggle}>
                    Cancel
                </Button>
            </ModalFooter>
            {shouldSelectSomething && (
                <UncontrolledTooltip
                    target="view-sharing-submit"
                    placement="top"
                >
                    Please select at least one team or one user
                </UncontrolledTooltip>
            )}
        </Modal>
    )
}

// TODO(@samy): when we can use `useDispatch`, directly do `dispatch(notify(...))` in the hook (same with `useStore`)
export default connect(
    (state) => ({
        currentUser: state.currentUser,
    }),
    {notify}
)(ViewSharingModal)

function useViewSharing(view: viewType, currentUser: currentUserType) {
    const user = useRef(currentUser)
    const viewId = useRef(view.get('id'))
    const [error, setError] = useState(null)
    const [isSaving, setSaving] = useState(false)
    const [isLoading, setLoading] = useState(true)
    const [visibility, setVisibility] = useState(view.get('visibility'))
    const [initialTeams, setInitialTeams] = useState(fromJS([]))
    const [initialUsers, setInitialUsers] = useState(fromJS([]))
    const [selectedTeams, setSelectedTeams] = useState(fromJS([]))
    const [selectedUsers, setSelectedUsers] = useState(fromJS([]))

    useEffect(() => {
        const api = new GorgiasApi()
        api.getViewSharing(viewId.current)
            .then((data) => {
                const teams = data.get('shared_with_teams')
                let users = data.get('shared_with_users')
                const isEmpty = !teams.size && !users.size
                if (isEmpty) {
                    users = fromJS([user.current])
                }

                setInitialTeams(teams)
                setInitialUsers(users)
                setSelectedTeams(teams)
                setSelectedUsers(users)
            })
            .catch(setError)
            .finally(() => setLoading(false))
    }, [])

    const onTeamClick = useCallback(
        (team) => setSelectedTeams(selectedTeams.push(team)),
        [selectedTeams, setSelectedTeams]
    )

    const onUserClick = useCallback(
        (user) => setSelectedUsers(selectedUsers.push(user)),
        [selectedUsers, setSelectedUsers]
    )

    const onRemoveTeam = useCallback(
        (team) =>
            setSelectedTeams(
                selectedTeams.filter(
                    (selectedTeam) => selectedTeam.get('id') !== team.get('id')
                )
            ),
        [selectedTeams, setSelectedTeams]
    )

    const onRemoveUser = useCallback(
        (user) =>
            setSelectedUsers(
                selectedUsers.filter(
                    (selectedUser) => selectedUser.get('id') !== user.get('id')
                )
            ),
        [selectedUsers, setSelectedUsers]
    )

    const save = useCallback(
        (onSuccess) => {
            setSaving(true)
            setError(null)

            const api = new GorgiasApi()
            const isShared = visibility === ViewVisibility.SHARED
            const teams = isShared ? selectedTeams : []
            let users = isShared ? selectedUsers : []

            if (visibility === ViewVisibility.PRIVATE) {
                users = [currentUser]
            }

            api.setViewSharing(viewId.current, visibility, teams, users)
                .then(onSuccess)
                .catch(setError)
                .finally(() => setSaving(false))
        },
        [visibility, selectedTeams, selectedUsers, currentUser]
    )

    return {
        isSaving,
        isLoading,
        visibility,
        error,
        initialTeams,
        initialUsers,
        selectedTeams,
        selectedUsers,
        setVisibility,
        onTeamClick,
        onUserClick,
        onRemoveTeam,
        onRemoveUser,
        save,
    }
}

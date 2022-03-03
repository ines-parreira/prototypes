import React, {useCallback, useEffect, useRef, useState} from 'react'
import {
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    UncontrolledTooltip,
} from 'reactstrap'
import {fromJS, Map, List} from 'immutable'
import {connect, ConnectedProps} from 'react-redux'
import {AxiosError} from 'axios'

import Button, {ButtonIntent} from 'pages/common/components/button/Button'
import GorgiasApi from '../../../../../services/gorgiasApi'
import {notify} from '../../../../../state/notifications/actions'
import {RootState} from '../../../../../state/types'
import {ViewVisibility, View} from '../../../../../models/view/types'
import {NotificationStatus} from '../../../../../state/notifications/types'
import {viewUpdated} from '../../../../../state/entities/views/actions'
import {toJS} from '../../../../../utils'

import ViewSharingModalBody from './ViewSharingModalBody'
import css from './ViewSharingModal.less'

type OwnProps = {
    view: Map<any, any>
    isOpen: boolean
    toggle: () => void
}

type Props = OwnProps & ConnectedProps<typeof connector>

export function ViewSharingModalContainer({
    view,
    isOpen,
    currentUser,
    toggle,
    notify,
    viewUpdated,
}: Props) {
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

    const isShared = visibility === ViewVisibility.Shared
    const shouldSelectSomething =
        isShared && !selectedTeams.size && !selectedUsers.size
    const disabled = isLoading || isSaving || shouldSelectSomething

    const onSaveSuccess = (data: View) => {
        void notify({
            status: NotificationStatus.Success,
            message: "View's sharing options saved",
        })
        viewUpdated(data)

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
                    id="view-sharing-submit"
                    className={css.submit}
                    isDisabled={disabled}
                    onClick={() => save(onSaveSuccess)}
                >
                    Update view sharing
                </Button>
                <Button intent={ButtonIntent.Secondary} onClick={toggle}>
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
const connector = connect(
    (state: RootState) => ({
        currentUser: state.currentUser,
        plans: toJS(state.billing.get('plans')),
    }),
    {notify, viewUpdated}
)

export default connector(ViewSharingModalContainer)

function useViewSharing(view: Map<any, any>, currentUser: Map<any, any>) {
    const user = useRef(currentUser)
    const viewId = useRef(view.get('id'))
    const [error, setError] = useState<Error | null>(null)
    const [isSaving, setSaving] = useState<boolean>(false)
    const [isLoading, setLoading] = useState<boolean>(true)
    const [visibility, setVisibility] = useState<ViewVisibility>(
        view.get('visibility')
    )
    const [initialTeams, setInitialTeams] = useState<List<any>>(fromJS([]))
    const [initialUsers, setInitialUsers] = useState<List<any>>(fromJS([]))
    const [selectedTeams, setSelectedTeams] = useState<List<any>>(fromJS([]))
    const [selectedUsers, setSelectedUsers] = useState<List<any>>(fromJS([]))

    useEffect(() => {
        const api = new GorgiasApi()
        api.getViewSharing(viewId.current)
            .then((data) => {
                const teams = data.get('shared_with_teams') as List<any>
                let users = data.get('shared_with_users') as List<any>
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
        (team: Map<any, any>) => setSelectedTeams(selectedTeams.push(team)),
        [selectedTeams, setSelectedTeams]
    )

    const onUserClick = useCallback(
        (user: Map<any, any>) => setSelectedUsers(selectedUsers.push(user)),
        [selectedUsers, setSelectedUsers]
    )

    const onRemoveTeam = useCallback(
        (team: Map<any, any>) =>
            setSelectedTeams(
                selectedTeams.filter(
                    (selectedTeam: Map<any, any>) =>
                        selectedTeam.get('id') !== team.get('id')
                ) as List<any>
            ),
        [selectedTeams, setSelectedTeams]
    )

    const onRemoveUser = useCallback(
        (user: Map<any, any>) =>
            setSelectedUsers(
                selectedUsers.filter(
                    (selectedUser: Map<any, any>) =>
                        selectedUser.get('id') !== user.get('id')
                ) as List<any>
            ),
        [selectedUsers, setSelectedUsers]
    )

    const save = useCallback(
        (onSuccess) => {
            setSaving(true)
            setError(null)

            const api = new GorgiasApi()
            const isShared = visibility === ViewVisibility.Shared
            const teams = isShared ? selectedTeams : fromJS([])
            let users = isShared ? selectedUsers : fromJS([])

            if (visibility === ViewVisibility.Private) {
                users = [currentUser]
            }

            api.setViewSharing(viewId.current, visibility, teams, users)
                .then(onSuccess)
                .catch((error: AxiosError) => {
                    if (!error.response) {
                        return setError(error)
                    }

                    const errorMessage = (
                        fromJS(error.response) as Map<any, any>
                    ).getIn(['data', 'error', 'msg'])

                    if (!errorMessage) {
                        return setError(error)
                    }

                    return setError(errorMessage)
                })
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

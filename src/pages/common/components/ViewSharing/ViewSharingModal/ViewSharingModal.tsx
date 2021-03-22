import React, {useCallback, useEffect, useRef, useState} from 'react'
import {
    Button,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    UncontrolledTooltip,
} from 'reactstrap'
import {fromJS, Map, List} from 'immutable'
import {connect, ConnectedProps} from 'react-redux'
import {AxiosError} from 'axios'

import GorgiasApi from '../../../../../services/gorgiasApi'
import {notify} from '../../../../../state/notifications/actions'
import {RootState} from '../../../../../state/types'
import {ViewVisibility, View} from '../../../../../models/view/types'
import {Plan} from '../../../../../models/billing/types'
import {NotificationStatus} from '../../../../../state/notifications/types'
import {viewUpdated} from '../../../../../state/entities/views/actions'
import {AccountFeatures} from '../../../../../state/currentAccount/types'
import {getCheaperPlanForFeature} from '../../../../../utils/paywalls'
import {toJS} from '../../../../../utils'

import UpgradeButton from '../../UpgradeButton/UpgradeButton'

import ViewSharingModalBody from './ViewSharingModalBody'
import css from './ViewSharingModal.less'

type OwnProps = {
    view: Map<any, any>
    isOpen: boolean
    showPaywall: boolean
    toggle: () => void
}

type Props = OwnProps & ConnectedProps<typeof connector>

export function ViewSharingModalContainer({
    view,
    isOpen,
    currentUser,
    plans,
    showPaywall,
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

    const requiredPlanName = getCheaperPlanForFeature(
        AccountFeatures.ViewSharing,
        plans as Record<string, Plan>
    )

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>
                {!showPaywall ? (
                    <>
                        Update view sharing: <b>{view.get('name')}</b>
                    </>
                ) : (
                    'Unclutter your helpdesk with view sharing'
                )}
            </ModalHeader>
            {!showPaywall ? (
                <>
                    <ModalBody className="p-0">
                        {
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
                        }
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
                </>
            ) : (
                <ModalBody>
                    <p className={css.paywallText}>
                        Upgrade to an advanced plan to customize the visibility
                        of your views and create <b>public,</b> <b>private,</b>{' '}
                        and <b>shared views.</b>
                        <br />
                    </p>
                    <p className={css.paywallText}>
                        Check{' '}
                        <a
                            href="https://www.gorgias.com/blog/view-sharing"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            this blog post to
                        </a>{' '}
                        learn more about how view sharing can benefit your team.
                    </p>
                    <UpgradeButton
                        className="mb-3"
                        label={`Upgrade to ${requiredPlanName}`}
                        state={{
                            openedPlanPopover: requiredPlanName,
                        }}
                    />
                </ModalBody>
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

                    const errorMessage = (fromJS(error.response) as Map<
                        any,
                        any
                    >).getIn(['data', 'error', 'msg'])

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

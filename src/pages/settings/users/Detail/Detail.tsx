import React, {FormEvent, useState} from 'react'
import {useParams} from 'react-router-dom'
import classnames from 'classnames'

import {useCreateAgent} from 'hooks/agents/useCreateAgent'
import {useUpdateAgent} from 'hooks/agents/useUpdateAgent'
import {UserDraft, UserRole} from 'config/types/user'
import {getAccountOwnerId} from 'state/currentAccount/selectors'
import {getCurrentUserId} from 'state/currentUser/selectors'
import useAppSelector from 'hooks/useAppSelector'
import useAppDispatch from 'hooks/useAppDispatch'
import Loader from 'pages/common/components/Loader/Loader'
import settingsCss from 'pages/settings/settings.less'

import {useGetAgentWithEffects} from './hooks/useGetAgentWithEffect'
import {Header} from './Header'
import {Statuses} from './Statuses'
import {Info} from './Info'
import {Role} from './Role'
import {Footer} from './Footer'
import {navigateBackToUserList} from './constants'
import {AgentState} from './types'

export const Detail = () => {
    const dispatch = useAppDispatch()
    const {id: unsafeAgentId} = useParams<{
        id: string
    }>()

    const agentId = Number(unsafeAgentId)
    const isEdit = Boolean(agentId)

    const [agentState, setAgentState] = useState<AgentState>({
        name: '',
        email: '',
        role: UserRole.BasicAgent,
    })
    const {name, email, role} = agentState
    const [has2FA, set2FA] = useState<undefined | boolean>(undefined)

    const {rawData, isLoading} = useGetAgentWithEffects({
        agentId,
        isEdit,
        setAgentState,
        set2FA,
        dispatch,
    })

    const {mutate: createAgent, isLoading: isCreating} = useCreateAgent()
    const {mutate: updateAgent, isLoading: isUpdating} = useUpdateAgent()

    const accountOwnerId = useAppSelector(getAccountOwnerId)
    const currentUserId = useAppSelector(getCurrentUserId)
    const isSelf = agentId === currentUserId
    const isAccountOwner = currentUserId === accountOwnerId
    const isViewingAccountOwner = agentId === accountOwnerId

    if (isEdit && isLoading) {
        return <Loader />
    }

    if (isEdit && !isLoading && !rawData) {
        return <></>
    }

    const onSubmit = (e: FormEvent) => {
        e.preventDefault()
        const form: UserDraft = {
            email,
            name,
            role: {name: role},
        }

        if (isSelf) {
            delete form.role
        }

        isEdit
            ? updateAgent([{id: agentId, agent: form}], {
                  onSuccess: navigateBackToUserList,
              })
            : createAgent([form], {onSuccess: navigateBackToUserList})
    }

    return (
        <div className="full-width">
            <Header isEdit={isEdit} name={name} />
            <div className={classnames(settingsCss.newPageContainer)}>
                {isEdit && (
                    <Statuses
                        agentId={agentId}
                        rawData={rawData}
                        has2FA={has2FA}
                        set2FA={set2FA}
                        isAccountOwner={isAccountOwner}
                        isViewingAccountOwner={isViewingAccountOwner}
                    />
                )}
                <form onSubmit={onSubmit}>
                    <Info
                        name={name}
                        email={email}
                        isEdit={isEdit}
                        agentId={agentId}
                        setAgentState={setAgentState}
                        isAccountOwner={isAccountOwner}
                        isViewingAccountOwner={isViewingAccountOwner}
                    />
                    <Role
                        role={role}
                        setAgentState={setAgentState}
                        isSelf={isSelf}
                        isViewingAccountOwner={isViewingAccountOwner}
                    />
                    <Footer
                        rawData={rawData}
                        isEdit={isEdit}
                        agentId={agentId}
                        agentState={agentState}
                        isSaving={isCreating || isUpdating}
                        isViewingAccountOwner={isViewingAccountOwner}
                        isSelf={isSelf}
                    />
                </form>
            </div>
        </div>
    )
}

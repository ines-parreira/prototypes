import React, { FormEvent, useState } from 'react'

import classnames from 'classnames'
import { useParams } from 'react-router-dom'

import { UserDraft, UserRole } from 'config/types/user'
import { useCreateAgent } from 'hooks/agents/useCreateAgent'
import { useUpdateAgent } from 'hooks/agents/useUpdateAgent'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import Loader from 'pages/common/components/Loader/Loader'
import settingsCss from 'pages/settings/settings.less'
import { getAccountOwnerId } from 'state/currentAccount/selectors'
import { getCurrentUserId } from 'state/currentUser/selectors'

import { navigateBackToUserList } from './constants'
import { Footer } from './Footer'
import { Header } from './Header'
import { useGetAgentWithEffects } from './hooks/useGetAgentWithEffect'
import { Info } from './Info'
import { Role } from './Role'
import { Statuses } from './Statuses'
import { AgentState } from './types'

export const Detail = () => {
    const dispatch = useAppDispatch()
    const { id: unsafeAgentId } = useParams<{
        id: string
    }>()

    const agentId = Number(unsafeAgentId)
    const isEdit = Boolean(agentId)

    const [agentState, setAgentState] = useState<AgentState>({
        name: '',
        email: '',
        role: UserRole.BasicAgent,
    })
    const { name, email, role } = agentState
    const [has2FA, set2FA] = useState<undefined | boolean>(undefined)

    const { rawData, isLoading } = useGetAgentWithEffects({
        agentId,
        isEdit,
        setAgentState,
        set2FA,
        dispatch,
    })

    const { mutate: createAgent, isLoading: isCreating } = useCreateAgent()
    const { mutate: updateAgent, isLoading: isUpdating } = useUpdateAgent()

    const accountOwnerId = useAppSelector(getAccountOwnerId)
    const currentUserId = useAppSelector(getCurrentUserId)
    const isSelf = agentId === currentUserId
    const isAccountOwner = currentUserId === accountOwnerId
    const isViewingAccountOwner = agentId === accountOwnerId
    const isInternal = role === UserRole.Bot || role === UserRole.GorgiasAgent

    if (isEdit && isLoading) {
        return <Loader />
    }

    if (isEdit && !isLoading && !rawData) {
        return <></>
    }

    const onSubmit = (e: FormEvent) => {
        e.preventDefault()
        const form: UserDraft = {
            name: name.trim(),
        }

        if (!isInternal) {
            form.email = email?.trim()?.toLocaleLowerCase() ?? ''
            form.role = { name: role }
        }

        if (isSelf) {
            delete form.role
        }

        isEdit
            ? updateAgent([{ id: agentId, agent: form }], {
                  onSuccess: navigateBackToUserList,
              })
            : createAgent([form], { onSuccess: navigateBackToUserList })
    }

    return (
        <div className="full-width">
            <Header isEdit={isEdit} name={name} />
            <div className={classnames(settingsCss.newPageContainer)}>
                {isEdit && !isInternal && (
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
                        isInternal={isInternal}
                        isViewingAccountOwner={isViewingAccountOwner}
                    />
                    {
                        <Role
                            role={role}
                            setAgentState={setAgentState}
                            isSelf={isSelf}
                            isInternal={isInternal}
                            isViewingAccountOwner={isViewingAccountOwner}
                        />
                    }
                    <Footer
                        rawData={rawData}
                        isEdit={isEdit}
                        agentId={agentId}
                        agentState={agentState}
                        isSaving={isCreating || isUpdating}
                        isViewingAccountOwner={isViewingAccountOwner}
                        isSelf={isSelf}
                        isInternal={isInternal}
                    />
                </form>
            </div>
        </div>
    )
}

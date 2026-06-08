import type { FormEvent } from 'react'
import React, { useState } from 'react'

import { useCreateUser, useUpdateUser } from '@repo/users'
import classnames from 'classnames'
import { useParams } from 'react-router-dom'

import { BackButton } from '@repo/routing'

import { Panel, PanelFooter, PanelHeader, toast } from '@gorgias/axiom'
import type { CreateUserBody } from '@gorgias/helpdesk-queries'

import { normalizeUserName } from 'common/utils'
import type { UserDraft } from 'config/types/user'
import { UserRole } from 'config/types/user'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import Loader from 'pages/common/components/Loader/Loader'
import settingsCss from 'pages/settings/settings.less'
import { getAccountOwnerId } from 'state/currentAccount/selectors'
import { getCurrentUserId } from 'state/currentUser/selectors'
import { errorToChildren } from 'utils'

import { navigateBackToUserList, USERS_LIST_PATH } from './constants'
import { Footer } from './Footer'
import { useGetAgentWithEffects } from './hooks/useGetAgentWithEffect'
import { Info } from './Info'
import { Role } from './Role'
import { Statuses } from './Statuses'
import type { AgentState } from './types'

const USER_FORM_ID = 'user-detail-form'

function toApiRoleName(role: UserRole): CreateUserBody['role']['name'] | null {
    switch (role) {
        case UserRole.Admin:
            return 'admin'
        case UserRole.Agent:
            return 'agent'
        case UserRole.BasicAgent:
            return 'basic-agent'
        case UserRole.LiteAgent:
            return 'lite-agent'
        case UserRole.ObserverAgent:
            return 'observer-agent'
        default:
            return null
    }
}

export const DetailV2 = () => {
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

    const { mutateAsync: createUser, isLoading: isCreating } = useCreateUser()
    const { mutateAsync: updateUser, isLoading: isUpdating } = useUpdateUser()

    const accountOwnerId = useAppSelector(getAccountOwnerId)
    const currentUserId = useAppSelector(getCurrentUserId)
    const isSelf = agentId === currentUserId
    const isAccountOwner = currentUserId === accountOwnerId
    const isViewingAccountOwner = agentId === accountOwnerId
    const isInternal = role === UserRole.Bot || role === UserRole.GorgiasAgent

    if (isEdit && isLoading) {
        return (
            <Panel key="loading" h="100%" w="100%" overflow="auto">
                <Loader />
            </Panel>
        )
    }

    if (isEdit && !isLoading && !rawData) {
        return <></>
    }

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault()
        const form: UserDraft = {
            name: normalizeUserName(name),
        }

        if (!isInternal) {
            form.email = email?.trim()?.toLocaleLowerCase() ?? ''
            form.role = { name: role }
        }

        if (isSelf) {
            delete form.role
        }

        try {
            if (isEdit) {
                const apiRole = form.role ? toApiRoleName(form.role.name) : null
                await updateUser({
                    id: agentId,
                    data: {
                        name: form.name,
                        ...(form.email !== undefined
                            ? { email: form.email }
                            : {}),
                        ...(apiRole ? { role: { name: apiRole } } : {}),
                    },
                })
                toast.success('Team member updated')
            } else {
                if (!form.email || !form.role) {
                    toast.error('Email and role are required')
                    return
                }
                const apiRole = toApiRoleName(form.role.name)
                if (!apiRole) {
                    toast.error('This role cannot be assigned to new users')
                    return
                }
                const response = await createUser({
                    data: {
                        name: form.name,
                        email: form.email,
                        role: { name: apiRole },
                    },
                })
                toast.success(
                    `Team member created. We've sent login instructions to ${response.data.email}.`,
                )
            }
            navigateBackToUserList()
        } catch (error) {
            toast.error(
                errorToChildren(error) ??
                    `Error while ${isEdit ? 'updating' : 'creating'} user`,
            )
        }
    }

    return (
        <Panel key="form" h="100%" w="100%" overflow="auto">
            <PanelHeader
                leadingSlot={
                    <BackButton
                        fallbackUrl={USERS_LIST_PATH}
                        aria-label="Back to users"
                    />
                }
                title={isEdit ? name : 'New user'}
            />
            <form id={USER_FORM_ID} onSubmit={onSubmit}>
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
                    <Role
                        role={role}
                        setAgentState={setAgentState}
                        isSelf={isSelf}
                        isInternal={isInternal}
                        isViewingAccountOwner={isViewingAccountOwner}
                    />
                </div>
            </form>
            <PanelFooter>
                <Footer
                    rawData={rawData}
                    isEdit={isEdit}
                    agentId={agentId}
                    agentState={agentState}
                    isSaving={isCreating || isUpdating}
                    isViewingAccountOwner={isViewingAccountOwner}
                    isSelf={isSelf}
                    isInternal={isInternal}
                    formId={USER_FORM_ID}
                />
            </PanelFooter>
        </Panel>
    )
}

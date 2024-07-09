import {useCallback, useEffect, useReducer, useState} from 'react'

import {useSelfServiceConfigurationUpdate} from 'pages/automate/common/hooks/useSelfServiceConfigurationUpdate'
import {NotificationStatus} from 'state/notifications/types'

import {useGetWorkflowConfigurations} from 'models/workflows/queries'
import {WorkflowConfigurationShallow} from '../models/workflowConfiguration.types'
import {WfConfigurationResponseDto} from '../types'
import useWorkflowApi from './useWorkflowApi'

type UseStoreWorkflowsState = {
    duplicatePending: boolean
    updatePending: boolean
    deletePending: boolean
    workflowConfigurationById: Record<string, WorkflowConfigurationShallow>
}

const initialState: UseStoreWorkflowsState = {
    duplicatePending: false,
    updatePending: false,
    deletePending: false,
    workflowConfigurationById: {},
}

type LoadingStateUpdate = {
    type: 'duplicate' | 'update' | 'delete'
    isPending: boolean
}
type WorkflowConfigurationUpdate = {
    type: 'configurationUpdate'
    payload: Record<string, WorkflowConfigurationShallow>
}

type Action = LoadingStateUpdate | WorkflowConfigurationUpdate

const reducer = (state: UseStoreWorkflowsState, action: Action) => {
    switch (action.type) {
        case 'duplicate':
        case 'update':
        case 'delete':
            return {
                ...state,
                [`${action.type}Pending`]: action.isPending,
            }
        case 'configurationUpdate':
            return {
                ...state,
                workflowConfigurationById: action.payload,
            }
    }
}

export const useStoreWorkflowsApi = (
    notifyMerchant: (message: string, kind: 'success' | 'error') => void
) => {
    const [state, dispatch] = useReducer(reducer, initialState)
    const {
        isUpdatePending: isWorkflowApiUpdatePending,
        isFetchPending: isWorkflowApiFetchPending,
        deleteWorkflowConfiguration,
        duplicateWorkflowConfiguration,
    } = useWorkflowApi()

    const {
        data: configurations,
        isLoading: isWorkflowConfigurationsFetchPending,
    } = useGetWorkflowConfigurations(true, {})
    const [workflowConfigurationById, setWorkflowConfigurationById] = useState<
        Record<string, WfConfigurationResponseDto>
    >({})

    const loadWorkflowsConfigurations = useCallback(() => {
        if (!configurations) return
        setWorkflowConfigurationById(
            configurations.reduce(
                (acc, conf) => ({
                    ...acc,
                    [conf.id]: conf,
                }),
                {}
            )
        )
    }, [configurations])

    useEffect(() => {
        void loadWorkflowsConfigurations()
    }, [loadWorkflowsConfigurations])

    const {handleSelfServiceConfigurationUpdate} =
        useSelfServiceConfigurationUpdate({
            handleNotify: (notify) => {
                if (
                    notify.status === NotificationStatus.Error &&
                    notify.message
                ) {
                    notifyMerchant(notify.message, 'error')
                }
            },
        })

    const duplicateWorkflow = useCallback(
        async (workflowId: string, storeIntegrationId: number) => {
            dispatch({
                type: 'duplicate',
                isPending: true,
            })
            const duplicatedWorkflow = await duplicateWorkflowConfiguration(
                workflowId,
                storeIntegrationId
            )

            loadWorkflowsConfigurations()
            await handleSelfServiceConfigurationUpdate(
                (draft) => {
                    draft.workflowsEntrypoints ??= []
                    draft.workflowsEntrypoints?.unshift({
                        workflow_id: duplicatedWorkflow.id,
                    })
                },
                undefined,
                storeIntegrationId
            )
            dispatch({
                type: 'duplicate',
                isPending: false,
            })
            return {id: duplicatedWorkflow.id}
        },
        [
            duplicateWorkflowConfiguration,
            handleSelfServiceConfigurationUpdate,
            loadWorkflowsConfigurations,
        ]
    )

    const removeWorkflowFromStore = useCallback(
        async (workflowId: string, storeIntegrationId: number) => {
            dispatch({
                type: 'delete',
                isPending: true,
            })
            await handleSelfServiceConfigurationUpdate(
                (draft) => {
                    const at =
                        draft.workflowsEntrypoints?.findIndex(
                            (e) => e.workflow_id === workflowId
                        ) ?? -1
                    if (at >= 0) draft.workflowsEntrypoints?.splice(at, 1)
                },
                {},
                storeIntegrationId
            )
            const internalId =
                workflowConfigurationById[workflowId]?.internal_id

            await deleteWorkflowConfiguration(internalId)
            dispatch({
                type: 'delete',
                isPending: false,
            })
            notifyMerchant('Successfully deleted', 'success')
        },
        [
            handleSelfServiceConfigurationUpdate,
            workflowConfigurationById,
            deleteWorkflowConfiguration,
            notifyMerchant,
        ]
    )

    const appendWorkflowInStore = useCallback(
        async (workflowId: string, storeIntegrationId: number) => {
            await handleSelfServiceConfigurationUpdate(
                (draft) => {
                    draft.workflowsEntrypoints ??= []

                    const alreadyPresent = draft.workflowsEntrypoints.find(
                        (e) => e.workflow_id === workflowId
                    )

                    if (!alreadyPresent) {
                        draft.workflowsEntrypoints.push({
                            workflow_id: workflowId,
                        })
                    }
                },
                undefined,
                storeIntegrationId
            )
        },
        [handleSelfServiceConfigurationUpdate]
    )

    const {duplicatePending, updatePending, deletePending} = state

    const isUpdatePending =
        isWorkflowApiUpdatePending ||
        duplicatePending ||
        updatePending ||
        deletePending

    return {
        duplicateWorkflow,
        removeWorkflowFromStore,
        appendWorkflowInStore,
        workflowConfigurationById,
        isFetchPending:
            isWorkflowApiFetchPending || isWorkflowConfigurationsFetchPending,
        isUpdatePending,
    }
}

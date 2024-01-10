import {useCallback, useEffect, useReducer, useState} from 'react'

import {useSelfServiceConfigurationUpdate} from 'pages/automate/common/hooks/useSelfServiceConfigurationUpdate'
import {NotificationStatus} from 'state/notifications/types'

import {WorkflowConfigurationShallow} from '../models/workflowConfiguration.types'
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
        fetchWorkflowConfigurations,
        deleteWorkflowConfiguration,
        duplicateWorkflowConfiguration,
    } = useWorkflowApi()

    const [workflowConfigurationById, setWorkflowConfigurationById] = useState<
        Record<string, WorkflowConfigurationShallow>
    >({})

    const loadWorkflowsConfigurations = useCallback(async () => {
        const configurations = await fetchWorkflowConfigurations(true)

        setWorkflowConfigurationById(
            configurations.reduce(
                (acc, conf) => ({
                    ...acc,
                    [conf.id]: conf,
                }),
                {} as Record<string, WorkflowConfigurationShallow>
            )
        )
    }, [fetchWorkflowConfigurations])

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
                workflowId
            )

            await loadWorkflowsConfigurations()
            await handleSelfServiceConfigurationUpdate(
                (draft) => {
                    draft.workflows_entrypoints ??= []
                    draft.workflows_entrypoints?.unshift({
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
                        draft.workflows_entrypoints?.findIndex(
                            (e) => e.workflow_id === workflowId
                        ) ?? -1
                    if (at >= 0) draft.workflows_entrypoints?.splice(at, 1)
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
                    draft.workflows_entrypoints ??= []

                    const alreadyPresent = draft.workflows_entrypoints.find(
                        (e) => e.workflow_id === workflowId
                    )

                    if (!alreadyPresent) {
                        draft.workflows_entrypoints.push({
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
        isFetchPending: isWorkflowApiFetchPending,
        isUpdatePending,
    }
}

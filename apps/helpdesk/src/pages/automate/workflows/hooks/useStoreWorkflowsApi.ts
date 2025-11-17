import { useCallback, useEffect, useReducer, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import {
    useDeleteWorkflowConfiguration,
    useDuplicateWorkflowConfiguration,
    useGetWorkflowConfigurations,
    workflowsConfigurationDefinitionKeys,
} from 'models/workflows/queries'
import { useSelfServiceConfigurationUpdate } from 'pages/automate/common/hooks/useSelfServiceConfigurationUpdate'
import { NotificationStatus } from 'state/notifications/types'

import type {
    WorkflowConfiguration,
    WorkflowConfigurationShallow,
} from '../models/workflowConfiguration.types'

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
    notifyMerchant: (message: string, kind: 'success' | 'error') => void,
) => {
    const queryClient = useQueryClient()
    const [state, dispatch] = useReducer(reducer, initialState)

    const {
        mutateAsync: duplicateWorkflowConfiguration,
        isLoading: isDuplicateWorkflowConfigurationLoading,
    } = useDuplicateWorkflowConfiguration()
    const {
        mutateAsync: deleteWorkflowConfiguration,
        isLoading: isDeletingWorkflowConfigurationLoading,
    } = useDeleteWorkflowConfiguration()

    const {
        data: configurations,
        isFetched: isWorkflowConfigurationsFetched,
        isLoading: isWorkflowConfigurationsLoading,
    } = useGetWorkflowConfigurations(true, {})
    const [workflowConfigurationById, setWorkflowConfigurationById] = useState<
        Record<string, WorkflowConfigurationShallow>
    >({})

    const loadWorkflowsConfigurations = useCallback(() => {
        if (!configurations) return
        setWorkflowConfigurationById(
            configurations.reduce(
                (acc, conf) => ({
                    ...acc,
                    [conf.id]: conf,
                }),
                {},
            ),
        )
    }, [configurations])

    useEffect(() => {
        if (isWorkflowConfigurationsFetched) {
            void loadWorkflowsConfigurations()
        }
    }, [loadWorkflowsConfigurations, isWorkflowConfigurationsFetched])

    const { handleSelfServiceConfigurationUpdate } =
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
            const duplicatedWorkflow = await duplicateWorkflowConfiguration([
                workflowId,
                { integration_id: storeIntegrationId },
            ])

            queryClient.setQueriesData<WorkflowConfiguration[]>(
                workflowsConfigurationDefinitionKeys.lists(),
                (data) =>
                    data?.concat(
                        duplicatedWorkflow.data as WorkflowConfiguration,
                    ),
            )

            loadWorkflowsConfigurations()
            await handleSelfServiceConfigurationUpdate(
                (draft) => {
                    draft.workflowsEntrypoints ??= []
                    draft.workflowsEntrypoints?.unshift({
                        workflow_id: duplicatedWorkflow.data.id,
                    })
                },
                undefined,
                storeIntegrationId,
            )
            dispatch({
                type: 'duplicate',
                isPending: false,
            })
            return { id: duplicatedWorkflow.data.id }
        },
        [
            duplicateWorkflowConfiguration,
            handleSelfServiceConfigurationUpdate,
            loadWorkflowsConfigurations,
            queryClient,
        ],
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
                            (e) => e.workflow_id === workflowId,
                        ) ?? -1
                    if (at >= 0) draft.workflowsEntrypoints?.splice(at, 1)
                },
                {},
                storeIntegrationId,
            )
            const internalId =
                workflowConfigurationById[workflowId]?.internal_id

            await deleteWorkflowConfiguration([internalId])

            queryClient.removeQueries(
                workflowsConfigurationDefinitionKeys.get(workflowId),
            )

            queryClient.setQueriesData<WorkflowConfiguration[]>(
                workflowsConfigurationDefinitionKeys.lists(),
                (data) =>
                    data?.filter(
                        (configuration) => configuration.id !== workflowId,
                    ),
            )

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
            queryClient,
            notifyMerchant,
        ],
    )

    const appendWorkflowInStore = useCallback(
        async (workflowId: string, storeIntegrationId: number) => {
            await handleSelfServiceConfigurationUpdate(
                (draft) => {
                    draft.workflowsEntrypoints ??= []

                    const alreadyPresent = draft.workflowsEntrypoints.find(
                        (e) => e.workflow_id === workflowId,
                    )

                    if (!alreadyPresent) {
                        draft.workflowsEntrypoints.push({
                            workflow_id: workflowId,
                        })
                    }
                },
                undefined,
                storeIntegrationId,
            )
        },
        [handleSelfServiceConfigurationUpdate],
    )

    const { duplicatePending, updatePending, deletePending } = state

    const isUpdatePending = duplicatePending || updatePending || deletePending

    const isFetchPending =
        isDuplicateWorkflowConfigurationLoading ||
        isDeletingWorkflowConfigurationLoading ||
        isWorkflowConfigurationsLoading

    return {
        duplicateWorkflow,
        removeWorkflowFromStore,
        appendWorkflowInStore,
        workflowConfigurationById,
        isFetchPending,
        isUpdatePending,
    }
}

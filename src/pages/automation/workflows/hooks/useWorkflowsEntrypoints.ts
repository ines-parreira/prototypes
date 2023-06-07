import {useCallback, useEffect, useState} from 'react'
import {produce} from 'immer'
import {WorkflowEntrypoint} from 'models/selfServiceConfiguration/types'
import useSelfServiceConfiguration from 'pages/automation/common/hooks/useSelfServiceConfiguration'
import {NotificationStatus} from 'state/notifications/types'
import {WorkflowConfiguration} from '../types'
import useWorkflowApi from './useWorkflowApi'

export type UseWorkflowsEntrypointsReturnType = {
    workflowsEntrypoints: Array<WorkflowEntrypoint & {name: string}>
    isFetchPending: boolean
    isUpdatePending: boolean
    deleteWorkflowEntrypoint: (workflowId: string) => Promise<void>
    duplicateWorkflow: (workflowId: string) => Promise<{id: string}>
}

export default function useWorkflowsEntrypoints(
    shopType: string,
    shopName: string,
    notifyMerchant: (message: string, kind: 'success' | 'error') => void
): UseWorkflowsEntrypointsReturnType {
    const {
        selfServiceConfiguration,
        isFetchPending: isSelfServiceFetchPending,
        isUpdatePending: isSelfServiceUpdatePending,
        handleSelfServiceConfigurationUpdate,
    } = useSelfServiceConfiguration(
        shopType,
        shopName,
        // we disable the notifications managed by the useSelfServiceConfiguration hook except for errors
        // because the hook redirects to '/app/automation/macros' in case of API error and we want to keep that behavior so we proxy the notification in this case
        (notif) => {
            if (notif.status === NotificationStatus.Error && notif.message) {
                notifyMerchant(notif.message, 'error')
            }
        }
    )
    const {
        isFetchPending: isWorkflowApiFetchPending,
        isUpdatePending: isWorkflowApiUpdatePending,
        fetchWorkflowConfigurations,
        deleteWorkflowConfiguration,
        duplicateWorkflowConfiguration,
    } = useWorkflowApi()
    const [workflowConfigurationById, setWorkflowConfigurationById] = useState<
        Record<string, WorkflowConfiguration>
    >({})
    const loadWorkflowsConfigurations = useCallback(() => {
        return fetchWorkflowConfigurations().then((confs) =>
            setWorkflowConfigurationById(
                confs.reduce(
                    (acc, conf) => ({
                        ...acc,
                        [conf.id]: conf,
                    }),
                    {} as Record<string, WorkflowConfiguration>
                )
            )
        )
    }, [fetchWorkflowConfigurations])
    useEffect(() => {
        void loadWorkflowsConfigurations()
    }, [loadWorkflowsConfigurations])

    // some operations (duplicate) require fetching and updating from both the self service API and workflows API
    // to keep a consistent loading state we use an additional local isUpdatePending state
    const [isUpdatePending, setIsUpdatePending] = useState(false)

    const deleteWorkflowEntrypoint = useCallback(
        async (workflowId: string) => {
            if (!selfServiceConfiguration)
                throw new Error('self service configuration not loaded')
            const nextConfiguration = produce(
                selfServiceConfiguration,
                (draft) => {
                    const at =
                        draft.workflows_entrypoints?.findIndex(
                            (e) => e.workflow_id === workflowId
                        ) ?? -1
                    if (at >= 0) draft.workflows_entrypoints!.splice(at, 1)
                }
            )

            await handleSelfServiceConfigurationUpdate(nextConfiguration)
            const internalId =
                workflowConfigurationById[workflowId]?.internal_id
            await deleteWorkflowConfiguration(internalId)
            notifyMerchant('Successfully deleted', 'success')
        },
        [
            selfServiceConfiguration,
            handleSelfServiceConfigurationUpdate,
            workflowConfigurationById,
            deleteWorkflowConfiguration,
            notifyMerchant,
        ]
    )

    const duplicateWorkflow = useCallback(
        async (workflowId: string) => {
            if (!selfServiceConfiguration)
                throw new Error('self service configuration not loaded')
            setIsUpdatePending(true)
            const duplicatedWorkflow = await duplicateWorkflowConfiguration(
                workflowId
            )
            await loadWorkflowsConfigurations()
            const nextConfiguration = produce(
                selfServiceConfiguration,
                (draft) => {
                    const originalLabel = draft.workflows_entrypoints?.find(
                        (e) => e.workflow_id === workflowId
                    )?.label
                    draft.workflows_entrypoints?.push({
                        workflow_id: duplicatedWorkflow.id,
                        enabled: false,
                        label: originalLabel || '',
                    })
                }
            )
            await handleSelfServiceConfigurationUpdate(nextConfiguration)
            setIsUpdatePending(false)
            return {id: duplicatedWorkflow.id}
        },
        [
            selfServiceConfiguration,
            duplicateWorkflowConfiguration,
            loadWorkflowsConfigurations,
            handleSelfServiceConfigurationUpdate,
        ]
    )

    const workflowsEntrypoints =
        selfServiceConfiguration?.workflows_entrypoints?.map((e) => ({
            ...e,
            name: workflowConfigurationById[e.workflow_id]?.name ?? '',
        })) ?? []
    return {
        workflowsEntrypoints,
        isFetchPending:
            !isUpdatePending &&
            (isSelfServiceFetchPending || isWorkflowApiFetchPending),
        isUpdatePending:
            isSelfServiceUpdatePending ||
            isWorkflowApiUpdatePending ||
            isUpdatePending,
        deleteWorkflowEntrypoint,
        duplicateWorkflow,
    }
}

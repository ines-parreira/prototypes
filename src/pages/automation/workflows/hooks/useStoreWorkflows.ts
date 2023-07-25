import {useCallback, useEffect, useState} from 'react'

import useSelfServiceConfiguration from 'pages/automation/common/hooks/useSelfServiceConfiguration'
import {NotificationStatus} from 'state/notifications/types'
import {
    LanguageCode,
    WorkflowConfigurationShallow,
} from '../models/workflowConfiguration.types'
import useWorkflowApi from './useWorkflowApi'

export type UseWorkflowsEntrypointsReturnType = {
    storeWorkflows: Array<{
        workflow_id: string
        name: string
        available_languages: LanguageCode[]
    }>
    isFetchPending: boolean
    isUpdatePending: boolean
    removeWorkflowFromStore: (workflowId: string) => Promise<void>
    duplicateWorkflow: (workflowId: string) => Promise<{id: string}>
    appendWorkflowInStore: (workflowId: string) => Promise<void>
}

export default function useStoreWorkflows(
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
        Record<string, WorkflowConfigurationShallow>
    >({})
    const loadWorkflowsConfigurations = useCallback(() => {
        return fetchWorkflowConfigurations().then((confs) =>
            setWorkflowConfigurationById(
                confs.reduce(
                    (acc, conf) => ({
                        ...acc,
                        [conf.id]: conf,
                    }),
                    {} as Record<string, WorkflowConfigurationShallow>
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

    const removeWorkflowFromStore = useCallback(
        async (workflowId: string) => {
            await handleSelfServiceConfigurationUpdate((draft) => {
                const at =
                    draft.workflows_entrypoints?.findIndex(
                        (e) => e.workflow_id === workflowId
                    ) ?? -1
                if (at >= 0) draft.workflows_entrypoints?.splice(at, 1)
            })
            const internalId =
                workflowConfigurationById[workflowId]?.internal_id
            await deleteWorkflowConfiguration(internalId)
            notifyMerchant('Successfully deleted', 'success')
        },
        [
            handleSelfServiceConfigurationUpdate,
            workflowConfigurationById,
            deleteWorkflowConfiguration,
            notifyMerchant,
        ]
    )

    const duplicateWorkflow = useCallback(
        async (workflowId: string) => {
            setIsUpdatePending(true)
            const duplicatedWorkflow = await duplicateWorkflowConfiguration(
                workflowId
            )
            await loadWorkflowsConfigurations()
            await handleSelfServiceConfigurationUpdate((draft) => {
                draft.workflows_entrypoints?.push({
                    workflow_id: duplicatedWorkflow.id,
                })
            })
            setIsUpdatePending(false)
            return {id: duplicatedWorkflow.id}
        },
        [
            duplicateWorkflowConfiguration,
            loadWorkflowsConfigurations,
            handleSelfServiceConfigurationUpdate,
        ]
    )

    const appendWorkflowInStore = useCallback(
        async (workflowId: string) => {
            setIsUpdatePending(true)
            await handleSelfServiceConfigurationUpdate((draft) => {
                draft.workflows_entrypoints ??= []
                draft.workflows_entrypoints.push({
                    workflow_id: workflowId,
                })
            })
            setIsUpdatePending(false)
        },
        [handleSelfServiceConfigurationUpdate]
    )

    const storeWorkflows =
        selfServiceConfiguration?.workflows_entrypoints
            ?.filter((e) => workflowConfigurationById[e.workflow_id])
            .map((e) => ({
                ...e,
                name: workflowConfigurationById[e.workflow_id]?.name ?? '',
                available_languages:
                    workflowConfigurationById[e.workflow_id]
                        ?.available_languages ?? [],
            })) ?? []
    return {
        storeWorkflows,
        isFetchPending:
            !isUpdatePending &&
            (isSelfServiceFetchPending || isWorkflowApiFetchPending),
        isUpdatePending:
            isSelfServiceUpdatePending ||
            isWorkflowApiUpdatePending ||
            isUpdatePending,
        removeWorkflowFromStore,
        duplicateWorkflow,
        appendWorkflowInStore,
    }
}

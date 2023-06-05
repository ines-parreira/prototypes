import {useState, useEffect, useRef, useCallback} from 'react'
import {produce} from 'immer'
import {
    SelfServiceConfiguration,
    WorkflowEntrypoint,
} from 'models/selfServiceConfiguration/types'
import useSelfServiceConfiguration from 'pages/automation/common/hooks/useSelfServiceConfiguration'
import {NotificationStatus} from 'state/notifications/types'
import {MAX_ACTIVE_QUICK_RESPONSES_AND_FLOWS} from 'pages/automation/common/components/constants'
import {WorkflowConfiguration} from '../types'
import useWorkflowApi from './useWorkflowApi'

export type UseWorkflowsEntrypointsReturnType = {
    workflowsEntrypoints: Array<WorkflowEntrypoint & {name: string}>
    isFetchPending: boolean
    isUpdatePending: boolean
    isEnabledLimitReached: boolean
    isToggleUpdatePending: (workflowId: string) => boolean
    toggleEnabled: (workflowId: string) => Promise<void>
    handleDragAndDrop: (sortedWorkflowIds: string[]) => Promise<void>
    deleteWorkflowEntrypoint: (workflowId: string) => Promise<void>
    duplicateWorkflow: (workflowId: string) => Promise<{id: string}>
}

export default function useWorkflowsEntrypoints(
    shopType: string,
    shopName: string,
    notifyMerchant: (message: string, kind: 'success' | 'error') => void
): UseWorkflowsEntrypointsReturnType {
    const {
        isFetchPending: isSelfServiceFetchPending,
        isUpdatePending: isSelfServiceUpdatePending,
        handleSelfServiceConfigurationUpdate,
        ...selfServiceConfigurationApi
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

    // needed to avoid stale references of self service configuration in the handleDragAndDrop callback below
    // otherwise there is a bug involving ReactSortable onChange prop having a stale version of the callback
    // see https://linear.app/gorgias/issue/PLTCO-2960/[frontend]-stale-prop-bug-in-the-reactsortable-component
    const selfServiceConfigurationRef = useRef(
        selfServiceConfigurationApi.selfServiceConfiguration
    )

    // we maintain a local draft configuration to know which entrypoint is currently being enabled or disabled
    // and display the loading in the UI in the corresponding Toggle component
    // see isToggleUpdatePending and its use
    const [draftConfiguration, setDraftConfiguration] = useState(
        selfServiceConfigurationRef.current
    )
    // some operations (duplicate) require fetching and updating from both the self service API and workflows API
    // to keep a consistent loading state we use an additional local isUpdatePending state
    const [isUpdatePending, setIsUpdatePending] = useState(false)

    useEffect(() => {
        setDraftConfiguration(
            selfServiceConfigurationApi.selfServiceConfiguration
        )
        selfServiceConfigurationRef.current =
            selfServiceConfigurationApi.selfServiceConfiguration
    }, [selfServiceConfigurationApi.selfServiceConfiguration])

    const toggleEnabled = useCallback(
        async (workflowId: string) => {
            if (!selfServiceConfigurationApi.selfServiceConfiguration)
                throw new Error('self service configuration not loaded')
            const nextConfiguration = produce(
                selfServiceConfigurationApi.selfServiceConfiguration,
                (draft) => {
                    const entrypoint = draft.workflows_entrypoints?.find(
                        (e) => e.workflow_id === workflowId
                    )
                    if (entrypoint) entrypoint.enabled = !entrypoint.enabled
                }
            )
            setDraftConfiguration(nextConfiguration)
            await handleSelfServiceConfigurationUpdate(nextConfiguration)
            notifyMerchant('Successfully updated', 'success')
        },
        [
            selfServiceConfigurationApi.selfServiceConfiguration,
            handleSelfServiceConfigurationUpdate,
            notifyMerchant,
        ]
    )

    const handleDragAndDrop = useCallback(
        async (sortedWorkflowIds: string[]) => {
            // see why we use a ref here instead of selfServiceConfigurationApi.selfServiceConfiguration in the comment above the ref definition
            if (!selfServiceConfigurationRef.current) return
            const nextConfiguration = reorderWorkflowsEntrypoints(
                selfServiceConfigurationRef.current,
                sortedWorkflowIds
            )
            setDraftConfiguration(nextConfiguration)
            await handleSelfServiceConfigurationUpdate(nextConfiguration)
            notifyMerchant('Successfully updated', 'success')
        },
        [handleSelfServiceConfigurationUpdate, notifyMerchant]
    )

    const deleteWorkflowEntrypoint = useCallback(
        async (workflowId: string) => {
            if (!selfServiceConfigurationApi.selfServiceConfiguration)
                throw new Error('self service configuration not loaded')
            const nextConfiguration = produce(
                selfServiceConfigurationApi.selfServiceConfiguration,
                (draft) => {
                    const at =
                        draft.workflows_entrypoints?.findIndex(
                            (e) => e.workflow_id === workflowId
                        ) ?? -1
                    if (at >= 0) draft.workflows_entrypoints!.splice(at, 1)
                }
            )

            setDraftConfiguration(nextConfiguration)
            await handleSelfServiceConfigurationUpdate(nextConfiguration)
            const internalId =
                workflowConfigurationById[workflowId]?.internal_id
            await deleteWorkflowConfiguration(internalId)
            notifyMerchant('Successfully deleted', 'success')
        },
        [
            selfServiceConfigurationApi.selfServiceConfiguration,
            handleSelfServiceConfigurationUpdate,
            workflowConfigurationById,
            deleteWorkflowConfiguration,
            notifyMerchant,
        ]
    )

    const duplicateWorkflow = useCallback(
        async (workflowId: string) => {
            if (!selfServiceConfigurationApi.selfServiceConfiguration)
                throw new Error('self service configuration not loaded')
            setIsUpdatePending(true)
            const duplicatedWorkflow = await duplicateWorkflowConfiguration(
                workflowId
            )
            await loadWorkflowsConfigurations()
            const nextConfiguration = produce(
                selfServiceConfigurationApi.selfServiceConfiguration,
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
            selfServiceConfigurationApi.selfServiceConfiguration,
            duplicateWorkflowConfiguration,
            loadWorkflowsConfigurations,
            handleSelfServiceConfigurationUpdate,
        ]
    )

    const isToggleUpdatePending = useCallback(
        (workflowId: string) => {
            const apiEnabled =
                selfServiceConfigurationApi.selfServiceConfiguration?.workflows_entrypoints?.find(
                    (e) => e.workflow_id === workflowId
                )?.enabled
            const draftEnabled =
                draftConfiguration?.workflows_entrypoints?.find(
                    (e) => e.workflow_id === workflowId
                )?.enabled
            return apiEnabled !== draftEnabled
        },
        [
            selfServiceConfigurationApi.selfServiceConfiguration,
            draftConfiguration,
        ]
    )

    const workflowsEntrypoints =
        draftConfiguration?.workflows_entrypoints?.map((e) => ({
            ...e,
            name: workflowConfigurationById[e.workflow_id]?.name ?? '',
        })) ?? []
    const quickResponsesEnabled =
        selfServiceConfigurationApi.selfServiceConfiguration?.quick_response_policies?.filter(
            (p) => p.deactivated_datetime == null
        ).length ?? 0
    return {
        workflowsEntrypoints,
        isEnabledLimitReached:
            workflowsEntrypoints.filter((e) => e.enabled).length +
                quickResponsesEnabled >=
            MAX_ACTIVE_QUICK_RESPONSES_AND_FLOWS,
        isFetchPending:
            !isUpdatePending &&
            (isSelfServiceFetchPending || isWorkflowApiFetchPending),
        isUpdatePending:
            isSelfServiceUpdatePending ||
            isWorkflowApiUpdatePending ||
            isUpdatePending,
        isToggleUpdatePending,
        toggleEnabled,
        handleDragAndDrop,
        deleteWorkflowEntrypoint,
        duplicateWorkflow,
    }
}

function reorderWorkflowsEntrypoints(
    configuration: SelfServiceConfiguration,
    sortedWorkflowIds: string[]
) {
    const entrypointsByWorkflowId =
        configuration.workflows_entrypoints?.reduce(
            (acc, e) => ({...acc, [e.workflow_id]: e}),
            {} as {[workflowId: string]: WorkflowEntrypoint}
        ) ?? {}
    const workflowsEntrypoints = sortedWorkflowIds
        .filter((workflowId) => workflowId in entrypointsByWorkflowId)
        .map((workflowId) => entrypointsByWorkflowId[workflowId])
    return {
        ...configuration,
        workflows_entrypoints: workflowsEntrypoints,
    }
}

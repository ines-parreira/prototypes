import {useState, useEffect, useRef, useCallback} from 'react'
import {produce} from 'immer'
import {
    SelfServiceConfiguration,
    WorkflowEntrypoint,
} from 'models/selfServiceConfiguration/types'
import useSelfServiceConfiguration from 'pages/automation/common/hooks/useSelfServiceConfiguration'
import {NotificationStatus} from 'state/notifications/types'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'

export type UseWorflowsEntrypointsReturnType = {
    workflowsEntrypoints: WorkflowEntrypoint[]
    isFetchPending: boolean
    isUpdatePending: boolean
    isToggleUpdatePending: (workflowId: string) => boolean
    toggleEnabled: (workflowId: string) => void
    handleDragAndDrop: (sortedWorkflowIds: string[]) => void
    deleteWorkflowEntrypoint: (workflowId: string) => void
}

export default function useWorflowsEntrypoints(
    shopType: string,
    shopName: string
): UseWorflowsEntrypointsReturnType {
    const dispatch = useAppDispatch()
    const {
        isFetchPending,
        isUpdatePending,
        handleSelfServiceConfigurationUpdate,
        ...selfServiceConfigurationApi
    } = useSelfServiceConfiguration(
        shopType,
        shopName,
        // we disable the notifications managed by the useSelfServiceConfiguration hook except for errors
        // because the hook redirects to '/app/automation/macros' in case of API error and we want to keep that behavior so we proxy the notification in this case
        (notif) => {
            if (notif.status === NotificationStatus.Error) {
                void dispatch(notify(notif))
            }
        }
    )

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

    useEffect(() => {
        setDraftConfiguration(
            selfServiceConfigurationApi.selfServiceConfiguration
        )
        selfServiceConfigurationRef.current =
            selfServiceConfigurationApi.selfServiceConfiguration
    }, [selfServiceConfigurationApi.selfServiceConfiguration])

    const toggleEnabled = useCallback(
        (workflowId: string) => {
            if (!selfServiceConfigurationApi.selfServiceConfiguration) return
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
            void handleSelfServiceConfigurationUpdate(nextConfiguration)
        },
        [
            selfServiceConfigurationApi.selfServiceConfiguration,
            handleSelfServiceConfigurationUpdate,
        ]
    )

    const handleDragAndDrop = useCallback(
        (sortedWorkflowIds: string[]) => {
            // see why we use a ref here instead of selfServiceConfigurationApi.selfServiceConfiguration in the comment above the ref definition
            if (!selfServiceConfigurationRef.current) return
            const nextConfiguration = reorderWorkflowsEntrypoints(
                selfServiceConfigurationRef.current,
                sortedWorkflowIds
            )
            setDraftConfiguration(nextConfiguration)
            void handleSelfServiceConfigurationUpdate(nextConfiguration)
        },
        [handleSelfServiceConfigurationUpdate]
    )

    const deleteWorkflowEntrypoint = useCallback(
        (workflowId: string) => {
            if (!selfServiceConfigurationApi.selfServiceConfiguration) return
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
            void handleSelfServiceConfigurationUpdate(nextConfiguration)
        },
        [
            selfServiceConfigurationApi.selfServiceConfiguration,
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

    return {
        workflowsEntrypoints: draftConfiguration?.workflows_entrypoints ?? [],
        isFetchPending,
        isUpdatePending,
        isToggleUpdatePending,
        toggleEnabled,
        handleDragAndDrop,
        deleteWorkflowEntrypoint,
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

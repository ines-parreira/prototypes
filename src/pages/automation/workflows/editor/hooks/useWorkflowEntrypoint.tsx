import React, {createContext, useCallback, useContext, useState} from 'react'
import {produce} from 'immer'
import {NotificationStatus} from 'state/notifications/types'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import useSelfServiceConfiguration from 'pages/automation/common/hooks/useSelfServiceConfiguration'
import useOnLoaded from './useOnLoaded'

type WorkflowEntrypointContext = {
    label: string
    setLabel: (label: string) => void
    isDirty: boolean
    validationError: string | null
    isFetchPending: boolean
    isSavePending: boolean
    shouldShowErrors: boolean
    handleSave: () => Promise<void> | void
    handleDiscard: () => void
}

const WorkflowEntrypointContext = createContext<
    WorkflowEntrypointContext | undefined
>(undefined)

export function useWorkflowEntrypointContext() {
    const context = useContext(WorkflowEntrypointContext)
    if (!context)
        throw new Error(
            'A workflowEntrypointContext cannot be found in the scope'
        )
    return context
}

export const withWorkflowEntrypointContext =
    <
        WrappedProps extends JSX.IntrinsicAttributes & {
            shopType: string
            shopName: string
            workflowId: string
        }
    >(
        Component: React.FC<WrappedProps>
    ) =>
    (props: WrappedProps) => {
        const contextValue = useWorkflowEntrypoint(
            props.shopType,
            props.shopName,
            props.workflowId
        )
        return (
            <WorkflowEntrypointContext.Provider value={contextValue}>
                <Component {...props} />
            </WorkflowEntrypointContext.Provider>
        )
    }

export function useWorkflowEntrypoint(
    shopType: string,
    shopName: string,
    workflowId: string
) {
    const dispatch = useAppDispatch()
    const {
        isFetchPending,
        isUpdatePending,
        selfServiceConfiguration,
        handleSelfServiceConfigurationUpdate,
    } = useSelfServiceConfiguration(
        shopType,
        shopName,
        // we disable the notifications managed by the useSelfServiceConfiguration hook except for errors
        // because the hook redirects in case of API error so we proxy the notification in this case
        (notif) => {
            if (notif.status === NotificationStatus.Error) {
                void dispatch(notify(notif))
            }
        }
    )
    const [label, setLabel] = useState<string>('')
    const [shouldShowErrors, setShouldShowErrors] = useState(false)
    const apiLabel = selfServiceConfiguration?.workflows_entrypoints?.find(
        (e) => e.workflow_id === workflowId
    )?.label
    useOnLoaded(selfServiceConfiguration, () => {
        setLabel(apiLabel ?? '')
    })
    const isDirty = label !== (apiLabel ?? '')
    const validationError =
        label.trim().length > 1
            ? null
            : 'please add a valid trigger button text'
    const handleSave = useCallback((): Promise<void> | void => {
        if (!selfServiceConfiguration) return
        if (validationError) {
            setShouldShowErrors(true)
            return
        }
        if (!isDirty) return
        const nextConf = produce(selfServiceConfiguration, (draft) => {
            if (!draft.workflows_entrypoints) {
                draft.workflows_entrypoints = []
            }
            const existing = draft.workflows_entrypoints.find(
                (e) => e.workflow_id === workflowId
            )
            if (existing) {
                existing.label = label
            } else {
                draft.workflows_entrypoints.push({
                    label,
                    workflow_id: workflowId,
                    enabled: false,
                })
            }
        })
        return handleSelfServiceConfigurationUpdate(nextConf)
    }, [
        selfServiceConfiguration,
        handleSelfServiceConfigurationUpdate,
        label,
        validationError,
        isDirty,
        workflowId,
    ])
    const handleDiscard = useCallback(() => {
        setLabel(apiLabel || '')
    }, [apiLabel])
    return {
        label,
        setLabel,
        isDirty,
        validationError,
        shouldShowErrors,
        isFetchPending,
        isSavePending: isUpdatePending,
        handleSave,
        handleDiscard,
    }
}

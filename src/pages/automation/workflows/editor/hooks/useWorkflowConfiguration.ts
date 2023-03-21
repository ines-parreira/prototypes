import {useCallback, useEffect, useState, Dispatch, SetStateAction} from 'react'
import _isEqual from 'lodash/isEqual'
import useWorkflowApi, {WorkflowConfiguration} from './useWorkflowApi'
import useOnLoaded from './useOnLoaded'

type WorkflowConfigurationHook = {
    hookError: Maybe<string>
    configuration: WorkflowConfiguration
    isDirty: boolean
    validationError: Maybe<string>
    shouldShowErrors: boolean
    isFetchPending: boolean
    isSavePending: boolean
    handleSave: () => Promise<void>
    handleDiscard: () => void
    setWorkflowName: (name: string) => void
    // state updaters todo =>
    // setReplyButtonText: (stepId: string, text: string) => void
    // setAutomatedMessageContent: (
    //     stepId: string,
    //     content: AutomatedMessageContent
    // ) => void
    // deleteStep: (stepId: string) => void
    // addReplyButton: (parentStepId: string) => void
    // addReplyButtons: (parentStepId: string) => void
}

export default function useWorkflowConfiguration(
    workflowId: string,
    isNew: boolean
): WorkflowConfigurationHook {
    const {
        fetchWorkflowConfiguration,
        upsertWorkflowConfiguration,
        workflowConfigurationFactory,
    } = useWorkflowApi()
    const [isFetchPending, setIsFetchPending] = useState(false)
    const [isSavePending, setIsSavePending] = useState(false)
    const [remoteConfiguration, setRemoteConfiguration] =
        useState<Maybe<WorkflowConfiguration>>(null)
    const [localConfiguration, setLocalConfiguration] =
        useState<WorkflowConfiguration>(
            workflowConfigurationFactory(workflowId)
        )
    const [shouldShowErrors, setShouldShowErrors] = useState(false)
    const [hookError, setHookError] = useState<string | null>(null)

    useEffect(() => {
        async function fetch() {
            if (!isNew) {
                setIsFetchPending(true)
                const fetched = await fetchWorkflowConfiguration(workflowId)
                if (!fetched) setHookError('workflow not found')
                setRemoteConfiguration(fetched)
                setIsFetchPending(false)
            }
        }
        void fetch()
    }, [workflowId, isNew, fetchWorkflowConfiguration])

    useOnLoaded(remoteConfiguration, () => {
        setLocalConfiguration(remoteConfiguration!)
    })

    const isDirty =
        !_isEqual(localConfiguration, remoteConfiguration) &&
        (!isNew || localConfiguration.name.length > 0)
    const validationError = validate(localConfiguration)

    const handleSave = useCallback(async () => {
        if (validationError) {
            setShouldShowErrors(true)
            return
        }
        if (!isDirty) return
        setIsSavePending(true)
        await upsertWorkflowConfiguration(localConfiguration)
        setRemoteConfiguration(localConfiguration)
        setIsSavePending(false)
    }, [
        validationError,
        isDirty,
        upsertWorkflowConfiguration,
        localConfiguration,
    ])

    const handleDiscard = useCallback(() => {
        setLocalConfiguration(
            remoteConfiguration ?? workflowConfigurationFactory(workflowId)
        )
    }, [remoteConfiguration, workflowConfigurationFactory, workflowId])

    return {
        hookError,
        configuration: localConfiguration,
        isFetchPending,
        isSavePending,
        isDirty,
        validationError,
        shouldShowErrors,
        handleSave,
        handleDiscard,
        ...useStateUpdaters(setLocalConfiguration),
    }
}

function validate(conf: WorkflowConfiguration): Maybe<string> {
    if (conf.name.trim().length === 0)
        return 'You must add a flow name in order to save'
    // 'Complete or delete incomplete steps in order to save'
}

function useStateUpdaters(
    setLocalConfiguration: Dispatch<SetStateAction<WorkflowConfiguration>>
) {
    return {
        setWorkflowName(name: string) {
            setLocalConfiguration((c) => ({
                ...c,
                name,
            }))
        },
    }
}

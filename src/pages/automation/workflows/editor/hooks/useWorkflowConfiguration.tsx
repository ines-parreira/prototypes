import React, {
    useCallback,
    useEffect,
    useState,
    useContext,
    createContext,
    useRef,
} from 'react'
import _isEqual from 'lodash/isEqual'
import useWorkflowApi from '../../hooks/useWorkflowApi'
import {WorkflowConfiguration} from '../../types'
import useOnLoaded from './useOnLoaded'
import {
    WorkflowConfigurationAction,
    useWorkflowConfigurationReducer,
} from './useWorkflowConfigurationReducer'

type WorkflowConfigurationContext = {
    hookError: Maybe<string>
    configuration: WorkflowConfiguration
    isDirty: boolean
    isFetchPending: boolean
    isSavePending: boolean
    handleValidate: () => Maybe<string>
    handleSave: () => Promise<void>
    handleDiscard: () => void
    dispatch: React.Dispatch<WorkflowConfigurationAction>
}

const WorkflowConfigurationContext = createContext<
    WorkflowConfigurationContext | undefined
>(undefined)

export function useWorkflowConfigurationContext() {
    const context = useContext(WorkflowConfigurationContext)
    if (!context)
        throw new Error(
            'A workflowConfigurationContext cannot be found in the scope'
        )
    return context
}

export const withWorkflowConfigurationContext =
    <
        WrappedProps extends JSX.IntrinsicAttributes & {
            currentAccountId: number
            workflowId: string
            isNewWorkflow: boolean
        }
    >(
        Component: React.FC<WrappedProps>
    ) =>
    (props: WrappedProps) => {
        const contextValue = useWorkflowConfiguration(
            props.currentAccountId,
            props.workflowId,
            props.isNewWorkflow
        )
        return (
            <WorkflowConfigurationContext.Provider value={contextValue}>
                <Component {...props} />
            </WorkflowConfigurationContext.Provider>
        )
    }

export function useWorkflowConfiguration(
    currentAccountId: number,
    workflowId: string,
    isNew: boolean
): WorkflowConfigurationContext {
    const {
        fetchWorkflowConfiguration,
        upsertWorkflowConfiguration,
        workflowConfigurationFactory,
    } = useWorkflowApi()
    const [isFetchPending, setIsFetchPending] = useState(!isNew)
    const [isSavePending, setIsSavePending] = useState(false)
    const [remoteConfiguration, setRemoteConfiguration] =
        useState<Maybe<WorkflowConfiguration>>(null)
    const workflowFactoryInstance = useRef(
        workflowConfigurationFactory(currentAccountId, workflowId)
    )
    const [localConfiguration, dispatch] = useWorkflowConfigurationReducer(
        workflowFactoryInstance.current
    )
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
        if (!remoteConfiguration) return
        dispatch({
            type: 'RESET_CONFIGURATION',
            configuration: remoteConfiguration,
        })
    })

    const isDirty =
        !_isEqual(localConfiguration, remoteConfiguration) &&
        localConfiguration !== workflowFactoryInstance.current

    const handleValidate = useCallback(
        () => validate(localConfiguration),
        [localConfiguration]
    )

    const handleSave = useCallback(async () => {
        if (validate(localConfiguration)) {
            return
        }
        if (!isDirty) return
        setIsSavePending(true)
        try {
            await upsertWorkflowConfiguration(localConfiguration)
        } catch (e) {
            setIsSavePending(false)
            throw e
        }
        setRemoteConfiguration(localConfiguration)
        setIsSavePending(false)
    }, [isDirty, upsertWorkflowConfiguration, localConfiguration])

    const handleDiscard = useCallback(() => {
        dispatch({
            type: 'RESET_CONFIGURATION',
            configuration:
                remoteConfiguration ??
                workflowConfigurationFactory(currentAccountId, workflowId),
        })
    }, [
        remoteConfiguration,
        workflowConfigurationFactory,
        currentAccountId,
        workflowId,
        dispatch,
    ])

    return {
        hookError,
        configuration: localConfiguration,
        isFetchPending,
        isSavePending,
        isDirty,
        handleValidate,
        handleSave,
        handleDiscard,
        dispatch,
    }
}

function validate(conf: WorkflowConfiguration): Maybe<string> {
    if (conf.name.trim().length === 0)
        return 'You must add a flow name in order to save'
    else if (conf.name.length > 100)
        return 'Flow name must be less than 100 characters'
    if (
        conf.steps.find(
            (s) =>
                s.kind === 'messages' &&
                s.settings.messages[0].content.text.trim().length === 0
        ) ||
        conf.steps.find(
            (s) =>
                s.kind === 'choices' &&
                s.settings.choices.find((c) => c.label.trim().length === 0)
        )
    )
        return 'Complete or delete incomplete steps in order to save'
}

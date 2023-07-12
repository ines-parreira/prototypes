import React, {
    useCallback,
    useEffect,
    useState,
    useContext,
    createContext,
    useRef,
    useMemo,
} from 'react'
import _isEqual from 'lodash/isEqual'
import _omit from 'lodash/omit'

import {WorkflowConfiguration} from '../models/workflowConfiguration.types'
import {transformWorkflowConfigurationIntoVisualBuilderGraph} from '../models/workflowConfiguration.model'
import {
    VisualBuilderGraph,
    VisualBuilderNode,
} from '../models/visualBuilderGraph.types'
import {transformVisualBuilderGraphIntoWfConfiguration} from '../models/visualBuilderGraph.model'
import useWorkflowApi, {workflowConfigurationFactory} from './useWorkflowApi'
import {
    VisualBuilderGraphAction,
    useVisualBuilderGraphReducer,
} from './useVisualBuilderGraphReducer'
import {computeNodesPositions} from './useVisualBuilderGraphReducer/utils'

type WorkflowEditorContext = {
    hookError: Maybe<string>
    configuration: WorkflowConfiguration
    visualBuilderGraph: VisualBuilderGraph
    isDirty: boolean
    isFetchPending: boolean
    isSavePending: boolean
    handleValidate: () => Maybe<string>
    handleSave: () => Promise<void>
    handleDiscard: () => void
    dispatch: React.Dispatch<VisualBuilderGraphAction>
    visualBuilderNodeIdEditing: VisualBuilderNode['id'] | null
    setVisualBuilderNodeIdEditing: React.Dispatch<
        React.SetStateAction<VisualBuilderNode['id'] | null>
    >
}

export const WorkflowEditorContext = createContext<
    WorkflowEditorContext | undefined
>(undefined)

export function useWorkflowEditorContext() {
    const context = useContext(WorkflowEditorContext)
    if (!context)
        throw new Error(
            'A workflowConfigurationContext cannot be found in the scope'
        )
    return context
}

export const withWorkflowEditorContext =
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
        const contextValue = useWorkflowEditor(
            props.currentAccountId,
            props.workflowId,
            props.isNewWorkflow
        )
        return (
            <WorkflowEditorContext.Provider value={contextValue}>
                <Component {...props} />
            </WorkflowEditorContext.Provider>
        )
    }

export function useWorkflowEditor(
    currentAccountId: number,
    workflowId: string,
    isNew: boolean
): WorkflowEditorContext {
    const {
        fetchWorkflowConfiguration,
        upsertWorkflowConfiguration,
        workflowConfigurationFactory,
    } = useWorkflowApi()
    const [isFetchPending, setIsFetchPending] = useState(!isNew)
    const [isSavePending, setIsSavePending] = useState(false)
    const [visualBuilderNodeIdEditing, setVisualBuilderNodeIdEditing] =
        useState<VisualBuilderNode['id'] | null>(null)
    const [remoteConfiguration, setRemoteConfiguration] =
        useState<Maybe<WorkflowConfiguration>>(null)
    const workflowFactoryInstance = useRef(
        workflowConfigurationFactory(currentAccountId, workflowId)
    )
    const [visualBuilderGraph, setVisualBuilderGraph] =
        useState<VisualBuilderGraph>(
            computeNodesPositions(
                transformWorkflowConfigurationIntoVisualBuilderGraph(
                    workflowFactoryInstance.current
                )
            )
        )
    const [visualBuilderGraphDirty, dispatch] = useVisualBuilderGraphReducer(
        computeNodesPositions(
            transformWorkflowConfigurationIntoVisualBuilderGraph(
                workflowFactoryInstance.current
            )
        )
    )
    const [hookError, setHookError] = useState<string | null>(null)

    useEffect(() => {
        async function fetch() {
            if (!isNew) {
                setIsFetchPending(true)
                const fetched = await fetchWorkflowConfiguration(workflowId)
                if (!fetched) setHookError('workflow not found')
                setRemoteConfiguration(fetched)
                if (fetched) {
                    dispatch({
                        type: 'RESET_GRAPH',
                        graph: transformWorkflowConfigurationIntoVisualBuilderGraph(
                            fetched
                        ),
                    })
                }
                setIsFetchPending(false)
            }
        }

        void fetch()
    }, [workflowId, isNew, fetchWorkflowConfiguration, dispatch])

    useEffect(() => {
        if (!remoteConfiguration) return
        setVisualBuilderGraph(
            transformWorkflowConfigurationIntoVisualBuilderGraph(
                remoteConfiguration
            )
        )
    }, [remoteConfiguration, dispatch])

    const isDirty = useMemo(
        () =>
            !_isEqual(
                _omit(
                    transformVisualBuilderGraphIntoWfConfiguration(
                        visualBuilderGraphDirty
                    ),
                    ['transitions']
                ),
                _omit(
                    transformVisualBuilderGraphIntoWfConfiguration(
                        visualBuilderGraph
                    ),
                    ['transitions']
                )
            ),
        [visualBuilderGraph, visualBuilderGraphDirty]
    )

    const handleValidate = useCallback(
        () =>
            validate(
                transformVisualBuilderGraphIntoWfConfiguration(
                    visualBuilderGraphDirty
                )
            ),
        [visualBuilderGraphDirty]
    )

    const handleSave = useCallback(async () => {
        const configurationDirty =
            transformVisualBuilderGraphIntoWfConfiguration(
                visualBuilderGraphDirty
            )
        if (validate(configurationDirty)) {
            return
        }
        if (!isDirty) return
        setIsSavePending(true)
        try {
            await upsertWorkflowConfiguration(configurationDirty)
        } catch (e) {
            setIsSavePending(false)
            throw e
        }
        setRemoteConfiguration(configurationDirty)
        setIsSavePending(false)
    }, [isDirty, upsertWorkflowConfiguration, visualBuilderGraphDirty])

    const handleDiscard = useCallback(() => {
        dispatch({
            type: 'RESET_GRAPH',
            graph: transformWorkflowConfigurationIntoVisualBuilderGraph(
                remoteConfiguration ??
                    workflowConfigurationFactory(currentAccountId, workflowId)
            ),
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
        configuration: remoteConfiguration || workflowFactoryInstance.current,
        visualBuilderGraph: visualBuilderGraphDirty,
        isFetchPending,
        isSavePending,
        isDirty,
        handleValidate,
        handleSave,
        handleDiscard,
        dispatch,
        visualBuilderNodeIdEditing,
        setVisualBuilderNodeIdEditing,
    }
}

function validate(conf: WorkflowConfiguration): Maybe<string> {
    if (conf.name.trim().length === 0)
        return 'You must add a flow name in order to save'
    else if (conf.name.length > 100)
        return 'Flow name must be less than 100 characters'
    if (
        conf.entrypoint?.label.trim().length === 0 ||
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
    if (conf.steps.length === 1)
        return 'You must add at least one step after the trigger button in order to save'
}

export function createWorkflowEditorContextForPreview(
    visualBuilderGraph: VisualBuilderGraph
): WorkflowEditorContext {
    return {
        hookError: null,
        configuration: workflowConfigurationFactory(0, 'id'),
        visualBuilderGraph,
        isFetchPending: false,
        isSavePending: false,
        isDirty: false,
        handleValidate: () => null,
        handleSave: () => Promise.resolve(),
        handleDiscard: () => null,
        dispatch: () => null,
        visualBuilderNodeIdEditing: null,
        setVisualBuilderNodeIdEditing: () => null,
    }
}

import React, {
    useCallback,
    useEffect,
    useState,
    useContext,
    createContext,
    useRef,
    useMemo,
} from 'react'
import {useThrottleFn} from 'react-use'

import {
    LanguageCode,
    WorkflowConfiguration,
} from '../models/workflowConfiguration.types'
import {transformWorkflowConfigurationIntoVisualBuilderGraph} from '../models/workflowConfiguration.model'
import {
    MultipleChoicesNodeType,
    VisualBuilderGraph,
    VisualBuilderNode,
} from '../models/visualBuilderGraph.types'
import {
    areGraphsEqual,
    transformVisualBuilderGraphIntoWfConfiguration,
    walkVisualBuilderGraph,
} from '../models/visualBuilderGraph.model'
import {
    extractVariablesFromText,
    getWorkflowVariableListForNode,
    parseWorkflowVariable,
    checkGraphVariablesValidity,
    buildWorkflowVariableFromNode,
    findVariable,
} from '../models/variables.model'
import {
    getPayloadSizeToLimitRate,
    isPayloadTooLarge,
} from '../utils/payloadSize'
import useWorkflowApi, {workflowConfigurationFactory} from './useWorkflowApi'
import {
    VisualBuilderGraphAction,
    useVisualBuilderGraphReducer,
} from './useVisualBuilderGraphReducer'
import {computeNodesPositions} from './useVisualBuilderGraphReducer/utils'
import useWorkflowTranslations, {
    emptyTranslatedTexts,
} from './useWorkflowTranslations'

export type WorkflowEditorContext = {
    hookError: Maybe<string>
    configuration: WorkflowConfiguration
    visualBuilderGraph: VisualBuilderGraph
    isDirty: boolean
    isFetchPending: boolean
    isSavePending: boolean
    handleValidate: () => Maybe<string>
    handleSave: () => Promise<void>
    handleDiscard: () => void
    checkInvalidVariablesForNode: (text: string, nodeId: string) => boolean
    checkNodeHasVariablesUsedInChildren: (nodeId: string) => boolean
    dispatch: React.Dispatch<VisualBuilderGraphAction>
    visualBuilderNodeIdEditing: VisualBuilderNode['id'] | null
    setVisualBuilderNodeIdEditing: React.Dispatch<
        React.SetStateAction<VisualBuilderNode['id'] | null>
    >
    currentLanguage: LanguageCode
    switchLanguage: (nextLanguage: LanguageCode) => void
    translateKey: (tkey: string, languageCode: LanguageCode) => string
    deleteTranslation: (lang: LanguageCode) => void
    translateGraph: (
        graph: VisualBuilderGraph,
        lang: LanguageCode
    ) => VisualBuilderGraph
    shouldShowErrors: boolean
    setShouldShowErrors: (b: boolean) => void
    visualBuilderChoiceEventIdEditing:
        | MultipleChoicesNodeType['data']['choices'][number]['event_id']
        | null
    setVisualBuilderChoiceEventIdEditing: React.Dispatch<
        React.SetStateAction<
            | MultipleChoicesNodeType['data']['choices'][number]['event_id']
            | null
        >
    >
    translationSizeToLimitRate: number
    configurationSizeToLimitRate: number
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
    const [shouldShowErrors, setShouldShowErrors] = useState(false)
    const [visualBuilderNodeIdEditing, setVisualBuilderNodeIdEditing] =
        useState<VisualBuilderNode['id'] | null>(null)
    const [
        visualBuilderChoiceEventIdEditing,
        setVisualBuilderChoiceEventIdEditing,
    ] = useState<
        MultipleChoicesNodeType['data']['choices'][number]['event_id'] | null
    >(null)
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
    const {
        areTranslationsDirty,
        translateWithSavedTranslations,
        saveTranslations,
        deleteTranslation,
        getLangsOfIncompleteTranslations,
        discardTranslations,
        translateKey,
        currentLanguage,
        switchLanguage,
        setCurrentLanguage,
        getLangsOfTooLargeTranslations,
        translateGraph,
        computeCurrentTranslationSizeToLimitRate,
    } = useWorkflowTranslations(
        visualBuilderGraphDirty.wfConfigurationOriginal.internal_id,
        visualBuilderGraphDirty.available_languages ?? ['en-US'],
        isNew,
        visualBuilderGraphDirty.wfConfigurationOriginal.internal_id !==
            workflowFactoryInstance.current.internal_id
    )

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
                setCurrentLanguage(fetched?.available_languages?.[0] ?? 'en-US')
                setIsFetchPending(false)
            }
        }

        void fetch()
    }, [
        workflowId,
        isNew,
        fetchWorkflowConfiguration,
        setCurrentLanguage,
        dispatch,
    ])

    useEffect(() => {
        if (!remoteConfiguration) return
        setVisualBuilderGraph(
            computeNodesPositions(
                transformWorkflowConfigurationIntoVisualBuilderGraph(
                    remoteConfiguration
                )
            )
        )
    }, [remoteConfiguration, dispatch])

    const isVisualBuilderGraphDirty = useMemo(
        () =>
            !areGraphsEqual(
                translateWithSavedTranslations(visualBuilderGraph),
                visualBuilderGraphDirty
            ),
        [
            visualBuilderGraph,
            visualBuilderGraphDirty,
            translateWithSavedTranslations,
        ]
    )
    const isDirty = isVisualBuilderGraphDirty || areTranslationsDirty

    const configurationDirtySizeToLimitRate = useThrottleFn(
        (graph) =>
            getPayloadSizeToLimitRate(
                emptyTranslatedTexts(
                    transformVisualBuilderGraphIntoWfConfiguration(graph)
                )
            ),
        500,
        [visualBuilderGraphDirty]
    )
    const currentTranslationSizeToLimitRate = useThrottleFn(
        (graph) => computeCurrentTranslationSizeToLimitRate(graph),
        500,
        [visualBuilderGraphDirty]
    )

    const handleValidate = useCallback(() => {
        const configurationDirty =
            transformVisualBuilderGraphIntoWfConfiguration(
                visualBuilderGraphDirty
            )

        const error = validate(configurationDirty)

        if (error) return error

        const graphVariablesError = checkGraphVariablesValidity(
            visualBuilderGraphDirty,
            translateGraph
        )

        if (graphVariablesError) {
            const nextGraph = switchLanguage(
                visualBuilderGraphDirty,
                graphVariablesError.lang
            )
            dispatch({
                type: 'RESET_GRAPH',
                graph: nextGraph,
            })
            return graphVariablesError.error
        }

        const incompleteLangs = getLangsOfIncompleteTranslations(
            visualBuilderGraphDirty
        )
        if (incompleteLangs.length > 0) {
            const nextGraph = switchLanguage(
                visualBuilderGraphDirty,
                incompleteLangs[0]
            )
            dispatch({
                type: 'RESET_GRAPH',
                graph: nextGraph,
            })
            return 'Complete steps in all available languages in order to create a flow'
        }
        const tooLargeLangs = getLangsOfTooLargeTranslations(
            visualBuilderGraphDirty
        )
        if (tooLargeLangs.length > 0) {
            const nextGraph = switchLanguage(
                visualBuilderGraphDirty,
                tooLargeLangs[0]
            )
            dispatch({
                type: 'RESET_GRAPH',
                graph: nextGraph,
            })
            return 'This Flow is too large to save. Please remove steps or shorten responses and try again.'
        }

        return null
    }, [
        translateGraph,
        visualBuilderGraphDirty,
        getLangsOfIncompleteTranslations,
        getLangsOfTooLargeTranslations,
        switchLanguage,
        dispatch,
    ])

    const handleSave = useCallback(async () => {
        if (!isDirty) return

        const configurationDirty =
            transformVisualBuilderGraphIntoWfConfiguration(
                visualBuilderGraphDirty
            )

        setIsSavePending(true)
        try {
            // why saving order differ depending on isNew?
            // => https://www.notion.so/gorgias/Tech-specs-workflows-translations-FRONTEND-ad28bd8eb55440d788eebc9f896a3ff0?pvs=4#3f73c3969bc8471486a59efeee861511
            if (isNew) {
                await upsertWorkflowConfiguration(
                    emptyTranslatedTexts(configurationDirty)
                )
                await saveTranslations(visualBuilderGraphDirty)
            } else {
                await saveTranslations(visualBuilderGraphDirty)
                await upsertWorkflowConfiguration(
                    emptyTranslatedTexts(configurationDirty)
                )
            }
        } catch (e) {
            setIsSavePending(false)
            throw e
        }
        setRemoteConfiguration(configurationDirty)
        setIsSavePending(false)
    }, [
        isDirty,
        upsertWorkflowConfiguration,
        visualBuilderGraphDirty,
        saveTranslations,
        isNew,
    ])

    const handleDiscard = useCallback(() => {
        const nextGraph = computeNodesPositions(
            transformWorkflowConfigurationIntoVisualBuilderGraph(
                remoteConfiguration ??
                    workflowConfigurationFactory(currentAccountId, workflowId)
            )
        )
        dispatch({
            type: 'RESET_GRAPH',
            graph: nextGraph,
        })
        discardTranslations()
    }, [
        remoteConfiguration,
        workflowConfigurationFactory,
        currentAccountId,
        workflowId,
        dispatch,
        discardTranslations,
    ])

    const checkInvalidVariablesForNode = useCallback(
        (text: string, nodeId: string) => {
            const variables = extractVariablesFromText(text)
            if (variables.length === 0) return false
            const availableVariables = getWorkflowVariableListForNode(
                visualBuilderGraphDirty,
                nodeId
            )
            return variables
                .map((v) => parseWorkflowVariable(v, availableVariables))
                .some((v) => v.isInvalid)
        },
        [visualBuilderGraphDirty]
    )

    const checkNodeHasVariablesUsedInChildren = useCallback(
        (nodeId: string) => {
            const currentNode = visualBuilderGraphDirty.nodes.find(
                (n) => n.id === nodeId
            )

            if (!currentNode) return false

            const nodeVariable = buildWorkflowVariableFromNode(currentNode)
            if (!nodeVariable) return false

            let found = false

            walkVisualBuilderGraph(
                visualBuilderGraphDirty,
                nodeId,
                (childNode) => {
                    if (found) return

                    const content =
                        'content' in childNode.data
                            ? childNode.data.content.text
                            : null

                    if (!content) return

                    const variables = extractVariablesFromText(content)
                    if (variables.length === 0) return

                    found = Boolean(
                        findVariable([nodeVariable], (v) => {
                            if ('value' in v && variables.includes(v.value)) {
                                return v
                            }
                        })
                    )
                }
            )

            return found
        },
        [visualBuilderGraphDirty]
    )

    const switchLanguageCallback = useCallback(
        (nextLanguage: LanguageCode) => {
            const nextVisualBuilderGraph = switchLanguage(
                visualBuilderGraphDirty,
                nextLanguage
            )
            dispatch({
                type: 'RESET_GRAPH',
                graph: nextVisualBuilderGraph,
            })
        },
        [visualBuilderGraphDirty, switchLanguage, dispatch]
    )

    const deleteTranslationCallback = useCallback(
        (lang: LanguageCode) => {
            const nextVisualBuilderGraph = deleteTranslation(
                visualBuilderGraphDirty,
                lang
            )
            dispatch({
                type: 'RESET_GRAPH',
                graph: nextVisualBuilderGraph,
            })
        },
        [deleteTranslation, visualBuilderGraphDirty, dispatch]
    )

    return {
        hookError,
        configuration: remoteConfiguration || workflowFactoryInstance.current,
        visualBuilderGraph: visualBuilderGraphDirty,
        isFetchPending,
        isSavePending,
        isDirty: isVisualBuilderGraphDirty,
        checkInvalidVariablesForNode,
        checkNodeHasVariablesUsedInChildren,
        handleValidate,
        handleSave,
        handleDiscard,
        dispatch,
        visualBuilderNodeIdEditing,
        setVisualBuilderNodeIdEditing,
        translateKey,
        currentLanguage,
        switchLanguage: switchLanguageCallback,
        deleteTranslation: deleteTranslationCallback,
        shouldShowErrors,
        setShouldShowErrors,
        visualBuilderChoiceEventIdEditing,
        setVisualBuilderChoiceEventIdEditing,
        translateGraph,
        translationSizeToLimitRate: currentTranslationSizeToLimitRate ?? 0,
        configurationSizeToLimitRate: configurationDirtySizeToLimitRate ?? 0,
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
    if (isPayloadTooLarge(emptyTranslatedTexts(conf))) {
        return 'This Flow is too large to save. Please remove steps and try again.'
    }
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
        checkInvalidVariablesForNode: () => false,
        checkNodeHasVariablesUsedInChildren: () => false,
        handleValidate: () => null,
        handleSave: () => Promise.resolve(),
        handleDiscard: () => null,
        dispatch: () => null,
        visualBuilderNodeIdEditing: null,
        setVisualBuilderNodeIdEditing: () => null,
        translateKey: () => '',
        currentLanguage: 'en-US',
        switchLanguage: () => {
            // noop
        },
        deleteTranslation: () => {
            // noop
        },
        shouldShowErrors: false,
        setShouldShowErrors: () => {
            // noop
        },
        visualBuilderChoiceEventIdEditing: null,
        setVisualBuilderChoiceEventIdEditing: () => null,
        translateGraph: (graph) => graph,
        translationSizeToLimitRate: 0,
        configurationSizeToLimitRate: 0,
    }
}

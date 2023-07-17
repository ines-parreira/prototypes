import React, {
    useCallback,
    useEffect,
    useState,
    useContext,
    createContext,
    useRef,
    useMemo,
} from 'react'

import {
    LanguageCode,
    WorkflowConfiguration,
} from '../models/workflowConfiguration.types'
import {transformWorkflowConfigurationIntoVisualBuilderGraph} from '../models/workflowConfiguration.model'
import {
    VisualBuilderGraph,
    VisualBuilderNode,
} from '../models/visualBuilderGraph.types'
import {
    areGraphsEqual,
    transformVisualBuilderGraphIntoWfConfiguration,
} from '../models/visualBuilderGraph.model'
import useWorkflowApi, {workflowConfigurationFactory} from './useWorkflowApi'
import {
    VisualBuilderGraphAction,
    useVisualBuilderGraphReducer,
} from './useVisualBuilderGraphReducer'
import {computeNodesPositions} from './useVisualBuilderGraphReducer/utils'
import useWorkflowTranslations, {
    emptyTranslatedTexts,
} from './useWorkflowTranslations'

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
    currentLanguage: LanguageCode
    switchLanguage: (nextLanguage: LanguageCode) => void
    translateKey: (tkey: string, languageCode: LanguageCode) => string
    deleteTranslation: (lang: LanguageCode) => void
    shouldShowErrors: boolean
    setShouldShowErrors: (b: boolean) => void
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

    const handleValidate = useCallback(() => {
        const configurationDirty =
            transformVisualBuilderGraphIntoWfConfiguration(
                visualBuilderGraphDirty
            )
        const error = validate(configurationDirty)
        if (error) return error
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
        return null
    }, [
        visualBuilderGraphDirty,
        getLangsOfIncompleteTranslations,
        switchLanguage,
        dispatch,
    ])

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

    return {
        hookError,
        configuration: remoteConfiguration || workflowFactoryInstance.current,
        visualBuilderGraph: visualBuilderGraphDirty,
        isFetchPending,
        isSavePending,
        isDirty: isVisualBuilderGraphDirty,
        handleValidate,
        handleSave,
        handleDiscard,
        dispatch,
        visualBuilderNodeIdEditing,
        setVisualBuilderNodeIdEditing,
        translateKey,
        currentLanguage,
        switchLanguage: useCallback(
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
        ),
        deleteTranslation: useCallback(
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
        ),
        shouldShowErrors,
        setShouldShowErrors,
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
    }
}

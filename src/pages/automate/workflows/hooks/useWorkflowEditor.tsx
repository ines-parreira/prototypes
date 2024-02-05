import React, {
    useCallback,
    useEffect,
    useState,
    useContext,
    createContext,
    useRef,
    useMemo,
} from 'react'

import {validateHttpHeaderName, validateJSON, validateWebhookURL} from 'utils'
import {saveFileAsDownloaded} from 'utils/file'
import {Notification, NotificationStatus} from 'state/notifications/types'
import useThrottledValue from 'hooks/useThrottledValue'
import {
    LanguageCode,
    WorkflowConfiguration,
    WorkflowStepHttpRequest,
} from '../models/workflowConfiguration.types'
import {transformWorkflowConfigurationIntoVisualBuilderGraph} from '../models/workflowConfiguration.model'
import {
    HttpRequestNodeType,
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
    getWorkflowVariableListForNode,
    parseWorkflowVariable,
    checkGraphVariablesValidity,
    buildWorkflowVariableFromNode,
    findVariable,
    extractVariablesFromNode,
} from '../models/variables.model'
import {
    getPayloadSizeToLimitRate,
    isPayloadTooLarge,
} from '../utils/payloadSize'
import {MAX_CONFIGURATION_SIZE_IN_BYTES} from '../constants'
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
    isPublishPending: boolean
    handleValidate: (isPublishing: boolean) => Maybe<string>
    handleSave: () => Promise<string | undefined>
    handlePublish: () => Promise<string | undefined>
    handleDiscard: () => void
    checkInvalidVariablesForNode: (
        node: UnionPick<VisualBuilderNode, 'id' | 'type' | 'data'>
    ) => boolean
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
    handleDownloadHttpRequestEventLogs: (
        node: HttpRequestNodeType
    ) => Promise<void>
    isDownloadPending: boolean
    checkNewVisualBuilderNode: (nodeId: string) => boolean
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
            notifyMerchant: (message: Notification) => void
        }
    >(
        Component: React.FC<WrappedProps>
    ) =>
    (props: WrappedProps) => {
        const contextValue = useWorkflowEditor(
            props.currentAccountId,
            props.workflowId,
            props.isNewWorkflow,
            props.notifyMerchant
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
    isNew: boolean,
    notifyMerchant: (message: Notification) => void
): WorkflowEditorContext {
    const {
        fetchWorkflowConfiguration,
        upsertWorkflowConfiguration,
        workflowConfigurationFactory,
        downloadWorkflowConfigurationStepLogs,
    } = useWorkflowApi()
    const [isFetchPending, setIsFetchPending] = useState(!isNew)
    const [isSavePending, setIsSavePending] = useState(false)
    const [isPublishPending, setIsPublishPending] = useState(false)
    const [isDownloadPending, setIsDownloadPending] = useState(false)
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

    const configuration = remoteConfiguration || workflowFactoryInstance.current

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

    const configurationDirtySizeToLimitRate = useThrottledValue(
        (graph) =>
            getPayloadSizeToLimitRate(
                emptyTranslatedTexts(
                    transformVisualBuilderGraphIntoWfConfiguration(graph)
                ),
                MAX_CONFIGURATION_SIZE_IN_BYTES
            ),
        [visualBuilderGraphDirty],
        500
    )
    const currentTranslationSizeToLimitRate = useThrottledValue(
        (graph) => computeCurrentTranslationSizeToLimitRate(graph),
        [visualBuilderGraphDirty],
        500
    )

    const handleValidate = useCallback(
        (isPublishing: boolean) => {
            const configurationDirty =
                transformVisualBuilderGraphIntoWfConfiguration(
                    visualBuilderGraphDirty
                )

            const error = validate(configurationDirty, isPublishing)

            if (error) return error
            if (configurationDirty.is_draft && !isPublishing) return null

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
        },
        [
            translateGraph,
            visualBuilderGraphDirty,
            getLangsOfIncompleteTranslations,
            getLangsOfTooLargeTranslations,
            switchLanguage,
            dispatch,
        ]
    )

    const updateWorkflow = useCallback(
        async (configurationDirty: WorkflowConfiguration) => {
            let configuration: WorkflowConfiguration

            // why saving order differ depending on isNew?
            // => https://www.notion.so/gorgias/Tech-specs-workflows-translations-FRONTEND-ad28bd8eb55440d788eebc9f896a3ff0?pvs=4#3f73c3969bc8471486a59efeee861511
            if (isNew) {
                const updatedConfiguration = await upsertWorkflowConfiguration(
                    emptyTranslatedTexts(configurationDirty)
                )

                await saveTranslations(visualBuilderGraphDirty)
                configuration = updatedConfiguration
            } else {
                await saveTranslations(visualBuilderGraphDirty)
                const updatedConfiguration = await upsertWorkflowConfiguration(
                    emptyTranslatedTexts(configurationDirty)
                )

                configuration = updatedConfiguration
            }

            setRemoteConfiguration({
                ...configurationDirty,
                updated_datetime: configuration.updated_datetime,
            })
            dispatch({
                type: 'RESET_GRAPH',
                graph: transformWorkflowConfigurationIntoVisualBuilderGraph(
                    configurationDirty
                ),
            })

            return configuration.id
        },
        [
            isNew,
            upsertWorkflowConfiguration,
            saveTranslations,
            visualBuilderGraphDirty,
            dispatch,
        ]
    )

    const handlePublish = useCallback(async () => {
        const isAlreadyPublished = configuration.is_draft === false
        if (isAlreadyPublished && !isDirty) return

        try {
            setIsPublishPending(true)
            const configurationDirty =
                transformVisualBuilderGraphIntoWfConfiguration(
                    visualBuilderGraphDirty,
                    false
                )
            return await updateWorkflow(configurationDirty)
        } finally {
            setIsPublishPending(false)
        }
    }, [
        updateWorkflow,
        visualBuilderGraphDirty,
        isDirty,
        configuration.is_draft,
    ])

    const handleSave = useCallback(async () => {
        if (!isDirty) return

        try {
            setIsSavePending(true)
            const configurationDirty =
                transformVisualBuilderGraphIntoWfConfiguration(
                    visualBuilderGraphDirty
                )
            return await updateWorkflow(configurationDirty)
        } finally {
            setIsSavePending(false)
        }
    }, [updateWorkflow, visualBuilderGraphDirty, isDirty])

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
        (node: UnionPick<VisualBuilderNode, 'id' | 'type' | 'data'>) => {
            const variables = extractVariablesFromNode(node)
            if (variables.length === 0) return false
            const availableVariables = getWorkflowVariableListForNode(
                visualBuilderGraphDirty,
                node.id
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

                    const variables = extractVariablesFromNode(childNode)
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
    const handleDownloadHttpRequestEventLogs = useCallback(
        async (node: HttpRequestNodeType) => {
            setIsDownloadPending(true)

            try {
                const data = await downloadWorkflowConfigurationStepLogs(
                    visualBuilderGraphDirty.wfConfigurationOriginal.internal_id,
                    node.data.wfConfigurationRef
                        .wfConfigurationHttpRequestStepId
                )

                saveFileAsDownloaded(
                    `${
                        node.data.name ?? 'Request name'
                    }-event-logs-${new Date().toISOString()}.csv`,
                    data,
                    'text/csv'
                )
            } catch {
                notifyMerchant({
                    status: NotificationStatus.Error,
                    title: 'Failed to download event logs.',
                })
            } finally {
                setIsDownloadPending(false)
            }
        },
        [
            visualBuilderGraphDirty.wfConfigurationOriginal.internal_id,
            downloadWorkflowConfigurationStepLogs,
            notifyMerchant,
        ]
    )
    const checkNewVisualBuilderNode = useCallback(
        (nodeId: string) => {
            if (isNew) {
                return true
            }
            return !visualBuilderGraph.nodes.some((node) => node.id === nodeId)
        },
        [isNew, visualBuilderGraph.nodes]
    )

    return {
        hookError,
        configuration,
        visualBuilderGraph: visualBuilderGraphDirty,
        isFetchPending,
        isSavePending,
        isPublishPending,
        isDirty: isVisualBuilderGraphDirty,
        checkInvalidVariablesForNode,
        checkNodeHasVariablesUsedInChildren,
        handleValidate,
        handleSave,
        handlePublish,
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
        handleDownloadHttpRequestEventLogs,
        isDownloadPending,
        checkNewVisualBuilderNode,
    }
}

function isHttpRequestStepIncomplete({
    url,
    name,
    headers = {},
    variables,
    body,
}: WorkflowStepHttpRequest['settings']) {
    if (!name.trim() || !url) {
        return true
    }

    if (Object.entries(headers).some(([k, v]) => !k.trim() || !v.trim())) {
        return true
    }

    if (variables.some((v) => !v.name.trim() || !v.jsonpath.trim())) {
        return true
    }

    if (headers['content-type'] === 'application/x-www-form-urlencoded') {
        const entries = Array.from(new URLSearchParams(body).entries())

        if (entries.some(([k, v]) => !k.trim() || !v.trim())) {
            return true
        }
    }

    return false
}

function validate(
    conf: WorkflowConfiguration,
    isPublishing: boolean
): Maybe<string> {
    const action = isPublishing ? 'publish' : 'save'
    if (!conf.name.trim()) {
        return `You must add a flow name in order to ${action}`
    }
    if (conf.name.length > 100) {
        return 'Flow name must be less than 100 characters'
    }

    if (conf.is_draft && !isPublishing) return null
    if (conf.steps.length === 1) {
        return 'You must add at least one step after the trigger button in order to publish'
    }

    const httpRequestSteps = conf.steps.filter(
        (s): s is WorkflowStepHttpRequest => s.kind === 'http-request'
    )

    if (
        conf.entrypoint?.label.trim().length === 0 ||
        conf.steps.find(
            (s) =>
                s.kind === 'messages' &&
                !s.settings.messages[0].content.text.trim()
        ) ||
        conf.steps.find(
            (s) =>
                s.kind === 'choices' &&
                s.settings.choices.find((c) => !c.label.trim())
        ) ||
        httpRequestSteps.find((s) => isHttpRequestStepIncomplete(s.settings))
    ) {
        return 'Complete or delete incomplete steps in order to publish'
    }

    const urlValidationMessage = httpRequestSteps
        .map((s) => validateWebhookURL(s.settings.url))
        .filter(Boolean)[0]
    if (urlValidationMessage) {
        return urlValidationMessage
    }

    const jsonInvalid = httpRequestSteps
        .filter(
            (s) => s.settings.headers?.['content-type'] === 'application/json'
        )
        .some((s) => !validateJSON(s.settings.body || ''))
    if (jsonInvalid) {
        return 'Invalid JSON'
    }
    const headerNameInvalid = httpRequestSteps.some((s) =>
        Object.entries(s.settings.headers ?? {}).some(
            ([k]) => !validateHttpHeaderName(k)
        )
    )
    if (headerNameInvalid) {
        return 'Invalid header name in HTTP request'
    }
    if (
        isPayloadTooLarge(
            emptyTranslatedTexts(conf),
            MAX_CONFIGURATION_SIZE_IN_BYTES
        )
    ) {
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
        isPublishPending: false,
        isDirty: false,
        checkInvalidVariablesForNode: () => false,
        checkNodeHasVariablesUsedInChildren: () => false,
        handleValidate: () => null,
        handleSave: () => Promise.resolve(''),
        handlePublish: () => Promise.resolve(''),
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
        handleDownloadHttpRequestEventLogs: () => Promise.resolve(),
        isDownloadPending: false,
        checkNewVisualBuilderNode: () => false,
    }
}

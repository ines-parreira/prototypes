import React, {
    useCallback,
    useEffect,
    useState,
    useContext,
    createContext,
    useRef,
    useMemo,
} from 'react'

import {useQueryClient} from '@tanstack/react-query'
import {validateHttpHeaderName, validateWebhookURL} from 'utils'
import useThrottledValue from 'hooks/useThrottledValue'
import {WorkflowStepMetricsMap} from 'hooks/reporting/automate/utils'
import {
    useUpsertWorkflowConfiguration,
    useFetchWorkflowConfiguration,
    workflowsConfigurationDefinitionKeys,
} from 'models/workflows/queries'
import {
    LanguageCode,
    WorkflowConfiguration,
    WorkflowStep,
    WorkflowStepHttpRequest,
    WorkflowTransition,
} from '../models/workflowConfiguration.types'
import {transformWorkflowConfigurationIntoVisualBuilderGraph} from '../models/workflowConfiguration.model'
import {VisualBuilderGraph} from '../models/visualBuilderGraph.types'
import {
    areGraphsEqual,
    transformVisualBuilderGraphIntoWfConfiguration,
} from '../models/visualBuilderGraph.model'
import {
    getWorkflowVariableListForNode,
    checkGraphVariablesValidity,
    validateJSONWithVariables,
} from '../models/variables.model'
import {
    getPayloadSizeToLimitRate,
    isPayloadTooLarge,
} from '../utils/payloadSize'
import {MAX_CONFIGURATION_SIZE_IN_BYTES} from '../constants'
import {ConditionSchema} from '../models/conditions.types'
import {WorkflowVariableList} from '../models/variables.types'
import {WorkflowConfigurationUpsertDto} from '../types'
import {workflowConfigurationFactory} from './utils'
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
    isTesting: boolean
    isPublishPending: boolean
    handleValidate: (isPublishing: boolean) => Maybe<string>
    handleSave: () => Promise<string | undefined>
    handlePublish: () => Promise<string | undefined>
    handleDiscard: () => void
    dispatch: React.Dispatch<VisualBuilderGraphAction>
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
    setIsTesting: (isTesting: boolean) => void
    translationSizeToLimitRate: number
    configurationSizeToLimitRate: number
    isFlowPublishingInChannels: boolean
    setFlowPublishingInChannels: (flag: boolean) => void
    zoom: number
    setZoom: (zoom: number) => void
    workflowStepMetrics?: WorkflowStepMetricsMap | null
    setWorkflowStepMetrics?: (metrics: WorkflowStepMetricsMap | null) => void
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
            workflowId: string
            isNewWorkflow: boolean
        }
    >(
        Component: React.FC<WrappedProps>
    ) =>
    (props: WrappedProps) => {
        const contextValue = useWorkflowEditor(
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
    workflowId: string,
    isNew: boolean
): WorkflowEditorContext {
    const queryClient = useQueryClient()

    const [hookError, setHookError] = useState<string | null>(null)
    const {mutateAsync: upsertWorkflowConfiguration} =
        useUpsertWorkflowConfiguration()
    const {mutateAsync: fetchWorkflowConfiguration, isLoading: isFetchPending} =
        useFetchWorkflowConfiguration()
    const [isSavePending, setIsSavePending] = useState(false)
    const [isPublishPending, setIsPublishPending] = useState(false)
    const [shouldShowErrors, setShouldShowErrors] = useState(false)
    const [isTesting, setIsTesting] = useState(false)
    const [isFlowPublishingInChannels, setFlowPublishingInChannels] =
        useState(false)
    const [remoteConfiguration, setRemoteConfiguration] =
        useState<Maybe<WorkflowConfiguration>>(null)
    const workflowFactoryInstance = useRef(
        workflowConfigurationFactory(workflowId)
    )
    const [zoom, setZoom] = useState(1)
    const [workflowStepMetrics, setWorkflowStepMetrics] =
        useState<WorkflowStepMetricsMap | null>(null)

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
        if (visualBuilderGraphDirty.nodeEditingId !== null && isTesting) {
            setIsTesting(false)
        }
    }, [isTesting, visualBuilderGraphDirty.nodeEditingId])
    useEffect(() => {
        if (
            visualBuilderGraphDirty.nodeEditingId &&
            isFlowPublishingInChannels
        ) {
            setFlowPublishingInChannels(false)
        }
    }, [isFlowPublishingInChannels, visualBuilderGraphDirty.nodeEditingId])
    useEffect(() => {
        async function fetch() {
            if (!isNew) {
                const {data} = await fetchWorkflowConfiguration([workflowId])
                if (!data) setHookError('workflow not found')
                setRemoteConfiguration(data as WorkflowConfiguration)
                if (data) {
                    dispatch({
                        type: 'RESET_GRAPH',
                        graph: transformWorkflowConfigurationIntoVisualBuilderGraph(
                            data as WorkflowConfiguration
                        ),
                    })
                }
                setCurrentLanguage(data?.available_languages?.[0] ?? 'en-US')
            }
        }

        void fetch()
    }, [
        workflowId,
        isNew,
        setCurrentLanguage,
        dispatch,
        fetchWorkflowConfiguration,
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

            const availableVariablesByStepId =
                visualBuilderGraphDirty.nodes.reduce<
                    Record<WorkflowStep['id'], WorkflowVariableList>
                >(
                    (acc, node) => ({
                        ...acc,
                        [node.id]: getWorkflowVariableListForNode(
                            visualBuilderGraphDirty,
                            node.id
                        ),
                    }),
                    {}
                )

            const error = validateConfiguration(
                configurationDirty,
                isPublishing,
                availableVariablesByStepId
            )

            if (error) return error
            if (configurationDirty.is_draft && !isPublishing) return null

            for (const lang of visualBuilderGraphDirty.available_languages) {
                const translatedGraph = translateGraph(
                    visualBuilderGraphDirty,
                    lang
                )

                const graphVariablesError =
                    checkGraphVariablesValidity(translatedGraph)

                if (graphVariablesError) {
                    const nextGraph = switchLanguage(
                        visualBuilderGraphDirty,
                        lang
                    )
                    dispatch({
                        type: 'RESET_GRAPH',
                        graph: nextGraph,
                    })
                    return graphVariablesError
                }
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
                const updatedConfiguration = (await upsertWorkflowConfiguration(
                    [
                        visualBuilderGraphDirty.wfConfigurationOriginal
                            .internal_id,
                        emptyTranslatedTexts(
                            configurationDirty
                        ) as WorkflowConfigurationUpsertDto,
                    ]
                )) as {data: WorkflowConfiguration}

                await saveTranslations(visualBuilderGraphDirty)
                configuration = updatedConfiguration.data
            } else {
                await saveTranslations(visualBuilderGraphDirty)
                const updatedConfiguration = (await upsertWorkflowConfiguration(
                    [
                        visualBuilderGraphDirty.wfConfigurationOriginal
                            .internal_id,
                        emptyTranslatedTexts(
                            configurationDirty
                        ) as WorkflowConfigurationUpsertDto,
                    ]
                )) as {data: WorkflowConfiguration}

                configuration = updatedConfiguration.data
            }

            const updatedConfiguration = {
                ...configurationDirty,
                updated_datetime: configuration?.updated_datetime,
            }

            setRemoteConfiguration(updatedConfiguration)

            queryClient.setQueriesData<WorkflowConfiguration[]>(
                workflowsConfigurationDefinitionKeys.lists(),
                (data) => {
                    if (isNew) {
                        return data
                            ? [...data, updatedConfiguration]
                            : [updatedConfiguration]
                    }
                    return data?.map((configuration) =>
                        configuration.id === updatedConfiguration.id
                            ? updatedConfiguration
                            : configuration
                    )
                }
            )

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
            queryClient,
            dispatch,
            upsertWorkflowConfiguration,
            visualBuilderGraphDirty,
            saveTranslations,
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
                remoteConfiguration ?? workflowConfigurationFactory(workflowId)
            )
        )
        dispatch({
            type: 'RESET_GRAPH',
            graph: nextGraph,
        })
        discardTranslations()
    }, [remoteConfiguration, workflowId, dispatch, discardTranslations])

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
        configuration,
        visualBuilderGraph: visualBuilderGraphDirty,
        isFetchPending,
        isSavePending,
        isPublishPending,
        isDirty: isVisualBuilderGraphDirty,
        handleValidate,
        handleSave,
        handlePublish,
        handleDiscard,
        dispatch,
        translateKey,
        currentLanguage,
        switchLanguage: switchLanguageCallback,
        deleteTranslation: deleteTranslationCallback,
        shouldShowErrors,
        setShouldShowErrors,
        isTesting,
        setIsTesting,
        translateGraph,
        translationSizeToLimitRate: currentTranslationSizeToLimitRate ?? 0,
        configurationSizeToLimitRate: configurationDirtySizeToLimitRate ?? 0,
        isFlowPublishingInChannels,
        setFlowPublishingInChannels,
        zoom,
        setZoom,
        workflowStepMetrics,
        setWorkflowStepMetrics,
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

    if (
        Object.entries(headers ?? {}).some(([k, v]) => !k.trim() || !v.trim())
    ) {
        return true
    }

    if (variables.some((v) => !v.name.trim() || !v.jsonpath.trim())) {
        return true
    }

    if (headers?.['content-type'] === 'application/x-www-form-urlencoded') {
        const entries = Array.from(new URLSearchParams(body ?? '').entries())

        if (entries.some(([k, v]) => !k.trim() || !v.trim())) {
            return true
        }
    }

    return false
}

export function validateConditionSteps(
    transition: (Pick<WorkflowTransition, 'name'> & {
        conditions: ConditionSchema[]
    })[]
): boolean {
    return transition.some(({conditions, name}) => {
        if (!name) return true

        return validateConditions(conditions)
    })
}

export function validateConditions(conditions: ConditionSchema[]): boolean {
    if (conditions.length === 0) return true

    return conditions.some((condition) => {
        const key = Object.keys(condition)[0] as AllKeys<typeof condition>
        const schema = condition[key]

        if (!schema) {
            return true
        }

        if (key === 'exists' || key === 'doesNotExist') {
            return false
        }

        return schema[1] == null
    })
}

export function validateConfiguration(
    conf: WorkflowConfiguration,
    isPublishing: boolean,
    availableVariablesByStepId: Record<WorkflowStep['id'], WorkflowVariableList>
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

    const conditions = conf.transitions.filter(
        (transition) =>
            Array.isArray(transition.conditions?.and) ||
            Array.isArray(transition.conditions?.or)
    )

    const invalidConditions = validateConditionSteps(
        conditions.map((transition) => ({
            name: transition.name,
            conditions: transition.conditions?.and
                ? transition?.conditions?.and
                : transition.conditions?.or ?? [],
        }))
    )

    if (invalidConditions) {
        return 'Fix errors in conditional step in order to save'
    }

    if (
        conf.triggers?.find((trigger) => {
            if (trigger.kind === 'llm-prompt' && trigger.settings.conditions) {
                return validateConditions(
                    trigger.settings.conditions?.and
                        ? trigger.settings.conditions?.and
                        : trigger.settings.conditions?.or ?? []
                )
            }

            return false
        })
    ) {
        return 'Fix errors in conditions in order to save'
    }

    const httpRequestSteps = conf.steps.filter(
        (s): s is WorkflowStepHttpRequest => s.kind === 'http-request'
    )

    if (
        conf.entrypoint?.label.trim().length === 0 ||
        conf.steps.find(
            (s) =>
                (s.kind === 'message' ||
                    s.kind === 'text-input' ||
                    s.kind === 'attachments-input' ||
                    s.kind === 'order-selection' ||
                    s.kind === 'choices') &&
                !s.settings.message.content.text.trim()
        ) ||
        conf.steps.find(
            (s) =>
                s.kind === 'choices' &&
                s.settings.choices.find((c) => !c.label.trim())
        ) ||
        httpRequestSteps.find((s) => isHttpRequestStepIncomplete(s.settings)) ||
        conf.steps.find(
            (s) =>
                s.kind === 'update-shipping-address' &&
                (!s.settings.name.trim() ||
                    !s.settings.address1.trim() ||
                    !s.settings.address2.trim() ||
                    !s.settings.city.trim() ||
                    !s.settings.zip.trim() ||
                    !s.settings.province.trim() ||
                    !s.settings.country.trim() ||
                    !s.settings.phone.trim() ||
                    !s.settings.last_name.trim() ||
                    !s.settings.first_name.trim())
        ) ||
        conf.steps.find(
            (s) =>
                s.kind === 'cancel-subscription' &&
                (!s.settings.subscription_id.trim() ||
                    !s.settings.reason.trim())
        ) ||
        conf.steps.find(
            (s) =>
                s.kind === 'skip-charge' &&
                (!s.settings.subscription_id.trim() ||
                    !s.settings.charge_id.trim())
        ) ||
        conf.entrypoints?.find(
            (entrypoint) =>
                entrypoint.kind === 'llm-conversation' &&
                !entrypoint.settings.instructions.trim()
        )
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
        .some(
            (s) =>
                !validateJSONWithVariables(
                    s.settings.body || '',
                    availableVariablesByStepId[s.id] ?? []
                )
        )
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
        configuration: workflowConfigurationFactory('id'),
        visualBuilderGraph,
        isFetchPending: false,
        isSavePending: false,
        isPublishPending: false,
        isDirty: false,
        isTesting: false,
        setIsTesting: () => null,
        isFlowPublishingInChannels: false,
        setFlowPublishingInChannels: () => null,
        handleValidate: () => null,
        handleSave: () => Promise.resolve(''),
        handlePublish: () => Promise.resolve(''),
        handleDiscard: () => null,
        dispatch: () => null,
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
        translateGraph: (graph) => graph,
        translationSizeToLimitRate: 0,
        configurationSizeToLimitRate: 0,
        zoom: 1,
        setZoom: () => null,
    }
}

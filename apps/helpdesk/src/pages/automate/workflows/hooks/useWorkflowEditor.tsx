import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'

import { useDebouncedValue, useThrottledValue } from '@repo/hooks'
import { useQueryClient } from '@tanstack/react-query'
import { produce } from 'immer'

import { WorkflowStepMetricsMap } from 'domains/reporting/hooks/automate/utils'
import { IntegrationType } from 'models/integration/constants'
import {
    useGetWorkflowConfiguration,
    useUpsertWorkflowConfiguration,
    workflowsConfigurationDefinitionKeys,
} from 'models/workflows/queries'
import useValidateOnVisualBuilderGraphChange from 'pages/automate/actionsPlatform/hooks/useValidateOnVisualBuilderGraphChange'
import { useSelfServiceStoreIntegrationContext } from 'pages/automate/common/hooks/useSelfServiceStoreIntegration'

import {
    MAX_CONFIGURATION_SIZE_IN_BYTES,
    MIN_DEBOUNCE_STEP_COUNT,
} from '../constants'
import { getWorkflowVariableListForNode } from '../models/variables.model'
import {
    areGraphsEqual,
    transformVisualBuilderGraphIntoWfConfiguration,
} from '../models/visualBuilderGraph.model'
import {
    ChannelTriggerNodeType,
    VisualBuilderGraph,
} from '../models/visualBuilderGraph.types'
import { transformWorkflowConfigurationIntoVisualBuilderGraph } from '../models/workflowConfiguration.model'
import {
    LanguageCode,
    WorkflowConfiguration,
} from '../models/workflowConfiguration.types'
import { WorkflowConfigurationUpsertDto } from '../types'
import {
    getPayloadSizeToLimitRate,
    isPayloadTooLarge,
} from '../utils/payloadSize'
import { mapServerErrorsToGraph } from '../utils/serverValidationErrors'
import useTouchWorkflowGraph from './useTouchWorkflowGraph'
import useUntouchWorkflowGraph from './useUntouchWorkflowGraph'
import useValidateWorkflowGraph from './useValidateWorkflowGraph'
import {
    useVisualBuilderGraphReducer,
    VisualBuilderGraphAction,
} from './useVisualBuilderGraphReducer'
import { computeNodesPositions } from './useVisualBuilderGraphReducer/utils'
import useWorkflowTranslations, {
    emptyTranslatedTexts,
} from './useWorkflowTranslations'
import { workflowConfigurationFactory } from './utils'

export type WorkflowEditorContext = {
    configuration: WorkflowConfiguration
    visualBuilderGraph: VisualBuilderGraph<ChannelTriggerNodeType>
    isDirty: boolean
    isFetchPending: boolean
    isSavePending: boolean
    isTesting: boolean
    isPublishPending: boolean
    handleValidate: (isDraft: boolean) => boolean
    handleValidateSize: () => string | undefined
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
        lang: LanguageCode,
    ) => VisualBuilderGraph
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
            'A workflowConfigurationContext cannot be found in the scope',
        )
    return context
}

export const withWorkflowEditorContext =
    <
        WrappedProps extends JSX.IntrinsicAttributes & {
            workflowId: string
            isNewWorkflow: boolean
        },
    >(
        Component: React.FC<WrappedProps>,
    ) =>
    (props: WrappedProps) => {
        const contextValue = useWorkflowEditor(
            props.workflowId,
            props.isNewWorkflow,
        )
        return (
            <WorkflowEditorContext.Provider value={contextValue}>
                <Component {...props} />
            </WorkflowEditorContext.Provider>
        )
    }

export function useWorkflowEditor(
    workflowId: string,
    isNew: boolean,
): WorkflowEditorContext {
    const queryClient = useQueryClient()
    const storeIntegration = useSelfServiceStoreIntegrationContext()
    const { mutateAsync: upsertWorkflowConfiguration } =
        useUpsertWorkflowConfiguration()

    const { data: remoteConfiguration, isInitialLoading: isFetchPending } =
        useGetWorkflowConfiguration(workflowId, {
            enabled: !isNew,
            // Otherwise we reset user's changes when the query is refetched due to the staleTime
            staleTime: Infinity,
            refetchOnMount: 'always',
        })

    const [isSavePending, setIsSavePending] = useState(false)
    const [isPublishPending, setIsPublishPending] = useState(false)
    const [isTesting, setIsTesting] = useState(false)
    const [isFlowPublishingInChannels, setFlowPublishingInChannels] =
        useState(false)
    const workflowFactoryInstance = useRef(
        workflowConfigurationFactory(workflowId),
    )
    const [zoom, setZoom] = useState(1)
    const [workflowStepMetrics, setWorkflowStepMetrics] =
        useState<WorkflowStepMetricsMap | null>(null)

    const configuration =
        (remoteConfiguration as WorkflowConfiguration | null) ||
        workflowFactoryInstance.current

    const [visualBuilderGraph, setVisualBuilderGraph] =
        useState<VisualBuilderGraph>(
            computeNodesPositions(
                transformWorkflowConfigurationIntoVisualBuilderGraph(
                    workflowFactoryInstance.current,
                ),
            ),
        )
    const [visualBuilderGraphDirty, dispatch] = useVisualBuilderGraphReducer(
        computeNodesPositions(
            transformWorkflowConfigurationIntoVisualBuilderGraph<ChannelTriggerNodeType>(
                workflowFactoryInstance.current,
            ),
        ),
    )

    const changeCheckDebounce =
        visualBuilderGraphDirty.nodes.length > MIN_DEBOUNCE_STEP_COUNT
            ? 1500
            : 0

    const {
        areTranslationsDirty,
        translateWithSavedTranslations,
        saveTranslations,
        deleteTranslation,
        discardTranslations,
        translateKey,
        currentLanguage,
        switchLanguage,
        setCurrentLanguage,
        getLangsOfTooLargeTranslations,
        translateGraph,
        computeCurrentTranslationSizeToLimitRate,
    } = useWorkflowTranslations(
        visualBuilderGraphDirty.internal_id,
        visualBuilderGraphDirty.available_languages ?? ['en-US'],
        isNew,
        visualBuilderGraphDirty.internal_id !==
            workflowFactoryInstance.current.internal_id,
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
        if (!isNew && remoteConfiguration) {
            setCurrentLanguage(
                remoteConfiguration.available_languages[0] ?? 'en-US',
            )
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [remoteConfiguration?.id, setCurrentLanguage, isNew])

    useEffect(() => {
        if (!remoteConfiguration) {
            return
        }

        const configuration = produce(
            remoteConfiguration as WorkflowConfiguration,
            (draft) => {
                switch (storeIntegration.type) {
                    case IntegrationType.Shopify: {
                        if (
                            draft.apps?.every((app) => app.type !== 'shopify')
                        ) {
                            draft.apps ??= []
                            draft.apps.push({ type: 'shopify' })
                        }
                        break
                    }
                }
            },
        )

        dispatch({
            type: 'RESET_GRAPH',
            graph: transformWorkflowConfigurationIntoVisualBuilderGraph(
                configuration,
            ),
        })
        setVisualBuilderGraph(
            computeNodesPositions(
                transformWorkflowConfigurationIntoVisualBuilderGraph(
                    configuration,
                ),
            ),
        )
    }, [dispatch, remoteConfiguration, storeIntegration.type])

    const debouncedDirtyGraph = useDebouncedValue(
        visualBuilderGraphDirty,
        changeCheckDebounce,
    )

    const isVisualBuilderGraphDirty = useMemo(
        () =>
            !areGraphsEqual(
                translateWithSavedTranslations(visualBuilderGraph),
                debouncedDirtyGraph,
            ),
        [
            debouncedDirtyGraph,
            translateWithSavedTranslations,
            visualBuilderGraph,
        ],
    )
    const isDirty = isVisualBuilderGraphDirty || areTranslationsDirty

    const configurationDirtySizeToLimitRate = useThrottledValue(
        (graph) =>
            getPayloadSizeToLimitRate(
                emptyTranslatedTexts(
                    transformVisualBuilderGraphIntoWfConfiguration(
                        graph,
                        true,
                        [],
                    ),
                ),
                MAX_CONFIGURATION_SIZE_IN_BYTES,
            ),
        [visualBuilderGraphDirty],
        500,
    )
    const currentTranslationSizeToLimitRate = useThrottledValue(
        (graph) => computeCurrentTranslationSizeToLimitRate(graph),
        [visualBuilderGraphDirty],
        500,
    )

    const getVariableListForNode = useCallback(
        (nodeId: string) => {
            return getWorkflowVariableListForNode(
                visualBuilderGraphDirty,
                nodeId,
                [],
                [],
            )
        },
        [visualBuilderGraphDirty],
    )

    const handleValidateGraph = useValidateWorkflowGraph(getVariableListForNode)
    const handleTouchGraph = useTouchWorkflowGraph()
    const handleUntouchGraph = useUntouchWorkflowGraph()

    useValidateOnVisualBuilderGraphChange({
        graph: visualBuilderGraphDirty,
        handleValidate: handleValidateGraph,
        dispatch,
        changeCheckDebounce,
    })

    const handleValidate = useCallback(
        (isDraft: boolean): boolean => {
            const graph = handleValidateGraph(
                handleTouchGraph(visualBuilderGraphDirty),
                isDraft,
            )

            const isErrored =
                !!graph.errors || graph.nodes.some((node) => !!node.data.errors)

            if (isErrored) {
                dispatch({
                    type: 'RESET_GRAPH',
                    graph,
                })

                return false
            }

            for (const language of visualBuilderGraphDirty.available_languages) {
                if (language === currentLanguage) {
                    continue
                }

                const graph = handleValidateGraph(
                    translateGraph(
                        handleTouchGraph(visualBuilderGraphDirty),
                        language,
                    ),
                    isDraft,
                )

                const isErrored =
                    !!graph.errors ||
                    graph.nodes.some((node) => !!node.data.errors)

                if (isErrored) {
                    const graph = handleValidateGraph(
                        switchLanguage(
                            handleTouchGraph(visualBuilderGraphDirty),
                            language,
                        ),
                        isDraft,
                    )

                    dispatch({
                        type: 'RESET_GRAPH',
                        graph,
                    })

                    return false
                }
            }

            return true
        },
        [
            translateGraph,
            visualBuilderGraphDirty,
            switchLanguage,
            dispatch,
            handleValidateGraph,
            handleTouchGraph,
            currentLanguage,
        ],
    )

    const handleValidateSize = useCallback((): string | undefined => {
        if (
            isPayloadTooLarge(
                emptyTranslatedTexts(
                    transformVisualBuilderGraphIntoWfConfiguration(
                        visualBuilderGraphDirty,
                        visualBuilderGraphDirty.is_draft,
                        [],
                    ),
                ),
                MAX_CONFIGURATION_SIZE_IN_BYTES,
            )
        ) {
            return 'This Flow is too large to save. Please remove steps and try again.'
        }

        const tooLargeLangs = getLangsOfTooLargeTranslations(
            visualBuilderGraphDirty,
        )

        if (tooLargeLangs.length > 0) {
            const nextGraph = switchLanguage(
                visualBuilderGraphDirty,
                tooLargeLangs[0],
            )
            dispatch({
                type: 'RESET_GRAPH',
                graph: nextGraph,
            })

            return 'This Flow is too large to save. Please remove steps or shorten responses and try again.'
        }
    }, [
        visualBuilderGraphDirty,
        getLangsOfTooLargeTranslations,
        dispatch,
        switchLanguage,
    ])

    const updateWorkflow = useCallback(
        async (configurationDirty: WorkflowConfiguration) => {
            const configurationUpsertDto = produce(
                emptyTranslatedTexts(
                    configurationDirty,
                ) as WorkflowConfigurationUpsertDto,
                (draft) => {
                    delete draft.apps
                },
            )

            let configuration: WorkflowConfiguration

            try {
                // why saving order differ depending on isNew?
                // => https://www.notion.so/gorgias/Tech-specs-workflows-translations-FRONTEND-ad28bd8eb55440d788eebc9f896a3ff0?pvs=4#3f73c3969bc8471486a59efeee861511
                if (isNew) {
                    const updatedConfiguration =
                        (await upsertWorkflowConfiguration([
                            visualBuilderGraphDirty.internal_id,
                            configurationUpsertDto,
                        ])) as { data: WorkflowConfiguration }

                    await saveTranslations(visualBuilderGraphDirty)
                    configuration = updatedConfiguration.data
                } else {
                    await saveTranslations(visualBuilderGraphDirty)
                    const updatedConfiguration =
                        (await upsertWorkflowConfiguration([
                            visualBuilderGraphDirty.internal_id,
                            configurationUpsertDto,
                        ])) as { data: WorkflowConfiguration }

                    configuration = updatedConfiguration.data
                }
            } catch (error) {
                // Check if this is a server validation error we can parse
                const graphWithServerErrors = mapServerErrorsToGraph(
                    error,
                    visualBuilderGraphDirty,
                )

                if (graphWithServerErrors) {
                    // Set the server errors on the graph to display them to the user
                    dispatch({
                        type: 'RESET_GRAPH',
                        graph: graphWithServerErrors,
                    })
                }

                // Re-throw the error so the calling code can handle it
                throw error
            }

            const updatedConfiguration = {
                ...configurationDirty,
                updated_datetime: configuration?.updated_datetime,
            }

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
                            : configuration,
                    )
                },
            )
            queryClient.setQueriesData<WorkflowConfiguration>(
                workflowsConfigurationDefinitionKeys.get(
                    updatedConfiguration.id,
                ),
                updatedConfiguration,
            )

            dispatch({
                type: 'RESET_GRAPH',
                graph: transformWorkflowConfigurationIntoVisualBuilderGraph(
                    configurationDirty,
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
        ],
    )

    const handlePublish = useCallback(async () => {
        const isAlreadyPublished = configuration.is_draft === false
        if (isAlreadyPublished && !isDirty) return

        try {
            setIsPublishPending(true)
            const configurationDirty =
                transformVisualBuilderGraphIntoWfConfiguration(
                    visualBuilderGraphDirty,
                    false,
                    [],
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
                    visualBuilderGraphDirty,
                    true,
                    [],
                )
            return await updateWorkflow(configurationDirty)
        } finally {
            setIsSavePending(false)
        }
    }, [updateWorkflow, visualBuilderGraphDirty, isDirty])

    const handleDiscard = useCallback(() => {
        dispatch({
            type: 'RESET_GRAPH',
            graph: visualBuilderGraph,
        })
        discardTranslations()
    }, [visualBuilderGraph, dispatch, discardTranslations])

    const switchLanguageCallback = useCallback(
        (nextLanguage: LanguageCode) => {
            const nextVisualBuilderGraph = switchLanguage(
                handleUntouchGraph(visualBuilderGraphDirty),
                nextLanguage,
            )
            dispatch({
                type: 'RESET_GRAPH',
                graph: nextVisualBuilderGraph,
            })
        },
        [visualBuilderGraphDirty, switchLanguage, dispatch, handleUntouchGraph],
    )

    const deleteTranslationCallback = useCallback(
        (lang: LanguageCode) => {
            const nextVisualBuilderGraph = deleteTranslation(
                visualBuilderGraphDirty,
                lang,
            )
            dispatch({
                type: 'RESET_GRAPH',
                graph: nextVisualBuilderGraph,
            })
        },
        [deleteTranslation, visualBuilderGraphDirty, dispatch],
    )

    return {
        configuration,
        visualBuilderGraph: visualBuilderGraphDirty,
        isFetchPending,
        isSavePending,
        isPublishPending,
        isDirty: isVisualBuilderGraphDirty,
        handleValidate,
        handleValidateSize,
        handleSave,
        handlePublish,
        handleDiscard,
        dispatch,
        translateKey,
        currentLanguage,
        switchLanguage: switchLanguageCallback,
        deleteTranslation: deleteTranslationCallback,
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

export function createWorkflowEditorContextForPreview(
    visualBuilderGraph: VisualBuilderGraph<ChannelTriggerNodeType>,
): WorkflowEditorContext {
    return {
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
        handleValidate: () => true,
        handleValidateSize: () => undefined,
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
        translateGraph: (graph) => graph,
        translationSizeToLimitRate: 0,
        configurationSizeToLimitRate: 0,
        zoom: 1,
        setZoom: () => null,
    }
}

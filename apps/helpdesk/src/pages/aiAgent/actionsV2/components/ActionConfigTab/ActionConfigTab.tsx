import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { noop } from '@gorgias/toolkit'

import { Box, Button, toast } from '@gorgias/axiom'

import { ConfirmModalAction } from 'pages/common/components/ConfirmModalAction'
import {
    SettingsCard,
    SettingsCardContent,
    SettingsCardHeader,
    SettingsCardTitle,
} from 'pages/common/components/SettingsCard'
import { UnsavedChangesPrompt } from 'pages/common/components/UnsavedChangesPrompt'

import {
    useGetStoreWorkflowsConfigurations,
    useGetWorkflowConfigurationTemplates,
    useListActionsApps,
} from 'models/workflows/queries'
import { useDeleteAction } from 'pages/aiAgent/actions/hooks/useDeleteAction'
import { useThreeplIntegrations } from 'pages/aiAgent/actions/hooks/useThreeplIntegrations'
import { useTouchActionGraph } from 'pages/aiAgent/actions/hooks/useTouchActionGraph'
import { useUpsertAction } from 'pages/aiAgent/actions/hooks/useUpsertAction'
import { useValidateActionGraph } from 'pages/aiAgent/actions/hooks/useValidateActionGraph'
import { useGuidanceReferenceContext } from 'pages/aiAgent/actions/providers/GuidanceReferenceContext'
import { GuidanceReferenceProvider } from 'pages/aiAgent/actions/providers/GuidanceReferenceProvider'
import { StoreAppsProvider } from 'pages/aiAgent/actions/providers/StoreAppsProvider'
import { StoreTrackstarProvider } from 'pages/aiAgent/actions/providers/StoreTrackstarProvider'
import type { StoreWorkflowsConfiguration } from 'pages/aiAgent/actions/types'
import { ConditionBuilder } from 'pages/aiAgent/actionsV2/sidePanel/actionForm/ConditionBuilder'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'

import { ActionsPlatformTemplateConfirmation } from 'pages/automate/actionsPlatform/components/ActionsPlatformTemplateConfirmation'
import { ActionsPlatformTemplateInstructions } from 'pages/automate/actionsPlatform/components/ActionsPlatformTemplateInstructions'
import { ActionsPlatformTemplateSteps } from 'pages/automate/actionsPlatform/components/ActionsPlatformTemplateSteps'
import { ActionsPlatformTemplateVisualBuilderView } from 'pages/automate/actionsPlatform/components/ActionsPlatformTemplateVisualBuilderView'
import { useValidateOnVisualBuilderGraphChange } from 'pages/automate/actionsPlatform/hooks/useValidateOnVisualBuilderGraphChange'
import {
    useVisualBuilder,
    VisualBuilderContext,
} from 'pages/automate/workflows/hooks/useVisualBuilder'
import { useVisualBuilderGraphReducer } from 'pages/automate/workflows/hooks/useVisualBuilderGraphReducer'
import { computeNodesPositions } from 'pages/automate/workflows/hooks/useVisualBuilderGraphReducer/utils'
import {
    areGraphsEqual,
    transformVisualBuilderGraphIntoWfConfiguration,
} from 'pages/automate/workflows/models/visualBuilderGraph.model'
import type { LLMPromptTriggerNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'
import { transformWorkflowConfigurationIntoVisualBuilderGraph } from 'pages/automate/workflows/models/workflowConfiguration.model'
import type { WorkflowConfiguration } from 'pages/automate/workflows/models/workflowConfiguration.types'
import { mapServerErrorsToGraph } from 'pages/automate/workflows/utils/serverValidationErrors'

import { useTriggerConditionBuilder } from '../../hooks/useTriggerConditionBuilder'
import { ActionNameField } from '../../sidePanel/actionForm/ActionNameField'
import { PanelFooter } from '../../sidePanel/shell'

import { ActionStepList } from './ActionStepList'

import css from './ActionConfigTab.less'

type Props = {
    configuration: StoreWorkflowsConfiguration
}

export const ActionConfigTab = ({ configuration }: Props) => {
    const { shopName, shopType } = useParams<{
        shopName: string
        shopType: 'shopify'
    }>()

    return (
        <StoreTrackstarProvider storeName={shopName} storeType={shopType}>
            <GuidanceReferenceProvider actions={[configuration]}>
                <ActionConfigTabInner configuration={configuration} />
            </GuidanceReferenceProvider>
        </StoreTrackstarProvider>
    )
}

const ActionConfigTabInner = ({ configuration }: Props) => {
    const { shopName, shopType } = useParams<{
        shopName: string
        shopType: 'shopify'
    }>()

    const { isLoading: isSaving, mutateAsync: editAction } = useUpsertAction(
        'update',
        shopName,
        shopType,
    )

    const { data: steps = [] } = useGetWorkflowConfigurationTemplates({
        triggers: ['reusable-llm-prompt'],
    })
    const { data: actions = [] } = useGetStoreWorkflowsConfigurations({
        storeName: shopName,
        storeType: shopType,
        triggers: ['llm-prompt'],
    })
    const { data: actionsApps = [] } = useListActionsApps()
    const availableIntegrations = useThreeplIntegrations()

    const initialGraph = useMemo(
        () =>
            computeNodesPositions(
                transformWorkflowConfigurationIntoVisualBuilderGraph<LLMPromptTriggerNodeType>(
                    configuration as unknown as WorkflowConfiguration,
                    false,
                ),
            ),
        [configuration],
    )

    const [visualBuilderGraphDirty, dispatch] =
        useVisualBuilderGraphReducer<LLMPromptTriggerNodeType>(initialGraph)

    const visualBuilderContextValue = useVisualBuilder(
        visualBuilderGraphDirty,
        dispatch,
        false,
        availableIntegrations,
    )

    const [savedBaseline, setSavedBaseline] = useState(
        visualBuilderContextValue.initialVisualBuilderGraph,
    )

    const isDirty = useMemo(
        () => !areGraphsEqual(savedBaseline, visualBuilderGraphDirty),
        [savedBaseline, visualBuilderGraphDirty],
    )

    const formContainerRef = useRef<HTMLDivElement>(null)
    const [errorSummary, setErrorSummary] = useState<string | null>(null)

    const { getVariableListForNode } = visualBuilderContextValue
    const handleValidate = useValidateActionGraph(
        getVariableListForNode,
        actions,
    )
    const handleTouch = useTouchActionGraph(actionsApps)

    useValidateOnVisualBuilderGraphChange({
        graph: visualBuilderGraphDirty,
        handleValidate,
        dispatch,
    })

    const handleDiscard = useCallback(() => {
        setErrorSummary(null)
        dispatch({
            type: 'RESET_GRAPH',
            graph: savedBaseline,
        })
    }, [dispatch, savedBaseline])

    const focusFirstInvalidField = () => {
        const firstInvalid =
            formContainerRef.current?.querySelector<HTMLElement>(
                '[aria-invalid="true"]',
            )
        firstInvalid?.focus()
    }

    const handleSave = useCallback(async () => {
        setErrorSummary(null)
        const graph = handleValidate(handleTouch(visualBuilderGraphDirty))

        const isErrored =
            !!graph.errors ||
            graph.apps?.some((app) => !!app.errors) ||
            graph.nodes.some((node) => !!node.data.errors)

        if (isErrored) {
            dispatch({ type: 'RESET_GRAPH', graph })
            const message = 'Fix the highlighted errors before saving.'
            setErrorSummary(message)
            toast.error(message)
            window.requestAnimationFrame(focusFirstInvalidField)
            return Promise.reject(new Error(message))
        }

        const configurationDirty =
            transformVisualBuilderGraphIntoWfConfiguration(
                visualBuilderGraphDirty,
                false,
                steps,
                availableIntegrations,
            )

        const baselineAtSave = visualBuilderGraphDirty

        try {
            await editAction([
                {
                    internal_id: visualBuilderGraphDirty.internal_id,
                    store_name: shopName,
                    store_type: shopType,
                },
                configurationDirty as StoreWorkflowsConfiguration,
            ])
            setSavedBaseline(baselineAtSave)
        } catch (error) {
            const graphWithServerErrors = mapServerErrorsToGraph(
                error,
                visualBuilderGraphDirty,
            )
            if (graphWithServerErrors) {
                dispatch({
                    type: 'RESET_GRAPH',
                    graph: graphWithServerErrors,
                })
                const message =
                    'Please fix the validation errors below and try again.'
                setErrorSummary(message)
                toast.error(message)
                window.requestAnimationFrame(focusFirstInvalidField)
                return Promise.reject(error)
            }
            throw error
        }
    }, [
        availableIntegrations,
        dispatch,
        editAction,
        handleTouch,
        handleValidate,
        shopName,
        shopType,
        steps,
        visualBuilderGraphDirty,
    ])

    const history = useHistory()
    const { routes } = useAiAgentNavigation({ shopName })
    const { canBeDeleted } = useGuidanceReferenceContext()
    const { mutateAsync: deleteAction, isLoading: isDeleting } =
        useDeleteAction(visualBuilderGraphDirty.name, shopName, shopType)

    const isDeleteDisabled =
        isDeleting || !canBeDeleted(visualBuilderGraphDirty.id)

    const handleDelete = useCallback(async () => {
        if (isDeleteDisabled) {
            return
        }

        try {
            await deleteAction([
                { internal_id: visualBuilderGraphDirty.internal_id },
            ])
            history.push(routes.actions)
        } catch {
            // Toasting handled inside useDeleteAction.
        }
    }, [
        deleteAction,
        history,
        isDeleteDisabled,
        routes.actions,
        visualBuilderGraphDirty.internal_id,
    ])

    const [isEditingSteps, setIsEditingSteps] = useState(false)
    const [visualBuilderGraphAtModalOpen, setVisualBuilderGraphAtModalOpen] =
        useState(visualBuilderGraphDirty)

    // Snapshot only on open so cancelling the advanced editor reverts in-modal edits without clobbering edits made outside it.
    useEffect(() => {
        if (isEditingSteps) {
            setVisualBuilderGraphAtModalOpen(visualBuilderGraphDirty)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditingSteps])

    const triggerNodeId = visualBuilderGraphDirty.nodes[0].id
    const triggerVariables = useMemo(
        () => getVariableListForNode(triggerNodeId),
        [getVariableListForNode, triggerNodeId],
    )
    const conditionBuilderProps = useTriggerConditionBuilder({
        graph: visualBuilderGraphDirty,
        dispatch,
        triggerVariables,
    })

    if (isEditingSteps) {
        return (
            <StoreAppsProvider storeName={shopName} storeType={shopType}>
                <VisualBuilderContext.Provider
                    value={visualBuilderContextValue}
                >
                    <ActionsPlatformTemplateVisualBuilderView
                        visualBuilderGraph={visualBuilderGraphAtModalOpen}
                        handleValidate={handleValidate}
                        handleTouch={handleTouch}
                        onExit={() => {
                            dispatch({
                                type: 'RESET_GRAPH',
                                graph: visualBuilderGraphAtModalOpen,
                            })
                            setIsEditingSteps(false)
                        }}
                        onSave={() => {
                            setIsEditingSteps(false)
                        }}
                    />
                </VisualBuilderContext.Provider>
            </StoreAppsProvider>
        )
    }

    const triggerNode = visualBuilderGraphDirty.nodes[0]
    const isAdvanced = !!visualBuilderGraphDirty.advanced_datetime

    return (
        <VisualBuilderContext.Provider value={visualBuilderContextValue}>
            <StoreAppsProvider storeName={shopName} storeType={shopType}>
                <Box
                    ref={formContainerRef}
                    flexDirection="column"
                    gap="md"
                    className={css.container}
                >
                    {errorSummary && (
                        <Box role="alert" className={css.errorSummary} p="sm">
                            {errorSummary}
                        </Box>
                    )}

                    <SettingsCard>
                        <SettingsCardHeader>
                            <SettingsCardTitle isRequired>
                                Action name
                            </SettingsCardTitle>
                            <p>
                                Provide a clear, unique name that AI Agent will
                                use to match this action against customer
                                requests.
                            </p>
                        </SettingsCardHeader>
                        <SettingsCardContent>
                            <ActionNameField
                                value={visualBuilderGraphDirty.name}
                                onChange={(next) =>
                                    dispatch({ type: 'SET_NAME', name: next })
                                }
                                onBlur={() =>
                                    dispatch({
                                        type: 'SET_TOUCHED',
                                        touched: { name: true },
                                    })
                                }
                                error={
                                    visualBuilderGraphDirty.errors?.name as
                                        | string
                                        | undefined
                                }
                                caption="e.g. Cancel order"
                                placeholder="Action name"
                            />
                        </SettingsCardContent>
                    </SettingsCard>

                    <SettingsCard>
                        <SettingsCardHeader>
                            <SettingsCardTitle isRequired>
                                Instructions
                            </SettingsCardTitle>
                            <p>
                                Describe what this action does and when AI Agent
                                should use it.
                            </p>
                        </SettingsCardHeader>
                        <SettingsCardContent>
                            <ActionsPlatformTemplateInstructions
                                error={triggerNode.data.errors?.instructions}
                                value={triggerNode.data.instructions}
                                onChange={(next) =>
                                    dispatch({
                                        type: 'SET_LLM_PROMPT_TRIGGER_INSTRUCTIONS',
                                        instructions: next,
                                    })
                                }
                                onBlur={() =>
                                    dispatch({
                                        type: 'SET_TOUCHED',
                                        nodeId: triggerNode.id,
                                        touched: { instructions: true },
                                    })
                                }
                            />
                        </SettingsCardContent>
                    </SettingsCard>

                    <SettingsCard>
                        <SettingsCardHeader>
                            <SettingsCardTitle>Conditions</SettingsCardTitle>
                            <p>
                                Set conditions that must be met for this action
                                to run.
                            </p>
                        </SettingsCardHeader>
                        <SettingsCardContent>
                            <Box flexDirection="column" gap="md">
                                <ConditionBuilder {...conditionBuilderProps} />
                                <ActionsPlatformTemplateConfirmation
                                    steps={steps}
                                    nodes={visualBuilderGraphDirty.nodes}
                                    value={
                                        triggerNode.data.requires_confirmation
                                    }
                                    onChange={(next) =>
                                        dispatch({
                                            type: 'SET_LLM_PROMPT_TRIGGER_REQUIRES_CONFIRMATION',
                                            requiresConfirmation: next,
                                        })
                                    }
                                />
                            </Box>
                        </SettingsCardContent>
                    </SettingsCard>

                    <SettingsCard>
                        <SettingsCardHeader>
                            <SettingsCardTitle>Steps</SettingsCardTitle>
                            <p>
                                Add one or more steps with your 3rd party apps.
                                Steps will be performed in the order below.
                            </p>
                        </SettingsCardHeader>
                        <SettingsCardContent>
                            {isAdvanced ? (
                                <ActionsPlatformTemplateSteps
                                    error={
                                        visualBuilderGraphDirty.errors
                                            ?.nodes as string | undefined
                                    }
                                    onEditSteps={() => setIsEditingSteps(true)}
                                />
                            ) : (
                                <ActionStepList
                                    graph={visualBuilderGraphDirty}
                                    dispatch={dispatch}
                                    steps={steps}
                                />
                            )}
                        </SettingsCardContent>
                    </SettingsCard>

                    <SettingsCard>
                        <SettingsCardHeader>
                            <SettingsCardTitle>Delete action</SettingsCardTitle>
                            <p>
                                Remove this action from any AI Agent Skills,
                                Macros, and Rules using it. This can&apos;t be
                                undone.
                            </p>
                        </SettingsCardHeader>
                        <SettingsCardContent>
                            <Box>
                                <ConfirmModalAction
                                    title="Delete action?"
                                    content="Deleting this Action will remove and deactivate it for your store, and cannot be undone."
                                    actions={(onClose) => [
                                        <Button
                                            key="cancel"
                                            variant="secondary"
                                            onClick={onClose}
                                        >
                                            Cancel
                                        </Button>,
                                        <Button
                                            key="delete"
                                            variant="primary"
                                            intent="destructive"
                                            isLoading={isDeleting}
                                            onClick={() => {
                                                onClose()
                                                void handleDelete()
                                            }}
                                        >
                                            Delete action
                                        </Button>,
                                    ]}
                                >
                                    {(onClick) => (
                                        <Button
                                            variant="secondary"
                                            intent="destructive"
                                            isDisabled={isDeleteDisabled}
                                            isLoading={isDeleting}
                                            onClick={onClick}
                                        >
                                            Delete action
                                        </Button>
                                    )}
                                </ConfirmModalAction>
                            </Box>
                        </SettingsCardContent>
                    </SettingsCard>

                    <PanelFooter
                        onSubmit={() => {
                            void handleSave().catch(noop)
                        }}
                        onDismiss={handleDiscard}
                        submitLabel="Save"
                        dismissLabel="Cancel"
                        isSubmitting={isSaving}
                        isSubmitDisabled={!isDirty || isSaving}
                        isDismissDisabled={!isDirty}
                        disabledTooltip="No changes to save"
                    />
                </Box>

                <UnsavedChangesPrompt
                    onSave={handleSave}
                    shouldRedirectAfterSave
                    when={isDirty}
                />
            </StoreAppsProvider>
        </VisualBuilderContext.Provider>
    )
}

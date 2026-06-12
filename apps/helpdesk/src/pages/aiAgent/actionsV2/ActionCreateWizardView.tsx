import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import { ulid } from 'ulidx'
import { noop } from '@gorgias/toolkit'
import { useEffectOnce } from '@gorgias/toolkit-react'

import { toast } from '@gorgias/axiom'

import {
    useGetStoreWorkflowsConfigurations,
    useGetWorkflowConfigurationTemplates,
    useListActionsApps,
} from 'models/workflows/queries'
import { AiAgentLayout } from 'pages/aiAgent/components/AiAgentLayout/AiAgentLayout'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { ActionsPlatformTemplateVisualBuilderView } from 'pages/automate/actionsPlatform/components/ActionsPlatformTemplateVisualBuilderView'
import { useValidateOnVisualBuilderGraphChange } from 'pages/automate/actionsPlatform/hooks/useValidateOnVisualBuilderGraphChange'
import {
    useVisualBuilder,
    VisualBuilderContext,
} from 'pages/automate/workflows/hooks/useVisualBuilder'
import { useVisualBuilderGraphReducer } from 'pages/automate/workflows/hooks/useVisualBuilderGraphReducer'
import { computeNodesPositions } from 'pages/automate/workflows/hooks/useVisualBuilderGraphReducer/utils'
import { transformVisualBuilderGraphIntoWfConfiguration } from 'pages/automate/workflows/models/visualBuilderGraph.model'
import type { LLMPromptTriggerNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'
import {
    transformWorkflowConfigurationIntoVisualBuilderGraph,
    WorkflowConfigurationBuilder,
} from 'pages/automate/workflows/models/workflowConfiguration.model'
import type { WorkflowConfiguration } from 'pages/automate/workflows/models/workflowConfiguration.types'
import { mapServerErrorsToGraph } from 'pages/automate/workflows/utils/serverValidationErrors'
import { UnsavedChangesPrompt } from 'pages/common/components/UnsavedChangesPrompt'

import { useSupportActionTracking } from '../actions/hooks/useSupportActionTracking'
import { useThreeplIntegrations } from '../actions/hooks/useThreeplIntegrations'
import { useTouchActionGraph } from '../actions/hooks/useTouchActionGraph'
import { useUpsertAction } from '../actions/hooks/useUpsertAction'
import { useValidateActionGraph } from '../actions/hooks/useValidateActionGraph'
import { StoreAppsProvider } from '../actions/providers/StoreAppsProvider'
import type { StoreWorkflowsConfiguration } from '../actions/types'
import { useAiAgentOnboardingNotification } from '../hooks/useAiAgentOnboardingNotification'
import { BuildAdvancedModeModal } from './components/BuildAdvancedModeModal'
import { WizardFooter } from './components/WizardFooter'
import { WizardStepper } from './components/WizardStepper'
import { WizardStepSetup } from './components/WizardStepSetup'
import { WizardStepStepsList } from './components/WizardStepStepsList'

import css from './ActionCreateWizardView.less'

type WizardStep = 1 | 2

const STEP_LABELS: Record<WizardStep, string> = {
    1: 'Setup and conditions',
    2: 'Steps',
}

const getInitialConfiguration = () => {
    const b = new WorkflowConfigurationBuilder({
        id: ulid(),
        name: '',
        initialStep: {
            id: ulid(),
            kind: 'end',
            settings: {
                success: true,
            },
        },
        entrypoints: [
            {
                kind: 'llm-conversation',
                trigger: 'llm-prompt',
                settings: {
                    instructions: '',
                    requires_confirmation: false,
                },
                deactivated_datetime: null,
            },
        ],
        triggers: [
            {
                kind: 'llm-prompt',
                settings: {
                    custom_inputs: [],
                    object_inputs: [],
                    outputs: [],
                    conditions: null,
                },
            },
        ],
        is_draft: false,
        apps: [],
        available_languages: [],
    })

    return b.build()
}

const ActionCreateWizardView = () => {
    const { state } = useLocation<WorkflowConfiguration | undefined>()

    const configurationFromTemplate = useRef(state)

    useEffectOnce(() => {
        window.history.replaceState(null, '')
    })

    const { shopName, shopType } = useParams<{
        shopName: string
        shopType: 'shopify'
    }>()
    const { routes } = useAiAgentNavigation({ shopName })
    const history = useHistory()

    const {
        isLoading: isCreateActionLoading,
        mutateAsync: createAction,
        isSuccess: isCreateActionSuccess,
    } = useUpsertAction('create', shopName, shopType)

    const configuration = useMemo(
        () => configurationFromTemplate.current ?? getInitialConfiguration(),
        [],
    )

    const { data: steps = [] } = useGetWorkflowConfigurationTemplates({
        triggers: ['reusable-llm-prompt'],
    })
    const { data: actionsApps = [] } = useListActionsApps()

    const availableIntegrations = useThreeplIntegrations()

    const [visualBuilderGraphDirty, dispatch] = useVisualBuilderGraphReducer(
        computeNodesPositions(
            transformWorkflowConfigurationIntoVisualBuilderGraph<LLMPromptTriggerNodeType>(
                configuration,
                false,
            ),
        ),
    )

    const visualBuilderContextValue = useVisualBuilder(
        visualBuilderGraphDirty,
        dispatch,
        true,
        availableIntegrations,
    )

    const { getVariableListForNode } = visualBuilderContextValue

    const { data: actions = [] } = useGetStoreWorkflowsConfigurations({
        storeName: shopName,
        storeType: shopType,
        triggers: ['llm-prompt'],
    })

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

    const { onActionCreated } = useSupportActionTracking({ shopName })
    const {
        isLoading: isLoadingOnboardingNotificationState,
        handleOnTriggerActivateAiAgentNotification,
    } = useAiAgentOnboardingNotification({ shopName })

    const [currentStep, setCurrentStep] = useState<WizardStep>(1)
    const [isSaveAndTest, setIsSaveAndTest] = useState(false)
    const [isEditingSteps, setIsEditingSteps] = useState(false)
    const [isAdvancedModalOpen, setIsAdvancedModalOpen] = useState(false)
    const [visualBuilderGraph, setVisualBuilderGraph] = useState(
        visualBuilderGraphDirty,
    )

    const handleEditSteps = useCallback(() => {
        setVisualBuilderGraph(visualBuilderGraphDirty)
        setIsEditingSteps(true)
    }, [visualBuilderGraphDirty])

    const handleBuildAdvanced = useCallback(() => {
        if (visualBuilderGraphDirty.advanced_datetime) {
            handleEditSteps()
            return
        }
        setIsAdvancedModalOpen(true)
    }, [visualBuilderGraphDirty.advanced_datetime, handleEditSteps])

    const handleConfirmAdvanced = useCallback(() => {
        dispatch({ type: 'MIGRATE_TO_ADVANCED_STEP_BUILDER' })
        setVisualBuilderGraph(visualBuilderGraphDirty)
        setIsEditingSteps(true)
    }, [dispatch, visualBuilderGraphDirty])

    const stepHeadingRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        document.title = `Create Action — Step ${currentStep}: ${STEP_LABELS[currentStep]}`
        stepHeadingRef.current?.focus()
    }, [currentStep])

    const triggerNode = visualBuilderGraphDirty.nodes[0]

    const isSetupValid = useMemo(() => {
        const hasName = !!visualBuilderGraphDirty.name?.trim()
        const triggerData = triggerNode.data
        const hasInstructions =
            'instructions' in triggerData && !!triggerData.instructions?.trim()

        return hasName && hasInstructions
    }, [triggerNode.data, visualBuilderGraphDirty.name])

    const handleSave = useCallback(async () => {
        const graph = handleValidate(handleTouch(visualBuilderGraphDirty))

        const isErrored =
            !!graph.errors ||
            graph.apps?.some((app) => !!app.errors) ||
            graph.nodes.some((node) => !!node.data.errors)

        if (isErrored) {
            dispatch({
                type: 'RESET_GRAPH',
                graph,
            })

            toast.error('Fix errors in order to create Action')

            return Promise.reject()
        }

        try {
            await createAction([
                {
                    internal_id: visualBuilderGraphDirty.internal_id,
                    store_name: shopName,
                    store_type: shopType,
                },
                transformVisualBuilderGraphIntoWfConfiguration(
                    visualBuilderGraphDirty,
                    false,
                    steps,
                    availableIntegrations,
                ) as StoreWorkflowsConfiguration,
            ])
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

                toast.error(
                    'Please fix the validation errors below and try again',
                )

                return Promise.reject()
            }

            throw error
        }

        onActionCreated({
            createdHow: configurationFromTemplate.current
                ? 'from-template'
                : 'from-scratch',
        })
    }, [
        visualBuilderGraphDirty,
        createAction,
        handleValidate,
        handleTouch,
        steps,
        dispatch,
        shopName,
        shopType,
        availableIntegrations,
        onActionCreated,
    ])

    useEffect(() => {
        if (isCreateActionSuccess) {
            handleOnTriggerActivateAiAgentNotification()

            if (isSaveAndTest) {
                history.replace(`${routes.actions}/edit/${configuration.id}`)
                history.push(routes.test)
            } else {
                history.push(routes.actions)
            }
        }
    }, [
        isCreateActionSuccess,
        isSaveAndTest,
        history,
        routes,
        configuration.id,
        handleOnTriggerActivateAiAgentNotification,
    ])

    const handleContinue = useCallback(() => {
        dispatch({
            type: 'SET_TOUCHED',
            touched: { name: true },
        })
        dispatch({
            type: 'SET_TOUCHED',
            nodeId: triggerNode.id,
            touched: { instructions: true },
        })

        if (isSetupValid) {
            setCurrentStep(2)
        }
    }, [dispatch, triggerNode.id, isSetupValid])

    const handleBack = useCallback(() => {
        setCurrentStep(1)
    }, [])

    const handleCancel = useCallback(() => {
        history.push(routes.actions)
    }, [history, routes.actions])

    const handleSaveClick = useCallback(
        (saveAndTest: boolean) => {
            setIsSaveAndTest(saveAndTest)
            void handleSave().catch(noop)
        },
        [handleSave],
    )

    const isTestDisabled =
        !!visualBuilderGraphDirty.nodes[0].data.deactivated_datetime
    const headingText =
        currentStep === 2 && visualBuilderGraphDirty.name
            ? visualBuilderGraphDirty.name
            : 'Create action'

    if (isEditingSteps) {
        return (
            <StoreAppsProvider storeName={shopName} storeType={shopType}>
                <VisualBuilderContext.Provider
                    value={visualBuilderContextValue}
                >
                    <ActionsPlatformTemplateVisualBuilderView
                        visualBuilderGraph={visualBuilderGraph}
                        handleValidate={handleValidate}
                        handleTouch={handleTouch}
                        onExit={() => {
                            setIsEditingSteps(false)
                        }}
                        onSave={() => {
                            setVisualBuilderGraph(visualBuilderGraphDirty)
                        }}
                    />
                </VisualBuilderContext.Provider>
            </StoreAppsProvider>
        )
    }

    return (
        <AiAgentLayout
            shopName={shopName}
            className={css.container}
            title={headingText}
        >
            <div className={css.wizard}>
                <WizardStepper
                    currentStep={currentStep}
                    steps={[1, 2].map((step) => ({
                        number: step,
                        label: STEP_LABELS[step as WizardStep],
                    }))}
                />
                <div
                    aria-live="polite"
                    className={css.srOnly}
                >{`Step ${currentStep} of 2: ${STEP_LABELS[currentStep]}`}</div>
                <VisualBuilderContext.Provider
                    value={visualBuilderContextValue}
                >
                    <StoreAppsProvider
                        storeName={shopName}
                        storeType={shopType}
                    >
                        <div className={css.form}>
                            {currentStep === 1 ? (
                                <WizardStepSetup steps={steps} />
                            ) : (
                                <WizardStepStepsList
                                    steps={steps}
                                    onEditSteps={handleEditSteps}
                                    onBuildAdvanced={handleBuildAdvanced}
                                />
                            )}
                        </div>
                        <WizardFooter
                            currentStep={currentStep}
                            onCancel={handleCancel}
                            onBack={handleBack}
                            onContinue={handleContinue}
                            isContinueDisabled={!isSetupValid}
                            onSaveAndEnable={() => handleSaveClick(false)}
                            onSaveAndTest={() => handleSaveClick(true)}
                            isSaving={isCreateActionLoading}
                            isSaveDisabled={
                                isLoadingOnboardingNotificationState
                            }
                            isTestDisabled={isTestDisabled}
                        />
                    </StoreAppsProvider>
                </VisualBuilderContext.Provider>
            </div>
            <UnsavedChangesPrompt
                when={!isCreateActionSuccess}
                onSave={noop}
                shouldShowSaveButton={false}
                title="Discard new Action?"
                body="You will lose all information entered for this Action."
            />
            <BuildAdvancedModeModal
                isOpen={isAdvancedModalOpen}
                onOpenChange={setIsAdvancedModalOpen}
                onConfirm={handleConfirmAdvanced}
            />
        </AiAgentLayout>
    )
}

export { ActionCreateWizardView }

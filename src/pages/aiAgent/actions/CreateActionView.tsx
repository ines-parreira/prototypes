import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import _noop from 'lodash/noop'
import { Prompt, useHistory, useLocation, useParams } from 'react-router-dom'
import { ulid } from 'ulidx'

import { Tooltip } from '@gorgias/merchant-ui-kit'

import useAppDispatch from 'hooks/useAppDispatch'
import useEffectOnce from 'hooks/useEffectOnce'
import {
    useGetStoreWorkflowsConfigurations,
    useGetWorkflowConfigurationTemplates,
    useListActionsApps,
} from 'models/workflows/queries'
import { AiAgentLayout } from 'pages/aiAgent/components/AiAgentLayout/AiAgentLayout'
import { ACTIONS } from 'pages/aiAgent/constants'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import ActionsPlatformTemplateVisualBuilderView from 'pages/automate/actionsPlatform/components/ActionsPlatformTemplateVisualBuilderView'
import useValidateOnVisualBuilderGraphChange from 'pages/automate/actionsPlatform/hooks/useValidateOnVisualBuilderGraphChange'
import {
    useVisualBuilder,
    VisualBuilderContext,
} from 'pages/automate/workflows/hooks/useVisualBuilder'
import { useVisualBuilderGraphReducer } from 'pages/automate/workflows/hooks/useVisualBuilderGraphReducer'
import { computeNodesPositions } from 'pages/automate/workflows/hooks/useVisualBuilderGraphReducer/utils'
import { transformVisualBuilderGraphIntoWfConfiguration } from 'pages/automate/workflows/models/visualBuilderGraph.model'
import { LLMPromptTriggerNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'
import {
    transformWorkflowConfigurationIntoVisualBuilderGraph,
    WorkflowConfigurationBuilder,
} from 'pages/automate/workflows/models/workflowConfiguration.model'
import { WorkflowConfiguration } from 'pages/automate/workflows/models/workflowConfiguration.types'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import useUnsavedChangesPrompt from 'pages/common/components/useUnsavedChangesPrompt'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { useAiAgentOnboardingNotification } from '../hooks/useAiAgentOnboardingNotification'
import ActionFormView from './components/ActionFormView'
import useThreeplIntegrations from './hooks/useThreeplIntegrations'
import useTouchActionGraph from './hooks/useTouchActionGraph'
import useUpsertAction from './hooks/useUpsertAction'
import useValidateActionGraph from './hooks/useValidateActionGraph'
import StoreAppsProvider from './providers/StoreAppsProvider'
import StoreTrackstarProvider from './providers/StoreTrackstarProvider'
import { StoreWorkflowsConfiguration } from './types'

import css from './CreateActionView.less'

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

const CreateActionView = () => {
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
    const {
        isLoading: isCreateActionLoading,
        mutateAsync: createAction,
        isSuccess: isCreateActionSuccess,
    } = useUpsertAction('create', shopName, shopType)

    const appDispatch = useAppDispatch()
    const history = useHistory()
    const configuration = useMemo(
        () => configurationFromTemplate.current ?? getInitialConfiguration(),
        [],
    )

    const [createAndTestButtonRef, setCreateAndTestButtonRef] =
        useState<HTMLButtonElement | null>(null)
    const [isCreateAndTestButtonClicked, setIsCreateAndTestButtonClicked] =
        useState(false)

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
    const [visualBuilderGraph, setVisualBuilderGraph] = useState(
        visualBuilderGraphDirty,
    )

    const visualBuilderContextValue = useVisualBuilder(
        visualBuilderGraphDirty,
        dispatch,
        true,
        availableIntegrations,
    )

    const { getVariableListForNode, initialVisualBuilderGraph } =
        visualBuilderContextValue

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

            void appDispatch(
                notify({
                    showDismissButton: true,
                    status: NotificationStatus.Error,
                    message: 'Fix errors in order to create Action',
                }),
            )

            return Promise.reject()
        }

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
    }, [
        visualBuilderGraphDirty,
        createAction,
        handleValidate,
        handleTouch,
        steps,
        dispatch,
        shopName,
        shopType,
        appDispatch,
        availableIntegrations,
    ])

    const [isEditingSteps, setIsEditingSteps] = useState(false)

    const { isOpen, onClose, redirectToOriginalLocation, onNavigateAway } =
        useUnsavedChangesPrompt({
            when: !isCreateActionSuccess && !isEditingSteps,
        })

    const {
        isLoading: isLoadingOnboardingNotificationState,
        handleOnTriggerActivateAiAgentNotification,
    } = useAiAgentOnboardingNotification({ shopName })

    useEffect(() => {
        if (isCreateActionSuccess) {
            handleOnTriggerActivateAiAgentNotification()

            if (isCreateAndTestButtonClicked) {
                history.replace(`${routes.actions}/edit/${configuration.id}`)
                history.push(routes.test)
            } else {
                history.push(routes.actions)
            }
        }
    }, [
        isCreateActionSuccess,
        isCreateAndTestButtonClicked,
        history,
        routes,
        configuration.id,
        handleOnTriggerActivateAiAgentNotification,
    ])

    const [
        isConditionsRecommendationAlertOpen,
        setIsConditionsRecommendationAlertOpen,
    ] = useState(() => !!initialVisualBuilderGraph.nodes[0].data.conditionsType)

    if (isEditingSteps) {
        return (
            <StoreTrackstarProvider storeName={shopName} storeType={shopType}>
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
            </StoreTrackstarProvider>
        )
    }

    return (
        <AiAgentLayout
            shopName={shopName}
            className={css.container}
            title={ACTIONS}
        >
            <div>
                <div className={css.links}>
                    <Button
                        intent="secondary"
                        fillStyle="ghost"
                        onClick={() => {
                            history.push(routes.actions)
                        }}
                    >
                        <ButtonIconLabel icon="arrow_back">
                            Back to actions
                        </ButtonIconLabel>
                    </Button>
                </div>
                <div className={css.form}>
                    <StoreTrackstarProvider
                        storeName={shopName}
                        storeType={shopType}
                    >
                        <VisualBuilderContext.Provider
                            value={visualBuilderContextValue}
                        >
                            <ActionFormView
                                isTemplate={!!configurationFromTemplate.current}
                                onEditSteps={() => {
                                    setIsEditingSteps(true)
                                    setVisualBuilderGraph(
                                        visualBuilderGraphDirty,
                                    )
                                }}
                                steps={steps}
                                isConditionsRecommendationAlertOpen={
                                    isConditionsRecommendationAlertOpen
                                }
                                onConditionsRecommendationAlertClose={() => {
                                    setIsConditionsRecommendationAlertOpen(
                                        false,
                                    )
                                }}
                            />
                        </VisualBuilderContext.Provider>
                    </StoreTrackstarProvider>
                </div>
                <div className={css.actions}>
                    <Button
                        onClick={() => {
                            setIsCreateAndTestButtonClicked(false)

                            void handleSave().catch(_noop)
                        }}
                        isLoading={isCreateActionLoading}
                        isDisabled={isLoadingOnboardingNotificationState}
                    >
                        Create Action
                    </Button>
                    <Button
                        ref={setCreateAndTestButtonRef}
                        intent="secondary"
                        onClick={() => {
                            setIsCreateAndTestButtonClicked(true)

                            void handleSave().catch(_noop)
                        }}
                        isLoading={isCreateActionLoading}
                        isDisabled={
                            isLoadingOnboardingNotificationState ||
                            !!visualBuilderGraphDirty.nodes[0].data
                                .deactivated_datetime
                        }
                    >
                        Create and test
                    </Button>
                    {!!visualBuilderGraphDirty.nodes[0].data
                        .deactivated_datetime &&
                        createAndTestButtonRef && (
                            <Tooltip
                                target={createAndTestButtonRef}
                                placement="top-start"
                            >
                                Action must be enabled to test.
                            </Tooltip>
                        )}
                    <Button
                        intent="secondary"
                        onClick={() => {
                            setIsCreateAndTestButtonClicked(false)

                            history.push(routes.actions)
                        }}
                    >
                        Cancel
                    </Button>
                </div>
            </div>
            <Prompt when={!isCreateActionSuccess} message={onNavigateAway} />
            <Modal
                isOpen={isOpen}
                isClosable={false}
                onClose={_noop}
                size="small"
            >
                <ModalHeader title="Discard new Action?" />
                <ModalBody>
                    You will lose all information entered for this Action.
                </ModalBody>
                <ModalActionsFooter>
                    <Button intent="secondary" onClick={onClose}>
                        Back To Editing
                    </Button>
                    <Button
                        intent="destructive"
                        onClick={() => {
                            onClose()
                            redirectToOriginalLocation()
                        }}
                    >
                        Discard Action
                    </Button>
                </ModalActionsFooter>
            </Modal>
        </AiAgentLayout>
    )
}

export default CreateActionView

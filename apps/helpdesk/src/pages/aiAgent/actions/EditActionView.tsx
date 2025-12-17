import { useCallback, useEffect, useMemo, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import _noop from 'lodash/noop'
import { useHistory, useParams } from 'react-router-dom'

import {
    LegacyButton as Button,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import {
    useGetStoreWorkflowsConfigurations,
    useGetWorkflowConfigurationTemplates,
    useListActionsApps,
} from 'models/workflows/queries'
import { AiAgentLayout } from 'pages/aiAgent/components/AiAgentLayout/AiAgentLayout'
import { SUPPORT_ACTIONS } from 'pages/aiAgent/constants'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { usePlaygroundPanel } from 'pages/aiAgent/hooks/usePlaygroundPanel'
import ActionsPlatformTemplateVisualBuilderView from 'pages/automate/actionsPlatform/components/ActionsPlatformTemplateVisualBuilderView'
import useValidateOnVisualBuilderGraphChange from 'pages/automate/actionsPlatform/hooks/useValidateOnVisualBuilderGraphChange'
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
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import { ConfirmModalAction } from 'pages/common/components/ConfirmModalAction'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import ActionFormView from './components/ActionFormView'
import useDeleteAction from './hooks/useDeleteAction'
import { useSupportActionTracking } from './hooks/useSupportActionTracking'
import useThreeplIntegrations from './hooks/useThreeplIntegrations'
import useTouchActionGraph from './hooks/useTouchActionGraph'
import useUpsertAction from './hooks/useUpsertAction'
import useValidateActionGraph from './hooks/useValidateActionGraph'
import { useGuidanceReferenceContext } from './providers/GuidanceReferenceContext'
import StoreAppsProvider from './providers/StoreAppsProvider'
import type { StoreWorkflowsConfiguration } from './types'

import css from './CreateActionView.less'

type Props = {
    configuration: WorkflowConfiguration
}

const EditActionView = ({ configuration }: Props) => {
    const { shopName, shopType } = useParams<{
        shopName: string
        shopType: 'shopify'
    }>()
    const { routes } = useAiAgentNavigation({ shopName })
    const {
        isLoading: isEditActionLoading,
        mutateAsync: editAction,
        isSuccess: isEditActionSuccess,
    } = useUpsertAction('update', shopName, shopType)

    const {
        mutateAsync: deleteAction,
        isLoading: isDeleteActionLoading,
        isSuccess: isDeleteActionSuccess,
    } = useDeleteAction(configuration.name, shopName, shopType)

    const { canBeDeleted } = useGuidanceReferenceContext()

    const appDispatch = useAppDispatch()
    const history = useHistory()

    const { data: steps = [] } = useGetWorkflowConfigurationTemplates({
        triggers: ['reusable-llm-prompt'],
    })
    const [saveAndTestButtonRef, setSaveAndTestButtonRef] = useState<
        HTMLButtonElement | HTMLAnchorElement | null
    >(null)
    const [deleteActionConfirmationRef, setDeleteActionConfirmationRef] =
        useState<HTMLButtonElement | HTMLAnchorElement | null>(null)
    const [isSaveAndTestButtonClicked, setIsSaveAndTestButtonClicked] =
        useState(false)
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
        false,
        availableIntegrations,
    )

    const isVisualBuilderGraphDirty = useMemo(
        () =>
            !areGraphsEqual(
                visualBuilderContextValue.initialVisualBuilderGraph,
                visualBuilderGraphDirty,
            ),
        [
            visualBuilderContextValue.initialVisualBuilderGraph,
            visualBuilderGraphDirty,
        ],
    )

    const { getVariableListForNode } = visualBuilderContextValue

    const { data: actions = [] } = useGetStoreWorkflowsConfigurations({
        storeName: shopName,
        storeType: shopType,
        triggers: ['llm-prompt'],
    })
    const { data: actionsApps = [] } = useListActionsApps()

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

    const { onActionEdited } = useSupportActionTracking({ shopName })

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
                    message: 'Fix errors in order to save Action',
                }),
            )

            return Promise.reject()
        }

        const configurationDirty =
            transformVisualBuilderGraphIntoWfConfiguration(
                visualBuilderGraphDirty,
                false,
                steps,
                availableIntegrations,
            )

        try {
            await editAction([
                {
                    internal_id: visualBuilderGraphDirty.internal_id,
                    store_name: shopName,
                    store_type: shopType,
                },
                configurationDirty as StoreWorkflowsConfiguration,
            ])
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

                void appDispatch(
                    notify({
                        showDismissButton: true,
                        status: NotificationStatus.Error,
                        message:
                            'Please fix the validation errors below and try again',
                    }),
                )

                return Promise.reject()
            }

            // Re-throw for generic error handling
            throw error
        }

        onActionEdited()
    }, [
        visualBuilderGraphDirty,
        editAction,
        handleValidate,
        handleTouch,
        steps,
        dispatch,
        shopName,
        shopType,
        appDispatch,
        availableIntegrations,
        onActionEdited,
    ])

    const [isEditingSteps, setIsEditingSteps] = useState(false)

    const isPlaygroundAvailableEverywhere = useFlag<boolean>(
        FeatureFlagKey.MakePlaygroundAvailableEverywhere,
        false,
    )

    useEffect(() => {
        if (isDeleteActionSuccess) {
            history.push(routes.actions)
        }
    }, [isDeleteActionSuccess, history, routes])

    const { openPlayground: openPlaygroundPanel } = usePlaygroundPanel()

    useEffect(() => {
        if (isEditActionSuccess) {
            if (isSaveAndTestButtonClicked) {
                if (isPlaygroundAvailableEverywhere) {
                    openPlaygroundPanel()
                    setIsSaveAndTestButtonClicked(false)
                } else {
                    history.push(routes.test)
                }
            }
        }
    }, [
        isEditActionSuccess,
        isSaveAndTestButtonClicked,
        isPlaygroundAvailableEverywhere,
        openPlaygroundPanel,
        history,
        routes,
    ])

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
            title={SUPPORT_ACTIONS}
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
                            Back to support actions
                        </ButtonIconLabel>
                    </Button>
                    <Button
                        fillStyle="ghost"
                        intent="secondary"
                        onClick={() => {
                            history.push(
                                routes.actionEvents(visualBuilderGraphDirty.id),
                            )
                        }}
                    >
                        View Events
                    </Button>
                </div>
                <div className={css.form}>
                    <VisualBuilderContext.Provider
                        value={visualBuilderContextValue}
                    >
                        <ActionFormView
                            onEditSteps={() => {
                                setIsEditingSteps(true)
                                setVisualBuilderGraph(visualBuilderGraphDirty)
                            }}
                            steps={steps}
                        />
                    </VisualBuilderContext.Provider>
                </div>
                <div className={css.actions}>
                    <Button
                        onClick={() => {
                            setIsSaveAndTestButtonClicked(false)

                            void handleSave().catch(_noop)
                        }}
                        isLoading={isEditActionLoading}
                    >
                        Save changes
                    </Button>
                    <Button
                        ref={setSaveAndTestButtonRef}
                        intent="secondary"
                        onClick={() => {
                            setIsSaveAndTestButtonClicked(true)

                            void handleSave().catch(_noop)
                        }}
                        isLoading={isEditActionLoading}
                        isDisabled={
                            !!visualBuilderGraphDirty.nodes[0].data
                                .deactivated_datetime
                        }
                    >
                        Save and test
                    </Button>
                    {!!visualBuilderGraphDirty.nodes[0].data
                        .deactivated_datetime &&
                        saveAndTestButtonRef && (
                            <Tooltip
                                target={saveAndTestButtonRef}
                                placement="top-start"
                            >
                                Action must be enabled to test.
                            </Tooltip>
                        )}
                    <Button
                        intent="secondary"
                        onClick={() => {
                            setIsSaveAndTestButtonClicked(false)

                            history.push(routes.actions)
                        }}
                    >
                        Cancel
                    </Button>
                    <ConfirmModalAction
                        actions={(onClose) => [
                            <Button
                                key="cancel"
                                intent="secondary"
                                onClick={onClose}
                            >
                                Cancel
                            </Button>,
                            <Button
                                key="delete"
                                intent="destructive"
                                onClick={() => {
                                    void deleteAction([
                                        {
                                            internal_id:
                                                visualBuilderGraph.internal_id,
                                        },
                                    ])
                                }}
                            >
                                Delete Action
                            </Button>,
                        ]}
                        content="Deleting this Action will remove and deactivate it for your store, and cannot be undone."
                        title="Delete Action?"
                    >
                        {(onClick) => (
                            <Button
                                ref={setDeleteActionConfirmationRef}
                                isLoading={isDeleteActionLoading}
                                intent="destructive"
                                isDisabled={
                                    isEditActionLoading ||
                                    !canBeDeleted(configuration.id)
                                }
                                onClick={onClick}
                                className={css.deleteButton}
                                fillStyle="ghost"
                            >
                                <ButtonIconLabel icon="delete">
                                    Delete Action
                                </ButtonIconLabel>
                                {!canBeDeleted(configuration.id) &&
                                    deleteActionConfirmationRef && (
                                        <Tooltip
                                            placement="top"
                                            target={deleteActionConfirmationRef}
                                        >
                                            This Action is currently being used
                                            in Guidance. Remove the Action from
                                            all Guidance in order to delete.
                                        </Tooltip>
                                    )}
                            </Button>
                        )}
                    </ConfirmModalAction>
                </div>
            </div>
            <UnsavedChangesPrompt
                onSave={() => {
                    setIsSaveAndTestButtonClicked(false)

                    return handleSave()
                }}
                shouldRedirectAfterSave
                when={
                    !isEditActionSuccess &&
                    !isDeleteActionSuccess &&
                    isVisualBuilderGraphDirty
                }
            />
        </AiAgentLayout>
    )
}

export default EditActionView

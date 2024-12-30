import {Tooltip} from '@gorgias/merchant-ui-kit'

import _noop from 'lodash/noop'
import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {useHistory, useParams} from 'react-router-dom'

import useAppDispatch from 'hooks/useAppDispatch'
import {
    useGetStoreWorkflowsConfigurations,
    useGetWorkflowConfigurationTemplates,
} from 'models/workflows/queries'
import {AiAgentLayout} from 'pages/aiAgent/components/AiAgentLayout/AiAgentLayout'
import {useAiAgentNavigation} from 'pages/aiAgent/hooks/useAiAgentNavigation'
import ActionsPlatformTemplateVisualBuilderView from 'pages/automate/actionsPlatform/components/ActionsPlatformTemplateVisualBuilderView'
import useValidateOnVisualBuilderGraphChange from 'pages/automate/actionsPlatform/hooks/useValidateOnVisualBuilderGraphChange'
import {
    useVisualBuilder,
    VisualBuilderContext,
} from 'pages/automate/workflows/hooks/useVisualBuilder'
import {useVisualBuilderGraphReducer} from 'pages/automate/workflows/hooks/useVisualBuilderGraphReducer'
import {computeNodesPositions} from 'pages/automate/workflows/hooks/useVisualBuilderGraphReducer/utils'
import {
    areGraphsEqual,
    transformVisualBuilderGraphIntoWfConfiguration,
} from 'pages/automate/workflows/models/visualBuilderGraph.model'
import {LLMPromptTriggerNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import {transformWorkflowConfigurationIntoVisualBuilderGraph} from 'pages/automate/workflows/models/workflowConfiguration.model'
import {WorkflowConfiguration} from 'pages/automate/workflows/models/workflowConfiguration.types'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {ConfirmModalAction} from 'pages/common/components/ConfirmModalAction'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

import ActionFormView from './components/ActionFormView'
import css from './CreateActionView.less'
import use3plIntegrations from './hooks/use3plIntegrations'
import useDeleteAction from './hooks/useDeleteAction'
import useTouchActionGraph from './hooks/useTouchActionGraph'
import useUpsertAction from './hooks/useUpsertAction'
import useValidateActionGraph from './hooks/useValidateActionGraph'
import StoreAppsProvider from './providers/StoreAppsProvider'
import {StoreWorkflowsConfiguration} from './types'

type Props = {
    configuration: WorkflowConfiguration
}

const EditActionView = ({configuration}: Props) => {
    const {shopName, shopType} = useParams<{
        shopName: string
        shopType: 'shopify'
    }>()
    const {routes} = useAiAgentNavigation({shopName})
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

    const appDispatch = useAppDispatch()
    const history = useHistory()

    const {data: steps = []} = useGetWorkflowConfigurationTemplates({
        triggers: ['reusable-llm-prompt'],
    })
    const [saveAndTestButtonRef, setSaveAndTestButtonRef] =
        useState<HTMLButtonElement | null>(null)
    const [isSaveAndTestButtonClicked, setIsSaveAndTestButtonClicked] =
        useState(false)
    const availableIntegrations = use3plIntegrations()

    const [visualBuilderGraphDirty, dispatch] = useVisualBuilderGraphReducer(
        computeNodesPositions(
            transformWorkflowConfigurationIntoVisualBuilderGraph<LLMPromptTriggerNodeType>(
                configuration,
                false
            )
        )
    )
    const [visualBuilderGraph, setVisualBuilderGraph] = useState(
        visualBuilderGraphDirty
    )

    const visualBuilderContextValue = useVisualBuilder(
        visualBuilderGraphDirty,
        dispatch,
        false,
        availableIntegrations
    )

    const isVisualBuilderGraphDirty = useMemo(
        () =>
            !areGraphsEqual(
                visualBuilderContextValue.initialVisualBuilderGraph,
                visualBuilderGraphDirty
            ),
        [
            visualBuilderContextValue.initialVisualBuilderGraph,
            visualBuilderGraphDirty,
        ]
    )

    const {getVariableListForNode} = visualBuilderContextValue

    const {data: actions = []} = useGetStoreWorkflowsConfigurations({
        storeName: shopName,
        storeType: shopType,
        triggers: ['llm-prompt'],
    })

    const handleValidate = useValidateActionGraph(
        getVariableListForNode,
        actions
    )
    const handleTouch = useTouchActionGraph()

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
                    message: 'Fix errors in order to save Action',
                })
            )

            return Promise.reject()
        }

        const configurationDirty =
            transformVisualBuilderGraphIntoWfConfiguration(
                visualBuilderGraphDirty,
                false,
                steps,
                availableIntegrations
            )

        await editAction([
            {
                internal_id: visualBuilderGraphDirty.internal_id,
                store_name: shopName,
                store_type: shopType,
            },
            configurationDirty as StoreWorkflowsConfiguration,
        ])
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
    ])

    const [isEditingSteps, setIsEditingSteps] = useState(false)

    useEffect(() => {
        if (isDeleteActionSuccess) {
            history.push(routes.actions)
        }
    }, [isDeleteActionSuccess, history, routes])

    useEffect(() => {
        if (isEditActionSuccess) {
            history.push(
                isSaveAndTestButtonClicked ? routes.test : routes.actions
            )
        }
    }, [isEditActionSuccess, isSaveAndTestButtonClicked, history, routes])

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
        <AiAgentLayout shopName={shopName} className={css.container}>
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
                    <Button
                        fillStyle="ghost"
                        intent="secondary"
                        onClick={() => {
                            history.push(
                                routes.actionEvents(visualBuilderGraphDirty.id)
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
                                isLoading={isDeleteActionLoading}
                                intent="destructive"
                                isDisabled={isEditActionLoading}
                                onClick={onClick}
                                className={css.deleteButton}
                                fillStyle="ghost"
                            >
                                <ButtonIconLabel icon="delete">
                                    Delete Action
                                </ButtonIconLabel>
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

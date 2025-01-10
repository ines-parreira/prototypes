import {Label} from '@gorgias/merchant-ui-kit'
import React, {useState, useMemo, useEffect, useCallback} from 'react'

import {useParams, useHistory} from 'react-router-dom'

import {ulid} from 'ulidx'

import orderSelectionIcon from 'assets/img/workflows/icons/order-selection-sm-neutral.svg'
import {useGetWorkflowConfigurationTemplates} from 'models/workflows/queries'
import useHumanReadableOrderConditions from 'pages/aiAgent/actions/hooks/useHumanReadableOrderConditions'
import useUpsertAction from 'pages/aiAgent/actions/hooks/useUpsertAction'
import {StoreWorkflowsConfiguration} from 'pages/aiAgent/actions/types'
import {useAiAgentNavigation} from 'pages/aiAgent/hooks/useAiAgentNavigation'
import useApps from 'pages/automate/actionsPlatform/hooks/useApps'
import useGetAppFromTemplateApp from 'pages/automate/actionsPlatform/hooks/useGetAppFromTemplateApp'
import {ActionTemplate} from 'pages/automate/actionsPlatform/types'
import ReusableLLMPromptCallNodeLabel from 'pages/automate/workflows/editor/visualBuilder/nodes/ReusableLLMPromptCallNodeLabel'
import {useVisualBuilderGraphReducer} from 'pages/automate/workflows/hooks/useVisualBuilderGraphReducer'
import {computeNodesPositions} from 'pages/automate/workflows/hooks/useVisualBuilderGraphReducer/utils'
import {getWorkflowVariableListForNode} from 'pages/automate/workflows/models/variables.model'
import {
    transformVisualBuilderGraphIntoWfConfiguration,
    walkVisualBuilderGraph,
} from 'pages/automate/workflows/models/visualBuilderGraph.model'
import {
    isReusableLLMPromptCallNodeType,
    LLMPromptTriggerNodeType,
    ReusableLLMPromptCallNodeType,
} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import {
    transformWorkflowConfigurationIntoVisualBuilderGraph,
    WorkflowConfigurationBuilder,
} from 'pages/automate/workflows/models/workflowConfiguration.model'
import Button from 'pages/common/components/button/Button'
import {Chip} from 'pages/common/components/Chip'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'

import css from './UseCaseTemplateModal.less'

type Props = {
    template: ActionTemplate
    onClose: () => void
}

const UseCaseTemplateModal = ({template, onClose}: Props) => {
    const history = useHistory()
    const [step, setStep] = useState<'selection' | 'confirmation'>('selection')
    const {apps} = useApps()

    const getAppFromTemplateApp = useGetAppFromTemplateApp({apps})

    const templateNodes = useMemo(() => {
        const graph =
            transformWorkflowConfigurationIntoVisualBuilderGraph<LLMPromptTriggerNodeType>(
                template
            )
        const nodes: ReusableLLMPromptCallNodeType[] = []

        walkVisualBuilderGraph(graph, graph.nodes[0].id, (node) => {
            if (isReusableLLMPromptCallNodeType(node)) {
                nodes.push(node)
            }
        })

        return nodes
    }, [template])

    const endNodeId = useMemo(() => ulid(), [])
    const configuration = useMemo(() => {
        const b = new WorkflowConfigurationBuilder({
            id: ulid(),
            name: template.name,
            initialStep: {
                id: endNodeId,
                kind: 'end',
                settings: {
                    success: true,
                },
            },
            entrypoints: template.entrypoints,
            triggers: template.triggers,
            is_draft: false,
            apps: [],
            available_languages: [],
        })

        return b.build()
    }, [endNodeId, template])

    const [graph, dispatch] = useVisualBuilderGraphReducer(
        computeNodesPositions(
            transformWorkflowConfigurationIntoVisualBuilderGraph<LLMPromptTriggerNodeType>(
                configuration
            )
        )
    )

    const {shopName, shopType} = useParams<{
        shopName: string
        shopType: 'shopify'
    }>()

    const {
        mutateAsync: createAction,
        isLoading: isCreateActionLoading,
        isSuccess: isCreateActionSuccess,
    } = useUpsertAction('create', shopName, shopType)

    const {data: steps = []} = useGetWorkflowConfigurationTemplates({
        triggers: ['reusable-llm-prompt'],
    })

    const variables = useMemo(
        () =>
            getWorkflowVariableListForNode(
                graph,
                graph.nodes[0].id,
                steps,
                apps
            ),
        [graph, steps, apps]
    )
    const conditions = useHumanReadableOrderConditions({
        variables,
        conditions: graph.nodes[0].data.conditions,
    })

    const {routes} = useAiAgentNavigation({shopName})

    const handleCreateAndEnable = useCallback(() => {
        return createAction([
            {
                internal_id: graph.internal_id,
                store_name: shopName,
                store_type: shopType,
            },
            transformVisualBuilderGraphIntoWfConfiguration(
                graph,
                false,
                steps
            ) as StoreWorkflowsConfiguration,
        ])
    }, [createAction, graph, shopName, shopType, steps])

    const handleCustomize = useCallback(() => {
        const configuration = transformVisualBuilderGraphIntoWfConfiguration(
            graph,
            false,
            steps
        )

        history.push(routes.newAction(), configuration)
    }, [history, routes, graph, steps])

    useEffect(() => {
        if (isCreateActionSuccess) {
            history.push(routes.actions)
        }
    }, [isCreateActionSuccess, history, routes.actions])

    return (
        <Modal isOpen onClose={onClose} size="medium">
            <ModalHeader title={template.name} />
            <ModalBody>
                {step === 'selection' ? (
                    <>
                        <Label className={css.label}>
                            First, select the apps you need to perform this
                            Action
                        </Label>
                        <div className={css.nodes}>
                            {templateNodes.map((templateNode, index) => {
                                const step = steps.find(
                                    (step) =>
                                        step.id ===
                                            templateNode.data
                                                .configuration_id &&
                                        step.internal_id ===
                                            templateNode.data
                                                .configuration_internal_id
                                )

                                if (!step) {
                                    return <Skeleton height={32} width={82} />
                                }

                                const app = getAppFromTemplateApp(step.apps[0])

                                if (!app) {
                                    return <Skeleton height={32} width={82} />
                                }

                                const node = graph.nodes.find((node) => {
                                    return (
                                        node.type ===
                                            'reusable_llm_prompt_call' &&
                                        node.data.configuration_id ===
                                            templateNode.data
                                                .configuration_id &&
                                        node.data.configuration_internal_id ===
                                            templateNode.data
                                                .configuration_internal_id
                                    )
                                })

                                const values = templateNode.data.values

                                return (
                                    <Chip
                                        key={templateNode.id}
                                        id={templateNode.id}
                                        label={app.name}
                                        isActive={!!node}
                                        onClick={() => {
                                            if (node) {
                                                dispatch({
                                                    type: 'DELETE_NODE',
                                                    nodeId: node.id,
                                                    apps,
                                                    steps,
                                                })
                                            } else {
                                                let beforeNodeId = endNodeId

                                                for (const templateNode of templateNodes.slice(
                                                    index
                                                )) {
                                                    const node =
                                                        graph.nodes.find(
                                                            (node) => {
                                                                return (
                                                                    node.type ===
                                                                        'reusable_llm_prompt_call' &&
                                                                    node.data
                                                                        .configuration_id ===
                                                                        templateNode
                                                                            .data
                                                                            .configuration_id &&
                                                                    node.data
                                                                        .configuration_internal_id ===
                                                                        templateNode
                                                                            .data
                                                                            .configuration_internal_id
                                                                )
                                                            }
                                                        )

                                                    if (node) {
                                                        beforeNodeId = node.id

                                                        break
                                                    }
                                                }

                                                dispatch({
                                                    type: 'INSERT_REUSABLE_LLM_PROMPT_CALL_NODE',
                                                    beforeNodeId,
                                                    configurationId: step.id,
                                                    configurationInternalId:
                                                        step.internal_id,
                                                    trigger: step.triggers[0]
                                                        .settings as Extract<
                                                        ActionTemplate['triggers'][number],
                                                        {
                                                            kind: 'reusable-llm-prompt'
                                                        }
                                                    >['settings'],
                                                    entrypoint:
                                                        step.entrypoints[0]
                                                            .settings,
                                                    app: step.apps[0],
                                                    values,
                                                })
                                            }
                                        }}
                                    />
                                )
                            })}
                        </div>
                        <div data-candu-id="action-libray-use-cases-modal"></div>
                    </>
                ) : (
                    <div className={css.container}>
                        <div>
                            <Label className={css.label}>
                                AI Agent will perform the following steps
                            </Label>
                            <div className={css.steps}>
                                {graph.nodes.map((node) => {
                                    if (
                                        !isReusableLLMPromptCallNodeType(node)
                                    ) {
                                        return null
                                    }

                                    const step = steps.find(
                                        (step) =>
                                            step.id ===
                                                node.data.configuration_id &&
                                            step.internal_id ===
                                                node.data
                                                    .configuration_internal_id
                                    )

                                    if (!step) {
                                        return null
                                    }

                                    const app = getAppFromTemplateApp(
                                        step.apps[0]
                                    )

                                    if (!app) {
                                        return null
                                    }

                                    return (
                                        <ReusableLLMPromptCallNodeLabel
                                            key={node.id}
                                            app={app}
                                            name={step.name}
                                            variant="regular"
                                        />
                                    )
                                })}
                            </div>
                        </div>
                        <div>
                            <Label className={css.label}>
                                Action conditions
                            </Label>
                            <div className={css.conditions}>
                                {conditions.map((condition) => (
                                    <div
                                        key={condition}
                                        className={css.condition}
                                    >
                                        <img
                                            src={orderSelectionIcon}
                                            alt="order"
                                        />
                                        {condition}
                                    </div>
                                ))}
                                {graph.nodes[0].data.requires_confirmation && (
                                    <div className={css.condition}>
                                        <i className="material-icons">
                                            check_circle
                                        </i>
                                        AI Agent will always ask for customer
                                        confirmation before performing the
                                        Action
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </ModalBody>
            {step === 'selection' && (
                <ModalActionsFooter>
                    <Button intent="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        intent="primary"
                        isDisabled={graph.nodes.length === 2}
                        onClick={() => {
                            if (
                                graph.apps?.every(
                                    (app) => app.type === 'shopify'
                                )
                            ) {
                                setStep('confirmation')
                            } else {
                                handleCustomize()
                            }
                        }}
                    >
                        Continue
                    </Button>
                </ModalActionsFooter>
            )}
            {step === 'confirmation' && (
                <ModalActionsFooter
                    extra={
                        <Button
                            fillStyle="fill"
                            intent="secondary"
                            isDisabled={isCreateActionLoading}
                            onClick={() => {
                                setStep('selection')
                            }}
                        >
                            Back
                        </Button>
                    }
                >
                    <Button
                        intent="primary"
                        fillStyle="ghost"
                        onClick={handleCustomize}
                        isDisabled={isCreateActionLoading}
                        leadingIcon="edit"
                    >
                        Customize
                    </Button>
                    <Button
                        intent="primary"
                        isDisabled={isCreateActionLoading}
                        onClick={handleCreateAndEnable}
                        leadingIcon="play_arrow"
                    >
                        Create and enable
                    </Button>
                </ModalActionsFooter>
            )}
        </Modal>
    )
}

export default UseCaseTemplateModal

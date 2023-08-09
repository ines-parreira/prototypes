import {ulid} from 'ulidx'
import {
    ORDER_SELECTION_WORKFLOW_ID,
    WAS_THIS_HELPFUL_WORKFLOW_ID,
} from '../constants'
import {
    buildEdgeCommonProperties,
    buildNodeCommonProperties,
} from './visualBuilderGraph.model'
import {
    AutomatedMessageNodeType,
    EndNodeType,
    FileUploadNodeType,
    MultipleChoicesNodeType,
    OrderSelectionNodeType,
    TextReplyNodeType,
    TriggerButtonNodeType,
    VisualBuilderEdge,
    VisualBuilderGraph,
    VisualBuilderNode,
} from './visualBuilderGraph.types'
import {
    MessageContent,
    WorkflowConfiguration,
    WorkflowStep,
    WorkflowTransition,
} from './workflowConfiguration.types'

export function walkWorkflowConfigurationGraph(
    c: WorkflowConfiguration,
    currentStepId: string,
    f: (
        step: WorkflowStep,
        context: {
            previousStep: WorkflowStep | undefined
            nextSteps: WorkflowStep[]
            incomingTransition: WorkflowTransition | undefined
            outgoingTransitions: WorkflowTransition[]
        }
    ) => void
) {
    const step = c.steps.find((s) => s.id === currentStepId)
    if (!step) return
    const incomingTransition = c.transitions.find(
        (t) => t.to_step_id === currentStepId
    )
    const previousStep = incomingTransition
        ? c.steps.find((s) => s.id === incomingTransition.from_step_id)
        : undefined
    const outgoingTransitions = c.transitions.filter(
        (t) => t.from_step_id === currentStepId
    )
    const nextSteps = outgoingTransitions.reduce(
        (acc, t) => [...acc, ...c.steps.filter((s) => s.id === t.to_step_id)],
        [] as WorkflowStep[]
    )
    f(step, {previousStep, incomingTransition, outgoingTransitions, nextSteps})
    if (outgoingTransitions.length === 0) return
    for (const outgoingTransition of outgoingTransitions) {
        walkWorkflowConfigurationGraph(c, outgoingTransition.to_step_id, f)
    }
}

function injectTkeysInContentIfNotExist(content: MessageContent) {
    const {html_tkey, text_tkey, ...rest} = content
    return {
        html_tkey: html_tkey || ulid(),
        text_tkey: text_tkey || ulid(),
        ...rest,
    }
}

function injectTkeysInChoicesIfNotExist(
    choices: MultipleChoicesNodeType['data']['choices']
) {
    return choices.map((c) => {
        const {label_tkey, ...rest} = c
        return {
            label_tkey: label_tkey || ulid(),
            ...rest,
        }
    })
}

export function transformWorkflowConfigurationIntoVisualBuilderGraph(
    c: WorkflowConfiguration
): VisualBuilderGraph {
    const triggerButtonNode: TriggerButtonNodeType = {
        ...buildNodeCommonProperties(),
        id: 'trigger_button',
        type: 'trigger_button',
        data: {
            label: c.entrypoint?.label ?? '',
            label_tkey: c.entrypoint?.label_tkey ?? ulid(),
        },
    }
    const nodes: VisualBuilderNode[] = [triggerButtonNode]
    const edges: VisualBuilderEdge[] = []
    const nodeIdByStepId: Record<string, string> = {}
    walkWorkflowConfigurationGraph(c, c.initial_step_id, (step, context) => {
        const {previousStep, nextSteps, incomingTransition} = context
        if (
            step.kind === 'messages' &&
            nextSteps.length === 1 &&
            nextSteps[0].kind === 'choices'
        ) {
            // group message step followed by a choice step into a multiple_choices node
            const n: MultipleChoicesNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'multiple_choices',
                data: {
                    content: injectTkeysInContentIfNotExist(
                        step.settings.messages[0].content
                    ),
                    choices: injectTkeysInChoicesIfNotExist(
                        nextSteps[0].settings.choices
                    ),
                    wfConfigurationRef: {
                        wfConfigurationChoicesStepId: nextSteps[0].id,
                        wfConfigurationMessagesStepId: step.id,
                    },
                },
            }
            nodeIdByStepId[nextSteps[0].id] = n.id
            nodes.push(n)
        } else if (
            step.kind === 'messages' &&
            nextSteps.length === 1 &&
            nextSteps[0].kind === 'text-input'
        ) {
            // group message step followed by a text-input step into a text_reply node
            const n: TextReplyNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'text_reply',
                data: {
                    content: injectTkeysInContentIfNotExist(
                        step.settings.messages[0].content
                    ),
                    wfConfigurationRef: {
                        wfConfigurationMessagesStepId: step.id,
                        wfConfigurationTextInputStepId: nextSteps[0].id,
                    },
                },
            }
            nodeIdByStepId[nextSteps[0].id] = n.id
            nodes.push(n)
        } else if (
            step.kind === 'messages' &&
            nextSteps.length === 1 &&
            nextSteps[0].kind === 'attachments-input'
        ) {
            // group message step followed by an attachments-input step into a file_upload node
            const n: FileUploadNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'file_upload',
                data: {
                    content: injectTkeysInContentIfNotExist(
                        step.settings.messages[0].content
                    ),
                    wfConfigurationRef: {
                        wfConfigurationMessagesStepId: step.id,
                        wfConfigurationAttachmentsInputStepId: nextSteps[0].id,
                    },
                },
            }
            nodeIdByStepId[nextSteps[0].id] = n.id
            nodes.push(n)
        } else if (
            step.kind === 'messages' &&
            nextSteps.length === 1 &&
            nextSteps[0].kind === 'shopper-authentication'
        ) {
            const orderSelectionWorkflowCallStepId = c.transitions.find(
                (t) => t.from_step_id === nextSteps[0].id
            )?.to_step_id
            const orderSelectionWorkflowCallStep = c.steps.find(
                (s) =>
                    s.id === orderSelectionWorkflowCallStepId &&
                    s.kind === 'workflow_call' &&
                    s.settings.configuration_id === ORDER_SELECTION_WORKFLOW_ID
            )

            if (!orderSelectionWorkflowCallStep) {
                throw new Error(
                    'order_selection node expects a chain of message -> shopper-authentication -> workflow_call steps'
                )
            }

            // group message step followed by a shopper-authentication & workflow_call steps into an order_selection node
            const n: OrderSelectionNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'order_selection',
                data: {
                    content: injectTkeysInContentIfNotExist(
                        step.settings.messages[0].content
                    ),
                    wfConfigurationRef: {
                        wfConfigurationMessagesStepId: step.id,
                        wfConfigurationShopperAuthenticationStepId:
                            nextSteps[0].id,
                        wfConfigurationOrderSelectionWorkflowCallStepId:
                            orderSelectionWorkflowCallStep.id,
                    },
                    integrationId: nextSteps[0].settings.integration_id,
                },
            }
            nodeIdByStepId[orderSelectionWorkflowCallStep.id] = n.id
            nodes.push(n)
        } else if (step.kind === 'messages') {
            // single message step will become an automated_answer node
            const n: AutomatedMessageNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'automated_message',
                data: {
                    content: injectTkeysInContentIfNotExist(
                        step.settings.messages[0].content
                    ),
                    wfConfigurationRef: {
                        wfConfigurationMessagesStepId: step.id,
                    },
                },
            }
            nodeIdByStepId[step.id] = n.id
            nodes.push(n)
        } else if (
            step.kind === 'workflow_call' &&
            step.settings.configuration_id === WAS_THIS_HELPFUL_WORKFLOW_ID
        ) {
            const n: EndNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'end',
                data: {
                    wfConfigurationRef: {
                        wfConfigurationWorkflowCallOrHandoverStepId: step.id,
                    },
                    withWasThisHelpfulPrompt: true,
                },
            }
            nodeIdByStepId[step.id] = n.id
            nodes.push(n)
        } else if (step.kind === 'handover') {
            const n: EndNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'end',
                data: {
                    wfConfigurationRef: {
                        wfConfigurationWorkflowCallOrHandoverStepId: step.id,
                    },
                    withWasThisHelpfulPrompt: false,
                    ticketTags: step.settings.ticket_tags,
                    ticketAssigneeUserId: step.settings.ticket_assignee_user_id,
                    ticketAssigneeTeamId: step.settings.ticket_assignee_team_id,
                },
            }
            nodeIdByStepId[step.id] = n.id
            nodes.push(n)
        } else {
            return
        }
        // linking from previous node to the one just added
        if (previousStep) {
            const n = nodes[nodes.length - 1]
            edges.push({
                ...buildEdgeCommonProperties(),
                id: `${nodeIdByStepId[previousStep.id]}-${n.id}`,
                source: nodeIdByStepId[previousStep.id],
                target: n.id,
                ...(incomingTransition?.event?.id
                    ? {data: {event: incomingTransition.event}}
                    : {}),
            })
        } else {
            const n = nodes[nodes.length - 1]
            edges.push({
                ...buildEdgeCommonProperties(),
                id: `${triggerButtonNode.id}-${n.id}`,
                source: triggerButtonNode.id,
                target: n.id,
                ...(incomingTransition?.event?.id
                    ? {data: {event: incomingTransition.event}}
                    : {}),
            })
        }
    })
    return {
        name: c.name,
        available_languages: c.available_languages,
        nodes,
        edges,
        wfConfigurationOriginal: c,
    }
}

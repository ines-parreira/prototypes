import {
    buildEdgeCommonProperties,
    buildNodeCommonProperties,
} from './visualBuilderGraph.model'
import {
    AutomatedMessageNodeType,
    EndNodeType,
    FileUploadNodeType,
    MultipleChoicesNodeType,
    TextReplyNodeType,
    TriggerButtonNodeType,
    VisualBuilderEdge,
    VisualBuilderGraph,
    VisualBuilderNode,
} from './visualBuilderGraph.types'
import {
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

export function transformWorkflowConfigurationIntoVisualBuilderGraph(
    c: WorkflowConfiguration
): VisualBuilderGraph {
    const triggerButtonNode: TriggerButtonNodeType = {
        ...buildNodeCommonProperties(),
        type: 'trigger_button',
        data: {
            label: c.entrypoint?.label ?? '',
            label_tkey: c.entrypoint?.label_tkey ?? '',
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
                type: 'multiple_choices',
                data: {
                    content: {
                        html: step.settings.messages[0].content.html,
                        text: step.settings.messages[0].content.text,
                        attachments:
                            step.settings.messages[0].content.attachments,
                    },
                    choices: nextSteps[0].settings.choices,
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
                type: 'text_reply',
                data: {
                    content: {
                        html: step.settings.messages[0].content.html,
                        text: step.settings.messages[0].content.text,
                        attachments:
                            step.settings.messages[0].content.attachments,
                    },
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
                type: 'file_upload',
                data: {
                    content: {
                        html: step.settings.messages[0].content.html,
                        text: step.settings.messages[0].content.text,
                        attachments:
                            step.settings.messages[0].content.attachments,
                    },
                    wfConfigurationRef: {
                        wfConfigurationMessagesStepId: step.id,
                        wfConfigurationAttachmentsInputStepId: nextSteps[0].id,
                    },
                },
            }
            nodeIdByStepId[nextSteps[0].id] = n.id
            nodes.push(n)
        } else if (step.kind === 'messages') {
            // single message step will become an automated_answer node
            const n: AutomatedMessageNodeType = {
                ...buildNodeCommonProperties(),
                type: 'automated_message',
                data: {
                    content: {
                        html: step.settings.messages[0].content.html,
                        text: step.settings.messages[0].content.text,
                        attachments:
                            step.settings.messages[0].content.attachments,
                    },
                    wfConfigurationRef: {
                        wfConfigurationMessagesStepId: step.id,
                    },
                },
            }
            nodeIdByStepId[step.id] = n.id
            nodes.push(n)
        } else if (step.kind === 'workflow_call') {
            // workflow_call step is always an end_node for now
            const n: EndNodeType = {
                ...buildNodeCommonProperties(),
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
                source: triggerButtonNode.id,
                target: n.id,
                ...(incomingTransition?.event?.id
                    ? {data: {event: incomingTransition.event}}
                    : {}),
            })
        }
    })
    return {name: c.name, nodes, edges, wfConfigurationOriginal: c}
}

import {Edge, Node} from 'reactflow'
import {ulid} from 'ulidx'
import _cloneDeep from 'lodash/cloneDeep'
import _omit from 'lodash/omit'
import _isEqual from 'lodash/isEqual'

import {WAS_THIS_HELPFUL_WORKFLOW_ID} from '../constants'
import {
    WorkflowConfiguration,
    WorkflowStepAttachmentsInput,
    WorkflowStepChoices,
    WorkflowStepHandover,
    WorkflowStepMessages,
    WorkflowStepTextInput,
    WorkflowStepWorkflowCall,
} from './workflowConfiguration.types'
import {
    VisualBuilderEdge,
    VisualBuilderGraph,
    VisualBuilderNode,
} from './visualBuilderGraph.types'

export const buildEdgeCommonProperties: () => Pick<
    Edge,
    'id' | 'type' | 'style' | 'interactionWidth'
> & {id: string} = () => ({
    id: ulid(),
    type: 'custom',
    style: {stroke: '#D2D7DE'},
    interactionWidth: 0,
})

export const buildNodeCommonProperties: () => Pick<Node, 'id' | 'position'> =
    () => ({
        id: ulid(),
        position: {x: 0, y: 0},
    })

export function areGraphsEqual(
    g1: VisualBuilderGraph,
    g2: VisualBuilderGraph
): boolean {
    const essentialGraph = (g: VisualBuilderGraph) =>
        _omit(
            {
                ...g,
                nodes: g.nodes
                    .map(({id, type, data}) => ({
                        id,
                        type,
                        data: _omit(data, ['isGreyedOut']),
                    }))
                    .sort((a, b) => a.id.localeCompare(b.id)),
                edges: g.edges
                    .map(({source, target, data}) => ({
                        source,
                        target,
                        data,
                    }))
                    .sort((a, b) =>
                        `${a.source}${a.target}`.localeCompare(
                            `${b.source}${b.target}`
                        )
                    ),
            },
            ['wfConfigurationOriginal']
        )
    return _isEqual(essentialGraph(g1), essentialGraph(g2))
}

export function walkVisualBuilderGraph(
    g: VisualBuilderGraph,
    currentNodeId: string,
    f: (
        node: VisualBuilderNode,
        context: {
            previousNode: VisualBuilderNode | undefined
            nextNodes: VisualBuilderNode[]
            incomingEdge: VisualBuilderEdge | undefined
            outgoingEdges: VisualBuilderEdge[]
        }
    ) => void
) {
    const {nodes, edges} = g
    const node = nodes.find((n) => n.id === currentNodeId)
    if (!node) return
    const incomingEdge = edges.find((e) => e.target === currentNodeId)
    const previousNode = incomingEdge
        ? nodes.find((n) => n.id === incomingEdge.source)
        : undefined
    const outgoingEdges = edges.filter((e) => e.source === currentNodeId)
    const nextNodes = outgoingEdges.map(
        (e) => nodes.find((n) => n.id === e.target) as VisualBuilderNode
    )
    f(node, {previousNode, nextNodes, incomingEdge, outgoingEdges})
    if (outgoingEdges.length === 0) return
    for (const outgoingEdge of outgoingEdges) {
        walkVisualBuilderGraph(g, outgoingEdge.target, f)
    }
}

export function transformVisualBuilderGraphIntoWfConfiguration(
    g: VisualBuilderGraph
) {
    const c: WorkflowConfiguration = _cloneDeep<WorkflowConfiguration>(
        g.wfConfigurationOriginal
    )
    c.name = g.name
    c.available_languages = g.available_languages
    c.steps = []
    c.transitions = []
    const stepIdByNodeId: Record<string, string> = {}
    walkVisualBuilderGraph(
        g,
        g.nodes[0].id,
        (node, {previousNode, incomingEdge}) => {
            if (node.type === 'trigger_button') {
                // TODO remove condition once label and label_tkey become non nullable
                if (node.data.label != null && node.data.label_tkey != null) {
                    c.entrypoint = {
                        label: node.data.label,
                        label_tkey: node.data.label_tkey,
                    }
                }
                return
            } else if (node.type === 'automated_message') {
                const stepId =
                    node.data.wfConfigurationRef.wfConfigurationMessagesStepId
                const s: WorkflowStepMessages = {
                    id: stepId,
                    kind: 'messages',
                    settings: {
                        messages: [
                            {
                                content: node.data.content,
                            },
                        ],
                    },
                }
                c.steps.push(s)
                if (previousNode && stepIdByNodeId[previousNode.id]) {
                    c.transitions.push({
                        id: ulid(),
                        from_step_id: stepIdByNodeId[previousNode.id],
                        to_step_id: stepId,
                        event: incomingEdge?.data?.event,
                    })
                } else {
                    c.initial_step_id = stepId
                }
                stepIdByNodeId[node.id] = stepId
            } else if (node.type === 'text_reply') {
                const messagesStepId =
                    node.data.wfConfigurationRef.wfConfigurationMessagesStepId
                const textInputStepId =
                    node.data.wfConfigurationRef.wfConfigurationTextInputStepId
                const messagesStep: WorkflowStepMessages = {
                    id: messagesStepId,
                    kind: 'messages',
                    settings: {
                        messages: [
                            {
                                content: node.data.content,
                            },
                        ],
                    },
                }
                const textInputStep: WorkflowStepTextInput = {
                    id: textInputStepId,
                    kind: 'text-input',
                }
                c.steps.push(messagesStep, textInputStep)
                c.transitions.push({
                    id: ulid(),
                    from_step_id: messagesStepId,
                    to_step_id: textInputStepId,
                })
                if (previousNode && stepIdByNodeId[previousNode.id]) {
                    c.transitions.push({
                        id: ulid(),
                        from_step_id: stepIdByNodeId[previousNode.id],
                        to_step_id: messagesStepId,
                        event: incomingEdge?.data?.event,
                    })
                } else {
                    c.initial_step_id = messagesStepId
                }
                stepIdByNodeId[node.id] = textInputStepId
            } else if (node.type === 'file_upload') {
                const messagesStepId =
                    node.data.wfConfigurationRef.wfConfigurationMessagesStepId
                const attachmentsInputStepId =
                    node.data.wfConfigurationRef
                        .wfConfigurationAttachmentsInputStepId
                const messagesStep: WorkflowStepMessages = {
                    id: messagesStepId,
                    kind: 'messages',
                    settings: {
                        messages: [
                            {
                                content: node.data.content,
                            },
                        ],
                    },
                }
                const attachmentsInputStep: WorkflowStepAttachmentsInput = {
                    id: attachmentsInputStepId,
                    kind: 'attachments-input',
                }
                c.steps.push(messagesStep, attachmentsInputStep)
                c.transitions.push({
                    id: ulid(),
                    from_step_id: messagesStepId,
                    to_step_id: attachmentsInputStepId,
                })
                if (previousNode && stepIdByNodeId[previousNode.id]) {
                    c.transitions.push({
                        id: ulid(),
                        from_step_id: stepIdByNodeId[previousNode.id],
                        to_step_id: messagesStepId,
                        event: incomingEdge?.data?.event,
                    })
                } else {
                    c.initial_step_id = messagesStepId
                }
                stepIdByNodeId[node.id] = attachmentsInputStepId
            } else if (node.type === 'multiple_choices') {
                const messagesStepId =
                    node.data.wfConfigurationRef.wfConfigurationMessagesStepId
                const messagesStep: WorkflowStepMessages = {
                    id: messagesStepId,
                    kind: 'messages',
                    settings: {
                        messages: [
                            {
                                content: node.data.content,
                            },
                        ],
                    },
                }
                const choicesStepId =
                    node.data.wfConfigurationRef.wfConfigurationChoicesStepId
                const choicesStep: WorkflowStepChoices = {
                    id: choicesStepId,
                    kind: 'choices',
                    settings: {
                        choices: node.data.choices,
                    },
                }
                c.steps.push(messagesStep)
                c.steps.push(choicesStep)
                if (previousNode && stepIdByNodeId[previousNode.id]) {
                    c.transitions.push({
                        id: ulid(),
                        from_step_id: stepIdByNodeId[previousNode.id],
                        to_step_id: messagesStepId,
                        event: incomingEdge?.data?.event,
                    })
                } else {
                    c.initial_step_id = messagesStepId
                }
                c.transitions.push({
                    id: ulid(),
                    from_step_id: messagesStepId,
                    to_step_id: choicesStepId,
                })
                stepIdByNodeId[node.id] = choicesStepId
            } else if (
                node.type === 'end' &&
                node.data.withWasThisHelpfulPrompt
            ) {
                const workflowCallStepId =
                    node.data.wfConfigurationRef
                        .wfConfigurationWorkflowCallOrHandoverStepId
                const workflowCallStep: WorkflowStepWorkflowCall = {
                    id: workflowCallStepId,
                    kind: 'workflow_call',
                    settings: {
                        configuration_id: WAS_THIS_HELPFUL_WORKFLOW_ID,
                    },
                }
                c.steps.push(workflowCallStep)
                if (previousNode && stepIdByNodeId[previousNode.id]) {
                    c.transitions.push({
                        id: ulid(),
                        from_step_id: stepIdByNodeId[previousNode.id],
                        to_step_id: workflowCallStepId,
                        event: incomingEdge?.data?.event,
                    })
                }
            } else if (
                node.type === 'end' &&
                !node.data.withWasThisHelpfulPrompt
            ) {
                const handoverStepId =
                    node.data.wfConfigurationRef
                        .wfConfigurationWorkflowCallOrHandoverStepId
                const workflowCallStep: WorkflowStepHandover = {
                    id: handoverStepId,
                    kind: 'handover',
                    settings: {
                        ticket_tags: node.data.ticketTags,
                        ticket_assignee_user_id: node.data.ticketAssigneeUserId,
                        ticket_assignee_team_id: node.data.ticketAssigneeTeamId,
                    },
                }
                c.steps.push(workflowCallStep)
                if (previousNode && stepIdByNodeId[previousNode.id]) {
                    c.transitions.push({
                        id: ulid(),
                        from_step_id: stepIdByNodeId[previousNode.id],
                        to_step_id: handoverStepId,
                        event: incomingEdge?.data?.event,
                    })
                }
            }
        }
    )
    return c
}

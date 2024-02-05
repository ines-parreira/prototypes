import {Edge, Node} from 'reactflow'
import {ulid} from 'ulidx'
import _cloneDeep from 'lodash/cloneDeep'
import _omit from 'lodash/omit'
import _isEqual from 'lodash/isEqual'
import _keyBy from 'lodash/keyBy'
import _groupBy from 'lodash/groupBy'
import _omitBy from 'lodash/omitBy'

import {
    NO_ORDERS_WORKFLOW_ID,
    ORDER_SELECTION_WORKFLOW_ID,
    WAS_THIS_HELPFUL_WORKFLOW_ID,
} from '../constants'
import {
    WorkflowConfiguration,
    WorkflowStepAttachmentsInput,
    WorkflowStepChoices,
    WorkflowStepHandover,
    WorkflowStepHelpfulPrompt,
    WorkflowStepHttpRequest,
    WorkflowStepMessage,
    WorkflowStepMessages,
    WorkflowStepOrderSelection,
    WorkflowStepShopperAuthentication,
    WorkflowStepTextInput,
    WorkflowStepWorkflowCall,
} from './workflowConfiguration.types'
import {
    VisualBuilderEdge,
    VisualBuilderGraph,
    VisualBuilderNode,
    isMultipleChoicesNodeType,
} from './visualBuilderGraph.types'
import {unescapeUrlEncodedVariables} from './variables.model'

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
                    .map((node) => {
                        let data = _omitBy(
                            _omit(node.data, ['isGreyedOut']),
                            (value) => value === undefined
                        )

                        if (node.type === 'http_request') {
                            data = _omit(data, ['testRequestResult'])

                            return {
                                id: node.id,
                                type: node.type,
                                data: {
                                    ...data,
                                    headers: node.data.headers.map(
                                        (header) => ({
                                            ...header,
                                            name: header.name.toLowerCase(),
                                        })
                                    ),
                                },
                            }
                        }

                        return {id: node.id, type: node.type, data}
                    })
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
            ['wfConfigurationOriginal', 'isNewModel']
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
    ) => void,
    direction: 'upwards' | 'downwards' = 'downwards',
    indexes?: {
        nodeById: Record<string, VisualBuilderNode>
        edgesBySource: Record<string, VisualBuilderEdge[]>
        edgesByTarget: Record<string, VisualBuilderEdge[]>
    }
) {
    const {nodes, edges} = g
    // Build indexes on first iteration
    const {nodeById, edgesBySource, edgesByTarget} = indexes ?? {
        nodeById: _keyBy(nodes, 'id'),
        edgesBySource: _groupBy(edges, 'source'),
        edgesByTarget: _groupBy(edges, 'target'),
    }

    const node = nodeById[currentNodeId]
    if (!node) return

    let nextEdges = []
    let previousNode
    let incomingEdge

    if (direction === 'downwards') {
        nextEdges = edgesBySource[currentNodeId] ?? []
        incomingEdge = edgesByTarget[currentNodeId]?.[0]
        previousNode = incomingEdge ? nodeById[incomingEdge.source] : undefined
    } else {
        nextEdges = edgesByTarget[currentNodeId] ?? []
        const outgoingEdge = nextEdges.length > 0 ? nextEdges[0] : undefined
        previousNode = outgoingEdge ? nodeById[outgoingEdge.target] : undefined
    }

    const nextNodes = nextEdges.map(
        (e) => nodeById[direction === 'downwards' ? e.target : e.source]
    )

    f(node, {previousNode, nextNodes, incomingEdge, outgoingEdges: nextEdges})

    for (const edge of nextEdges) {
        walkVisualBuilderGraph(
            g,
            direction === 'downwards' ? edge.target : edge.source,
            f,
            direction,
            {
                nodeById,
                edgesBySource,
                edgesByTarget,
            }
        )
    }
}

export function transformVisualBuilderGraphIntoWfConfiguration(
    g: VisualBuilderGraph,
    isDraft = true
) {
    const c: WorkflowConfiguration = _cloneDeep<WorkflowConfiguration>(
        g.wfConfigurationOriginal
    )
    c.name = g.name
    c.available_languages = g.available_languages
    c.steps = []
    c.transitions = []
    c.is_draft = isDraft
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
            } /* DEPRECATED */ else if (
                node.type === 'automated_message' &&
                'wfConfigurationMessagesStepId' in node.data.wfConfigurationRef
            ) {
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
            } else if (
                node.type === 'automated_message' &&
                'wfConfigurationMessageStepId' in node.data.wfConfigurationRef
            ) {
                const step: WorkflowStepMessage = {
                    id: node.data.wfConfigurationRef
                        .wfConfigurationMessageStepId,
                    kind: 'message',
                    settings: {
                        message: {
                            content: node.data.content,
                        },
                    },
                }
                c.steps.push(step)
                if (previousNode && stepIdByNodeId[previousNode.id]) {
                    c.transitions.push({
                        id: ulid(),
                        from_step_id: stepIdByNodeId[previousNode.id],
                        to_step_id: step.id,
                        event: incomingEdge?.data?.event,
                    })
                } else {
                    c.initial_step_id = step.id
                }
                stepIdByNodeId[node.id] = step.id
            } /* DEPRECATED */ else if (
                node.type === 'text_reply' &&
                'wfConfigurationMessagesStepId' in node.data.wfConfigurationRef
            ) {
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
            } else if (
                node.type === 'text_reply' &&
                !(
                    'wfConfigurationMessagesStepId' in
                    node.data.wfConfigurationRef
                )
            ) {
                const step: WorkflowStepTextInput = {
                    id: node.data.wfConfigurationRef
                        .wfConfigurationTextInputStepId,
                    kind: 'text-input',
                    settings: {
                        message: {
                            content: node.data.content,
                        },
                    },
                }
                c.steps.push(step)
                if (previousNode && stepIdByNodeId[previousNode.id]) {
                    c.transitions.push({
                        id: ulid(),
                        from_step_id: stepIdByNodeId[previousNode.id],
                        to_step_id: step.id,
                        event: incomingEdge?.data?.event,
                    })
                } else {
                    c.initial_step_id = step.id
                }
                stepIdByNodeId[node.id] = step.id
            } /* DEPRECATED */ else if (
                node.type === 'file_upload' &&
                'wfConfigurationMessagesStepId' in node.data.wfConfigurationRef
            ) {
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
            } else if (
                node.type === 'file_upload' &&
                !(
                    'wfConfigurationMessagesStepId' in
                    node.data.wfConfigurationRef
                )
            ) {
                const step: WorkflowStepAttachmentsInput = {
                    id: node.data.wfConfigurationRef
                        .wfConfigurationAttachmentsInputStepId,
                    kind: 'attachments-input',
                    settings: {
                        message: {
                            content: node.data.content,
                        },
                    },
                }
                c.steps.push(step)
                if (previousNode && stepIdByNodeId[previousNode.id]) {
                    c.transitions.push({
                        id: ulid(),
                        from_step_id: stepIdByNodeId[previousNode.id],
                        to_step_id: step.id,
                        event: incomingEdge?.data?.event,
                    })
                } else {
                    c.initial_step_id = step.id
                }
                stepIdByNodeId[node.id] = step.id
            } /* DEPRECATED */ else if (
                node.type === 'order_selection' &&
                'wfConfigurationMessagesStepId' in
                    node.data.wfConfigurationRef &&
                previousNode
            ) {
                const noOrdersWorkflowCallStepId =
                    node.data.wfConfigurationRef
                        .wfConfigurationNoOrdersWorkflowCallStepId
                const messagesStepId =
                    node.data.wfConfigurationRef.wfConfigurationMessagesStepId
                const orderSelectionWorkflowCallStepId =
                    node.data.wfConfigurationRef
                        .wfConfigurationOrderSelectionWorkflowCallStepId
                const noOrdersWorkflowCallStep: WorkflowStepWorkflowCall = {
                    id: noOrdersWorkflowCallStepId,
                    kind: 'workflow_call',
                    settings: {
                        configuration_id: NO_ORDERS_WORKFLOW_ID,
                    },
                }
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
                const orderSelectionWorkflowCallStep: WorkflowStepWorkflowCall =
                    {
                        id: orderSelectionWorkflowCallStepId,
                        kind: 'workflow_call',
                        settings: {
                            configuration_id: ORDER_SELECTION_WORKFLOW_ID,
                        },
                    }
                c.steps.push(
                    noOrdersWorkflowCallStep,
                    messagesStep,
                    orderSelectionWorkflowCallStep
                )
                c.transitions.push({
                    id: ulid(),
                    from_step_id: stepIdByNodeId[previousNode.id],
                    to_step_id: noOrdersWorkflowCallStepId,
                    conditions: {'!': {var: 'customer.orders'}},
                    event: incomingEdge?.data?.event,
                })
                c.transitions.push({
                    id: ulid(),
                    from_step_id: stepIdByNodeId[previousNode.id],
                    to_step_id: messagesStepId,
                    conditions: {'!!': {var: 'customer.orders'}},
                    event: incomingEdge?.data?.event,
                })
                c.transitions.push({
                    id: ulid(),
                    from_step_id: messagesStepId,
                    to_step_id: orderSelectionWorkflowCallStepId,
                })
                stepIdByNodeId[node.id] = orderSelectionWorkflowCallStepId
            } else if (
                node.type === 'order_selection' &&
                'wfConfigurationOrderSelectionStepId' in
                    node.data.wfConfigurationRef
            ) {
                const step: WorkflowStepOrderSelection = {
                    id: node.data.wfConfigurationRef
                        .wfConfigurationOrderSelectionStepId,
                    kind: 'order-selection',
                    settings: {
                        message: {
                            content: node.data.content,
                        },
                    },
                }
                c.steps.push(step)
                if (previousNode && stepIdByNodeId[previousNode.id]) {
                    c.transitions.push({
                        id: ulid(),
                        from_step_id: stepIdByNodeId[previousNode.id],
                        to_step_id: step.id,
                        event: incomingEdge?.data?.event,
                    })
                } else {
                    c.initial_step_id = step.id
                }
                stepIdByNodeId[node.id] = step.id
            } /* DEPRECATED */ else if (
                node.type === 'multiple_choices' &&
                'wfConfigurationMessagesStepId' in node.data.wfConfigurationRef
            ) {
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
                node.type === 'multiple_choices' &&
                !(
                    'wfConfigurationMessagesStepId' in
                    node.data.wfConfigurationRef
                )
            ) {
                const step: WorkflowStepChoices = {
                    id: node.data.wfConfigurationRef
                        .wfConfigurationChoicesStepId,
                    kind: 'choices',
                    settings: {
                        choices: node.data.choices,
                        message: {
                            content: node.data.content,
                        },
                    },
                }
                c.steps.push(step)
                if (previousNode && stepIdByNodeId[previousNode.id]) {
                    c.transitions.push({
                        id: ulid(),
                        from_step_id: stepIdByNodeId[previousNode.id],
                        to_step_id: step.id,
                        event: incomingEdge?.data?.event,
                    })
                } else {
                    c.initial_step_id = step.id
                }
                stepIdByNodeId[node.id] = step.id
            } /* DEPRECATED */ else if (
                node.type === 'end' &&
                node.data.withWasThisHelpfulPrompt &&
                'wfConfigurationWorkflowCallOrHandoverStepId' in
                    node.data.wfConfigurationRef
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
                } else {
                    c.initial_step_id = workflowCallStepId
                }
            } else if (
                node.type === 'end' &&
                node.data.withWasThisHelpfulPrompt &&
                'wfConfigurationHelpfulPromptOrHandoverStepId' in
                    node.data.wfConfigurationRef
            ) {
                const step: WorkflowStepHelpfulPrompt = {
                    id: node.data.wfConfigurationRef
                        .wfConfigurationHelpfulPromptOrHandoverStepId,
                    kind: 'helpful-prompt',
                }
                c.steps.push(step)
                if (previousNode && stepIdByNodeId[previousNode.id]) {
                    c.transitions.push({
                        id: ulid(),
                        from_step_id: stepIdByNodeId[previousNode.id],
                        to_step_id: step.id,
                        event: incomingEdge?.data?.event,
                    })
                }
            } /* DEPRECATED */ else if (
                node.type === 'end' &&
                !node.data.withWasThisHelpfulPrompt &&
                'wfConfigurationWorkflowCallOrHandoverStepId' in
                    node.data.wfConfigurationRef
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
                } else {
                    c.initial_step_id = handoverStepId
                }
            } else if (
                node.type === 'end' &&
                !node.data.withWasThisHelpfulPrompt &&
                'wfConfigurationHelpfulPromptOrHandoverStepId' in
                    node.data.wfConfigurationRef
            ) {
                const step: WorkflowStepHandover = {
                    id: node.data.wfConfigurationRef
                        .wfConfigurationHelpfulPromptOrHandoverStepId,
                    kind: 'handover',
                    settings: {
                        ticket_tags: node.data.ticketTags,
                        ticket_assignee_user_id: node.data.ticketAssigneeUserId,
                        ticket_assignee_team_id: node.data.ticketAssigneeTeamId,
                    },
                }
                c.steps.push(step)
                if (previousNode && stepIdByNodeId[previousNode.id]) {
                    c.transitions.push({
                        id: ulid(),
                        from_step_id: stepIdByNodeId[previousNode.id],
                        to_step_id: step.id,
                        event: incomingEdge?.data?.event,
                    })
                }
            } else if (node.type === 'http_request') {
                const headers = node.data.headers.reduce<
                    Record<string, string>
                >((acc, header) => {
                    acc[header.name.toLowerCase()] = header.value
                    return acc
                }, {})

                if (node.data.bodyContentType) {
                    headers['content-type'] = node.data.bodyContentType
                }

                let body: string | undefined

                switch (node.data.bodyContentType) {
                    case 'application/json':
                        body = node.data.json
                        break
                    case 'application/x-www-form-urlencoded': {
                        const entries = node.data.formUrlencoded?.map(
                            (entry) => [entry.key, entry.value]
                        )

                        body = unescapeUrlEncodedVariables(
                            new URLSearchParams(entries).toString()
                        )
                        break
                    }
                }

                const step: WorkflowStepHttpRequest = {
                    id: node.data.wfConfigurationRef
                        .wfConfigurationHttpRequestStepId,
                    kind: 'http-request',
                    settings: {
                        name: node.data.name,
                        url: node.data.url,
                        method: node.data.method,
                        headers,
                        body,
                        variables: node.data.variables,
                    },
                }
                c.steps.push(step)
                if (previousNode && stepIdByNodeId[previousNode.id]) {
                    c.transitions.push({
                        id: ulid(),
                        from_step_id: stepIdByNodeId[previousNode.id],
                        to_step_id: step.id,
                        event: incomingEdge?.data?.event,
                    })
                } else {
                    c.initial_step_id = step.id
                }
                stepIdByNodeId[node.id] = step.id
            } else if (node.type === 'shopper_authentication') {
                const stepId =
                    node.data.wfConfigurationRef
                        .wfConfigurationShopperAuthenticationStepId

                const s: WorkflowStepShopperAuthentication = {
                    id: stepId,
                    kind: 'shopper-authentication',
                    settings: {
                        integration_id: node.data.integrationId,
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
            }
        }
    )
    return c
}

export function getIncomingChoice(
    visualBuilderGraph: VisualBuilderGraph,
    currentNodeId: string
) {
    const incomingEdge = visualBuilderGraph.edges.find(
        ({target}) => target === currentNodeId
    )
    const choiceEventId = incomingEdge?.data?.event?.id
    const previousNodeId = incomingEdge?.source
    const previousNode = previousNodeId
        ? visualBuilderGraph.nodes.find(({id}) => id === previousNodeId)
        : undefined
    const choiceIndex =
        previousNode?.type === 'multiple_choices' && choiceEventId != null
            ? previousNode.data.choices.findIndex(
                  ({event_id}) => event_id === choiceEventId
              )
            : -1
    if (
        choiceIndex >= 0 &&
        previousNode &&
        isMultipleChoicesNodeType(previousNode)
    ) {
        const choice = previousNode.data.choices[choiceIndex]
        return {
            label: choice.label || `Option ${choiceIndex + 1}`,
            eventId: choice.event_id,
            nodeId: previousNode.id,
        }
    }
    return undefined
}

export function isNodeUniquePerPath(
    type: VisualBuilderNode['type'],
    graph: VisualBuilderGraph,
    nodeId: string
) {
    const {nodes} = graph
    const childrenIds: Set<string> = new Set()
    walkVisualBuilderGraph(
        graph,
        nodeId,
        (node) => {
            childrenIds.add(node.id)
        },
        'upwards'
    )
    walkVisualBuilderGraph(
        graph,
        nodeId,
        (node) => {
            childrenIds.add(node.id)
        },
        'downwards'
    )

    return !Boolean(
        nodes.find((node) => childrenIds.has(node.id) && node.type === type)
    )
}

export function hasParentNodeInPath(
    type: VisualBuilderNode['type'],
    graph: VisualBuilderGraph,
    nodeId: string
) {
    let hasParentNode = false

    walkVisualBuilderGraph(
        graph,
        nodeId,
        (node) => {
            if (node.type === type && node.id !== nodeId) {
                hasParentNode = true
            }
        },
        'upwards'
    )

    return hasParentNode
}

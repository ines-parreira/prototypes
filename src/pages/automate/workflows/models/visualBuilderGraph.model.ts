import {Edge, Node} from 'reactflow'
import {ulid} from 'ulidx'
import _cloneDeep from 'lodash/cloneDeep'
import _omit from 'lodash/omit'
import _isEqual from 'lodash/isEqual'
import _keyBy from 'lodash/keyBy'
import _groupBy from 'lodash/groupBy'
import _omitBy from 'lodash/omitBy'

import {
    WorkflowConfiguration,
    WorkflowStepAttachmentsInput,
    WorkflowStepChoices,
    WorkflowStepConditions,
    WorkflowStepEnd,
    WorkflowStepHandover,
    WorkflowStepHelpfulPrompt,
    WorkflowStepHttpRequest,
    WorkflowStepMessage,
    WorkflowStepOrderSelection,
    WorkflowStepShopperAuthentication,
    WorkflowStepTextInput,
} from './workflowConfiguration.types'
import {
    VisualBuilderEdge,
    VisualBuilderGraph,
    VisualBuilderNode,
    isMultipleChoicesNodeType,
    isConditionsNodeType,
    isHttpRequestNodeType,
} from './visualBuilderGraph.types'
import {
    getWorkflowVariableListForNode,
    parseWorkflowVariable,
    unescapeUrlEncodedVariables,
} from './variables.model'
import {ConditionSchema, ConditionsSchema, VarSchema} from './conditions.types'
import {WorkflowVariableList} from './variables.types'

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
                edges: g.edges.map(({source, target, data}) => ({
                    source,
                    target,
                    data,
                })),
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

export function cleanConditionsFromEmptyVariables(
    conditions: ConditionsSchema,
    availableVariables: WorkflowVariableList
) {
    const clear = (condition: ConditionSchema) => {
        const operator = Object.keys(condition)?.[0] as keyof ConditionSchema

        const schema = condition[operator] as [VarSchema, string]

        const [variable] = schema

        return parseWorkflowVariable(variable.var, availableVariables) != null
    }

    if (!conditions.and && !conditions.or) {
        return conditions
    }

    if (conditions.and) {
        return {
            ...conditions,
            and: conditions.and.filter(clear),
        }
    } else if (conditions.or) {
        return {
            ...conditions,
            or: conditions.or.filter(clear),
        }
    }

    return conditions
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
                c.entrypoint = {
                    label: node.data.label,
                    label_tkey: node.data.label_tkey,
                }
                return
            } else if (node.type === 'automated_message') {
                const step: WorkflowStepMessage = {
                    id: node.id,
                    kind: 'message',
                    settings: {
                        message: {
                            content: node.data.content,
                        },
                    },
                }
                c.steps.push(step)
                stepIdByNodeId[node.id] = step.id
            } else if (node.type === 'text_reply') {
                const step: WorkflowStepTextInput = {
                    id: node.id,
                    kind: 'text-input',
                    settings: {
                        message: {
                            content: node.data.content,
                        },
                    },
                }
                c.steps.push(step)
                stepIdByNodeId[node.id] = step.id
            } else if (node.type === 'file_upload') {
                const step: WorkflowStepAttachmentsInput = {
                    id: node.id,
                    kind: 'attachments-input',
                    settings: {
                        message: {
                            content: node.data.content,
                        },
                    },
                }
                c.steps.push(step)
                stepIdByNodeId[node.id] = step.id
            } else if (node.type === 'order_selection') {
                const step: WorkflowStepOrderSelection = {
                    id: node.id,
                    kind: 'order-selection',
                    settings: {
                        message: {
                            content: node.data.content,
                        },
                    },
                }
                c.steps.push(step)
                stepIdByNodeId[node.id] = step.id
            } else if (node.type === 'multiple_choices') {
                const step: WorkflowStepChoices = {
                    id: node.id,
                    kind: 'choices',
                    settings: {
                        choices: node.data.choices,
                        message: {
                            content: node.data.content,
                        },
                    },
                }
                c.steps.push(step)
                stepIdByNodeId[node.id] = step.id
            } else if (
                node.type === 'end' &&
                node.data.action === 'ask-for-feedback'
            ) {
                const step: WorkflowStepHelpfulPrompt = {
                    id: node.id,
                    kind: 'helpful-prompt',
                    settings: {
                        ticket_tags: node.data.ticketTags,
                        ticket_assignee_user_id: node.data.ticketAssigneeUserId,
                        ticket_assignee_team_id: node.data.ticketAssigneeTeamId,
                    },
                }
                c.steps.push(step)
                stepIdByNodeId[node.id] = step.id
            } else if (
                node.type === 'end' &&
                node.data.action === 'create-ticket'
            ) {
                const step: WorkflowStepHandover = {
                    id: node.id,
                    kind: 'handover',
                    settings: {
                        ticket_tags: node.data.ticketTags,
                        ticket_assignee_user_id: node.data.ticketAssigneeUserId,
                        ticket_assignee_team_id: node.data.ticketAssigneeTeamId,
                    },
                }
                c.steps.push(step)
                stepIdByNodeId[node.id] = step.id
            } else if (node.type === 'end' && node.data.action === 'end') {
                const step: WorkflowStepEnd = {
                    id: node.id,
                    kind: 'end',
                }
                c.steps.push(step)
                stepIdByNodeId[node.id] = step.id
            } else if (node.type === 'conditions') {
                const step: WorkflowStepConditions = {
                    id: node.id,
                    kind: 'conditions',
                    settings: {
                        name: node.data.name,
                    },
                }
                c.steps.push(step)
                stepIdByNodeId[node.id] = step.id
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
                    id: node.id,
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
                stepIdByNodeId[node.id] = step.id
            } else if (node.type === 'shopper_authentication') {
                const step: WorkflowStepShopperAuthentication = {
                    id: node.id,
                    kind: 'shopper-authentication',
                    settings: {
                        integration_id: node.data.integrationId,
                    },
                }
                c.steps.push(step)
                stepIdByNodeId[node.id] = step.id
            } else {
                return
            }

            if (previousNode && stepIdByNodeId[previousNode.id]) {
                c.transitions.push({
                    id: ulid(),
                    from_step_id: stepIdByNodeId[previousNode.id],
                    to_step_id: stepIdByNodeId[node.id],
                    name: incomingEdge?.data?.name,
                    event: incomingEdge?.data?.event,
                    conditions: incomingEdge?.data?.conditions
                        ? cleanConditionsFromEmptyVariables(
                              incomingEdge.data.conditions,
                              getWorkflowVariableListForNode(g, node.id)
                          )
                        : undefined,
                })
            } else {
                c.initial_step_id = stepIdByNodeId[node.id]
            }
        }
    )
    return c
}

export function getIncoming(
    visualBuilderGraph: VisualBuilderGraph,
    currentNodeId: string,
    type: 'choice' | 'conditions' | 'http_request'
) {
    const incomingEdge = visualBuilderGraph.edges.find(
        ({target}) => target === currentNodeId
    )

    if (!incomingEdge) {
        return
    }

    const previousNodeId = incomingEdge.source
    const previousNode = previousNodeId
        ? visualBuilderGraph.nodes.find(({id}) => id === previousNodeId)
        : undefined

    switch (type) {
        case 'choice': {
            const choiceEventId = incomingEdge.data?.event?.id
            const choiceIndex =
                previousNode?.type === 'multiple_choices' &&
                choiceEventId != null
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
            break
        }
        case 'http_request': {
            const branchName = incomingEdge.data?.name
            const branchId = incomingEdge.id

            if (previousNode && isHttpRequestNodeType(previousNode)) {
                return {
                    id: branchId,
                    label: branchName,
                    nodeId: previousNode.id,
                    isFallback: !incomingEdge.data?.conditions,
                }
            }
            break
        }
        case 'conditions': {
            const branchName = incomingEdge.data?.name
            const branchId = incomingEdge.id

            if (previousNode && isConditionsNodeType(previousNode)) {
                return {
                    id: branchId,
                    label: branchName,
                    nodeId: previousNode.id,
                    isFallback: !incomingEdge.data?.conditions,
                }
            }
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

import {produce} from 'immer'

import {MessageContent} from 'pages/automate/workflows/models/workflowConfiguration.types'
import {
    buildEdgeCommonProperties,
    cleanConditionsFromEmptyVariables,
} from 'pages/automate/workflows/models/visualBuilderGraph.model'

import {
    AutomatedMessageNodeType,
    EndNodeType,
    FileUploadNodeType,
    OrderSelectionNodeType,
    TextReplyNodeType,
    TriggerButtonNodeType,
    VisualBuilderGraph,
    VisualBuilderNode,
} from '../../models/visualBuilderGraph.types'
import {getWorkflowVariableListForNode} from '../../models/variables.model'
import {
    buildAutomatedMessageNode,
    buildEndNode,
    buildFileUploadNode,
    buildOrderSelectionNode,
    buildShopperAuthenticationNode,
    buildTextReplyNode,
    computeNodesPositions,
    deleteBranch,
    greyOutBranch,
} from './utils'

export type VisualBuilderBaseAction =
    | {
          type: 'RESET_GRAPH'
          graph: VisualBuilderGraph
      }
    | {
          type: 'SET_NAME'
          name: string
      }
    | {
          type: 'SET_TRIGGER_BUTTON_LABEL'
          triggerButtonNodeId: string
          label: string
      }
    | {
          type: 'SET_AUTOMATED_MESSAGE_CONTENT'
          automatedMessageNodeId: string
          content: MessageContent
      }
    | {
          type: 'SET_TEXT_REPLY_CONTENT'
          textReplyNodeId: string
          content: MessageContent
      }
    | {
          type: 'SET_FILE_UPLOAD_CONTENT'
          fileUploadNodeId: string
          content: MessageContent
      }
    | {
          type: 'SET_ORDER_SELECTION_CONTENT'
          orderSelectionNodeId: string
          content: MessageContent
      }
    | {
          type: 'SET_END_NODE_SETTINGS'
          endNodeId: string
          settings: Pick<
              EndNodeType['data'],
              | 'action'
              | 'ticketTags'
              | 'ticketAssigneeUserId'
              | 'ticketAssigneeTeamId'
          >
      }
    | {
          type: 'INSERT_AUTOMATED_MESSAGE_NODE'
          beforeNodeId: string
      }
    | {
          type: 'INSERT_SHOPPER_AUTHENTICATION_NODE'
          beforeNodeId: string
          storeIntegrationId: number
      }
    | {
          type: 'INSERT_TEXT_REPLY_NODE'
          beforeNodeId: string
      }
    | {
          type: 'INSERT_FILE_UPLOAD_NODE'
          beforeNodeId: string
      }
    | {
          type: 'INSERT_ORDER_SELECTION_NODE'
          beforeNodeId: string
      }
    | {
          type: 'DELETE_NODE'
          nodeId: string
      }
    | {
          type: 'DELETE_BRANCH'
          nodeId: string
      }
    | {
          type: 'GREY_OUT_BRANCH'
          nodeId: string
          isGreyedOut: boolean
      }

export function baseReducer(
    graph: VisualBuilderGraph,
    action: VisualBuilderBaseAction
): VisualBuilderGraph {
    switch (action.type) {
        case 'RESET_GRAPH':
            return computeNodesPositions(action.graph)
        case 'SET_NAME':
            return produce(graph, (draft) => {
                draft.name = action.name
            })
        case 'SET_TRIGGER_BUTTON_LABEL':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is TriggerButtonNodeType =>
                        n.id === action.triggerButtonNodeId &&
                        n.type === 'trigger_button'
                )
                if (node) node.data.label = action.label
            })
        case 'SET_AUTOMATED_MESSAGE_CONTENT':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is AutomatedMessageNodeType =>
                        n.id === action.automatedMessageNodeId &&
                        n.type === 'automated_message'
                )
                if (node) {
                    node.data.content = action.content
                }
            })
        case 'SET_TEXT_REPLY_CONTENT':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is TextReplyNodeType =>
                        n.id === action.textReplyNodeId &&
                        n.type === 'text_reply'
                )
                if (node) {
                    node.data.content = action.content
                }
            })
        case 'SET_FILE_UPLOAD_CONTENT':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is FileUploadNodeType =>
                        n.id === action.fileUploadNodeId &&
                        n.type === 'file_upload'
                )
                if (node) {
                    node.data.content = action.content
                }
            })
        case 'SET_ORDER_SELECTION_CONTENT':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is OrderSelectionNodeType =>
                        n.id === action.orderSelectionNodeId &&
                        n.type === 'order_selection'
                )
                if (node) {
                    node.data.content = action.content
                }
            })
        case 'SET_END_NODE_SETTINGS':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is EndNodeType => n.id === action.endNodeId
                )
                if (node) {
                    node.data.action = action.settings.action
                    node.data.ticketAssigneeTeamId =
                        action.settings.ticketAssigneeTeamId
                    node.data.ticketAssigneeUserId =
                        action.settings.ticketAssigneeUserId
                    node.data.ticketTags = action.settings.ticketTags
                }
            })
        case 'INSERT_AUTOMATED_MESSAGE_NODE':
            return computeNodesPositions(
                insertNodeBefore(
                    graph,
                    buildAutomatedMessageNode(),
                    action.beforeNodeId
                )
            )
        case 'INSERT_TEXT_REPLY_NODE':
            return computeNodesPositions(
                insertNodeBefore(
                    graph,
                    buildTextReplyNode(),
                    action.beforeNodeId
                )
            )
        case 'INSERT_FILE_UPLOAD_NODE':
            return computeNodesPositions(
                insertNodeBefore(
                    graph,
                    buildFileUploadNode(),
                    action.beforeNodeId
                )
            )
        case 'INSERT_SHOPPER_AUTHENTICATION_NODE':
            return computeNodesPositions(
                insertNodeBefore(
                    graph,
                    buildShopperAuthenticationNode(action.storeIntegrationId),
                    action.beforeNodeId
                )
            )
        case 'INSERT_ORDER_SELECTION_NODE':
            return computeNodesPositions(
                insertNodeBefore(
                    graph,
                    buildOrderSelectionNode(),
                    action.beforeNodeId
                )
            )
        case 'DELETE_NODE':
            return computeNodesPositions(
                produce(graph, (draft) => {
                    const nodeIndex = draft.nodes.findIndex(
                        (n) => n.id === action.nodeId
                    )
                    if (nodeIndex === -1) return
                    draft.nodes.splice(nodeIndex, 1)
                    const incomingEdge = draft.edges.find(
                        (e) => e.target === action.nodeId
                    )
                    const outgoingEdges = draft.edges.filter(
                        (e) => e.source === action.nodeId
                    )
                    if (incomingEdge && outgoingEdges.length === 1) {
                        incomingEdge.target = outgoingEdges[0].target

                        // preserve edge ordering
                        draft.edges = [
                            ...draft.edges
                                .filter((e) => e.source !== action.nodeId)
                                .map((edge) => {
                                    // Removes variables from conditions that are associated with the deleted choice
                                    if (edge.data?.conditions) {
                                        edge.data.conditions =
                                            cleanConditionsFromEmptyVariables(
                                                edge.data.conditions,
                                                getWorkflowVariableListForNode(
                                                    draft,
                                                    edge.target
                                                )
                                            )
                                        return edge
                                    }
                                    return edge
                                }),
                        ]
                    }
                })
            )

        case 'DELETE_BRANCH': {
            const nextGraph = deleteBranch(graph, action.nodeId, {
                keepIncomingEdge: true,
            })
            return computeNodesPositions(
                produce(nextGraph, (draft) => {
                    const incomingEdge = draft.edges.find(
                        (e) => e.target === action.nodeId
                    )
                    if (!incomingEdge) return
                    const endNode = buildEndNode()
                    draft.nodes.push(endNode)
                    incomingEdge.target = endNode.id
                })
            )
        }
        case 'GREY_OUT_BRANCH': {
            return greyOutBranch(graph, action.nodeId, action.isGreyedOut)
        }
    }
}

function insertNodeBefore(
    graph: VisualBuilderGraph,
    nodeToInsert: VisualBuilderNode,
    beforeNodeId: string
) {
    return produce(graph, (draft) => {
        const edge = draft.edges.find((e) => e.target === beforeNodeId)
        if (!edge) return
        draft.nodes.push(nodeToInsert)
        edge.target = nodeToInsert.id
        const newEdge = {
            ...buildEdgeCommonProperties(),
            source: nodeToInsert.id,
            target: beforeNodeId,
        }
        draft.edges.push(newEdge)
    })
}

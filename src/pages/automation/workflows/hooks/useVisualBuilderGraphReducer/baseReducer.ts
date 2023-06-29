import {produce} from 'immer'

import {MessageContent} from 'pages/automation/workflows/models/workflowConfiguration.types'
import {buildEdgeCommonProperties} from 'pages/automation/workflows/models/visualBuilderGraph.model'

import {
    AutomatedMessageNodeType,
    FileUploadNodeType,
    TextReplyNodeType,
    TriggerButtonNodeType,
    VisualBuilderGraph,
    VisualBuilderNode,
} from '../../models/visualBuilderGraph.types'
import {
    buildAutomatedMessageNode,
    buildEndNode,
    buildFileUploadNode,
    buildTextReplyNode,
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
          type: 'INSERT_AUTOMATED_MESSAGE_NODE'
          beforeNodeId: string
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
            return action.graph
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
                const {html, text, attachments} = action.content
                if (node) {
                    node.data.content.html = html
                    node.data.content.text = text
                    node.data.content.attachments = attachments
                }
            })
        case 'SET_TEXT_REPLY_CONTENT':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is TextReplyNodeType =>
                        n.id === action.textReplyNodeId &&
                        n.type === 'text_reply'
                )
                const {html, text, attachments} = action.content
                if (node) {
                    node.data.content.html = html
                    node.data.content.text = text
                    node.data.content.attachments = attachments
                }
            })
        case 'SET_FILE_UPLOAD_CONTENT':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is FileUploadNodeType =>
                        n.id === action.fileUploadNodeId &&
                        n.type === 'file_upload'
                )
                const {html, text, attachments} = action.content
                if (node) {
                    node.data.content.html = html
                    node.data.content.text = text
                    node.data.content.attachments = attachments
                }
            })
        case 'INSERT_AUTOMATED_MESSAGE_NODE':
            return insertNodeBefore(
                graph,
                buildAutomatedMessageNode(),
                action.beforeNodeId
            )
        case 'INSERT_TEXT_REPLY_NODE':
            return insertNodeBefore(
                graph,
                buildTextReplyNode(),
                action.beforeNodeId
            )
        case 'INSERT_FILE_UPLOAD_NODE':
            return insertNodeBefore(
                graph,
                buildFileUploadNode(),
                action.beforeNodeId
            )
        case 'DELETE_NODE':
            return produce(graph, (draft) => {
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
                        ...draft.edges.filter(
                            (e) => e.source !== action.nodeId
                        ),
                    ]
                }
            })

        case 'DELETE_BRANCH': {
            const nextGraph = deleteBranch(graph, action.nodeId, {
                keepIncomingEdge: true,
            })
            return produce(nextGraph, (draft) => {
                const incomingEdge = draft.edges.find(
                    (e) => e.target === action.nodeId
                )
                if (!incomingEdge) return
                const endNode = buildEndNode()
                draft.nodes.push(endNode)
                incomingEdge.target = endNode.id
            })
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

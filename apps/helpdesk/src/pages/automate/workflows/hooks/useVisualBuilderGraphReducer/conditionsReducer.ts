import { produce } from 'immer'

import type { ConditionsSchema } from '../../models/conditions.types'
import { buildEdgeCommonProperties } from '../../models/visualBuilderGraph.model'
import type {
    ConditionsNodeType,
    VisualBuilderEdge,
    VisualBuilderGraph,
} from '../../models/visualBuilderGraph.types'
import {
    buildConditionsNode,
    buildEndNode,
    computeNodesPositions,
    deleteBranch,
} from './utils'

export type VisualBuilderConditionsAction =
    | {
          type: 'INSERT_CONDITIONS_NODE'
          beforeNodeId: string
      }
    | {
          type: 'ADD_CONDITIONS_NODE_BRANCH'
          conditionNodeId: string
          edgeId: string
      }
    | {
          type: 'DELETE_CONDITIONS_NODE_BRANCH'
          edgeId: string
      }
    | {
          type: 'UPDATE_CONDITIONS_NODE_NAME'
          nodeId: string
          name: ConditionsNodeType['data']['name']
      }
    | {
          type: 'UPDATE_CONDITIONS_NODE_BRANCH'
          nodeId: string
          data: {
              conditions?: ConditionsSchema | null
              name?: string | null
          }
      }
    | {
          type: 'REORDER_CONDITIONS_NODE_BRANCHES'
          nodeId: string
          newOrder: string[]
      }

// bridge between type system and runtime
// allow to keep a type safe list of all action types for this reducer
type ActionTypes = {
    [K in VisualBuilderConditionsAction['type']]: true
}
const visualBuilderConditionAction: ActionTypes = {
    INSERT_CONDITIONS_NODE: true,
    ADD_CONDITIONS_NODE_BRANCH: true,
    REORDER_CONDITIONS_NODE_BRANCHES: true,
    UPDATE_CONDITIONS_NODE_BRANCH: true,
    DELETE_CONDITIONS_NODE_BRANCH: true,
    UPDATE_CONDITIONS_NODE_NAME: true,
}

export function isVisualBuilderConditionAction(action: {
    type: string
}): action is VisualBuilderConditionsAction {
    return Object.keys(visualBuilderConditionAction).includes(action.type)
}

export function conditionsReducer(
    graph: VisualBuilderGraph,
    action: VisualBuilderConditionsAction,
): VisualBuilderGraph {
    switch (action.type) {
        case 'INSERT_CONDITIONS_NODE':
            return computeNodesPositions(
                insertCondition(graph, action.beforeNodeId),
            )
        case 'ADD_CONDITIONS_NODE_BRANCH':
            return computeNodesPositions(
                addConditionBranch(
                    graph,
                    action.conditionNodeId,
                    action.edgeId,
                ),
            )
        case 'DELETE_CONDITIONS_NODE_BRANCH': {
            const childNodeId = graph.edges.find(
                (e) => e.id === action.edgeId,
            )?.target

            if (childNodeId) {
                return computeNodesPositions(deleteBranch(graph, childNodeId))
            }

            return computeNodesPositions(graph)
        }
        case 'REORDER_CONDITIONS_NODE_BRANCHES':
            return computeNodesPositions(
                reorderBranches(graph, action.nodeId, action.newOrder),
            )
        case 'UPDATE_CONDITIONS_NODE_BRANCH':
            return computeNodesPositions(
                produce(graph, (draft) => {
                    const edge = draft.edges.find((e) => e.id === action.nodeId)
                    if (edge) {
                        edge.data = { ...edge.data, ...action.data }
                    }
                }),
            )
        case 'UPDATE_CONDITIONS_NODE_NAME':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is ConditionsNodeType => n.id === action.nodeId,
                )
                if (node) {
                    node.data.name = action.name
                }
            })
        default:
            return graph
    }
}

function insertCondition(graph: VisualBuilderGraph, beforeNodeId: string) {
    const triggerNode = graph.nodes[0]

    return produce(graph, (draft) => {
        const edge = draft.edges.find((e) => e.target === beforeNodeId)
        if (!edge) return
        const conditionsNode = buildConditionsNode()
        const endNode = buildEndNode(
            triggerNode.type === 'channel_trigger'
                ? 'ask-for-feedback'
                : 'end-failure',
        )

        const targetNode = draft.nodes.find((node) => node.id === beforeNodeId)

        if (
            targetNode?.type === 'end' &&
            targetNode.data.action === 'end-failure'
        ) {
            targetNode.data.action = 'end-success'
        }

        draft.nodes.push(conditionsNode, endNode)
        edge.target = conditionsNode.id
        draft.edges.push(
            {
                ...buildEdgeCommonProperties(),
                source: conditionsNode.id,
                target: beforeNodeId,
                data: {
                    name: 'Branch 1',
                    conditions: {
                        and: [],
                    },
                },
            },
            {
                ...buildEdgeCommonProperties(),
                source: conditionsNode.id,
                target: endNode.id,
                data: {
                    name: 'Fallback',
                },
            },
        )
        draft.nodeEditingId = conditionsNode.id
        draft.choiceEventIdEditing = null
        draft.branchIdsEditing = []
    })
}

function reorderBranches(
    graph: VisualBuilderGraph,
    conditionNodeId: string,
    newOrder: string[],
) {
    return produce(graph, (draft) => {
        const branches = draft.edges.filter(
            (edge) => edge.source === conditionNodeId,
        )

        const fallback = branches.pop()
        if (!fallback) return
        const newBranches = newOrder
            .map((id) => branches.find((e) => e.id === id))
            .filter(
                (
                    edge: VisualBuilderEdge | undefined,
                ): edge is VisualBuilderEdge => Boolean(edge),
            )

        draft.edges = draft.edges.filter(
            (edge) => edge.source !== conditionNodeId,
        )
        draft.edges = draft.edges.concat(newBranches, fallback)
    })
}

function addConditionBranch(
    graph: VisualBuilderGraph,
    conditionNodeId: string,
    edgeId: string,
) {
    const triggerNode = graph.nodes[0]

    return produce(graph, (draft) => {
        const node = draft.nodes.find((node) => node.id === conditionNodeId)
        if (!node) return

        draft.nodes.push(
            buildEndNode(
                triggerNode.type === 'channel_trigger'
                    ? 'ask-for-feedback'
                    : 'end-success',
            ),
        )
        const edges = draft.edges.filter(
            (edge) => edge.source === conditionNodeId,
        )

        const fallback = edges.pop()

        edges.push({
            ...buildEdgeCommonProperties(),
            id: edgeId,
            source: conditionNodeId,
            target: draft.nodes[draft.nodes.length - 1].id,
            data: {
                name: `Branch ${
                    draft.edges.filter(
                        (edge) => edge.source === conditionNodeId,
                    ).length
                }`,
                conditions: {
                    and: [],
                },
            },
        })

        if (!fallback) return

        const newBranches = [...edges, fallback]

        draft.edges = draft.edges.filter(
            (edge) => edge.source !== conditionNodeId,
        )

        draft.edges = draft.edges.concat(newBranches)
    })
}

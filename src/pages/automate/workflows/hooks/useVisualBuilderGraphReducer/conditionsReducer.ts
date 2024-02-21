import {produce} from 'immer'

import {VisualBuilderGraph} from '../../models/visualBuilderGraph.types'
import {buildEdgeCommonProperties} from '../../models/visualBuilderGraph.model'
import {buildConditionsNode, buildEndNode, computeNodesPositions} from './utils'

export type VisualBuilderConditionsAction =
    | {
          type: 'INSERT_CONDITIONS_NODE'
          beforeNodeId: string
      }
    | {
          type: 'ADD_CONDITION_BRANCH'
          conditionNodeId: string
      }

// bridge between type system and runtime
// allow to keep a type safe list of all action types for this reducer
type ActionTypes = {
    [K in VisualBuilderConditionsAction['type']]: true
}
const visualBuilderConditionAction: ActionTypes = {
    INSERT_CONDITIONS_NODE: true,
    ADD_CONDITION_BRANCH: true,
}

export function isVisualBuilderConditionAction(action: {
    type: string
}): action is VisualBuilderConditionsAction {
    return Object.keys(visualBuilderConditionAction).includes(action.type)
}

export function conditionsReducer(
    graph: VisualBuilderGraph,
    action: VisualBuilderConditionsAction
): VisualBuilderGraph {
    switch (action.type) {
        case 'INSERT_CONDITIONS_NODE':
            return computeNodesPositions(
                insertCondition(graph, action.beforeNodeId)
            )
        default:
            return graph
    }
}

function insertCondition(graph: VisualBuilderGraph, beforeEndNodeId: string) {
    return produce(graph, (draft) => {
        const edge = draft.edges.find((e) => e.target === beforeEndNodeId)
        if (!edge) return
        const conditionsNode = buildConditionsNode()
        const endNode = buildEndNode()
        draft.nodes.push(conditionsNode, endNode)
        edge.target = conditionsNode.id
        draft.edges.push(
            {
                ...buildEdgeCommonProperties(),
                source: conditionsNode.id,
                target: beforeEndNodeId,
                data: {
                    name: 'Branch 1',
                },
            },
            {
                ...buildEdgeCommonProperties(),
                source: conditionsNode.id,
                target: endNode.id,
                data: {
                    name: 'Fallback',
                },
            }
        )
    })
}

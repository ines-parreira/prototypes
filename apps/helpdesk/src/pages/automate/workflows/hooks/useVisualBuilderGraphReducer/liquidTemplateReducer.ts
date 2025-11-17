import { produce } from 'immer'

import type {
    LiquidTemplateNodeType,
    VisualBuilderGraph,
} from '../../models/visualBuilderGraph.types'
import { insertNodeBefore } from './baseReducer'
import { buildLiquidTemplateNode, computeNodesPositions } from './utils'

export type VisualBuilderLiquidTemplateAction =
    | {
          type: 'INSERT_LIQUID_TEMPLATE_NODE'
          beforeNodeId: string
      }
    | {
          type: 'SET_LIQUID_TEMPLATE_EXPRESSION'
          liquidTemplateNodeId: string
          template: string
      }
    | {
          type: 'SET_LIQUID_TEMPLATE_OUTPUT_DATA_TYPE'
          liquidTemplateNodeId: string
          data_type: 'string' | 'number' | 'boolean' | 'date'
      }
    | {
          type: 'SET_LIQUID_TEMPLATE_NAME'
          liquidTemplateNodeId: string
          name: string
      }

type ActionTypes = {
    [K in VisualBuilderLiquidTemplateAction['type']]: true
}
const visualBuilderLiquidTemplateActionTypes: ActionTypes = {
    INSERT_LIQUID_TEMPLATE_NODE: true,
    SET_LIQUID_TEMPLATE_EXPRESSION: true,
    SET_LIQUID_TEMPLATE_OUTPUT_DATA_TYPE: true,
    SET_LIQUID_TEMPLATE_NAME: true,
}

export function isVisualBuilderLiquidTemplateAction(action: {
    type: string
}): action is VisualBuilderLiquidTemplateAction {
    return Object.keys(visualBuilderLiquidTemplateActionTypes).includes(
        action.type,
    )
}

export function liquidTemplateReducer(
    graph: VisualBuilderGraph,
    action: VisualBuilderLiquidTemplateAction,
): VisualBuilderGraph {
    switch (action.type) {
        case 'INSERT_LIQUID_TEMPLATE_NODE':
            return computeNodesPositions(
                insertNodeBefore(
                    graph,
                    buildLiquidTemplateNode(),
                    action.beforeNodeId,
                ),
            )
        case 'SET_LIQUID_TEMPLATE_EXPRESSION':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is LiquidTemplateNodeType =>
                        n.id === action.liquidTemplateNodeId &&
                        n.type === 'liquid_template',
                )
                if (node) {
                    node.data.template = action.template
                }
            })
        case 'SET_LIQUID_TEMPLATE_OUTPUT_DATA_TYPE':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is LiquidTemplateNodeType =>
                        n.id === action.liquidTemplateNodeId &&
                        n.type === 'liquid_template',
                )
                if (node) {
                    node.data.output.data_type = action.data_type
                }
            })
        case 'SET_LIQUID_TEMPLATE_NAME':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is LiquidTemplateNodeType =>
                        n.id === action.liquidTemplateNodeId &&
                        n.type === 'liquid_template',
                )
                if (node) {
                    node.data.name = action.name
                }
            })
    }
}

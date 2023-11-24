import {useReducer} from 'react'

import {VisualBuilderGraph} from '../../models/visualBuilderGraph.types'
import {VisualBuilderBaseAction, baseReducer} from './baseReducer'
import {
    VisualBuilderChoicesAction,
    isVisualBuilderChoiceAction,
    choicesReducer,
} from './choicesReducer'

export type VisualBuilderGraphAction =
    | VisualBuilderBaseAction
    | VisualBuilderChoicesAction

export function useVisualBuilderGraphReducer(initialState: VisualBuilderGraph) {
    return useReducer(reducer, initialState)
}

export function reducer(
    graph: VisualBuilderGraph,
    action: VisualBuilderGraphAction
): VisualBuilderGraph {
    if (isVisualBuilderChoiceAction(action)) {
        return choicesReducer(graph, action)
    }
    return baseReducer(graph, action)
}

import {useReducer} from 'react'

import {VisualBuilderGraph} from '../../models/visualBuilderGraph.types'
import {VisualBuilderBaseAction, baseReducer} from './baseReducer'
import {
    VisualBuilderChoicesAction,
    isVisualBuilderChoiceAction,
    choicesReducer,
} from './choicesReducer'
import {
    VisualBuilderHttpRequestAction,
    isVisualBuilderHttpRequestAction,
    httpRequestReducer,
} from './httpRequestReducer'

export type VisualBuilderGraphAction =
    | VisualBuilderBaseAction
    | VisualBuilderChoicesAction
    | VisualBuilderHttpRequestAction

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
    if (isVisualBuilderHttpRequestAction(action)) {
        return httpRequestReducer(graph, action)
    }
    return baseReducer(graph, action)
}

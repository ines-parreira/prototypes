import {useReducer} from 'react'

import {VisualBuilderGraph} from '../../models/visualBuilderGraph.types'
import {VisualBuilderBaseAction, baseReducer} from './baseReducer'
import {
    VisualBuilderChoicesAction,
    isVisualBuilderChoiceAction,
    choicesReducer,
} from './choicesReducer'
import {
    conditionsReducer,
    isVisualBuilderConditionAction,
    VisualBuilderConditionsAction,
} from './conditionsReducer'
import {
    VisualBuilderHttpRequestAction,
    isVisualBuilderHttpRequestAction,
    httpRequestReducer,
} from './httpRequestReducer'
import {
    isVisualBuilderLLMPromptTriggerAction,
    llmPromptTriggerReducer,
    VisualBuilderLLMPromptTriggerAction,
} from './llmPromptTriggerReducer'

export type VisualBuilderGraphAction =
    | VisualBuilderBaseAction
    | VisualBuilderChoicesAction
    | VisualBuilderHttpRequestAction
    | VisualBuilderConditionsAction
    | VisualBuilderLLMPromptTriggerAction

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
    if (isVisualBuilderConditionAction(action)) {
        return conditionsReducer(graph, action)
    }
    if (isVisualBuilderLLMPromptTriggerAction(action)) {
        return llmPromptTriggerReducer(graph, action)
    }
    return baseReducer(graph, action)
}

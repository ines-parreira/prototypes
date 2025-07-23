import { useReducer } from 'react'

import {
    VisualBuilderGraph,
    VisualBuilderTriggerNode,
} from 'pages/automate/workflows/models/visualBuilderGraph.types'

import { baseReducer, VisualBuilderBaseAction } from './baseReducer'
import {
    choicesReducer,
    isVisualBuilderChoiceAction,
    VisualBuilderChoicesAction,
} from './choicesReducer'
import {
    conditionsReducer,
    isVisualBuilderConditionAction,
    VisualBuilderConditionsAction,
} from './conditionsReducer'
import {
    httpRequestReducer,
    isVisualBuilderHttpRequestAction,
    VisualBuilderHttpRequestAction,
} from './httpRequestReducer'
import {
    isVisualBuilderLiquidTemplateAction,
    liquidTemplateReducer,
    VisualBuilderLiquidTemplateAction,
} from './liquidTemplateReducer'
import {
    isVisualBuilderLLMPromptTriggerAction,
    llmPromptTriggerReducer,
    VisualBuilderLLMPromptTriggerAction,
} from './llmPromptTriggerReducer'
import {
    isVisualBuilderReusableLLMPromptCallAction,
    reusableLLMPromptCallReducer,
    VisualBuilderReusableLLMPromptCallAction,
} from './reusableLLMPromptCallReducer'
import {
    isVisualBuilderReusableLLMPromptTriggerAction,
    reusableLLMPromptTriggerReducer,
    VisualBuilderReusableLLMPromptTriggerAction,
} from './reusableLLMPromptTriggerReducer'

export type VisualBuilderGraphAction =
    | VisualBuilderBaseAction
    | VisualBuilderChoicesAction
    | VisualBuilderHttpRequestAction
    | VisualBuilderConditionsAction
    | VisualBuilderLLMPromptTriggerAction
    | VisualBuilderReusableLLMPromptTriggerAction
    | VisualBuilderReusableLLMPromptCallAction
    | VisualBuilderLiquidTemplateAction

export function useVisualBuilderGraphReducer<
    T extends VisualBuilderTriggerNode = VisualBuilderTriggerNode,
>(initialState: VisualBuilderGraph<T>) {
    return useReducer<typeof reducer<T>>(reducer, initialState)
}

export function reducer<
    T extends VisualBuilderTriggerNode = VisualBuilderTriggerNode,
>(
    graph: VisualBuilderGraph<T>,
    action: VisualBuilderGraphAction,
): VisualBuilderGraph<T> {
    if (isVisualBuilderChoiceAction(action)) {
        return choicesReducer(graph, action) as VisualBuilderGraph<T>
    }
    if (isVisualBuilderHttpRequestAction(action)) {
        return httpRequestReducer(graph, action) as VisualBuilderGraph<T>
    }
    if (isVisualBuilderLiquidTemplateAction(action)) {
        return liquidTemplateReducer(graph, action) as VisualBuilderGraph<T>
    }
    if (isVisualBuilderConditionAction(action)) {
        return conditionsReducer(graph, action) as VisualBuilderGraph<T>
    }
    if (isVisualBuilderLLMPromptTriggerAction(action)) {
        return llmPromptTriggerReducer(graph, action) as VisualBuilderGraph<T>
    }
    if (isVisualBuilderReusableLLMPromptTriggerAction(action)) {
        return reusableLLMPromptTriggerReducer(
            graph,
            action,
        ) as VisualBuilderGraph<T>
    }
    if (isVisualBuilderReusableLLMPromptCallAction(action)) {
        return reusableLLMPromptCallReducer(
            graph,
            action,
        ) as VisualBuilderGraph<T>
    }
    return baseReducer(graph, action) as VisualBuilderGraph<T>
}

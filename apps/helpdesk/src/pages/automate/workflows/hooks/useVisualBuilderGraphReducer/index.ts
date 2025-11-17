import { useReducer } from 'react'

import type {
    VisualBuilderGraph,
    VisualBuilderTriggerNode,
} from 'pages/automate/workflows/models/visualBuilderGraph.types'

import type { VisualBuilderBaseAction } from './baseReducer'
import { baseReducer } from './baseReducer'
import type { VisualBuilderChoicesAction } from './choicesReducer'
import { choicesReducer, isVisualBuilderChoiceAction } from './choicesReducer'
import type { VisualBuilderConditionsAction } from './conditionsReducer'
import {
    conditionsReducer,
    isVisualBuilderConditionAction,
} from './conditionsReducer'
import type { VisualBuilderHttpRequestAction } from './httpRequestReducer'
import {
    httpRequestReducer,
    isVisualBuilderHttpRequestAction,
} from './httpRequestReducer'
import type { VisualBuilderLiquidTemplateAction } from './liquidTemplateReducer'
import {
    isVisualBuilderLiquidTemplateAction,
    liquidTemplateReducer,
} from './liquidTemplateReducer'
import type { VisualBuilderLLMPromptTriggerAction } from './llmPromptTriggerReducer'
import {
    isVisualBuilderLLMPromptTriggerAction,
    llmPromptTriggerReducer,
} from './llmPromptTriggerReducer'
import type { VisualBuilderReusableLLMPromptCallAction } from './reusableLLMPromptCallReducer'
import {
    isVisualBuilderReusableLLMPromptCallAction,
    reusableLLMPromptCallReducer,
} from './reusableLLMPromptCallReducer'
import type { VisualBuilderReusableLLMPromptTriggerAction } from './reusableLLMPromptTriggerReducer'
import {
    isVisualBuilderReusableLLMPromptTriggerAction,
    reusableLLMPromptTriggerReducer,
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

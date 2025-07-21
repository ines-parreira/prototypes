import { produce } from 'immer'
import { ulid } from 'ulidx'

import {
    isReusableLLMPromptTriggerNodeType,
    ReusableLLMPromptTriggerNodeType,
    VisualBuilderGraph,
} from '../../models/visualBuilderGraph.types'

export type VisualBuilderReusableLLMPromptTriggerAction =
    | {
          type: 'SET_REUSABLE_LLM_PROMPT_TRIGGER_REQUIRES_CONFIRMATION'
          requiresConfirmation: boolean
      }
    | {
          type: 'ADD_REUSABLE_LLM_PROMPT_TRIGGER_INPUT'
      }
    | {
          type: 'DELETE_REUSABLE_LLM_PROMPT_TRIGGER_INPUT'
          id: ReusableLLMPromptTriggerNodeType['data']['inputs'][number]['id']
      }
    | {
          type: 'SET_REUSABLE_LLM_PROMPT_TRIGGER_INPUT'
          input: ReusableLLMPromptTriggerNodeType['data']['inputs'][number]
      }
    | {
          type: 'SET_REUSABLE_LLM_PROMPT_TRIGGER_CONDITIONS_TYPE'
          conditionsType: ReusableLLMPromptTriggerNodeType['data']['conditionsType']
      }
    | {
          type: 'DELETE_REUSABLE_LLM_PROMPT_TRIGGER_CONDITION'
          index: number
      }
    | {
          type: 'ADD_REUSABLE_LLM_PROMPT_TRIGGER_CONDITION'
          condition: ReusableLLMPromptTriggerNodeType['data']['conditions'][number]
      }
    | {
          type: 'SET_REUSABLE_LLM_PROMPT_TRIGGER_CONDITION'
          index: number
          condition: ReusableLLMPromptTriggerNodeType['data']['conditions'][number]
      }

// bridge between type system and runtime
// allow to keep a type safe list of all action types for this reducer
type ActionTypes = {
    [K in VisualBuilderReusableLLMPromptTriggerAction['type']]: true
}
const visualBuilderReusableLLMPromptTriggerActionTypes: ActionTypes = {
    SET_REUSABLE_LLM_PROMPT_TRIGGER_REQUIRES_CONFIRMATION: true,
    ADD_REUSABLE_LLM_PROMPT_TRIGGER_INPUT: true,
    DELETE_REUSABLE_LLM_PROMPT_TRIGGER_INPUT: true,
    SET_REUSABLE_LLM_PROMPT_TRIGGER_INPUT: true,
    SET_REUSABLE_LLM_PROMPT_TRIGGER_CONDITIONS_TYPE: true,
    DELETE_REUSABLE_LLM_PROMPT_TRIGGER_CONDITION: true,
    ADD_REUSABLE_LLM_PROMPT_TRIGGER_CONDITION: true,
    SET_REUSABLE_LLM_PROMPT_TRIGGER_CONDITION: true,
}

export function isVisualBuilderReusableLLMPromptTriggerAction(action: {
    type: string
}): action is VisualBuilderReusableLLMPromptTriggerAction {
    return Object.keys(
        visualBuilderReusableLLMPromptTriggerActionTypes,
    ).includes(action.type)
}

export function reusableLLMPromptTriggerReducer(
    graph: VisualBuilderGraph,
    action: VisualBuilderReusableLLMPromptTriggerAction,
): VisualBuilderGraph {
    switch (action.type) {
        case 'SET_REUSABLE_LLM_PROMPT_TRIGGER_REQUIRES_CONFIRMATION':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    isReusableLLMPromptTriggerNodeType,
                )

                if (node) {
                    node.data.requires_confirmation =
                        action.requiresConfirmation
                }
            })
        case 'ADD_REUSABLE_LLM_PROMPT_TRIGGER_INPUT':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    isReusableLLMPromptTriggerNodeType,
                )

                if (node) {
                    node.data.inputs.push({
                        id: ulid(),
                        name: '',
                        instructions: '',
                        data_type: 'string',
                    })
                }
            })
        case 'DELETE_REUSABLE_LLM_PROMPT_TRIGGER_INPUT':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    isReusableLLMPromptTriggerNodeType,
                )

                if (node) {
                    const index = node.data.inputs.findIndex(
                        (input) => input.id === action.id,
                    )

                    if (index !== -1) {
                        node.data.inputs.splice(index, 1)
                    }
                }
            })
        case 'SET_REUSABLE_LLM_PROMPT_TRIGGER_INPUT':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    isReusableLLMPromptTriggerNodeType,
                )

                if (node) {
                    const index = node.data.inputs.findIndex(
                        (input) => input.id === action.input.id,
                    )

                    if (index !== -1) {
                        node.data.inputs[index] = action.input
                    }
                }
            })
        case 'SET_REUSABLE_LLM_PROMPT_TRIGGER_CONDITIONS_TYPE':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    isReusableLLMPromptTriggerNodeType,
                )

                if (node) {
                    node.data.conditionsType = action.conditionsType

                    if (!action.conditionsType) {
                        node.data.conditions = []
                    }
                }
            })
        case 'DELETE_REUSABLE_LLM_PROMPT_TRIGGER_CONDITION':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    isReusableLLMPromptTriggerNodeType,
                )

                if (node) {
                    node.data.conditions.splice(action.index, 1)
                }
            })
        case 'ADD_REUSABLE_LLM_PROMPT_TRIGGER_CONDITION':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    isReusableLLMPromptTriggerNodeType,
                )

                if (node) {
                    node.data.conditions.push(action.condition)
                }
            })
        case 'SET_REUSABLE_LLM_PROMPT_TRIGGER_CONDITION':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    isReusableLLMPromptTriggerNodeType,
                )

                if (node) {
                    node.data.conditions[action.index] = action.condition
                }
            })
    }
}

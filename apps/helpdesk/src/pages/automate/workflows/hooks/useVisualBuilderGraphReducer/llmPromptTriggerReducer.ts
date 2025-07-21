import { produce } from 'immer'
import { ulid } from 'ulidx'

import {
    isLLMPromptTriggerNodeType,
    LLMPromptTriggerNodeType,
    VisualBuilderGraph,
} from '../../models/visualBuilderGraph.types'

export type VisualBuilderLLMPromptTriggerAction =
    | {
          type: 'SET_LLM_PROMPT_TRIGGER_INSTRUCTIONS'
          instructions: string
      }
    | {
          type: 'SET_LLM_PROMPT_TRIGGER_REQUIRES_CONFIRMATION'
          requiresConfirmation: boolean
      }
    | {
          type: 'ADD_LLM_PROMPT_TRIGGER_INPUT'
      }
    | {
          type: 'DELETE_LLM_PROMPT_TRIGGER_INPUT'
          id: LLMPromptTriggerNodeType['data']['inputs'][number]['id']
      }
    | {
          type: 'SET_LLM_PROMPT_TRIGGER_INPUT'
          input: LLMPromptTriggerNodeType['data']['inputs'][number]
      }
    | {
          type: 'SET_LLM_PROMPT_TRIGGER_CONDITIONS_TYPE'
          conditionsType: LLMPromptTriggerNodeType['data']['conditionsType']
      }
    | {
          type: 'DELETE_LLM_PROMPT_TRIGGER_CONDITION'
          index: number
      }
    | {
          type: 'ADD_LLM_PROMPT_TRIGGER_CONDITION'
          condition: LLMPromptTriggerNodeType['data']['conditions'][number]
      }
    | {
          type: 'SET_LLM_PROMPT_TRIGGER_CONDITION'
          index: number
          condition: LLMPromptTriggerNodeType['data']['conditions'][number]
      }
    | {
          type: 'SET_LLM_PROMPT_TRIGGER_DEACTIVATED_DATETIME'
          deactivated_datetime: string | null
      }

// bridge between type system and runtime
// allow to keep a type safe list of all action types for this reducer
type ActionTypes = {
    [K in VisualBuilderLLMPromptTriggerAction['type']]: true
}
const visualBuilderLLMPromptTriggerActionTypes: ActionTypes = {
    SET_LLM_PROMPT_TRIGGER_INSTRUCTIONS: true,
    SET_LLM_PROMPT_TRIGGER_REQUIRES_CONFIRMATION: true,
    ADD_LLM_PROMPT_TRIGGER_INPUT: true,
    DELETE_LLM_PROMPT_TRIGGER_INPUT: true,
    SET_LLM_PROMPT_TRIGGER_INPUT: true,
    SET_LLM_PROMPT_TRIGGER_CONDITIONS_TYPE: true,
    DELETE_LLM_PROMPT_TRIGGER_CONDITION: true,
    ADD_LLM_PROMPT_TRIGGER_CONDITION: true,
    SET_LLM_PROMPT_TRIGGER_CONDITION: true,
    SET_LLM_PROMPT_TRIGGER_DEACTIVATED_DATETIME: true,
}

export function isVisualBuilderLLMPromptTriggerAction(action: {
    type: string
}): action is VisualBuilderLLMPromptTriggerAction {
    return Object.keys(visualBuilderLLMPromptTriggerActionTypes).includes(
        action.type,
    )
}

export function llmPromptTriggerReducer(
    graph: VisualBuilderGraph,
    action: VisualBuilderLLMPromptTriggerAction,
): VisualBuilderGraph {
    switch (action.type) {
        case 'SET_LLM_PROMPT_TRIGGER_INSTRUCTIONS':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(isLLMPromptTriggerNodeType)

                if (node) {
                    node.data.instructions = action.instructions
                }
            })
        case 'SET_LLM_PROMPT_TRIGGER_REQUIRES_CONFIRMATION':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(isLLMPromptTriggerNodeType)

                if (node) {
                    node.data.requires_confirmation =
                        action.requiresConfirmation
                }
            })
        case 'ADD_LLM_PROMPT_TRIGGER_INPUT':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(isLLMPromptTriggerNodeType)

                if (node) {
                    node.data.inputs.push({
                        id: ulid(),
                        name: '',
                        instructions: '',
                        data_type: 'string',
                    })
                }
            })
        case 'DELETE_LLM_PROMPT_TRIGGER_INPUT':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(isLLMPromptTriggerNodeType)

                if (node) {
                    const index = node.data.inputs.findIndex(
                        (input) => input.id === action.id,
                    )

                    if (index !== -1) {
                        node.data.inputs.splice(index, 1)
                    }
                }
            })
        case 'SET_LLM_PROMPT_TRIGGER_INPUT':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(isLLMPromptTriggerNodeType)

                if (node) {
                    const index = node.data.inputs.findIndex(
                        (input) => input.id === action.input.id,
                    )

                    if (index !== -1) {
                        node.data.inputs[index] = action.input
                    }
                }
            })
        case 'SET_LLM_PROMPT_TRIGGER_CONDITIONS_TYPE':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(isLLMPromptTriggerNodeType)

                if (node) {
                    node.data.conditionsType = action.conditionsType

                    if (!action.conditionsType) {
                        node.data.conditions = []
                    }
                }
            })
        case 'DELETE_LLM_PROMPT_TRIGGER_CONDITION':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(isLLMPromptTriggerNodeType)

                if (node) {
                    node.data.conditions.splice(action.index, 1)
                }
            })
        case 'ADD_LLM_PROMPT_TRIGGER_CONDITION':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(isLLMPromptTriggerNodeType)

                if (node) {
                    node.data.conditions.push(action.condition)
                }
            })
        case 'SET_LLM_PROMPT_TRIGGER_CONDITION':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(isLLMPromptTriggerNodeType)

                if (node) {
                    node.data.conditions[action.index] = action.condition
                }
            })
        case 'SET_LLM_PROMPT_TRIGGER_DEACTIVATED_DATETIME':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(isLLMPromptTriggerNodeType)

                if (node) {
                    node.data.deactivated_datetime = action.deactivated_datetime
                }
            })
    }
}

import type {
    LLMPromptTriggerNodeType,
    VisualBuilderGraph,
} from 'pages/automate/workflows/models/visualBuilderGraph.types'

import { visualBuilderGraphLlmPromptTriggerFixture } from 'pages/automate/workflows/tests/visualBuilderGraph.fixtures'

import { llmPromptTriggerReducer } from '../llmPromptTriggerReducer'

describe('llmPromptTriggerReducer', () => {
    test('ADD_LLM_PROMPT_TRIGGER_INPUT', () => {
        const g = visualBuilderGraphLlmPromptTriggerFixture
        const nextG = llmPromptTriggerReducer(g, {
            type: 'ADD_LLM_PROMPT_TRIGGER_INPUT',
        })

        expect(
            nextG.nodes.find((node) => node.type === 'llm_prompt_trigger')
                ?.data,
        ).toEqual(
            expect.objectContaining({
                inputs: [
                    {
                        id: 'someid',
                        name: 'some name',
                        instructions: 'some instructions',
                        data_type: 'string',
                    },
                    {
                        id: expect.any(String),
                        name: '',
                        instructions: '',
                        data_type: 'string',
                    },
                ],
            }),
        )
    })

    test('DELETE_LLM_PROMPT_TRIGGER_INPUT', () => {
        const g = visualBuilderGraphLlmPromptTriggerFixture
        const nextG = llmPromptTriggerReducer(g, {
            type: 'DELETE_LLM_PROMPT_TRIGGER_INPUT',
            id: 'someid',
        })

        expect(
            nextG.nodes.find((node) => node.type === 'llm_prompt_trigger')
                ?.data,
        ).toEqual(
            expect.objectContaining({
                inputs: [],
            }),
        )
    })

    test('SET_LLM_PROMPT_TRIGGER_INPUT', () => {
        const g = visualBuilderGraphLlmPromptTriggerFixture
        const nextG = llmPromptTriggerReducer(g, {
            type: 'SET_LLM_PROMPT_TRIGGER_INPUT',
            input: {
                id: 'someid',
                name: 'some name',
                instructions: 'some instructions',
                data_type: 'number',
            },
        })

        expect(
            nextG.nodes.find((node) => node.type === 'llm_prompt_trigger')
                ?.data,
        ).toEqual(
            expect.objectContaining({
                inputs: [
                    {
                        id: 'someid',
                        name: 'some name',
                        instructions: 'some instructions',
                        data_type: 'number',
                    },
                ],
            }),
        )
    })

    test('SET_LLM_PROMPT_TRIGGER_CONDITIONS replaces the conditions array on the trigger node', () => {
        const g = visualBuilderGraphLlmPromptTriggerFixture
        const conditions = [
            { equals: [{ var: 'name' }, 'Alice'] },
            { exists: [{ var: 'email' }] },
        ] as unknown as LLMPromptTriggerNodeType['data']['conditions']

        const nextG = llmPromptTriggerReducer(g, {
            type: 'SET_LLM_PROMPT_TRIGGER_CONDITIONS',
            conditions,
        })

        expect(
            nextG.nodes.find((node) => node.type === 'llm_prompt_trigger')
                ?.data,
        ).toEqual(
            expect.objectContaining({
                conditions,
            }),
        )
    })

    test('SET_LLM_PROMPT_TRIGGER_CONDITIONS leaves the graph untouched when no trigger node exists', () => {
        const graphWithoutTrigger = {
            ...visualBuilderGraphLlmPromptTriggerFixture,
            nodes: visualBuilderGraphLlmPromptTriggerFixture.nodes.filter(
                (node) => node.type !== 'llm_prompt_trigger',
            ),
        } as unknown as VisualBuilderGraph

        const nextG = llmPromptTriggerReducer(graphWithoutTrigger, {
            type: 'SET_LLM_PROMPT_TRIGGER_CONDITIONS',
            conditions: [],
        })

        expect(nextG.nodes).toEqual(graphWithoutTrigger.nodes)
    })
})

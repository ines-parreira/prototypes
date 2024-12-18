import {visualBuilderGraphLlmPromptTriggerFixture} from 'pages/automate/workflows/tests/visualBuilderGraph.fixtures'

import {llmPromptTriggerReducer} from '../llmPromptTriggerReducer'

describe('llmPromptTriggerReducer', () => {
    test('ADD_LLM_PROMPT_TRIGGER_INPUT', () => {
        const g = visualBuilderGraphLlmPromptTriggerFixture
        const nextG = llmPromptTriggerReducer(g, {
            type: 'ADD_LLM_PROMPT_TRIGGER_INPUT',
        })

        expect(
            nextG.nodes.find((node) => node.type === 'llm_prompt_trigger')?.data
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
            })
        )
    })

    test('DELETE_LLM_PROMPT_TRIGGER_INPUT', () => {
        const g = visualBuilderGraphLlmPromptTriggerFixture
        const nextG = llmPromptTriggerReducer(g, {
            type: 'DELETE_LLM_PROMPT_TRIGGER_INPUT',
            id: 'someid',
        })

        expect(
            nextG.nodes.find((node) => node.type === 'llm_prompt_trigger')?.data
        ).toEqual(
            expect.objectContaining({
                inputs: [],
            })
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
            nextG.nodes.find((node) => node.type === 'llm_prompt_trigger')?.data
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
            })
        )
    })
})

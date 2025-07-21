import { visualBuilderGraphReusableLLMPromptTriggerFixture } from 'pages/automate/workflows/tests/visualBuilderGraph.fixtures'

import { reusableLLMPromptTriggerReducer } from '../reusableLLMPromptTriggerReducer'

describe('reusableLLMPromptTriggerReducer', () => {
    test('ADD_REUSABLE_LLM_PROMPT_TRIGGER_INPUT', () => {
        const g = visualBuilderGraphReusableLLMPromptTriggerFixture
        const nextG = reusableLLMPromptTriggerReducer(g, {
            type: 'ADD_REUSABLE_LLM_PROMPT_TRIGGER_INPUT',
        })

        expect(
            nextG.nodes.find(
                (node) => node.type === 'reusable_llm_prompt_trigger',
            )?.data,
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

    test('DELETE_REUSABLE_LLM_PROMPT_TRIGGER_INPUT', () => {
        const g = visualBuilderGraphReusableLLMPromptTriggerFixture
        const nextG = reusableLLMPromptTriggerReducer(g, {
            type: 'DELETE_REUSABLE_LLM_PROMPT_TRIGGER_INPUT',
            id: 'someid',
        })

        expect(
            nextG.nodes.find(
                (node) => node.type === 'reusable_llm_prompt_trigger',
            )?.data,
        ).toEqual(
            expect.objectContaining({
                inputs: [],
            }),
        )
    })

    test('SET_REUSABLE_LLM_PROMPT_TRIGGER_INPUT', () => {
        const g = visualBuilderGraphReusableLLMPromptTriggerFixture
        const nextG = reusableLLMPromptTriggerReducer(g, {
            type: 'SET_REUSABLE_LLM_PROMPT_TRIGGER_INPUT',
            input: {
                id: 'someid',
                name: 'some name',
                instructions: 'some instructions',
                data_type: 'number',
            },
        })

        expect(
            nextG.nodes.find(
                (node) => node.type === 'reusable_llm_prompt_trigger',
            )?.data,
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

    test('SET_REUSABLE_LLM_PROMPT_TRIGGER_REQUIRES_CONFIRMATION', () => {
        const g = visualBuilderGraphReusableLLMPromptTriggerFixture
        const nextG = reusableLLMPromptTriggerReducer(g, {
            type: 'SET_REUSABLE_LLM_PROMPT_TRIGGER_REQUIRES_CONFIRMATION',
            requiresConfirmation: true,
        })

        expect(
            nextG.nodes.find(
                (node) => node.type === 'reusable_llm_prompt_trigger',
            )?.data,
        ).toEqual(
            expect.objectContaining({
                requires_confirmation: true,
            }),
        )
    })

    test('SET_REUSABLE_LLM_PROMPT_TRIGGER_CONDITIONS_TYPE', () => {
        const g = visualBuilderGraphReusableLLMPromptTriggerFixture
        let nextG = reusableLLMPromptTriggerReducer(g, {
            type: 'SET_REUSABLE_LLM_PROMPT_TRIGGER_CONDITIONS_TYPE',
            conditionsType: 'and',
        })

        expect(
            nextG.nodes.find(
                (node) => node.type === 'reusable_llm_prompt_trigger',
            )?.data,
        ).toEqual(
            expect.objectContaining({
                conditionsType: 'and',
                conditions: [],
            }),
        )

        nextG = reusableLLMPromptTriggerReducer(nextG, {
            type: 'ADD_REUSABLE_LLM_PROMPT_TRIGGER_CONDITION',
            condition: { doesNotExist: [{ var: 'objects.order.name' }] },
        })

        expect(
            nextG.nodes.find(
                (node) => node.type === 'reusable_llm_prompt_trigger',
            )?.data,
        ).toEqual(
            expect.objectContaining({
                conditionsType: 'and',
                conditions: [{ doesNotExist: [{ var: 'objects.order.name' }] }],
            }),
        )

        nextG = reusableLLMPromptTriggerReducer(nextG, {
            type: 'SET_REUSABLE_LLM_PROMPT_TRIGGER_CONDITIONS_TYPE',
            conditionsType: null,
        })

        expect(
            nextG.nodes.find(
                (node) => node.type === 'reusable_llm_prompt_trigger',
            )?.data,
        ).toEqual(
            expect.objectContaining({
                conditionsType: null,
                conditions: [],
            }),
        )
    })

    test('DELETE_REUSABLE_LLM_PROMPT_TRIGGER_CONDITION', () => {
        const g = visualBuilderGraphReusableLLMPromptTriggerFixture
        let nextG = reusableLLMPromptTriggerReducer(g, {
            type: 'SET_REUSABLE_LLM_PROMPT_TRIGGER_CONDITIONS_TYPE',
            conditionsType: 'and',
        })

        nextG = reusableLLMPromptTriggerReducer(nextG, {
            type: 'ADD_REUSABLE_LLM_PROMPT_TRIGGER_CONDITION',
            condition: { doesNotExist: [{ var: 'objects.order.name' }] },
        })
        nextG = reusableLLMPromptTriggerReducer(nextG, {
            type: 'DELETE_REUSABLE_LLM_PROMPT_TRIGGER_CONDITION',
            index: 0,
        })

        expect(
            nextG.nodes.find(
                (node) => node.type === 'reusable_llm_prompt_trigger',
            )?.data,
        ).toEqual(
            expect.objectContaining({
                conditionsType: 'and',
                conditions: [],
            }),
        )
    })

    test('SET_REUSABLE_LLM_PROMPT_TRIGGER_CONDITION', () => {
        const g = visualBuilderGraphReusableLLMPromptTriggerFixture
        let nextG = reusableLLMPromptTriggerReducer(g, {
            type: 'SET_REUSABLE_LLM_PROMPT_TRIGGER_CONDITIONS_TYPE',
            conditionsType: 'and',
        })

        nextG = reusableLLMPromptTriggerReducer(nextG, {
            type: 'ADD_REUSABLE_LLM_PROMPT_TRIGGER_CONDITION',
            condition: { doesNotExist: [{ var: 'objects.order.name' }] },
        })
        nextG = reusableLLMPromptTriggerReducer(nextG, {
            type: 'SET_REUSABLE_LLM_PROMPT_TRIGGER_CONDITION',
            index: 0,
            condition: { exists: [{ var: 'objects.order.name' }] },
        })

        expect(
            nextG.nodes.find(
                (node) => node.type === 'reusable_llm_prompt_trigger',
            )?.data,
        ).toEqual(
            expect.objectContaining({
                conditionsType: 'and',
                conditions: [{ exists: [{ var: 'objects.order.name' }] }],
            }),
        )
    })
})

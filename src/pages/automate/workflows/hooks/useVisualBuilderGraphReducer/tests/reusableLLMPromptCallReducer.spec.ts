import {
    visualBuilderGraphLlmPromptTriggerFixture,
    visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
} from 'pages/automate/workflows/tests/visualBuilderGraph.fixtures'

import {reusableLLMPromptCallReducer} from '../reusableLLMPromptCallReducer'

describe('reusableLLMPromptCallReducer', () => {
    test('INSERT_REUSABLE_LLM_PROMPT_CALL_NODE', () => {
        const nextGraph = reusableLLMPromptCallReducer(
            visualBuilderGraphLlmPromptTriggerFixture,
            {
                type: 'INSERT_REUSABLE_LLM_PROMPT_CALL_NODE',
                beforeNodeId: 'http_request1',
                configurationId: 'config123',
                configurationInternalId: 'internal123',
                trigger: {
                    custom_inputs: [
                        {
                            id: 'input1',
                            name: 'Test name 1',
                            data_type: 'number',
                            instructions: 'Test instructions 1',
                        },
                    ],
                    object_inputs: [
                        {
                            kind: 'order',
                        },
                        {
                            kind: 'customer',
                        },
                        {
                            id: 'input2',
                            name: 'Test name 2',
                            kind: 'product',
                            instructions: 'Test instructions 2',
                        },
                    ],
                    outputs: [],
                },
                entrypoint: {
                    requires_confirmation: true,
                },
                app: {type: 'app', app_id: 'app123'},
                values: {
                    value1: 'value1',
                },
            }
        )

        expect(nextGraph.nodeEditingId).toEqual(nextGraph.nodes[3].id)
        expect(nextGraph.choiceEventIdEditing).toEqual(null)
        expect(nextGraph.branchIdsEditing).toEqual([])

        expect(nextGraph.nodes[0].data).toEqual({
            conditions: [],
            conditionsType: null,
            inputs: [
                {
                    data_type: 'string',
                    id: 'someid',
                    instructions: 'some instructions',
                    name: 'some name',
                },
                {
                    data_type: 'number',
                    id: expect.any(String),
                    instructions: 'Test instructions 1',
                    name: 'Test name 1',
                },
                {
                    id: expect.any(String),
                    instructions: 'Test instructions 2',
                    kind: 'product',
                    name: 'Test name 2',
                },
            ],
            instructions: 'Instructions',
            requires_confirmation: true,
        })
        expect(nextGraph.nodes[3].data).toEqual({
            configuration_id: 'config123',
            configuration_internal_id: 'internal123',
            custom_inputs: {
                input1: expect.stringMatching(/{{custom_inputs\.\w+}}/),
            },
            objects: {
                customer: '{{objects.customer}}',
                products: {
                    input2: expect.stringMatching(/{{objects\.products\.\w+}}/),
                },
            },
            values: {
                value1: 'value1',
            },
        })
        expect(nextGraph.apps).toEqual([
            {
                app_id: '123',
                type: 'app',
            },
            {
                app_id: 'app123',
                type: 'app',
            },
        ])
    })

    test('SET_REUSABLE_LLM_PROMPT_CALL_VALUE', () => {
        const nextGraph = reusableLLMPromptCallReducer(
            visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
            {
                type: 'SET_REUSABLE_LLM_PROMPT_CALL_VALUE',
                reusableLLMPromptCallNodeId: 'reusable_llm_prompt_call1',
                inputId: 'input1',
                value: 'value1',
            }
        )

        expect(nextGraph.nodes[1].data).toEqual(
            expect.objectContaining({
                values: {
                    input1: 'value1',
                },
            })
        )
    })
})

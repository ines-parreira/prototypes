import { renderHook } from '@testing-library/react-hooks'

import { buildNodeCommonProperties } from 'pages/automate/workflows/models/visualBuilderGraph.model'
import { LLMPromptTriggerNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'

import useSplitLLMPromptTriggerInputs from '../useSplitLLMPromptTriggerInputs'

describe('useSplitLLMPromptTriggerInputs()', () => {
    const inputs: LLMPromptTriggerNodeType['data']['inputs'] = [
        { id: 'input1', name: '', instructions: '', data_type: 'string' },
        { id: 'input2', name: '', instructions: '', kind: 'product' },
        { id: 'input3', name: '', instructions: '', data_type: 'number' },
    ]

    it('should split inputs into matching and non-matching based on template inputs', () => {
        const { result } = renderHook(() =>
            useSplitLLMPromptTriggerInputs(inputs, [
                {
                    ...buildNodeCommonProperties(),
                    type: 'llm_prompt_trigger',
                    data: {
                        requires_confirmation: false,
                        inputs,
                        conditionsType: null,
                        conditions: [],
                        instructions: '',
                    },
                },
                {
                    ...buildNodeCommonProperties(),
                    type: 'reusable_llm_prompt_call',
                    data: {
                        configuration_id: '',
                        configuration_internal_id: '',
                        custom_inputs: {
                            custom1: '{{custom_inputs.input1}}',
                        },
                        objects: {
                            products: {
                                product1: '{{objects.products.input2}}',
                            },
                        },
                        values: {},
                    },
                },
            ]),
        )

        const [nonMatching, matching] = result.current

        expect(nonMatching).toEqual([
            { id: 'input3', name: '', instructions: '', data_type: 'number' },
        ])
        expect(matching).toEqual([
            { id: 'input1', name: '', instructions: '', data_type: 'string' },
            { id: 'input2', name: '', instructions: '', kind: 'product' },
        ])
    })

    it('should return all inputs as non-matching when no template inputs match', () => {
        const { result } = renderHook(() =>
            useSplitLLMPromptTriggerInputs(inputs, [
                {
                    ...buildNodeCommonProperties(),
                    type: 'llm_prompt_trigger',
                    data: {
                        requires_confirmation: false,
                        inputs,
                        conditionsType: null,
                        conditions: [],
                        instructions: '',
                    },
                },
                {
                    ...buildNodeCommonProperties(),
                    type: 'reusable_llm_prompt_call',
                    data: {
                        configuration_id: '',
                        configuration_internal_id: '',
                        custom_inputs: {},
                        values: {},
                    },
                },
            ]),
        )

        const [nonMatching, matching] = result.current

        expect(nonMatching).toEqual(inputs)
        expect(matching).toEqual([])
    })

    it('should handle empty inputs and nodes gracefully', () => {
        const { result } = renderHook(() =>
            useSplitLLMPromptTriggerInputs(
                [],
                [
                    {
                        ...buildNodeCommonProperties(),
                        type: 'llm_prompt_trigger',
                        data: {
                            requires_confirmation: false,
                            inputs: [],
                            conditionsType: null,
                            conditions: [],
                            instructions: '',
                        },
                    },
                ],
            ),
        )

        const [nonMatching, matching] = result.current

        expect(nonMatching).toEqual([])
        expect(matching).toEqual([])
    })

    it('should handle nodes without reusable_llm_prompt_call type', () => {
        const { result } = renderHook(() =>
            useSplitLLMPromptTriggerInputs(inputs, [
                {
                    ...buildNodeCommonProperties(),
                    type: 'llm_prompt_trigger',
                    data: {
                        requires_confirmation: false,
                        inputs,
                        conditionsType: null,
                        conditions: [],
                        instructions: '',
                    },
                },
                {
                    ...buildNodeCommonProperties(),
                    type: 'end',
                    data: {
                        action: 'end',
                    },
                },
            ]),
        )

        const [nonMatching, matching] = result.current

        expect(nonMatching).toEqual(inputs)
        expect(matching).toEqual([])
    })
})

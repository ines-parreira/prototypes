import {buildReusableLLMPromptCallNode} from '../utils'

describe('visual builder graph utils', () => {
    describe('buildReusableLLMPromptCallNode()', () => {
        it('should return reusable LLM prompt call node', () => {
            expect(
                buildReusableLLMPromptCallNode({
                    configuration_id: 'configurationid',
                    configuration_internal_id: 'configurationinternalid',
                    values: {},
                })
            ).toEqual(
                expect.objectContaining({
                    id: expect.any(String),
                    type: 'reusable_llm_prompt_call',
                    data: {
                        configuration_id: 'configurationid',
                        configuration_internal_id: 'configurationinternalid',
                        objects: {},
                        custom_inputs: {},
                        values: {},
                    },
                })
            )
        })
    })
})

import {
    buildLiquidTemplateNode,
    buildReusableLLMPromptCallNode,
} from '../utils'

describe('useVisualBuilderGraphReducer utils', () => {
    describe('buildReusableLLMPromptCallNode()', () => {
        it('should return reusable LLM prompt call node', () => {
            expect(
                buildReusableLLMPromptCallNode({
                    configuration_id: 'configurationid',
                    configuration_internal_id: 'configurationinternalid',
                    values: {},
                }),
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
                }),
            )
        })
    })

    describe('buildLiquidTemplateNode', () => {
        it('should create a liquid template node with correct default structure', () => {
            const node = buildLiquidTemplateNode()

            expect(node.type).toBe('liquid_template')
            expect(node.id).toBeDefined()
            expect(node.id).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/) // ULID format
            expect(node.position).toEqual({ x: 0, y: 0 })
            expect(node.data).toEqual({
                name: '',
                template: '',
                output: {
                    data_type: 'string',
                },
            })
        })

        it('should create nodes with unique IDs on multiple calls', () => {
            const node1 = buildLiquidTemplateNode()
            const node2 = buildLiquidTemplateNode()

            expect(node1.id).not.toBe(node2.id)
            expect(node1.id).toBeDefined()
            expect(node2.id).toBeDefined()
        })

        it('should have consistent node common properties', () => {
            const node = buildLiquidTemplateNode()

            // Check that it has all the common node properties
            expect(node).toHaveProperty('id')
            expect(node).toHaveProperty('type')
            expect(node).toHaveProperty('position')
            expect(node).toHaveProperty('data')

            // Verify position structure
            expect(typeof node.position.x).toBe('number')
            expect(typeof node.position.y).toBe('number')
        })

        it('should always default to string data type', () => {
            // Create multiple nodes to ensure consistency
            const nodes = Array.from({ length: 5 }, () =>
                buildLiquidTemplateNode(),
            )

            nodes.forEach((node) => {
                expect(node.data.output.data_type).toBe('string')
            })
        })
    })
})

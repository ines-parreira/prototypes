import _cloneDeep from 'lodash/cloneDeep'

import {
    buildEdgeCommonProperties,
    buildNodeCommonProperties,
} from 'pages/automate/workflows/models/visualBuilderGraph.model'
import type {
    ChannelTriggerNodeType,
    LiquidTemplateNodeType,
    VisualBuilderGraph,
} from 'pages/automate/workflows/models/visualBuilderGraph.types'

import {
    isVisualBuilderLiquidTemplateAction,
    liquidTemplateReducer,
} from '../liquidTemplateReducer'
import { buildLiquidTemplateNode } from '../utils'

// Test fixture with a liquid template node
const liquidTemplateGraphFixture: VisualBuilderGraph<ChannelTriggerNodeType> = {
    id: '',
    internal_id: '',
    is_draft: false,
    isTemplate: false,
    name: 'Test Workflow',
    available_languages: ['en-US'],
    nodes: [
        {
            ...buildNodeCommonProperties(),
            id: 'trigger1',
            type: 'channel_trigger',
            data: {
                label: 'Start',
                label_tkey: 'start_tkey',
            },
        },
        {
            ...buildNodeCommonProperties(),
            id: 'liquid_template1',
            type: 'liquid_template',
            data: {
                name: 'Test Template',
                template: '{{ customer.name }}',
                output: {
                    data_type: 'string',
                },
            },
        },
        {
            ...buildNodeCommonProperties(),
            id: 'end1',
            type: 'end',
            data: {
                action: 'end',
            },
        },
    ],
    edges: [
        {
            ...buildEdgeCommonProperties(),
            source: 'trigger1',
            target: 'liquid_template1',
        },
        {
            ...buildEdgeCommonProperties(),
            source: 'liquid_template1',
            target: 'end1',
        },
    ],
    nodeEditingId: null,
    choiceEventIdEditing: null,
    branchIdsEditing: [],
}

// Simple fixture for insertion tests
const simpleGraphFixture: VisualBuilderGraph<ChannelTriggerNodeType> = {
    id: '',
    internal_id: '',
    is_draft: false,
    isTemplate: false,
    name: 'Simple Workflow',
    available_languages: ['en-US'],
    nodes: [
        {
            ...buildNodeCommonProperties(),
            id: 'trigger1',
            type: 'channel_trigger',
            data: {
                label: 'Start',
                label_tkey: 'start_tkey',
            },
        },
        {
            ...buildNodeCommonProperties(),
            id: 'end1',
            type: 'end',
            data: {
                action: 'end',
            },
        },
    ],
    edges: [
        {
            ...buildEdgeCommonProperties(),
            source: 'trigger1',
            target: 'end1',
        },
    ],
    nodeEditingId: null,
    choiceEventIdEditing: null,
    branchIdsEditing: [],
}

describe('liquidTemplateReducer', () => {
    describe('isVisualBuilderLiquidTemplateAction', () => {
        it('should return true for valid liquid template actions', () => {
            expect(
                isVisualBuilderLiquidTemplateAction({
                    type: 'INSERT_LIQUID_TEMPLATE_NODE',
                }),
            ).toBe(true)
            expect(
                isVisualBuilderLiquidTemplateAction({
                    type: 'SET_LIQUID_TEMPLATE_EXPRESSION',
                }),
            ).toBe(true)
            expect(
                isVisualBuilderLiquidTemplateAction({
                    type: 'SET_LIQUID_TEMPLATE_OUTPUT_DATA_TYPE',
                }),
            ).toBe(true)
            expect(
                isVisualBuilderLiquidTemplateAction({
                    type: 'SET_LIQUID_TEMPLATE_NAME',
                }),
            ).toBe(true)
        })

        it('should return false for invalid actions', () => {
            expect(
                isVisualBuilderLiquidTemplateAction({
                    type: 'INVALID_ACTION',
                }),
            ).toBe(false)
            expect(
                isVisualBuilderLiquidTemplateAction({
                    type: 'SET_AUTOMATED_MESSAGE_CONTENT',
                }),
            ).toBe(false)
            expect(isVisualBuilderLiquidTemplateAction({ type: '' })).toBe(
                false,
            )
        })
    })

    describe('INSERT_LIQUID_TEMPLATE_NODE', () => {
        it('should insert a liquid template node before the specified node', () => {
            const graph = _cloneDeep(simpleGraphFixture)
            const nextGraph = liquidTemplateReducer(graph, {
                type: 'INSERT_LIQUID_TEMPLATE_NODE',
                beforeNodeId: 'end1',
            })

            expect(nextGraph.nodes).toHaveLength(3)

            // Find the liquid template node by type
            const insertedLiquidNode = nextGraph.nodes.find(
                (n): n is LiquidTemplateNodeType =>
                    n.type === 'liquid_template',
            )!
            expect(insertedLiquidNode).toBeDefined()
            expect(insertedLiquidNode.data).toEqual({
                name: '',
                template: '',
                output: {
                    data_type: 'string',
                },
            })

            // Check edges are correctly updated
            const incomingEdge = nextGraph.edges.find(
                (e) => e.target === insertedLiquidNode.id,
            )
            const outgoingEdge = nextGraph.edges.find(
                (e) => e.source === insertedLiquidNode.id,
            )

            expect(incomingEdge).toBeDefined()
            expect(outgoingEdge).toBeDefined()
            expect(outgoingEdge?.target).toBe('end1')
        })

        it('should maintain original nodes when inserting', () => {
            const graph = _cloneDeep(simpleGraphFixture)
            const originalNodeCount = graph.nodes.length
            const nextGraph = liquidTemplateReducer(graph, {
                type: 'INSERT_LIQUID_TEMPLATE_NODE',
                beforeNodeId: 'end1',
            })

            expect(nextGraph.nodes).toHaveLength(originalNodeCount + 1)

            // Original nodes should still exist
            expect(
                nextGraph.nodes.find((n) => n.id === 'trigger1'),
            ).toBeDefined()
            expect(nextGraph.nodes.find((n) => n.id === 'end1')).toBeDefined()
        })
    })

    describe('SET_LIQUID_TEMPLATE_EXPRESSION', () => {
        it('should update the template expression for the specified node', () => {
            const graph = _cloneDeep(liquidTemplateGraphFixture)
            const newTemplate = '{{ order.total | money }}'
            const nextGraph = liquidTemplateReducer(graph, {
                type: 'SET_LIQUID_TEMPLATE_EXPRESSION',
                liquidTemplateNodeId: 'liquid_template1',
                template: newTemplate,
            })

            const liquidTemplateNode = nextGraph.nodes.find(
                (n): n is LiquidTemplateNodeType =>
                    n.id === 'liquid_template1' && n.type === 'liquid_template',
            )!

            expect(liquidTemplateNode.data.template).toBe(newTemplate)
        })

        it('should not modify other node properties', () => {
            const graph = _cloneDeep(liquidTemplateGraphFixture)
            const nextGraph = liquidTemplateReducer(graph, {
                type: 'SET_LIQUID_TEMPLATE_EXPRESSION',
                liquidTemplateNodeId: 'liquid_template1',
                template: 'new template',
            })

            const liquidTemplateNode = nextGraph.nodes.find(
                (n): n is LiquidTemplateNodeType =>
                    n.id === 'liquid_template1' && n.type === 'liquid_template',
            )!

            expect(liquidTemplateNode.data.name).toBe('Test Template')
            expect(liquidTemplateNode.data.output.data_type).toBe('string')
        })

        it('should handle empty template string', () => {
            const graph = _cloneDeep(liquidTemplateGraphFixture)
            const nextGraph = liquidTemplateReducer(graph, {
                type: 'SET_LIQUID_TEMPLATE_EXPRESSION',
                liquidTemplateNodeId: 'liquid_template1',
                template: '',
            })

            const liquidTemplateNode = nextGraph.nodes.find(
                (n): n is LiquidTemplateNodeType =>
                    n.id === 'liquid_template1' && n.type === 'liquid_template',
            )!

            expect(liquidTemplateNode.data.template).toBe('')
        })

        it('should not update anything if node is not found', () => {
            const graph = _cloneDeep(liquidTemplateGraphFixture)
            const nextGraph = liquidTemplateReducer(graph, {
                type: 'SET_LIQUID_TEMPLATE_EXPRESSION',
                liquidTemplateNodeId: 'non_existent_node',
                template: 'new template',
            })

            // Graph should remain unchanged
            expect(nextGraph).toEqual(graph)
        })

        it('should not update anything if node is not a liquid template type', () => {
            const graph = _cloneDeep(liquidTemplateGraphFixture)
            const nextGraph = liquidTemplateReducer(graph, {
                type: 'SET_LIQUID_TEMPLATE_EXPRESSION',
                liquidTemplateNodeId: 'end1', // This is an end node, not liquid template
                template: 'new template',
            })

            // Graph should remain unchanged
            expect(nextGraph).toEqual(graph)
        })
    })

    describe('SET_LIQUID_TEMPLATE_OUTPUT_DATA_TYPE', () => {
        it('should update the output data type for the specified node', () => {
            const graph = _cloneDeep(liquidTemplateGraphFixture)
            const nextGraph = liquidTemplateReducer(graph, {
                type: 'SET_LIQUID_TEMPLATE_OUTPUT_DATA_TYPE',
                liquidTemplateNodeId: 'liquid_template1',
                data_type: 'number',
            })

            const liquidTemplateNode = nextGraph.nodes.find(
                (n): n is LiquidTemplateNodeType =>
                    n.id === 'liquid_template1' && n.type === 'liquid_template',
            )!

            expect(liquidTemplateNode.data.output.data_type).toBe('number')
        })

        it('should handle all valid data types', () => {
            const dataTypes: Array<'string' | 'number' | 'boolean' | 'date'> = [
                'string',
                'number',
                'boolean',
                'date',
            ]

            dataTypes.forEach((dataType) => {
                const graph = _cloneDeep(liquidTemplateGraphFixture)
                const nextGraph = liquidTemplateReducer(graph, {
                    type: 'SET_LIQUID_TEMPLATE_OUTPUT_DATA_TYPE',
                    liquidTemplateNodeId: 'liquid_template1',
                    data_type: dataType,
                })

                const liquidTemplateNode = nextGraph.nodes.find(
                    (n): n is LiquidTemplateNodeType =>
                        n.id === 'liquid_template1' &&
                        n.type === 'liquid_template',
                )!

                expect(liquidTemplateNode.data.output.data_type).toBe(dataType)
            })
        })

        it('should not modify other node properties', () => {
            const graph = _cloneDeep(liquidTemplateGraphFixture)
            const nextGraph = liquidTemplateReducer(graph, {
                type: 'SET_LIQUID_TEMPLATE_OUTPUT_DATA_TYPE',
                liquidTemplateNodeId: 'liquid_template1',
                data_type: 'boolean',
            })

            const liquidTemplateNode = nextGraph.nodes.find(
                (n): n is LiquidTemplateNodeType =>
                    n.id === 'liquid_template1' && n.type === 'liquid_template',
            )!

            expect(liquidTemplateNode.data.name).toBe('Test Template')
            expect(liquidTemplateNode.data.template).toBe('{{ customer.name }}')
        })

        it('should not update anything if node is not found', () => {
            const graph = _cloneDeep(liquidTemplateGraphFixture)
            const nextGraph = liquidTemplateReducer(graph, {
                type: 'SET_LIQUID_TEMPLATE_OUTPUT_DATA_TYPE',
                liquidTemplateNodeId: 'non_existent_node',
                data_type: 'number',
            })

            // Graph should remain unchanged
            expect(nextGraph).toEqual(graph)
        })

        it('should not update anything if node is not a liquid template type', () => {
            const graph = _cloneDeep(liquidTemplateGraphFixture)
            const nextGraph = liquidTemplateReducer(graph, {
                type: 'SET_LIQUID_TEMPLATE_OUTPUT_DATA_TYPE',
                liquidTemplateNodeId: 'trigger1', // This is a trigger node, not liquid template
                data_type: 'number',
            })

            // Graph should remain unchanged
            expect(nextGraph).toEqual(graph)
        })
    })

    describe('SET_LIQUID_TEMPLATE_NAME', () => {
        it('should update the name for the specified node', () => {
            const graph = _cloneDeep(liquidTemplateGraphFixture)
            const newName = 'Updated Template Name'
            const nextGraph = liquidTemplateReducer(graph, {
                type: 'SET_LIQUID_TEMPLATE_NAME',
                liquidTemplateNodeId: 'liquid_template1',
                name: newName,
            })

            const liquidTemplateNode = nextGraph.nodes.find(
                (n): n is LiquidTemplateNodeType =>
                    n.id === 'liquid_template1' && n.type === 'liquid_template',
            )!

            expect(liquidTemplateNode.data.name).toBe(newName)
        })

        it('should handle empty name string', () => {
            const graph = _cloneDeep(liquidTemplateGraphFixture)
            const nextGraph = liquidTemplateReducer(graph, {
                type: 'SET_LIQUID_TEMPLATE_NAME',
                liquidTemplateNodeId: 'liquid_template1',
                name: '',
            })

            const liquidTemplateNode = nextGraph.nodes.find(
                (n): n is LiquidTemplateNodeType =>
                    n.id === 'liquid_template1' && n.type === 'liquid_template',
            )!

            expect(liquidTemplateNode.data.name).toBe('')
        })

        it('should handle special characters and long names', () => {
            const specialName =
                'Template with special chars: áéíóú & 特殊字符 😀'
            const graph = _cloneDeep(liquidTemplateGraphFixture)
            const nextGraph = liquidTemplateReducer(graph, {
                type: 'SET_LIQUID_TEMPLATE_NAME',
                liquidTemplateNodeId: 'liquid_template1',
                name: specialName,
            })

            const liquidTemplateNode = nextGraph.nodes.find(
                (n): n is LiquidTemplateNodeType =>
                    n.id === 'liquid_template1' && n.type === 'liquid_template',
            )!

            expect(liquidTemplateNode.data.name).toBe(specialName)
        })

        it('should not modify other node properties', () => {
            const graph = _cloneDeep(liquidTemplateGraphFixture)
            const nextGraph = liquidTemplateReducer(graph, {
                type: 'SET_LIQUID_TEMPLATE_NAME',
                liquidTemplateNodeId: 'liquid_template1',
                name: 'New Name',
            })

            const liquidTemplateNode = nextGraph.nodes.find(
                (n): n is LiquidTemplateNodeType =>
                    n.id === 'liquid_template1' && n.type === 'liquid_template',
            )!

            expect(liquidTemplateNode.data.template).toBe('{{ customer.name }}')
            expect(liquidTemplateNode.data.output.data_type).toBe('string')
        })

        it('should not update anything if node is not found', () => {
            const graph = _cloneDeep(liquidTemplateGraphFixture)
            const nextGraph = liquidTemplateReducer(graph, {
                type: 'SET_LIQUID_TEMPLATE_NAME',
                liquidTemplateNodeId: 'non_existent_node',
                name: 'New Name',
            })

            // Graph should remain unchanged
            expect(nextGraph).toEqual(graph)
        })

        it('should not update anything if node is not a liquid template type', () => {
            const graph = _cloneDeep(liquidTemplateGraphFixture)
            const nextGraph = liquidTemplateReducer(graph, {
                type: 'SET_LIQUID_TEMPLATE_NAME',
                liquidTemplateNodeId: 'end1', // This is an end node, not liquid template
                name: 'New Name',
            })

            // Graph should remain unchanged
            expect(nextGraph).toEqual(graph)
        })
    })

    describe('Edge cases and integration', () => {
        it('should maintain graph immutability', () => {
            const graph = _cloneDeep(liquidTemplateGraphFixture)
            const originalGraph = _cloneDeep(graph)

            liquidTemplateReducer(graph, {
                type: 'SET_LIQUID_TEMPLATE_NAME',
                liquidTemplateNodeId: 'liquid_template1',
                name: 'Modified Name',
            })

            // Original graph should not be modified
            expect(graph).toEqual(originalGraph)
        })

        it('should handle multiple liquid template nodes correctly', () => {
            const graph = _cloneDeep(liquidTemplateGraphFixture)

            // Add another liquid template node
            const secondLiquidTemplate = buildLiquidTemplateNode()
            secondLiquidTemplate.id = 'liquid_template2'
            secondLiquidTemplate.data.name = 'Second Template'
            graph.nodes.push(secondLiquidTemplate)

            const nextGraph = liquidTemplateReducer(graph, {
                type: 'SET_LIQUID_TEMPLATE_NAME',
                liquidTemplateNodeId: 'liquid_template2',
                name: 'Updated Second Template',
            })

            // Only the specified node should be updated
            const firstNode = nextGraph.nodes.find(
                (n): n is LiquidTemplateNodeType =>
                    n.id === 'liquid_template1' && n.type === 'liquid_template',
            )!
            const secondNode = nextGraph.nodes.find(
                (n): n is LiquidTemplateNodeType =>
                    n.id === 'liquid_template2' && n.type === 'liquid_template',
            )!

            expect(firstNode.data.name).toBe('Test Template') // Unchanged
            expect(secondNode.data.name).toBe('Updated Second Template') // Changed
        })

        it('should preserve node positions after insertion', () => {
            const graph = _cloneDeep(simpleGraphFixture)
            const nextGraph = liquidTemplateReducer(graph, {
                type: 'INSERT_LIQUID_TEMPLATE_NODE',
                beforeNodeId: 'end1',
            })

            // All nodes should have position properties
            nextGraph.nodes.forEach((node) => {
                expect(node.position).toBeDefined()
                expect(typeof node.position.x).toBe('number')
                expect(typeof node.position.y).toBe('number')
            })
        })

        it('should handle complex template expressions', () => {
            const graph = _cloneDeep(liquidTemplateGraphFixture)
            const complexTemplate = `
                {% assign total = 0 %}
                {% for item in order.line_items %}
                    {% assign total = total | plus: item.price %}
                {% endfor %}
                Order total: {{ total | money }}
                Customer: {{ customer.first_name }} {{ customer.last_name }}
            `

            const nextGraph = liquidTemplateReducer(graph, {
                type: 'SET_LIQUID_TEMPLATE_EXPRESSION',
                liquidTemplateNodeId: 'liquid_template1',
                template: complexTemplate,
            })

            const liquidTemplateNode = nextGraph.nodes.find(
                (n): n is LiquidTemplateNodeType =>
                    n.id === 'liquid_template1' && n.type === 'liquid_template',
            )!

            expect(liquidTemplateNode.data.template).toBe(complexTemplate)
        })
    })

    describe('Advanced edge cases and integration scenarios', () => {
        describe('Complex liquid template expressions', () => {
            it('should handle liquid templates with conditional logic', () => {
                const graph = _cloneDeep(liquidTemplateGraphFixture)
                const conditionalTemplate = `
                    {% if customer.total_spent > 100 %}
                        Welcome back, valued customer {{ customer.name }}!
                        Your total spent: {{ customer.total_spent | money }}
                    {% else %}
                        Hello {{ customer.name }}, thanks for visiting!
                    {% endif %}
                `

                const nextGraph = liquidTemplateReducer(graph, {
                    type: 'SET_LIQUID_TEMPLATE_EXPRESSION',
                    liquidTemplateNodeId: 'liquid_template1',
                    template: conditionalTemplate,
                })

                const liquidTemplateNode = nextGraph.nodes.find(
                    (n): n is LiquidTemplateNodeType =>
                        n.id === 'liquid_template1' &&
                        n.type === 'liquid_template',
                )!

                expect(liquidTemplateNode.data.template).toBe(
                    conditionalTemplate,
                )
            })

            it('should handle liquid templates with loops and arrays', () => {
                const graph = _cloneDeep(liquidTemplateGraphFixture)
                const loopTemplate = `
                    {% for item in order.line_items %}
                        Product: {{ item.name }}
                        Price: {{ item.price | money }}
                        Quantity: {{ item.quantity }}
                        {% unless forloop.last %}, {% endunless %}
                    {% endfor %}
                `

                const nextGraph = liquidTemplateReducer(graph, {
                    type: 'SET_LIQUID_TEMPLATE_EXPRESSION',
                    liquidTemplateNodeId: 'liquid_template1',
                    template: loopTemplate,
                })

                const liquidTemplateNode = nextGraph.nodes.find(
                    (n): n is LiquidTemplateNodeType =>
                        n.id === 'liquid_template1' &&
                        n.type === 'liquid_template',
                )!

                expect(liquidTemplateNode.data.template).toBe(loopTemplate)
            })

            it('should handle liquid templates with nested objects and filters', () => {
                const graph = _cloneDeep(liquidTemplateGraphFixture)
                const nestedTemplate = `
                    Customer: {{ customer.billing_address.first_name | capitalize }} {{ customer.billing_address.last_name | upcase }}
                    Address: {{ customer.billing_address.address1 | default: "No address provided" }}
                    City: {{ customer.billing_address.city | append: ", " | append: customer.billing_address.province }}
                    Order Date: {{ order.created_at | date: "%B %d, %Y" }}
                `

                const nextGraph = liquidTemplateReducer(graph, {
                    type: 'SET_LIQUID_TEMPLATE_EXPRESSION',
                    liquidTemplateNodeId: 'liquid_template1',
                    template: nestedTemplate,
                })

                const liquidTemplateNode = nextGraph.nodes.find(
                    (n): n is LiquidTemplateNodeType =>
                        n.id === 'liquid_template1' &&
                        n.type === 'liquid_template',
                )!

                expect(liquidTemplateNode.data.template).toBe(nestedTemplate)
            })

            it('should handle liquid templates with custom assignments and calculations', () => {
                const graph = _cloneDeep(liquidTemplateGraphFixture)
                const calculationTemplate = `
                    {% assign subtotal = 0 %}
                    {% assign tax_rate = 0.08 %}
                    {% for item in order.line_items %}
                        {% assign line_total = item.price | times: item.quantity %}
                        {% assign subtotal = subtotal | plus: line_total %}
                    {% endfor %}
                    {% assign tax_amount = subtotal | times: tax_rate %}
                    {% assign total = subtotal | plus: tax_amount %}
                    
                    Subtotal: {{ subtotal | money }}
                    Tax (8%): {{ tax_amount | money }}
                    Total: {{ total | money }}
                `

                const nextGraph = liquidTemplateReducer(graph, {
                    type: 'SET_LIQUID_TEMPLATE_EXPRESSION',
                    liquidTemplateNodeId: 'liquid_template1',
                    template: calculationTemplate,
                })

                const liquidTemplateNode = nextGraph.nodes.find(
                    (n): n is LiquidTemplateNodeType =>
                        n.id === 'liquid_template1' &&
                        n.type === 'liquid_template',
                )!

                expect(liquidTemplateNode.data.template).toBe(
                    calculationTemplate,
                )
            })
        })

        describe('Data type edge cases', () => {
            it('should handle rapid data type changes', () => {
                const graph = _cloneDeep(liquidTemplateGraphFixture)
                const dataTypes: Array<
                    'string' | 'number' | 'boolean' | 'date'
                > = ['string', 'number', 'boolean', 'date', 'string', 'number']

                let currentGraph = graph
                dataTypes.forEach((dataType) => {
                    currentGraph = liquidTemplateReducer(currentGraph, {
                        type: 'SET_LIQUID_TEMPLATE_OUTPUT_DATA_TYPE',
                        liquidTemplateNodeId: 'liquid_template1',
                        data_type: dataType,
                    }) as VisualBuilderGraph<ChannelTriggerNodeType>
                })

                const liquidTemplateNode = currentGraph.nodes.find(
                    (n): n is LiquidTemplateNodeType =>
                        n.id === 'liquid_template1' &&
                        n.type === 'liquid_template',
                )!

                expect(liquidTemplateNode.data.output.data_type).toBe('number')
            })

            it('should handle data type changes with complex templates', () => {
                const graph = _cloneDeep(liquidTemplateGraphFixture)

                // Set a complex template first
                let nextGraph = liquidTemplateReducer(graph, {
                    type: 'SET_LIQUID_TEMPLATE_EXPRESSION',
                    liquidTemplateNodeId: 'liquid_template1',
                    template:
                        '{% assign total = order.total_price | plus: shipping_cost %}{{ total | money }}',
                })

                // Then change data type
                nextGraph = liquidTemplateReducer(nextGraph, {
                    type: 'SET_LIQUID_TEMPLATE_OUTPUT_DATA_TYPE',
                    liquidTemplateNodeId: 'liquid_template1',
                    data_type: 'number',
                })

                const liquidTemplateNode = nextGraph.nodes.find(
                    (n): n is LiquidTemplateNodeType =>
                        n.id === 'liquid_template1' &&
                        n.type === 'liquid_template',
                )!

                expect(liquidTemplateNode.data.output.data_type).toBe('number')
                expect(liquidTemplateNode.data.template).toBe(
                    '{% assign total = order.total_price | plus: shipping_cost %}{{ total | money }}',
                )
            })
        })

        describe('Batch operations and performance', () => {
            it('should handle multiple consecutive operations efficiently', () => {
                const graph = _cloneDeep(liquidTemplateGraphFixture)
                const operations = [
                    {
                        type: 'SET_LIQUID_TEMPLATE_NAME' as const,
                        name: 'Step 1',
                    },
                    {
                        type: 'SET_LIQUID_TEMPLATE_EXPRESSION' as const,
                        template: '{{ customer.name }}',
                    },
                    {
                        type: 'SET_LIQUID_TEMPLATE_OUTPUT_DATA_TYPE' as const,
                        data_type: 'string' as const,
                    },
                    {
                        type: 'SET_LIQUID_TEMPLATE_NAME' as const,
                        name: 'Step 2',
                    },
                    {
                        type: 'SET_LIQUID_TEMPLATE_EXPRESSION' as const,
                        template: '{{ order.total | money }}',
                    },
                    {
                        type: 'SET_LIQUID_TEMPLATE_OUTPUT_DATA_TYPE' as const,
                        data_type: 'number' as const,
                    },
                ]

                let currentGraph = graph
                operations.forEach((op) => {
                    currentGraph = liquidTemplateReducer(currentGraph, {
                        ...op,
                        liquidTemplateNodeId: 'liquid_template1',
                    }) as VisualBuilderGraph<ChannelTriggerNodeType>
                })

                const liquidTemplateNode = currentGraph.nodes.find(
                    (n): n is LiquidTemplateNodeType =>
                        n.id === 'liquid_template1' &&
                        n.type === 'liquid_template',
                )!

                expect(liquidTemplateNode.data.name).toBe('Step 2')
                expect(liquidTemplateNode.data.template).toBe(
                    '{{ order.total | money }}',
                )
                expect(liquidTemplateNode.data.output.data_type).toBe('number')
            })

            it('should maintain performance with large template content', () => {
                const graph = _cloneDeep(liquidTemplateGraphFixture)
                const largeTemplate = Array.from(
                    { length: 100 },
                    (_, i) =>
                        `Line ${i + 1}: {{ customer.field_${i} | default: "N/A" }}`,
                ).join('\n')

                const startTime = performance.now()
                const nextGraph = liquidTemplateReducer(graph, {
                    type: 'SET_LIQUID_TEMPLATE_EXPRESSION',
                    liquidTemplateNodeId: 'liquid_template1',
                    template: largeTemplate,
                })
                const endTime = performance.now()

                const liquidTemplateNode = nextGraph.nodes.find(
                    (n): n is LiquidTemplateNodeType =>
                        n.id === 'liquid_template1' &&
                        n.type === 'liquid_template',
                )!

                expect(liquidTemplateNode.data.template).toBe(largeTemplate)
                expect(endTime - startTime).toBeLessThan(100) // Should complete in under 100ms
            })
        })

        describe('Graph consistency and relationships', () => {
            it('should maintain node order after multiple operations', () => {
                const graph = _cloneDeep(liquidTemplateGraphFixture)
                const originalNodeOrder = graph.nodes.map((n) => n.id)

                // Perform multiple operations
                let currentGraph = graph
                const operations = [
                    {
                        type: 'SET_LIQUID_TEMPLATE_NAME' as const,
                        name: 'Updated Name',
                    },
                    {
                        type: 'SET_LIQUID_TEMPLATE_EXPRESSION' as const,
                        template: '{{ new.template }}',
                    },
                    {
                        type: 'SET_LIQUID_TEMPLATE_OUTPUT_DATA_TYPE' as const,
                        data_type: 'boolean' as const,
                    },
                ]

                operations.forEach((op) => {
                    currentGraph = liquidTemplateReducer(currentGraph, {
                        ...op,
                        liquidTemplateNodeId: 'liquid_template1',
                    }) as VisualBuilderGraph<ChannelTriggerNodeType>
                })

                const newNodeOrder = currentGraph.nodes.map((n) => n.id)
                expect(newNodeOrder).toEqual(originalNodeOrder)
            })

            it('should preserve edge relationships during updates', () => {
                const graph = _cloneDeep(liquidTemplateGraphFixture)
                const originalEdges = _cloneDeep(graph.edges)

                const nextGraph = liquidTemplateReducer(graph, {
                    type: 'SET_LIQUID_TEMPLATE_EXPRESSION',
                    liquidTemplateNodeId: 'liquid_template1',
                    template: '{{ completely.new.template }}',
                })

                expect(nextGraph.edges).toEqual(originalEdges)
                expect(nextGraph.edges.length).toBe(originalEdges.length)

                // Verify edge targets and sources are preserved
                nextGraph.edges.forEach((edge, index) => {
                    expect(edge.source).toBe(originalEdges[index].source)
                    expect(edge.target).toBe(originalEdges[index].target)
                })
            })

            it('should handle updates to liquid template nodes in complex graphs', () => {
                const complexGraph = _cloneDeep(liquidTemplateGraphFixture)

                // Add more nodes to create a complex graph using the same structure as existing test
                const additionalLiquidTemplate = {
                    ...buildNodeCommonProperties(),
                    id: 'liquid_template2',
                    type: 'liquid_template' as const,
                    data: {
                        name: 'Second Template',
                        template: '',
                        output: {
                            data_type: 'string' as const,
                        },
                    },
                }
                complexGraph.nodes.push(additionalLiquidTemplate)

                // Add edge connecting the two liquid templates
                complexGraph.edges.push({
                    ...buildEdgeCommonProperties(),
                    source: 'liquid_template1',
                    target: 'liquid_template2',
                })

                const nextGraph = liquidTemplateReducer(complexGraph, {
                    type: 'SET_LIQUID_TEMPLATE_NAME',
                    liquidTemplateNodeId: 'liquid_template1',
                    name: 'First Template Updated',
                })

                // Verify only the target node was updated
                const firstNode = nextGraph.nodes.find(
                    (n) => n.id === 'liquid_template1',
                )
                const secondNode = nextGraph.nodes.find(
                    (n) => n.id === 'liquid_template2',
                )

                expect(
                    firstNode?.type === 'liquid_template' &&
                        firstNode.data.name,
                ).toBe('First Template Updated')
                expect(
                    secondNode?.type === 'liquid_template' &&
                        secondNode.data.name,
                ).toBe('Second Template')

                // Verify edges are preserved
                expect(nextGraph.edges).toHaveLength(3)
                const connectingEdge = nextGraph.edges.find(
                    (e) =>
                        e.source === 'liquid_template1' &&
                        e.target === 'liquid_template2',
                )
                expect(connectingEdge).toBeDefined()
            })
        })

        describe('Error resilience', () => {
            it('should handle malformed action objects gracefully', () => {
                const graph = _cloneDeep(liquidTemplateGraphFixture)

                // Test with missing liquidTemplateNodeId
                const resultWithMissingId = liquidTemplateReducer(graph, {
                    type: 'SET_LIQUID_TEMPLATE_NAME',
                    liquidTemplateNodeId: '',
                    name: 'Should not work',
                })

                expect(resultWithMissingId).toEqual(graph)
            })

            it('should preserve graph state when operations target non-liquid-template nodes', () => {
                const graph = _cloneDeep(liquidTemplateGraphFixture)
                const originalState = _cloneDeep(graph)

                // Try to update a trigger node as if it were a liquid template
                const result = liquidTemplateReducer(graph, {
                    type: 'SET_LIQUID_TEMPLATE_NAME',
                    liquidTemplateNodeId: 'trigger1',
                    name: 'This should not work',
                })

                expect(result).toEqual(originalState)
            })
        })
    })
})

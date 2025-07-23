import _cloneDeep from 'lodash/cloneDeep'

import {
    buildEdgeCommonProperties,
    buildNodeCommonProperties,
} from 'pages/automate/workflows/models/visualBuilderGraph.model'
import {
    ChannelTriggerNodeType,
    HttpRequestNodeType,
    LiquidTemplateNodeType,
    VisualBuilderGraph,
} from 'pages/automate/workflows/models/visualBuilderGraph.types'

import { liquidTemplateReducer } from '../liquidTemplateReducer'

// Complex fixture with multiple node types for integration testing
const complexWorkflowFixture: VisualBuilderGraph<ChannelTriggerNodeType> = {
    id: 'workflow1',
    internal_id: 'internal1',
    is_draft: false,
    isTemplate: false,
    name: 'Complex Integration Workflow',
    available_languages: ['en-US'],
    nodes: [
        {
            ...buildNodeCommonProperties(),
            id: 'trigger1',
            type: 'channel_trigger',
            data: {
                label: 'Start Complex Flow',
                label_tkey: 'start_complex_tkey',
            },
        },
        {
            ...buildNodeCommonProperties(),
            id: 'http_request1',
            type: 'http_request',
            data: {
                name: 'Fetch Customer Data',
                url: 'https://api.example.com/data',
                method: 'GET',
                headers: [],
                json: null,
                formUrlencoded: null,
                bodyContentType: null,
                variables: [
                    {
                        id: 'customer_data',
                        name: 'Customer Data',
                        jsonpath: '$.customer',
                        data_type: 'json',
                    },
                    {
                        id: 'order_total',
                        name: 'Order Total',
                        jsonpath: '$.order.total',
                        data_type: 'number',
                    },
                ],
            },
        },
        {
            ...buildNodeCommonProperties(),
            id: 'liquid_template1',
            type: 'liquid_template',
            data: {
                name: 'Data Processor',
                template:
                    '{{ steps_state.http_request1.content.customer_data | json }}',
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
            target: 'http_request1',
        },
        {
            ...buildEdgeCommonProperties(),
            source: 'http_request1',
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

describe('Liquid Template Integration Tests', () => {
    describe('Variable processing and references', () => {
        it('should handle references to previous step variables', () => {
            const graph = _cloneDeep(complexWorkflowFixture)
            const variableTemplate = `
                Customer Name: {{ steps_state.http_request1.content.customer_data.name }}
                Order Total: {{ steps_state.http_request1.content.order_total | money }}
                Processing Date: {{ "now" | date: "%Y-%m-%d" }}
            `

            const nextGraph = liquidTemplateReducer(graph, {
                type: 'SET_LIQUID_TEMPLATE_EXPRESSION',
                liquidTemplateNodeId: 'liquid_template1',
                template: variableTemplate,
            })

            const liquidTemplateNode = nextGraph.nodes.find(
                (n): n is LiquidTemplateNodeType =>
                    n.id === 'liquid_template1' && n.type === 'liquid_template',
            )!

            expect(liquidTemplateNode.data.template).toBe(variableTemplate)
        })

        it('should handle complex variable transformations', () => {
            const graph = _cloneDeep(complexWorkflowFixture)
            const transformationTemplate = `
                {% assign customer = steps_state.http_request1.content.customer_data %}
                {% assign total = steps_state.http_request1.content.order_total %}
                
                {% if customer.vip_status == true %}
                    {% assign discount = total | times: 0.1 %}
                    VIP Customer: {{ customer.name }}
                    Discount Applied: {{ discount | money }}
                    Final Total: {{ total | minus: discount | money }}
                {% else %}
                    Regular Customer: {{ customer.name }}
                    Total: {{ total | money }}
                {% endif %}
                
                Loyalty Points: {{ total | divided_by: 10 | round }}
            `

            const nextGraph = liquidTemplateReducer(graph, {
                type: 'SET_LIQUID_TEMPLATE_EXPRESSION',
                liquidTemplateNodeId: 'liquid_template1',
                template: transformationTemplate,
            })

            const liquidTemplateNode = nextGraph.nodes.find(
                (n): n is LiquidTemplateNodeType =>
                    n.id === 'liquid_template1' && n.type === 'liquid_template',
            )!

            expect(liquidTemplateNode.data.template).toBe(
                transformationTemplate,
            )
        })

        it('should handle cross-node variable dependencies', () => {
            const graph = _cloneDeep(complexWorkflowFixture)

            // Add another HTTP request node
            const secondHttpNode: HttpRequestNodeType = {
                ...buildNodeCommonProperties(),
                id: 'http_request2',
                type: 'http_request',
                data: {
                    name: 'Fetch Order Details',
                    url: 'https://api.example.com/orders/{{ steps_state.liquid_template1.output.value }}',
                    method: 'GET',
                    headers: [],
                    json: null,
                    formUrlencoded: null,
                    bodyContentType: null,
                    variables: [
                        {
                            id: 'order_details',
                            name: 'Order Details',
                            jsonpath: '$.order',
                            data_type: 'json',
                        },
                    ],
                },
            }
            graph.nodes.push(secondHttpNode)

            // Add edge
            graph.edges.push({
                ...buildEdgeCommonProperties(),
                source: 'liquid_template1',
                target: 'http_request2',
            })

            // Update liquid template to output a customer ID
            const customerIdTemplate =
                '{{ steps_state.http_request1.content.customer_data.id }}'

            const nextGraph = liquidTemplateReducer(graph, {
                type: 'SET_LIQUID_TEMPLATE_EXPRESSION',
                liquidTemplateNodeId: 'liquid_template1',
                template: customerIdTemplate,
            })

            const liquidTemplateNode = nextGraph.nodes.find(
                (n): n is LiquidTemplateNodeType =>
                    n.id === 'liquid_template1' && n.type === 'liquid_template',
            )!

            expect(liquidTemplateNode.data.template).toBe(customerIdTemplate)

            // Verify the HTTP node still references the liquid template output
            const httpNode = nextGraph.nodes.find(
                (n): n is HttpRequestNodeType =>
                    n.id === 'http_request2' && n.type === 'http_request',
            )!

            expect(httpNode.data.url).toContain(
                'steps_state.liquid_template1.output.value',
            )
        })
    })

    describe('Data type consistency and validation', () => {
        it('should handle data type changes affecting downstream nodes', () => {
            const graph = _cloneDeep(complexWorkflowFixture)

            // First set a numeric template
            let nextGraph = liquidTemplateReducer(graph, {
                type: 'SET_LIQUID_TEMPLATE_EXPRESSION',
                liquidTemplateNodeId: 'liquid_template1',
                template:
                    '{{ steps_state.http_request1.content.order_total | round }}',
            })

            // Change to number output type
            nextGraph = liquidTemplateReducer(nextGraph, {
                type: 'SET_LIQUID_TEMPLATE_OUTPUT_DATA_TYPE',
                liquidTemplateNodeId: 'liquid_template1',
                data_type: 'number',
            })

            const liquidTemplateNode = nextGraph.nodes.find(
                (n): n is LiquidTemplateNodeType =>
                    n.id === 'liquid_template1' && n.type === 'liquid_template',
            )!

            expect(liquidTemplateNode.data.output.data_type).toBe('number')
            expect(liquidTemplateNode.data.template).toBe(
                '{{ steps_state.http_request1.content.order_total | round }}',
            )
        })

        it('should handle boolean output with conditional logic', () => {
            const graph = _cloneDeep(complexWorkflowFixture)
            const booleanTemplate = `
                {% assign total = steps_state.http_request1.content.order_total %}
                {% if total > 100 %}
                    true
                {% else %}
                    false
                {% endif %}
            `

            let nextGraph = liquidTemplateReducer(graph, {
                type: 'SET_LIQUID_TEMPLATE_EXPRESSION',
                liquidTemplateNodeId: 'liquid_template1',
                template: booleanTemplate,
            })

            nextGraph = liquidTemplateReducer(nextGraph, {
                type: 'SET_LIQUID_TEMPLATE_OUTPUT_DATA_TYPE',
                liquidTemplateNodeId: 'liquid_template1',
                data_type: 'boolean',
            })

            const liquidTemplateNode = nextGraph.nodes.find(
                (n): n is LiquidTemplateNodeType =>
                    n.id === 'liquid_template1' && n.type === 'liquid_template',
            )!

            expect(liquidTemplateNode.data.output.data_type).toBe('boolean')
            expect(liquidTemplateNode.data.template).toBe(booleanTemplate)
        })

        it('should handle date output with date formatting', () => {
            const graph = _cloneDeep(complexWorkflowFixture)
            const dateTemplate = `
                {% assign order_date = steps_state.http_request1.content.customer_data.created_at %}
                {{ order_date | date: "%Y-%m-%d" }}
            `

            let nextGraph = liquidTemplateReducer(graph, {
                type: 'SET_LIQUID_TEMPLATE_EXPRESSION',
                liquidTemplateNodeId: 'liquid_template1',
                template: dateTemplate,
            })

            nextGraph = liquidTemplateReducer(nextGraph, {
                type: 'SET_LIQUID_TEMPLATE_OUTPUT_DATA_TYPE',
                liquidTemplateNodeId: 'liquid_template1',
                data_type: 'date',
            })

            const liquidTemplateNode = nextGraph.nodes.find(
                (n): n is LiquidTemplateNodeType =>
                    n.id === 'liquid_template1' && n.type === 'liquid_template',
            )!

            expect(liquidTemplateNode.data.output.data_type).toBe('date')
            expect(liquidTemplateNode.data.template).toBe(dateTemplate)
        })
    })

    describe('Workflow complexity and performance', () => {
        it('should handle multiple liquid template nodes in sequence', () => {
            const graph = _cloneDeep(complexWorkflowFixture)

            // Add second liquid template
            const secondLiquidTemplate: LiquidTemplateNodeType = {
                ...buildNodeCommonProperties(),
                id: 'liquid_template2',
                type: 'liquid_template',
                data: {
                    name: 'Secondary Processor',
                    template:
                        '{{ steps_state.liquid_template1.output.value | upcase }}',
                    output: {
                        data_type: 'string',
                    },
                },
            }
            graph.nodes.push(secondLiquidTemplate)

            // Rewire edges
            const liquidToEndEdge = graph.edges.find(
                (e) => e.source === 'liquid_template1',
            )!
            liquidToEndEdge.target = 'liquid_template2'

            graph.edges.push({
                ...buildEdgeCommonProperties(),
                source: 'liquid_template2',
                target: 'end1',
            })

            // Update both templates
            let nextGraph = liquidTemplateReducer(graph, {
                type: 'SET_LIQUID_TEMPLATE_EXPRESSION',
                liquidTemplateNodeId: 'liquid_template1',
                template:
                    '{{ steps_state.http_request1.content.customer_data.name }}',
            })

            nextGraph = liquidTemplateReducer(nextGraph, {
                type: 'SET_LIQUID_TEMPLATE_EXPRESSION',
                liquidTemplateNodeId: 'liquid_template2',
                template:
                    'Processed: {{ steps_state.liquid_template1.output.value | upcase }}',
            })

            const firstTemplate = nextGraph.nodes.find(
                (n): n is LiquidTemplateNodeType =>
                    n.id === 'liquid_template1' && n.type === 'liquid_template',
            )!

            const secondTemplate = nextGraph.nodes.find(
                (n): n is LiquidTemplateNodeType =>
                    n.id === 'liquid_template2' && n.type === 'liquid_template',
            )!

            expect(firstTemplate.data.template).toBe(
                '{{ steps_state.http_request1.content.customer_data.name }}',
            )
            expect(secondTemplate.data.template).toBe(
                'Processed: {{ steps_state.liquid_template1.output.value | upcase }}',
            )
        })

        it('should maintain workflow integrity during concurrent updates', () => {
            const graph = _cloneDeep(complexWorkflowFixture)
            const originalNodeCount = graph.nodes.length
            const originalEdgeCount = graph.edges.length

            // Perform multiple operations
            let currentGraph = graph
            const operations = [
                {
                    type: 'SET_LIQUID_TEMPLATE_NAME' as const,
                    liquidTemplateNodeId: 'liquid_template1',
                    name: 'Advanced Data Processor',
                },
                {
                    type: 'SET_LIQUID_TEMPLATE_EXPRESSION' as const,
                    liquidTemplateNodeId: 'liquid_template1',
                    template:
                        '{% assign data = steps_state.http_request1.content.customer_data %}{{ data | json }}',
                },
                {
                    type: 'SET_LIQUID_TEMPLATE_OUTPUT_DATA_TYPE' as const,
                    liquidTemplateNodeId: 'liquid_template1',
                    data_type: 'string' as const,
                },
            ]

            operations.forEach((op) => {
                currentGraph = liquidTemplateReducer(
                    currentGraph,
                    op,
                ) as VisualBuilderGraph<ChannelTriggerNodeType>
            })

            // Verify workflow integrity
            expect(currentGraph.nodes).toHaveLength(originalNodeCount)
            expect(currentGraph.edges).toHaveLength(originalEdgeCount)

            // Verify liquid template updates
            const liquidTemplateNode = currentGraph.nodes.find(
                (n): n is LiquidTemplateNodeType =>
                    n.id === 'liquid_template1' && n.type === 'liquid_template',
            )!

            expect(liquidTemplateNode.data.name).toBe('Advanced Data Processor')
            expect(liquidTemplateNode.data.template).toBe(
                '{% assign data = steps_state.http_request1.content.customer_data %}{{ data | json }}',
            )
            expect(liquidTemplateNode.data.output.data_type).toBe('string')
        })
    })

    describe('Error handling and edge cases', () => {
        it('should handle invalid variable references gracefully', () => {
            const graph = _cloneDeep(complexWorkflowFixture)
            const invalidTemplate =
                '{{ steps_state.non_existent_node.some_value }}'

            const nextGraph = liquidTemplateReducer(graph, {
                type: 'SET_LIQUID_TEMPLATE_EXPRESSION',
                liquidTemplateNodeId: 'liquid_template1',
                template: invalidTemplate,
            })

            const liquidTemplateNode = nextGraph.nodes.find(
                (n): n is LiquidTemplateNodeType =>
                    n.id === 'liquid_template1' && n.type === 'liquid_template',
            )!

            // Should still update the template (validation happens elsewhere)
            expect(liquidTemplateNode.data.template).toBe(invalidTemplate)
        })

        it('should handle very long template expressions', () => {
            const graph = _cloneDeep(complexWorkflowFixture)
            const longTemplate = [
                '{% assign customer = steps_state.http_request1.content.customer_data %}',
                ...Array.from(
                    { length: 50 },
                    (_, i) =>
                        `{% assign var_${i} = customer.field_${i} | default: "default_${i}" %}`,
                ),
                '{% assign result = "" %}',
                ...Array.from(
                    { length: 50 },
                    (_, i) =>
                        `{% assign result = result | append: var_${i} | append: " " %}`,
                ),
                '{{ result | strip }}',
            ].join('\n')

            const startTime = performance.now()
            const nextGraph = liquidTemplateReducer(graph, {
                type: 'SET_LIQUID_TEMPLATE_EXPRESSION',
                liquidTemplateNodeId: 'liquid_template1',
                template: longTemplate,
            })
            const endTime = performance.now()

            const liquidTemplateNode = nextGraph.nodes.find(
                (n): n is LiquidTemplateNodeType =>
                    n.id === 'liquid_template1' && n.type === 'liquid_template',
            )!

            expect(liquidTemplateNode.data.template).toBe(longTemplate)
            expect(endTime - startTime).toBeLessThan(50) // Should be very fast
        })

        it('should preserve graph structure under stress testing', () => {
            const graph = _cloneDeep(complexWorkflowFixture)
            const originalGraphStructure = {
                nodeCount: graph.nodes.length,
                edgeCount: graph.edges.length,
                nodeIds: graph.nodes.map((n) => n.id).sort(),
                edgeConnections: graph.edges
                    .map((e) => `${e.source}->${e.target}`)
                    .sort(),
            }

            // Perform rapid-fire updates
            let currentGraph = graph
            for (let i = 0; i < 100; i++) {
                currentGraph = liquidTemplateReducer(currentGraph, {
                    type: 'SET_LIQUID_TEMPLATE_EXPRESSION',
                    liquidTemplateNodeId: 'liquid_template1',
                    template: `{{ iteration_${i}_value }}`,
                }) as VisualBuilderGraph<ChannelTriggerNodeType>
            }

            const finalGraphStructure = {
                nodeCount: currentGraph.nodes.length,
                edgeCount: currentGraph.edges.length,
                nodeIds: currentGraph.nodes.map((n) => n.id).sort(),
                edgeConnections: currentGraph.edges
                    .map((e) => `${e.source}->${e.target}`)
                    .sort(),
            }

            expect(finalGraphStructure).toEqual(originalGraphStructure)

            // Verify final template is correct
            const liquidTemplateNode = currentGraph.nodes.find(
                (n): n is LiquidTemplateNodeType =>
                    n.id === 'liquid_template1' && n.type === 'liquid_template',
            )!

            expect(liquidTemplateNode.data.template).toBe(
                '{{ iteration_99_value }}',
            )
        })
    })
})

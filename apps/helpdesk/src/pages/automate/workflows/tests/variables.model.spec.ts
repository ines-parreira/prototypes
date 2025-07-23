import { ulid } from 'ulidx'

import {
    buildWorkflowVariableFromNode,
    buildWorkflowVariableFromTrigger,
    extractVariablesFromNode,
    extractVariablesFromText,
    getWorkflowVariableListForNode,
    hasInvalidVariables,
    isValidLiquidSyntax,
    parseWorkflowVariable,
    prerenderVariables,
    toLiquidSyntax,
} from '../models/variables.model'
import {
    SHIPMONK_APPLICATION_ID,
    WorkflowVariableList,
} from '../models/variables.types'
import { buildNodeCommonProperties } from '../models/visualBuilderGraph.model'
import {
    CreateDiscountCodeNodeType,
    EditOrderNoteNodeType,
    LiquidTemplateNodeType,
    OrderSelectionNodeType,
    RefundShippingCostsNodeType,
    ReshipForFreeNodeType,
    VisualBuilderGraph,
} from '../models/visualBuilderGraph.types'
import { visualBuilderGraphSimpleChoicesFixture } from './visualBuilderGraph.fixtures'

describe('parseWorkflowVariable()', () => {
    it('should parse an available flow variable', () => {
        const availableVariables: WorkflowVariableList = [
            {
                nodeType: 'text_reply',
                name: 'My text reply',
                value: 'steps_state.text_reply1.content.text',
                type: 'string',
            },
        ]
        const parsed = parseWorkflowVariable(
            'steps_state.text_reply1.content.text',
            availableVariables,
        )
        expect(parsed).toEqual({
            nodeType: 'text_reply',
            name: 'My text reply',
            value: 'steps_state.text_reply1.content.text',
            type: 'string',
        })
    })

    it('should parse an available group flow variable', () => {
        const availableVariables: WorkflowVariableList = [
            {
                nodeType: 'shopper_authentication',
                name: 'Customer login',
                variables: [
                    {
                        name: 'Customer first name',
                        value: 'steps_state.shopper_authentication1.customer.firstname',
                        type: 'string',
                        nodeType: 'shopper_authentication',
                    },
                ],
            },
        ]
        const parsed = parseWorkflowVariable(
            'steps_state.shopper_authentication1.customer.firstname',
            availableVariables,
        )
        expect(parsed).toEqual({
            name: 'Customer first name',
            value: 'steps_state.shopper_authentication1.customer.firstname',
            type: 'string',
            nodeType: 'shopper_authentication',
        })
    })

    it('should return an invalid flow variable if not found', () => {
        const availableVariables: WorkflowVariableList = []
        const parsed = parseWorkflowVariable(
            'steps_state.shopper_authentication1.customer.firstname',
            availableVariables,
        )
        expect(parsed).toEqual(null)
    })
})

describe('getAvailableFlowVariables', () => {
    const g = visualBuilderGraphSimpleChoicesFixture
    test('no available variables at the beginning of the flow', () => {
        expect(
            getWorkflowVariableListForNode(g, 'multiple_choices1', [], []),
        ).toEqual([])
    })

    test('selected choice and text input variables available', () => {
        expect(
            getWorkflowVariableListForNode(g, 'file_upload1', [], []),
        ).toEqual([
            {
                nodeType: 'multiple_choices',
                name: 'Choices text',
                value: 'steps_state.multiple_choices1.selected_choice.label',
                type: 'string',
            },
            {
                nodeType: 'text_reply',
                name: 'Text reply text',
                value: 'steps_state.text_reply1.content.text',
                type: 'string',
            },
        ])
    })

    test('only selected choice available', () => {
        expect(
            getWorkflowVariableListForNode(g, 'automated_message1', [], []),
        ).toEqual([
            {
                nodeType: 'multiple_choices',
                name: 'Choices text',
                value: 'steps_state.multiple_choices1.selected_choice.label',
                type: 'string',
            },
        ])
    })
    test('dont put undefined nodes if ptrNodeId is not present', () => {
        expect(
            getWorkflowVariableListForNode(
                {
                    name: 'name',
                    nodes: [
                        {
                            id: 'trigger_button1',
                            type: 'channel_trigger',
                        },
                    ],
                    edges: [{ target: 'conditions_end1' }],
                } as any,
                'conditions_end1',
                [],
                [],
            ),
        ).toEqual([])
    })
    test('returns available variables if available integrations are there', () => {
        const graphWithIntegrations = {
            ...g,
        }
        expect(
            expect(
                getWorkflowVariableListForNode(
                    graphWithIntegrations,
                    'multiple_choices1',
                    [],
                    [],
                    [
                        {
                            application_id: SHIPMONK_APPLICATION_ID,
                            integration_id: 1,
                        },
                    ],
                ),
            ).toEqual([
                expect.objectContaining({
                    nodeType: 'order_shipmonk',
                }),
            ]),
        )
    })
})

describe('prerenderVariables()', () => {
    it('should prerender JSON variable', () => {
        expect(
            prerenderVariables(
                '{{steps_state.http_request1.content.variable1 | json}}',
                [
                    {
                        name: '',
                        nodeType: 'http_request',
                        variables: [
                            {
                                name: '',
                                value: 'steps_state.http_request1.content.variable1',
                                nodeType: 'http_request',
                                type: 'json',
                            },
                        ],
                    },
                ],
            ),
        ).toEqual('{}')
    })
})

describe('buildWorkflowVariableFromNode()', () => {
    it('should return order_selection node variables for Shopify app', () => {
        const node: OrderSelectionNodeType = {
            ...buildNodeCommonProperties(),
            id: 'order_selection1',
            type: 'order_selection',
            data: {
                content: {
                    html: '',
                    html_tkey: ulid(),
                    text: '',
                    text_tkey: ulid(),
                },
            },
        }

        expect(
            buildWorkflowVariableFromNode(
                {
                    id: '',
                    internal_id: '',
                    is_draft: false,
                    isTemplate: false,
                    name: '',
                    available_languages: [],
                    nodes: [
                        {
                            ...buildNodeCommonProperties(),
                            id: 'channel_trigger',
                            type: 'channel_trigger',
                            data: {
                                label: '',
                                label_tkey: ulid(),
                            },
                        },
                        node,
                    ],
                    edges: [],
                    apps: [{ type: 'shopify' }],
                    nodeEditingId: null,
                    choiceEventIdEditing: null,
                    branchIdsEditing: [],
                },
                node,
                [],
                [],
            ),
        ).toEqual({
            name: 'Order selection',
            nodeType: 'order_selection',
            variables: expect.arrayContaining([
                {
                    name: 'Fulfillment status',
                    nodeType: 'order_selection',
                    options: [
                        {
                            label: 'unfulfilled',
                            value: null,
                        },
                        {
                            label: 'partially fulfilled',
                            value: 'partial',
                        },
                        {
                            label: 'fulfilled',
                            value: 'fulfilled',
                        },
                        {
                            label: 'restocked',
                            value: 'restocked',
                        },
                    ],
                    type: 'string',
                    value: 'steps_state.order_selection1.order.external_fulfillment_status',
                },
                {
                    name: 'Payment status',
                    nodeType: 'order_selection',
                    options: [
                        {
                            label: 'pending',
                            value: 'pending',
                        },
                        {
                            label: 'authorized',
                            value: 'authorized',
                        },
                        {
                            label: 'paid',
                            value: 'paid',
                        },
                        {
                            label: 'refunded',
                            value: 'refunded',
                        },
                        {
                            label: 'partially refunded',
                            value: 'partially_refunded',
                        },
                        {
                            label: 'voided',
                            value: 'voided',
                        },
                        {
                            label: 'partially paid',
                            value: 'partially_paid',
                        },
                        {
                            label: 'unpaid',
                            value: 'unpaid',
                        },
                    ],
                    type: 'string',
                    value: 'steps_state.order_selection1.order.external_payment_status',
                },
                {
                    name: 'Order status',
                    nodeType: 'order_selection',
                    options: [
                        {
                            label: 'open',
                            value: 'open',
                        },
                        {
                            label: 'archived',
                            value: 'archived',
                        },
                        {
                            label: 'cancelled',
                            value: 'cancelled',
                        },
                    ],
                    type: 'string',
                    value: 'steps_state.order_selection1.order.external_status',
                },
                {
                    name: 'Shipment status',
                    nodeType: 'order_selection',
                    options: [
                        {
                            label: 'label printed',
                            value: 'label_printed',
                        },
                        {
                            label: 'label purchased',
                            value: 'label_purchased',
                        },
                        {
                            label: 'confirmed',
                            value: 'confirmed',
                        },
                        {
                            label: 'in transit',
                            value: 'in_transit',
                        },
                        {
                            label: 'attempted delivery',
                            value: 'attempted_delivery',
                        },
                        {
                            label: 'ready for pickup',
                            value: 'ready_for_pickup',
                        },
                        {
                            label: 'delivered',
                            value: 'delivered',
                        },
                        {
                            label: 'failure',
                            value: 'failure',
                        },
                    ],
                    type: 'string',
                    value: 'steps_state.order_selection1.order.fulfillments.0.external_shipment_status',
                },
            ]),
        })
    })

    it('should return order_selection node variables for non Shopify app', () => {
        const node: OrderSelectionNodeType = {
            ...buildNodeCommonProperties(),
            id: 'order_selection1',
            type: 'order_selection',
            data: {
                content: {
                    html: '',
                    html_tkey: ulid(),
                    text: '',
                    text_tkey: ulid(),
                },
            },
        }

        expect(
            buildWorkflowVariableFromNode(
                {
                    id: '',
                    internal_id: '',
                    is_draft: false,
                    isTemplate: false,
                    name: '',
                    available_languages: [],
                    nodes: [
                        {
                            ...buildNodeCommonProperties(),
                            id: 'channel_trigger',
                            type: 'channel_trigger',
                            data: {
                                label: '',
                                label_tkey: ulid(),
                            },
                        },
                        node,
                    ],
                    edges: [],
                    nodeEditingId: null,
                    choiceEventIdEditing: null,
                    branchIdsEditing: [],
                },
                node,
                [],
                [],
            ),
        ).toEqual({
            name: 'Order selection',
            nodeType: 'order_selection',
            variables: expect.arrayContaining([
                {
                    name: 'Fulfillment status',
                    nodeType: 'order_selection',
                    type: 'string',
                    value: 'steps_state.order_selection1.order.external_fulfillment_status',
                },
                {
                    name: 'Payment status',
                    nodeType: 'order_selection',
                    type: 'string',
                    value: 'steps_state.order_selection1.order.external_payment_status',
                },
                {
                    name: 'Order status',
                    nodeType: 'order_selection',
                    type: 'string',
                    value: 'steps_state.order_selection1.order.external_status',
                },
                {
                    name: 'Shipment status',
                    nodeType: 'order_selection',
                    type: 'string',
                    value: 'steps_state.order_selection1.order.fulfillments.0.external_shipment_status',
                },
            ]),
        })
    })

    it('should return success node variables', () => {
        const nodeTypes = [
            'create_discount_code',
            'edit_order_note',
            'reship_for_free',
            'refund_shipping_costs',
        ] as const
        for (const nodeType of nodeTypes) {
            const node:
                | CreateDiscountCodeNodeType
                | EditOrderNoteNodeType
                | ReshipForFreeNodeType
                | RefundShippingCostsNodeType = {
                ...buildNodeCommonProperties(),
                id: `${nodeType}1`,
                type: nodeType as any,
                data: {
                    integrationId: '',
                    discountType: '',
                    amount: '',
                    validFor: '',
                    note: '',
                } as any,
            }

            const result = buildWorkflowVariableFromNode(
                {
                    id: '',
                    internal_id: '',
                    is_draft: false,
                    isTemplate: false,
                    name: '',
                    available_languages: [],
                    nodes: [
                        {
                            ...buildNodeCommonProperties(),
                            id: 'channel_trigger',
                            type: 'channel_trigger',
                            data: {
                                label: '',
                                label_tkey: ulid(),
                            },
                        },
                        node,
                    ],
                    edges: [],
                    apps: [{ type: 'shopify' }],
                    nodeEditingId: null,
                    choiceEventIdEditing: null,
                    branchIdsEditing: [],
                },
                node,
                [],
                [],
            )
            expect(result).toEqual(
                expect.objectContaining({
                    name: expect.any(String),
                    nodeType: nodeType,
                    value: `steps_state.${nodeType}1.success`,
                    type: 'boolean',
                }),
            )
        }
    })

    it('should return liquid template node variable', () => {
        const node: LiquidTemplateNodeType = {
            ...buildNodeCommonProperties(),
            id: 'liquid_template1',
            type: 'liquid_template',
            data: {
                name: 'Format customer data',
                template: 'Customer: [[objects.customer.name]]',
                output: {
                    data_type: 'string',
                },
            },
        }

        expect(
            buildWorkflowVariableFromNode(
                {
                    id: '',
                    internal_id: '',
                    is_draft: false,
                    isTemplate: false,
                    name: '',
                    available_languages: [],
                    nodes: [
                        {
                            ...buildNodeCommonProperties(),
                            id: 'channel_trigger',
                            type: 'channel_trigger',
                            data: {
                                label: '',
                                label_tkey: ulid(),
                            },
                        },
                        node,
                    ],
                    edges: [],
                    nodeEditingId: null,
                    choiceEventIdEditing: null,
                    branchIdsEditing: [],
                },
                node,
                [],
                [],
            ),
        ).toEqual({
            name: 'Format customer data',
            value: 'steps_state.liquid_template1.output.value',
            nodeType: 'liquid_template',
            type: 'string',
            filter: undefined,
        })
    })

    it('should return liquid template node variable with date filter', () => {
        const node: LiquidTemplateNodeType = {
            ...buildNodeCommonProperties(),
            id: 'liquid_template1',
            type: 'liquid_template',
            data: {
                name: 'Format date',
                template:
                    'Date: [[objects.order.created_datetime | format_datetime]]',
                output: {
                    data_type: 'date',
                },
            },
        }

        expect(
            buildWorkflowVariableFromNode(
                {
                    id: '',
                    internal_id: '',
                    is_draft: false,
                    isTemplate: false,
                    name: '',
                    available_languages: [],
                    nodes: [
                        {
                            ...buildNodeCommonProperties(),
                            id: 'channel_trigger',
                            type: 'channel_trigger',
                            data: {
                                label: '',
                                label_tkey: ulid(),
                            },
                        },
                        node,
                    ],
                    edges: [],
                    nodeEditingId: null,
                    choiceEventIdEditing: null,
                    branchIdsEditing: [],
                },
                node,
                [],
                [],
            ),
        ).toEqual({
            name: 'Format date',
            value: 'steps_state.liquid_template1.output.value',
            nodeType: 'liquid_template',
            type: 'date',
            filter: 'format_datetime',
        })
    })

    it('should use default name for liquid template node when name is empty', () => {
        const node: LiquidTemplateNodeType = {
            ...buildNodeCommonProperties(),
            id: 'liquid_template1',
            type: 'liquid_template',
            data: {
                name: '',
                template: 'Template: [[objects.customer.name]]',
                output: {
                    data_type: 'string',
                },
            },
        }

        const result = buildWorkflowVariableFromNode(
            {
                id: '',
                internal_id: '',
                is_draft: false,
                isTemplate: false,
                name: '',
                available_languages: [],
                nodes: [
                    {
                        ...buildNodeCommonProperties(),
                        id: 'channel_trigger',
                        type: 'channel_trigger',
                        data: {
                            label: '',
                            label_tkey: ulid(),
                        },
                    },
                    node,
                ],
                edges: [],
                nodeEditingId: null,
                choiceEventIdEditing: null,
                branchIdsEditing: [],
            },
            node,
            [],
            [],
        )

        expect(result).toEqual(
            expect.objectContaining({
                name: 'Liquid template',
                nodeType: 'liquid_template',
                type: 'string',
            }),
        )
    })
})

describe('extractVariablesFromText()', () => {
    it('should extract variable without filter from text', () => {
        expect(
            extractVariablesFromText(
                '{{steps_state.http_request1.content.variable1}}',
            ),
        ).toEqual([{ value: 'steps_state.http_request1.content.variable1' }])
    })

    it('should trim whitespaces from value', () => {
        expect(
            extractVariablesFromText(
                '{{ steps_state.http_request1.content.variable1 }}',
            ),
        ).toEqual([{ value: 'steps_state.http_request1.content.variable1' }])
    })

    it('should extract value with filter', () => {
        expect(
            extractVariablesFromText(
                '{{steps_state.http_request1.content.variable1 | json}}',
            ),
        ).toEqual([
            {
                value: 'steps_state.http_request1.content.variable1',
                filter: 'json',
            },
        ])
    })

    it('should extract value with multiple filter', () => {
        expect(
            extractVariablesFromText(
                '{{steps_state.http_request1.content.variable1 | json | default: "null"}}',
            ),
        ).toEqual([
            {
                value: 'steps_state.http_request1.content.variable1',
                filter: 'json | default: "null"',
            },
        ])
    })

    // Liquid Template Tests
    it('should extract liquid template variables when isLiquidTemplate is true', () => {
        expect(
            extractVariablesFromText(
                '[[objects.customer.name]] and [[objects.order.id]]',
                true,
            ),
        ).toEqual([
            { value: 'objects.customer.name' },
            { value: 'objects.order.id' },
        ])
    })

    it('should extract liquid template variables with filters', () => {
        expect(
            extractVariablesFromText(
                '[[objects.customer.name | upcase]] - [[objects.order.total | format_currency]]',
                true,
            ),
        ).toEqual([
            {
                value: 'objects.customer.name',
                filter: 'upcase',
            },
            {
                value: 'objects.order.total',
                filter: 'format_currency',
            },
        ])
    })

    it('should extract liquid template variables with multiple filters', () => {
        expect(
            extractVariablesFromText(
                '[[objects.customer.name | upcase | truncate: 20]]',
                true,
            ),
        ).toEqual([
            {
                value: 'objects.customer.name',
                filter: 'upcase | truncate: 20',
            },
        ])
    })

    it('should return empty array for liquid template syntax when isLiquidTemplate is false', () => {
        expect(
            extractVariablesFromText('[[objects.customer.name]]', false),
        ).toEqual([])
    })

    it('should return empty array for regular syntax when isLiquidTemplate is true', () => {
        expect(
            extractVariablesFromText('{{objects.customer.name}}', true),
        ).toEqual([])
    })

    it('should handle mixed text with liquid template variables', () => {
        expect(
            extractVariablesFromText(
                'Customer: [[objects.customer.name]] has order [[objects.order.id]] with status [[objects.order.status]]',
                true,
            ),
        ).toEqual([
            { value: 'objects.customer.name' },
            { value: 'objects.order.id' },
            { value: 'objects.order.status' },
        ])
    })

    it('should trim whitespace from liquid template variables', () => {
        expect(
            extractVariablesFromText(
                '[[ objects.customer.name ]] and [[ objects.order.id | upcase ]]',
                true,
            ),
        ).toEqual([
            { value: 'objects.customer.name' },
            {
                value: 'objects.order.id',
                filter: 'upcase',
            },
        ])
    })
})

describe('hasInvalidVariables()', () => {
    const variables: WorkflowVariableList = [
        {
            name: 'Customer Name',
            value: 'objects.customer.name',
            nodeType: 'shopper_authentication',
            type: 'string',
        },
        {
            name: 'Order ID',
            value: 'objects.order.id',
            nodeType: 'order_selection',
            type: 'string',
        },
    ]

    it('should return false for valid regular variables', () => {
        expect(
            hasInvalidVariables(
                'Customer {{objects.customer.name}} has order {{objects.order.id}}',
                variables,
                false,
            ),
        ).toBe(false)
    })

    it('should return true for invalid regular variables', () => {
        expect(
            hasInvalidVariables(
                'Customer {{invalid.variable}}',
                variables,
                false,
            ),
        ).toBe(true)
    })

    it('should return false for valid liquid template variables', () => {
        expect(
            hasInvalidVariables(
                'Customer [[objects.customer.name]] has order [[objects.order.id]]',
                variables,
                true,
            ),
        ).toBe(false)
    })

    it('should return true for invalid liquid template variables', () => {
        expect(
            hasInvalidVariables(
                'Customer [[invalid.variable]]',
                variables,
                true,
            ),
        ).toBe(true)
    })

    it('should return false when no variables present', () => {
        expect(
            hasInvalidVariables(
                'Plain text with no variables',
                variables,
                true,
            ),
        ).toBe(false)
    })

    it('should handle mixed valid and invalid liquid template variables', () => {
        expect(
            hasInvalidVariables(
                'Customer [[objects.customer.name]] has invalid [[invalid.variable]]',
                variables,
                true,
            ),
        ).toBe(true)
    })
})

describe('toLiquidSyntax()', () => {
    it('should convert to regular syntax when isLiquidTemplate is false', () => {
        expect(toLiquidSyntax({ value: 'objects.customer.name' }, false)).toBe(
            '{{objects.customer.name}}',
        )
    })

    it('should convert to regular syntax with filter when isLiquidTemplate is false', () => {
        expect(
            toLiquidSyntax(
                { value: 'objects.customer.name', filter: 'upcase' },
                false,
            ),
        ).toBe('{{objects.customer.name | upcase}}')
    })

    it('should convert to liquid template syntax when isLiquidTemplate is true', () => {
        expect(toLiquidSyntax({ value: 'objects.customer.name' }, true)).toBe(
            '[[objects.customer.name]]',
        )
    })

    it('should convert to liquid template syntax with filter when isLiquidTemplate is true', () => {
        expect(
            toLiquidSyntax(
                { value: 'objects.customer.name', filter: 'upcase' },
                true,
            ),
        ).toBe('[[objects.customer.name | upcase]]')
    })

    it('should handle complex filters', () => {
        expect(
            toLiquidSyntax(
                {
                    value: 'objects.order.total',
                    filter: 'format_currency: "USD", 2',
                },
                true,
            ),
        ).toBe('[[objects.order.total | format_currency: "USD", 2]]')
    })
})

describe('isValidLiquidSyntax()', () => {
    it('should return true for valid liquid syntax', () => {
        expect(isValidLiquidSyntax('Hello {{ name }}')).toBe(true)
    })

    it('should return true for valid liquid syntax with filters', () => {
        expect(isValidLiquidSyntax('Hello {{ name | upcase }}')).toBe(true)
    })

    it('should return true for plain text', () => {
        expect(isValidLiquidSyntax('Hello world')).toBe(true)
    })

    it('should return false for invalid liquid syntax', () => {
        expect(isValidLiquidSyntax('Hello {{ unclosed tag')).toBe(false)
    })

    it('should return false for malformed liquid tags', () => {
        expect(isValidLiquidSyntax('Hello {{ name }}')).toBe(true)
        expect(isValidLiquidSyntax('Hello {{}')).toBe(false)
    })

    it('should return true for empty string', () => {
        expect(isValidLiquidSyntax('')).toBe(true)
    })

    it('should return true for complex valid liquid syntax', () => {
        expect(
            isValidLiquidSyntax(
                '{% if customer.name %}Hello {{ customer.name | upcase }}{% endif %}',
            ),
        ).toBe(true)
    })
})

describe('buildWorkflowVariableFromTrigger()', () => {
    it('should return product variables', () => {
        const graph: VisualBuilderGraph = {
            id: '',
            internal_id: '',
            is_draft: false,
            isTemplate: false,
            name: '',
            available_languages: [],
            nodes: [
                {
                    ...buildNodeCommonProperties(),
                    id: 'trigger',
                    type: 'llm_prompt_trigger',
                    data: {
                        instructions: 'Instructions',
                        requires_confirmation: false,
                        inputs: [
                            {
                                id: 'someid',
                                name: 'some name',
                                instructions: 'some instructions',
                                kind: 'product',
                            },
                        ],
                        conditionsType: null,
                        conditions: [],
                    },
                },
            ],
            edges: [],
            nodeEditingId: null,
            choiceEventIdEditing: null,
            branchIdsEditing: [],
        }

        expect(buildWorkflowVariableFromTrigger(graph)).toEqual(
            expect.arrayContaining([
                {
                    name: 'Inputs',
                    nodeType: 'custom_input',
                    variables: [
                        {
                            name: 'some name',
                            nodeType: 'custom_input',
                            variables: [
                                {
                                    name: 'Product id',
                                    nodeType: 'custom_input',
                                    type: 'string',
                                    value: 'objects.products.someid.external_id',
                                },
                                {
                                    name: 'Product name',
                                    nodeType: 'custom_input',
                                    type: 'string',
                                    value: 'objects.products.someid.name',
                                },
                                {
                                    name: 'Product type',
                                    nodeType: 'custom_input',
                                    type: 'string',
                                    value: 'objects.products.someid.external_type',
                                },
                                {
                                    name: 'Product variant id',
                                    nodeType: 'custom_input',
                                    type: 'string',
                                    value: 'objects.products.someid.selected_variant.external_id',
                                },
                                {
                                    name: 'Product variant global id',
                                    nodeType: 'custom_input',
                                    type: 'string',
                                    value: 'objects.products.someid.selected_variant.external_gid',
                                },
                                {
                                    name: 'Product variant quantity in stock',
                                    nodeType: 'custom_input',
                                    type: 'number',
                                    value: 'objects.products.someid.selected_variant.quantity',
                                },
                                {
                                    name: 'Product variant name',
                                    nodeType: 'custom_input',
                                    type: 'string',
                                    value: 'objects.products.someid.selected_variant.name',
                                },
                            ],
                        },
                    ],
                },
            ]),
        )
    })
})

describe('extractVariablesFromNode()', () => {
    it('should extract variables from multiple_choice node', () => {
        expect(
            extractVariablesFromNode({
                type: 'multiple_choices',
                data: {
                    choices: [
                        {
                            event_id: 'id1',
                            label: 'text {{variable2}}',
                        },
                        {
                            event_id: 'id2',
                            label: 'text {{variable3}}',
                        },
                    ],
                    content: {
                        html: 'text {{variable1}}',
                        text: 'text {{variable1}}',
                    },
                },
            }),
        ).toEqual(['variable1', 'variable2', 'variable3'])
    })
    it('should extract varialbes from llm_prompt_trigger conditions', () => {
        expect(
            extractVariablesFromNode({
                ...buildNodeCommonProperties(),
                id: 'trigger',
                type: 'llm_prompt_trigger',
                data: {
                    instructions: '',
                    requires_confirmation: false,
                    inputs: [],
                    conditionsType: 'and',
                    conditions: [
                        {
                            equals: [
                                {
                                    var: 'objects.order.external_fulfillment_status',
                                },
                                'fulfilled',
                            ],
                        },
                    ],
                },
            }),
        ).toEqual(['objects.order.external_fulfillment_status'])
    })

    it('should extract variables from liquid_template node', () => {
        expect(
            extractVariablesFromNode({
                type: 'liquid_template',
                data: {
                    name: 'Test template',
                    template:
                        'Customer [[objects.customer.name]] has order [[objects.order.id]]',
                    output: {
                        data_type: 'string',
                    },
                },
            }),
        ).toEqual(['objects.customer.name', 'objects.order.id'])
    })

    it('should extract variables from liquid_template node with no variables', () => {
        expect(
            extractVariablesFromNode({
                type: 'liquid_template',
                data: {
                    name: 'Test template',
                    template: 'Static text with no variables',
                    output: {
                        data_type: 'string',
                    },
                },
            }),
        ).toEqual([])
    })

    it('should extract variables from liquid_template node with complex template', () => {
        expect(
            extractVariablesFromNode({
                type: 'liquid_template',
                data: {
                    name: 'Complex template',
                    template:
                        'Customer: [[objects.customer.name | upcase]] - Order: [[objects.order.id]] - Total: [[objects.order.total | format_currency]]',
                    output: {
                        data_type: 'string',
                    },
                },
            }),
        ).toEqual([
            'objects.customer.name',
            'objects.order.id',
            'objects.order.total',
        ])
    })
})

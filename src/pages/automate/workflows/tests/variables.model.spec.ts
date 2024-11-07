import {ulid} from 'ulidx'

import {
    buildWorkflowVariableFromNode,
    buildWorkflowVariableFromTrigger,
    extractVariablesFromNode,
    extractVariablesFromText,
    getWorkflowVariableListForNode,
    parseWorkflowVariable,
    prerenderVariables,
} from '../models/variables.model'
import {WorkflowVariableList} from '../models/variables.types'
import {buildNodeCommonProperties} from '../models/visualBuilderGraph.model'
import {
    CreateDiscountCodeNodeType,
    OrderSelectionNodeType,
    RefundShippingCostsNodeType,
    ReshipForFreeNodeType,
    VisualBuilderGraph,
} from '../models/visualBuilderGraph.types'
import {visualBuilderGraphSimpleChoicesFixture} from './visualBuilderGraph.fixtures'

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
            availableVariables
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
            availableVariables
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
            availableVariables
        )
        expect(parsed).toEqual(null)
    })
})

describe('getAvailableFlowVariables', () => {
    const g = visualBuilderGraphSimpleChoicesFixture
    test('no available variables at the beginning of the flow', () => {
        expect(getWorkflowVariableListForNode(g, 'multiple_choices1')).toEqual(
            []
        )
    })

    test('selected choice and text input variables available', () => {
        expect(getWorkflowVariableListForNode(g, 'file_upload1')).toEqual([
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
        expect(getWorkflowVariableListForNode(g, 'automated_message1')).toEqual(
            [
                {
                    nodeType: 'multiple_choices',
                    name: 'Choices text',
                    value: 'steps_state.multiple_choices1.selected_choice.label',
                    type: 'string',
                },
            ]
        )
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
                    edges: [{target: 'conditions_end1'}],
                } as any,
                'conditions_end1'
            )
        ).toEqual([])
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
                ]
            )
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
                    name: '',
                    available_languages: [],
                    nodes: [node],
                    edges: [],
                    apps: [{type: 'shopify'}],
                    wfConfigurationOriginal: {
                        id: '',
                        is_draft: false,
                        name: '',
                        internal_id: '',
                        initial_step_id: 'order_selection1',
                        steps: [],
                        transitions: [],
                        available_languages: [],
                    },
                    nodeEditingId: null,
                    choiceEventIdEditing: null,
                    branchIdsEditing: [],
                },
                node
            )
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
                    name: '',
                    available_languages: [],
                    nodes: [node],
                    edges: [],
                    apps: [],
                    wfConfigurationOriginal: {
                        id: '',
                        is_draft: false,
                        name: '',
                        internal_id: '',
                        initial_step_id: 'order_selection1',
                        steps: [],
                        transitions: [],
                        available_languages: [],
                    },
                    nodeEditingId: null,
                    choiceEventIdEditing: null,
                    branchIdsEditing: [],
                },
                node
            )
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

    it('should return create_discount_code node variables', () => {
        const node: CreateDiscountCodeNodeType = {
            ...buildNodeCommonProperties(),
            id: 'create_discount_code1',
            type: 'create_discount_code',
            data: {
                customerId: '',
                integrationId: '',
                discountType: '',
                amount: '',
                validFor: '',
            },
        }

        const result = buildWorkflowVariableFromNode(
            {
                name: '',
                available_languages: [],
                nodes: [node],
                edges: [],
                apps: [],
                wfConfigurationOriginal: {
                    id: '',
                    is_draft: false,
                    name: '',
                    internal_id: '',
                    initial_step_id: 'create_discount_code1',
                    steps: [],
                    transitions: [],
                    available_languages: [],
                },
                nodeEditingId: null,
                choiceEventIdEditing: null,
                branchIdsEditing: [],
            },
            node
        )
        expect(result).toEqual({
            name: 'Create discount code success',
            nodeType: 'create_discount_code',
            value: 'steps_state.create_discount_code1.success',
            type: 'boolean',
        })
    })
    it('should return refund_shipping_costs node variables', () => {
        const node: RefundShippingCostsNodeType = {
            ...buildNodeCommonProperties(),
            id: 'refund_shipping_costs1',
            type: 'refund_shipping_costs',
            data: {
                customerId: '',
                integrationId: '',
                orderExternalId: '',
            },
        }

        const result = buildWorkflowVariableFromNode(
            {
                name: '',
                available_languages: [],
                nodes: [node],
                edges: [],
                apps: [],
                wfConfigurationOriginal: {
                    id: '',
                    is_draft: false,
                    name: '',
                    internal_id: '',
                    initial_step_id: 'refund_shipping_costs1',
                    steps: [],
                    transitions: [],
                    available_languages: [],
                },
                nodeEditingId: null,
                choiceEventIdEditing: null,
                branchIdsEditing: [],
            },
            node
        )
        expect(result).toEqual({
            name: 'Refund shipping costs success',
            nodeType: 'refund_shipping_costs',
            value: 'steps_state.refund_shipping_costs1.success',
            type: 'boolean',
        })
    })
    it('should return reship_for_free node variables', () => {
        const node: ReshipForFreeNodeType = {
            ...buildNodeCommonProperties(),
            id: 'reship_for_free1',
            type: 'reship_for_free',
            data: {
                customerId: '',
                integrationId: '',
                orderExternalId: '',
            },
        }

        const result = buildWorkflowVariableFromNode(
            {
                name: '',
                available_languages: [],
                nodes: [node],
                edges: [],
                apps: [],
                wfConfigurationOriginal: {
                    id: '',
                    is_draft: false,
                    name: '',
                    internal_id: '',
                    initial_step_id: 'reship_for_free1',
                    steps: [],
                    transitions: [],
                    available_languages: [],
                },
                nodeEditingId: null,
                choiceEventIdEditing: null,
                branchIdsEditing: [],
            },
            node
        )
        expect(result).toEqual({
            name: 'Reship for free success',
            nodeType: 'reship_for_free',
            value: 'steps_state.reship_for_free1.success',
            type: 'boolean',
        })
    })
})

describe('extractVariablesFromText()', () => {
    it('should extract variable without filter from text', () => {
        expect(
            extractVariablesFromText(
                '{{steps_state.http_request1.content.variable1}}'
            )
        ).toEqual([{value: 'steps_state.http_request1.content.variable1'}])
    })

    it('should trim whitespaces from value', () => {
        expect(
            extractVariablesFromText(
                '{{ steps_state.http_request1.content.variable1 }}'
            )
        ).toEqual([{value: 'steps_state.http_request1.content.variable1'}])
    })

    it('should extract value with filter', () => {
        expect(
            extractVariablesFromText(
                '{{steps_state.http_request1.content.variable1 | json}}'
            )
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
                '{{steps_state.http_request1.content.variable1 | json | default: "null"}}'
            )
        ).toEqual([
            {
                value: 'steps_state.http_request1.content.variable1',
                filter: 'json | default: "null"',
            },
        ])
    })
})

describe('buildWorkflowVariableFromTrigger()', () => {
    it('should return product variables', () => {
        const graph: VisualBuilderGraph = {
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
            wfConfigurationOriginal: {
                internal_id: 'id_2',
                id: 'id_2',
                name: 'Llm prompt trigger configuration',
                is_draft: false,
                initial_step_id: 'trigger',
                entrypoint: null,
                available_languages: [],
                steps: [],
                transitions: [],
                updated_datetime: '2024-09-17T11:18:00.201Z',
                triggers: [],
                entrypoints: [],
                apps: [],
            },
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
            ])
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
            })
        ).toEqual(['variable1', 'variable2', 'variable3'])
    })
})

import {ulid} from 'ulidx'
import {
    buildWorkflowVariableFromNode,
    getWorkflowVariableListForNode,
    parseWorkflowVariable,
    prerenderVariables,
} from '../models/variables.model'
import {WorkflowVariableList} from '../models/variables.types'
import {buildNodeCommonProperties} from '../models/visualBuilderGraph.model'
import {OrderSelectionNodeType} from '../models/visualBuilderGraph.types'
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
})

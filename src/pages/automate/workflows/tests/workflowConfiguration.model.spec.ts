import {transformVisualBuilderGraphIntoWfConfiguration} from '../models/visualBuilderGraph.model'
import {transformWorkflowConfigurationIntoVisualBuilderGraph} from '../models/workflowConfiguration.model'
import {
    MessageContent,
    WorkflowConfiguration,
    WorkflowStepChoices,
    WorkflowStepHelpfulPrompt,
    WorkflowStepMessage,
    WorkflowTransition,
} from '../models/workflowConfiguration.types'

const genStepMessage = (
    id: string,
    content: MessageContent
): WorkflowStepMessage => ({
    id,
    kind: 'message',
    settings: {
        message: {
            content: {
                html: content.html,
                text: content.text,
                html_tkey: content.html,
                text_tkey: content.text,
            },
        },
    },
})

const genStepChoices = (
    id: string,
    choices: WorkflowStepChoices['settings']['choices'],
    content: MessageContent
): WorkflowStepChoices => ({
    id,
    kind: 'choices',
    settings: {
        choices: choices.map((choice) => ({
            ...choice,
            label_tkey: choice.label,
        })),
        message: {
            content: {
                html: content.html,
                text: content.text,
                html_tkey: content.html,
                text_tkey: content.text,
            },
        },
    },
})

const genStepHelpfulPrompt = (id: string): WorkflowStepHelpfulPrompt => ({
    id,
    kind: 'helpful-prompt',
})

const genTransition = (
    fromId: string,
    toId: string,
    eventId?: Maybe<string>
): WorkflowTransition => ({
    id: `${fromId}-${toId}-${eventId ?? ''}`,
    from_step_id: fromId,
    to_step_id: toId,
    ...(eventId ? {event: {id: eventId, kind: 'choices'}} : {}),
})

describe('workflowConfiguration is transformed into visualBuilderGraph', () => {
    test('full configuration', () => {
        const c: WorkflowConfiguration = {
            id: '1',
            internal_id: '1',
            is_draft: false,
            name: 'test',
            initial_step_id: 'choices1',
            entrypoint: {
                label: 'entrypoint',
                label_tkey: 'entrypoint_tkey',
            },
            steps: [
                genStepChoices(
                    'choices1',
                    [
                        {
                            label: 'choice1',
                            event_id: 'eventId1',
                        },
                        {
                            label: 'choice2',
                            event_id: 'eventId2',
                        },
                    ],
                    {html: 'html', text: 'text'}
                ),
                genStepMessage('messages2', {html: 'html', text: 'text'}),
                genStepMessage('messages3', {html: 'html', text: 'text'}),
                genStepHelpfulPrompt('helpfulPrompt1'),
                genStepHelpfulPrompt('helpfulPrompt2'),
            ],
            transitions: [
                genTransition('choices1', 'messages2', 'eventId1'),
                genTransition('choices1', 'messages3', 'eventId2'),
                genTransition('messages2', 'helpfulPrompt1'),
                genTransition('messages3', 'helpfulPrompt2'),
            ],
            available_languages: ['en-US'],
        }
        const visualBuilderGraph =
            transformWorkflowConfigurationIntoVisualBuilderGraph(
                transformVisualBuilderGraphIntoWfConfiguration(
                    transformWorkflowConfigurationIntoVisualBuilderGraph(c)
                )
            )
        expect(visualBuilderGraph.nodes.length).toBe(6)
        expect(visualBuilderGraph.nodes).toEqual(
            // arrayContaining does not check the order
            expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(String),
                    type: 'channel_trigger',
                    data: expect.objectContaining({
                        label: 'entrypoint',
                        label_tkey: 'entrypoint_tkey',
                    }),
                }),
                expect.objectContaining({
                    id: 'choices1',
                    type: 'multiple_choices',
                    data: expect.objectContaining({
                        content: expect.objectContaining({
                            html: 'html',
                            text: 'text',
                        }),
                        choices: expect.arrayContaining([
                            expect.objectContaining({
                                label: 'choice1',
                                event_id: 'eventId1',
                            }),
                            expect.objectContaining({
                                label: 'choice2',
                                event_id: 'eventId2',
                            }),
                        ]),
                    }),
                }),
                expect.objectContaining({
                    id: 'messages2',
                    type: 'automated_message',
                    data: expect.objectContaining({
                        content: expect.objectContaining({
                            html: 'html',
                            text: 'text',
                        }),
                    }),
                }),
                expect.objectContaining({
                    id: 'helpfulPrompt1',
                    type: 'end',
                    data: expect.objectContaining({
                        action: 'ask-for-feedback',
                    }),
                }),
                expect.objectContaining({
                    id: 'messages3',
                    type: 'automated_message',
                    data: expect.objectContaining({
                        content: expect.objectContaining({
                            html: 'html',
                            text: 'text',
                        }),
                    }),
                }),
                expect.objectContaining({
                    id: 'helpfulPrompt2',
                    type: 'end',
                    data: {
                        action: 'ask-for-feedback',
                    },
                }),
            ])
        )
        const [
            {id: channelTriggerNodeId},
            {id: multipleChoicesId},
            {id: automatedMessage1NodeId},
            {id: end1NodeId},
            {id: automatedMessage2NodeId},
            {id: end2NodeId},
        ] = visualBuilderGraph.nodes
        expect(visualBuilderGraph.edges.length).toBe(5)
        expect(visualBuilderGraph.edges).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(String),
                    source: channelTriggerNodeId,
                    target: multipleChoicesId,
                }),
                expect.objectContaining({
                    id: expect.any(String),
                    source: multipleChoicesId,
                    target: automatedMessage1NodeId,
                }),
                expect.objectContaining({
                    id: expect.any(String),
                    source: automatedMessage1NodeId,
                    target: end1NodeId,
                }),
                expect.objectContaining({
                    id: expect.any(String),
                    source: multipleChoicesId,
                    target: automatedMessage2NodeId,
                }),
                expect.objectContaining({
                    id: expect.any(String),
                    source: automatedMessage2NodeId,
                    target: end2NodeId,
                }),
            ])
        )
    })

    test('llmprompt trigger configuration', () => {
        const c: WorkflowConfiguration = {
            internal_id: '01J7ZTERASHHCT60ZJVYSBS3WZ',
            id: '01J7ZTERAST0PVVPF347XA37FR',
            name: 'Remove order item',
            is_draft: true,
            initial_step_id: 'remove_item',
            entrypoint: null,
            available_languages: ['en-US'],
            steps: [
                {
                    id: 'remove_item',
                    kind: 'remove-item',
                    settings: {
                        customer_id: '{{objects.customer.id}}',
                        order_external_id: '{{objects.order.external_id}}',
                        integration_id: '{{store.helpdesk_integration_id}}',
                        product_variant_id: '',
                        quantity: '',
                    },
                },
                {
                    id: 'end_success',
                    kind: 'end',
                },
                {
                    id: 'end_failure',
                    kind: 'end',
                },
            ],
            transitions: [
                {
                    id: '01J87E4X5V8YDKSF81BX80CCS5',
                    from_step_id: 'remove_item',
                    to_step_id: 'end_success',
                    name: undefined,
                    event: undefined,
                    conditions: undefined,
                },
                {
                    id: '01J87E4X5VZ7NTSXPV74384JKN',
                    from_step_id: 'remove_item',
                    to_step_id: 'end_failure',
                    name: undefined,
                    event: undefined,
                    conditions: undefined,
                },
            ],
            updated_datetime: '2024-09-17T11:18:00.201Z',
            triggers: [
                {
                    kind: 'llm-prompt',
                    settings: {
                        custom_inputs: [
                            {
                                id: '01J7ZTR9XY9M0TQC99836A6PXC',
                                name: 'Quantity',
                                data_type: 'number',
                                instructions: 'Quantity of items to remove',
                            },
                            {
                                id: '01J7ZTRY44ZM21JPNY7A7JK00Z',
                                name: 'Product variant id',
                                data_type: 'string',
                                instructions: 'id of the product variant',
                            },
                        ],
                        object_inputs: [],
                        conditions: null,
                        outputs: [
                            {
                                id: 'remove_item',
                                description: '',
                                path: 'steps_state.remove_item.success',
                            },
                        ],
                    },
                },
            ],
            entrypoints: [
                {
                    kind: 'llm-conversation',
                    trigger: 'llm-prompt',
                    settings: {
                        requires_confirmation: false,
                        instructions:
                            'This action removes the item from the order',
                    },
                },
            ],
            inputs: [
                {
                    id: 'string_input',
                    name: 'Test',
                    description: 'test',
                    data_type: 'string',
                },
            ],
            values: {string_input: 'test'},
        }
        const visualBuilderGraph =
            transformWorkflowConfigurationIntoVisualBuilderGraph(
                transformVisualBuilderGraphIntoWfConfiguration(
                    transformWorkflowConfigurationIntoVisualBuilderGraph(c)
                )
            )
        expect(visualBuilderGraph.nodes.length).toBe(4)
        expect(visualBuilderGraph.edges.length).toBe(3)
        expect(visualBuilderGraph.nodes).toEqual([
            {
                id: 'trigger_button',
                position: {
                    x: 0,
                    y: 0,
                },
                type: 'llm_prompt_trigger',
                data: {
                    instructions: 'This action removes the item from the order',
                    requires_confirmation: false,
                    inputs: [
                        {
                            id: '01J7ZTR9XY9M0TQC99836A6PXC',
                            name: 'Quantity',
                            data_type: 'number',
                            instructions: 'Quantity of items to remove',
                        },
                        {
                            id: '01J7ZTRY44ZM21JPNY7A7JK00Z',
                            name: 'Product variant id',
                            data_type: 'string',
                            instructions: 'id of the product variant',
                        },
                    ],
                    conditionsType: null,
                    conditions: [],
                },
            },
            {
                id: 'remove_item',
                position: {
                    x: 0,
                    y: 0,
                },
                type: 'remove_item',
                data: {
                    customerId: '{{objects.customer.id}}',
                    orderExternalId: '{{objects.order.external_id}}',
                    integrationId: '{{store.helpdesk_integration_id}}',
                    productVariantId: '',
                    quantity: '',
                },
            },
            {
                id: 'end_success',
                position: {
                    x: 0,
                    y: 0,
                },
                type: 'end',
                data: {
                    action: 'end',
                },
            },
            {
                id: 'end_failure',
                position: {
                    x: 0,
                    y: 0,
                },
                type: 'end',
                data: {
                    action: 'end',
                },
            },
        ])
        expect(visualBuilderGraph.edges).toEqual([
            {
                id: 'trigger_button-remove_item',
                type: 'custom',
                style: {
                    stroke: '#D2D7DE',
                },
                interactionWidth: 0,
                data: {},
                source: 'trigger_button',
                target: 'remove_item',
            },
            {
                id: 'remove_item-end_success',
                type: 'custom',
                style: {
                    stroke: '#D2D7DE',
                },
                interactionWidth: 0,
                data: {},
                source: 'remove_item',
                target: 'end_success',
            },
            {
                id: 'remove_item-end_failure',
                type: 'custom',
                style: {
                    stroke: '#D2D7DE',
                },
                interactionWidth: 0,
                data: {},
                source: 'remove_item',
                target: 'end_failure',
            },
        ])
        expect(visualBuilderGraph.inputs).toEqual([
            {
                id: 'string_input',
                name: 'Test',
                description: 'test',
                data_type: 'string',
            },
        ])
        expect(visualBuilderGraph.values).toEqual({
            string_input: 'test',
        })
    })
    test('configuration containing create-discount-code step', () => {
        const c: WorkflowConfiguration = {
            internal_id: '01J7ZTERASHHCT60ZJVYSBS3WZ',
            id: '01J7ZTERAST0PVVPF347XA37FR',
            name: 'Create Discount Code',
            is_draft: true,
            initial_step_id: 'create_discount_code',
            entrypoint: null,
            available_languages: ['en-US'],
            steps: [
                {
                    id: 'create_discount_code',
                    kind: 'create-discount-code',
                    settings: {
                        amount: '',
                        type: '',
                        customer_id: '{{objects.customer.id}}',
                        integration_id: '{{store.helpdesk_integration_id}}',
                        valid_for: '',
                    },
                },
                {
                    id: 'end_success',
                    kind: 'end',
                },
                {
                    id: 'end_failure',
                    kind: 'end',
                },
            ],
            transitions: [
                {
                    id: '01J87E4X5V8YDKSF81BX80CCS5',
                    from_step_id: 'create_discount_code',
                    to_step_id: 'end_success',
                    name: undefined,
                    event: undefined,
                    conditions: undefined,
                },
                {
                    id: '01J87E4X5VZ7NTSXPV74384JKN',
                    from_step_id: 'create_discount_code',
                    to_step_id: 'end_failure',
                    name: undefined,
                    event: undefined,
                    conditions: undefined,
                },
            ],
            updated_datetime: '2024-09-17T11:18:00.201Z',
            triggers: [
                {
                    kind: 'llm-prompt',
                    settings: {
                        custom_inputs: [],
                        object_inputs: [],
                        conditions: null,
                        outputs: [
                            {
                                id: 'create_discount_code',
                                description: '',
                                path: 'steps_state.create_discount_code.success',
                            },
                        ],
                    },
                },
            ],
            entrypoints: [
                {
                    kind: 'llm-conversation',
                    trigger: 'llm-prompt',
                    settings: {
                        requires_confirmation: false,
                        instructions: 'This action creates a discount code',
                    },
                },
            ],
        }
        const visualBuilderGraph =
            transformWorkflowConfigurationIntoVisualBuilderGraph(
                transformVisualBuilderGraphIntoWfConfiguration(
                    transformWorkflowConfigurationIntoVisualBuilderGraph(c)
                )
            )
        expect(visualBuilderGraph.nodes.length).toBe(4)
        expect(visualBuilderGraph.edges.length).toBe(3)
        expect(visualBuilderGraph.nodes).toEqual([
            {
                id: 'trigger_button',
                position: {
                    x: 0,
                    y: 0,
                },
                type: 'llm_prompt_trigger',
                data: {
                    instructions: 'This action creates a discount code',
                    requires_confirmation: false,
                    inputs: [],
                    conditionsType: null,
                    conditions: [],
                },
            },
            {
                id: 'create_discount_code',
                position: {
                    x: 0,
                    y: 0,
                },
                type: 'create_discount_code',
                data: {
                    amount: '{{values.amount}}',
                    customerId: '{{objects.customer.id}}',
                    integrationId: '{{store.helpdesk_integration_id}}',
                    discountType: '{{values.discount_type}}',
                    validFor: '{{values.valid_for}}',
                },
            },
            {
                id: 'end_success',
                position: {
                    x: 0,
                    y: 0,
                },
                type: 'end',
                data: {
                    action: 'end',
                },
            },
            {
                id: 'end_failure',
                position: {
                    x: 0,
                    y: 0,
                },
                type: 'end',
                data: {
                    action: 'end',
                },
            },
        ])
        expect(visualBuilderGraph.edges).toEqual([
            {
                id: 'trigger_button-create_discount_code',
                type: 'custom',
                style: {
                    stroke: '#D2D7DE',
                },
                interactionWidth: 0,
                data: {},
                source: 'trigger_button',
                target: 'create_discount_code',
            },
            {
                id: 'create_discount_code-end_success',
                type: 'custom',
                style: {
                    stroke: '#D2D7DE',
                },
                interactionWidth: 0,
                data: {},
                source: 'create_discount_code',
                target: 'end_success',
            },
            {
                id: 'create_discount_code-end_failure',
                type: 'custom',
                style: {
                    stroke: '#D2D7DE',
                },
                interactionWidth: 0,
                data: {},
                source: 'create_discount_code',
                target: 'end_failure',
            },
        ])
    })
    test('configuration containing reship-for-free step', () => {
        const c: WorkflowConfiguration = {
            internal_id: '01J7ZTERASHHCT60ZJVYSBS3WZ',
            id: '01J7ZTERAST0PVVPF347XA37FR',
            name: 'Reship For Free',
            is_draft: true,
            initial_step_id: 'reship_for_free',
            entrypoint: null,
            available_languages: ['en-US'],
            steps: [
                {
                    id: 'reship_for_free',
                    kind: 'reship-for-free',
                    settings: {
                        customer_id: '{{objects.customer.id}}',
                        order_external_id: '{{objects.order.external_id}}',
                        integration_id: '{{store.helpdesk_integration_id}}',
                    },
                },
                {
                    id: 'end_success',
                    kind: 'end',
                },
                {
                    id: 'end_failure',
                    kind: 'end',
                },
            ],
            transitions: [
                {
                    id: '01J87E4X5V8YDKSF81BX80CCS5',
                    from_step_id: 'reship_for_free',
                    to_step_id: 'end_success',
                    name: undefined,
                    event: undefined,
                    conditions: undefined,
                },
                {
                    id: '01J87E4X5VZ7NTSXPV74384JKN',
                    from_step_id: 'reship_for_free',
                    to_step_id: 'end_failure',
                    name: undefined,
                    event: undefined,
                    conditions: undefined,
                },
            ],
            updated_datetime: '2024-09-17T11:18:00.201Z',
            triggers: [
                {
                    kind: 'llm-prompt',
                    settings: {
                        custom_inputs: [],
                        object_inputs: [],
                        conditions: null,
                        outputs: [
                            {
                                id: 'reship_for_free',
                                description: '',
                                path: 'steps_state.reship_for_free.success',
                            },
                        ],
                    },
                },
            ],
            entrypoints: [
                {
                    kind: 'llm-conversation',
                    trigger: 'llm-prompt',
                    settings: {
                        requires_confirmation: false,
                        instructions: 'This action reships the item for free',
                    },
                },
            ],
        }
        const visualBuilderGraph =
            transformWorkflowConfigurationIntoVisualBuilderGraph(
                transformVisualBuilderGraphIntoWfConfiguration(
                    transformWorkflowConfigurationIntoVisualBuilderGraph(c)
                )
            )
        expect(visualBuilderGraph.nodes.length).toBe(4)
        expect(visualBuilderGraph.edges.length).toBe(3)
        expect(visualBuilderGraph.nodes).toEqual([
            {
                id: 'trigger_button',
                position: {
                    x: 0,
                    y: 0,
                },
                type: 'llm_prompt_trigger',
                data: {
                    instructions: 'This action reships the item for free',
                    requires_confirmation: false,
                    inputs: [],
                    conditionsType: null,
                    conditions: [],
                },
            },
            {
                id: 'reship_for_free',
                position: {
                    x: 0,
                    y: 0,
                },
                type: 'reship_for_free',
                data: {
                    customerId: '{{objects.customer.id}}',
                    orderExternalId: '{{objects.order.external_id}}',
                    integrationId: '{{store.helpdesk_integration_id}}',
                },
            },
            {
                id: 'end_success',
                position: {
                    x: 0,
                    y: 0,
                },
                type: 'end',
                data: {
                    action: 'end',
                },
            },
            {
                id: 'end_failure',
                position: {
                    x: 0,
                    y: 0,
                },
                type: 'end',
                data: {
                    action: 'end',
                },
            },
        ])
        expect(visualBuilderGraph.edges).toEqual([
            {
                id: 'trigger_button-reship_for_free',
                type: 'custom',
                style: {
                    stroke: '#D2D7DE',
                },
                interactionWidth: 0,
                data: {},
                source: 'trigger_button',
                target: 'reship_for_free',
            },
            {
                id: 'reship_for_free-end_success',
                type: 'custom',
                style: {
                    stroke: '#D2D7DE',
                },
                interactionWidth: 0,
                data: {},
                source: 'reship_for_free',
                target: 'end_success',
            },
            {
                id: 'reship_for_free-end_failure',
                type: 'custom',
                style: {
                    stroke: '#D2D7DE',
                },
                interactionWidth: 0,
                data: {},
                source: 'reship_for_free',
                target: 'end_failure',
            },
        ])
    })
    test('configuration containing refund-shipping-costs step', () => {
        const c: WorkflowConfiguration = {
            internal_id: '01J7ZTERASHHCT60ZJVYSBS3WZ',
            id: '01J7ZTERAST0PVVPF347XA37FR',
            name: 'Refund Shipping Costs',
            is_draft: true,
            initial_step_id: 'refund_shipping_costs',
            entrypoint: null,
            available_languages: ['en-US'],
            steps: [
                {
                    id: 'refund_shipping_costs',
                    kind: 'refund-shipping-costs',
                    settings: {
                        customer_id: '{{objects.customer.id}}',
                        order_external_id: '{{objects.order.external_id}}',
                        integration_id: '{{store.helpdesk_integration_id}}',
                    },
                },
                {
                    id: 'end_success',
                    kind: 'end',
                },
                {
                    id: 'end_failure',
                    kind: 'end',
                },
            ],
            transitions: [
                {
                    id: '01J87E4X5V8YDKSF81BX80CCS5',
                    from_step_id: 'refund_shipping_costs',
                    to_step_id: 'end_success',
                    name: undefined,
                    event: undefined,
                    conditions: undefined,
                },
                {
                    id: '01J87E4X5VZ7NTSXPV74384JKN',
                    from_step_id: 'refund_shipping_costs',
                    to_step_id: 'end_failure',
                    name: undefined,
                    event: undefined,
                    conditions: undefined,
                },
            ],
            updated_datetime: '2024-09-17T11:18:00.201Z',
            triggers: [
                {
                    kind: 'llm-prompt',
                    settings: {
                        custom_inputs: [],
                        object_inputs: [],
                        conditions: null,
                        outputs: [
                            {
                                id: 'refund_shipping_costs',
                                description: '',
                                path: 'steps_state.refund_shipping_costs.success',
                            },
                        ],
                    },
                },
            ],
            entrypoints: [
                {
                    kind: 'llm-conversation',
                    trigger: 'llm-prompt',
                    settings: {
                        requires_confirmation: false,
                        instructions: 'This action refunds the shipping costs',
                    },
                },
            ],
        }
        const visualBuilderGraph =
            transformWorkflowConfigurationIntoVisualBuilderGraph(
                transformVisualBuilderGraphIntoWfConfiguration(
                    transformWorkflowConfigurationIntoVisualBuilderGraph(c)
                )
            )
        expect(visualBuilderGraph.nodes.length).toBe(4)
        expect(visualBuilderGraph.edges.length).toBe(3)
        expect(visualBuilderGraph.nodes).toEqual([
            {
                id: 'trigger_button',
                position: {
                    x: 0,
                    y: 0,
                },
                type: 'llm_prompt_trigger',
                data: {
                    instructions: 'This action refunds the shipping costs',
                    requires_confirmation: false,
                    inputs: [],
                    conditionsType: null,
                    conditions: [],
                },
            },
            {
                id: 'refund_shipping_costs',
                position: {
                    x: 0,
                    y: 0,
                },
                type: 'refund_shipping_costs',
                data: {
                    customerId: '{{objects.customer.id}}',
                    orderExternalId: '{{objects.order.external_id}}',
                    integrationId: '{{store.helpdesk_integration_id}}',
                },
            },
            {
                id: 'end_success',
                position: {
                    x: 0,
                    y: 0,
                },
                type: 'end',
                data: {
                    action: 'end',
                },
            },
            {
                id: 'end_failure',
                position: {
                    x: 0,
                    y: 0,
                },
                type: 'end',
                data: {
                    action: 'end',
                },
            },
        ])
        expect(visualBuilderGraph.edges).toEqual([
            {
                id: 'trigger_button-refund_shipping_costs',
                type: 'custom',
                style: {
                    stroke: '#D2D7DE',
                },
                interactionWidth: 0,
                data: {},
                source: 'trigger_button',
                target: 'refund_shipping_costs',
            },
            {
                id: 'refund_shipping_costs-end_success',
                type: 'custom',
                style: {
                    stroke: '#D2D7DE',
                },
                interactionWidth: 0,
                data: {},
                source: 'refund_shipping_costs',
                target: 'end_success',
            },
            {
                id: 'refund_shipping_costs-end_failure',
                type: 'custom',
                style: {
                    stroke: '#D2D7DE',
                },
                interactionWidth: 0,
                data: {},
                source: 'refund_shipping_costs',
                target: 'end_failure',
            },
        ])
    })
    test('configuration containing replace-item step', () => {
        const c: WorkflowConfiguration = {
            internal_id: '01J7ZTERASHHCT60ZJVYSBS3WZ',
            id: '01J7ZTERAST0PVVPF347XA37FR',
            name: 'Replace item',
            is_draft: true,
            initial_step_id: 'replace_item',
            entrypoint: null,
            available_languages: ['en-US'],
            steps: [
                {
                    id: 'replace_item',
                    kind: 'replace-item',
                    settings: {
                        customer_id: '{{objects.customer.id}}',
                        order_external_id: '{{objects.order.external_id}}',
                        integration_id: '{{store.helpdesk_integration_id}}',
                        product_variant_id:
                            '{{objects.products.product1.selected_variant.external_gid}}',
                        quantity: '{{custom_inputs.quantity1}}',
                        added_product_variant_id:
                            '{{objects.products.product2.selected_variant.external_gid}}',
                        added_quantity: '{{custom_inputs.quantity2}}',
                    },
                },
                {
                    id: 'end_success',
                    kind: 'end',
                },
                {
                    id: 'end_failure',
                    kind: 'end',
                },
            ],
            transitions: [
                {
                    id: '01JB9PNJ85BQFCNHATM5QGKJE9',
                    from_step_id: 'replace_item',
                    to_step_id: 'end_success',
                    name: undefined,
                    event: undefined,
                    conditions: undefined,
                },
                {
                    id: '01JB9PNJ85Y4SC7QDG7QP331MS',
                    from_step_id: 'replace_item',
                    to_step_id: 'end_failure',
                    name: undefined,
                    event: undefined,
                    conditions: undefined,
                },
            ],
            updated_datetime: '2024-09-17T11:18:00.201Z',
            triggers: [
                {
                    kind: 'llm-prompt',
                    settings: {
                        custom_inputs: [
                            {
                                data_type: 'string',
                                id: 'quantity1',
                                name: 'Quantity to remove',
                                instructions:
                                    'How nmuch of the product to remove',
                            },
                            {
                                data_type: 'string',
                                id: 'quantity2',
                                name: 'Quantity to add',
                                instructions: 'How much of the product to add',
                            },
                        ],
                        object_inputs: [
                            {
                                kind: 'product',
                                integration_id:
                                    '{{store.helpdesk_integration_id}}',
                                id: 'product1',
                                name: 'Product to replace',
                                instructions: 'Select the product to replace',
                            },
                            {
                                kind: 'product',
                                integration_id:
                                    '{{store.helpdesk_integration_id}}',
                                id: 'product2',
                                name: 'Product to replace with',
                                instructions:
                                    'Select the product to replace with',
                            },
                            {
                                kind: 'customer',
                                integration_id:
                                    '{{store.helpdesk_integration_id}}',
                            },
                            {
                                kind: 'order',
                                integration_id:
                                    '{{store.helpdesk_integration_id}}',
                            },
                        ],
                        conditions: null,
                        outputs: [
                            {
                                id: 'replace_item',
                                description: '',
                                path: 'steps_state.replace_item.success',
                            },
                        ],
                    },
                },
            ],
            entrypoints: [
                {
                    kind: 'llm-conversation',
                    trigger: 'llm-prompt',
                    settings: {
                        requires_confirmation: false,
                        instructions: 'This action replaces an item',
                    },
                    deactivated_datetime: undefined,
                },
            ],
            apps: undefined,
            inputs: undefined,
            values: undefined,
        }
        const visualBuilderGraph =
            transformWorkflowConfigurationIntoVisualBuilderGraph(
                transformVisualBuilderGraphIntoWfConfiguration(
                    transformWorkflowConfigurationIntoVisualBuilderGraph(c)
                )
            )
        expect(visualBuilderGraph.nodes.length).toBe(4)
        expect(visualBuilderGraph.edges.length).toBe(3)
        expect(visualBuilderGraph.nodes).toEqual([
            {
                id: 'trigger_button',
                position: {
                    x: 0,
                    y: 0,
                },
                type: 'llm_prompt_trigger',
                data: {
                    instructions: 'This action replaces an item',
                    requires_confirmation: false,
                    deactivated_datetime: undefined,
                    inputs: [
                        {
                            data_type: 'string',
                            id: 'quantity1',
                            name: 'Quantity to remove',
                            instructions: 'How nmuch of the product to remove',
                        },
                        {
                            data_type: 'string',
                            id: 'quantity2',
                            name: 'Quantity to add',
                            instructions: 'How much of the product to add',
                        },
                        {
                            kind: 'product',
                            integration_id: '{{store.helpdesk_integration_id}}',
                            id: 'product1',
                            name: 'Product to replace',
                            instructions: 'Select the product to replace',
                        },
                        {
                            kind: 'product',
                            integration_id: '{{store.helpdesk_integration_id}}',
                            id: 'product2',
                            name: 'Product to replace with',
                            instructions: 'Select the product to replace with',
                        },
                    ],
                    conditionsType: null,
                    conditions: [],
                },
            },
            {
                id: 'replace_item',
                position: {
                    x: 0,
                    y: 0,
                },
                type: 'replace_item',
                data: {
                    customerId: '{{objects.customer.id}}',
                    orderExternalId: '{{objects.order.external_id}}',
                    integrationId: '{{store.helpdesk_integration_id}}',
                    productVariantId:
                        '{{objects.products.product1.selected_variant.external_gid}}',
                    quantity: '{{custom_inputs.quantity1}}',
                    addedProductVariantId:
                        '{{objects.products.product2.selected_variant.external_gid}}',
                    addedQuantity: '{{custom_inputs.quantity2}}',
                },
            },
            {
                id: 'end_success',
                position: {
                    x: 0,
                    y: 0,
                },
                type: 'end',
                data: {
                    action: 'end',
                },
            },
            {
                id: 'end_failure',
                position: {
                    x: 0,
                    y: 0,
                },
                type: 'end',
                data: {
                    action: 'end',
                },
            },
        ])
        expect(visualBuilderGraph.edges).toEqual([
            {
                id: 'trigger_button-replace_item',
                type: 'custom',
                style: {
                    stroke: '#D2D7DE',
                },
                interactionWidth: 0,
                data: {},
                source: 'trigger_button',
                target: 'replace_item',
            },
            {
                id: 'replace_item-end_success',
                type: 'custom',
                style: {
                    stroke: '#D2D7DE',
                },
                interactionWidth: 0,
                data: {},
                source: 'replace_item',
                target: 'end_success',
            },
            {
                id: 'replace_item-end_failure',
                type: 'custom',
                style: {
                    stroke: '#D2D7DE',
                },
                interactionWidth: 0,
                data: {},
                source: 'replace_item',
                target: 'end_failure',
            },
        ])
    })
})

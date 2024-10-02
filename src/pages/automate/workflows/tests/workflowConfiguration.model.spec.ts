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
    })
})

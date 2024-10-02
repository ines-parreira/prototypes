import {
    buildEdgeCommonProperties,
    buildNodeCommonProperties,
    transformVisualBuilderGraphIntoWfConfiguration,
} from '../models/visualBuilderGraph.model'
import {transformWorkflowConfigurationIntoVisualBuilderGraph} from '../models/workflowConfiguration.model'
import {visualBuilderGraphSimpleChoicesFixture} from './visualBuilderGraph.fixtures'

describe('visualBuilderGraph is transformed into workflowConfiguration', () => {
    test('full graph', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const transformed = transformVisualBuilderGraphIntoWfConfiguration(
            transformWorkflowConfigurationIntoVisualBuilderGraph(
                transformVisualBuilderGraphIntoWfConfiguration(g)
            )
        )
        const {id, is_draft, name, internal_id, initial_step_id} = transformed
        expect(transformed).toEqual(
            expect.objectContaining({
                id,
                is_draft,
                name,
                internal_id,
                initial_step_id,
            })
        )
        expect(transformed.steps.length).toBe(8)
        expect(transformed.steps).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: 'multiple_choices1',
                    kind: 'choices',
                }),
                expect.objectContaining({
                    id: 'automated_message1',
                    kind: 'message',
                }),
                expect.objectContaining({
                    id: 'end1',
                    kind: 'helpful-prompt',
                }),
                expect.objectContaining({
                    id: 'automated_message2',
                    kind: 'message',
                }),
                expect.objectContaining({
                    id: 'end2',
                    kind: 'helpful-prompt',
                }),
                expect.objectContaining({
                    id: 'text_reply1',
                    kind: 'text-input',
                }),
                expect.objectContaining({
                    id: 'file_upload1',
                    kind: 'attachments-input',
                }),
                expect.objectContaining({
                    id: 'end3',
                    kind: 'helpful-prompt',
                }),
            ])
        )

        expect(transformed.transitions.length).toBe(7)
        expect(transformed.transitions).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    from_step_id: 'multiple_choices1',
                    to_step_id: 'automated_message1',
                }),
                expect.objectContaining({
                    from_step_id: 'automated_message1',
                    to_step_id: 'end1',
                }),
                expect.objectContaining({
                    from_step_id: 'multiple_choices1',
                    to_step_id: 'automated_message2',
                }),
                expect.objectContaining({
                    from_step_id: 'automated_message2',
                    to_step_id: 'end2',
                }),
                expect.objectContaining({
                    from_step_id: 'multiple_choices1',
                    to_step_id: 'text_reply1',
                }),
                expect.objectContaining({
                    from_step_id: 'text_reply1',
                    to_step_id: 'file_upload1',
                }),
                expect.objectContaining({
                    from_step_id: 'file_upload1',
                    to_step_id: 'end3',
                }),
            ])
        )
    })

    it('should transform http request step JSON variable', () => {
        const configuration = transformVisualBuilderGraphIntoWfConfiguration({
            name: 'name',
            nodes: [
                {
                    ...buildNodeCommonProperties(),
                    id: 'trigger_button1',
                    type: 'channel_trigger',
                    data: {
                        label: 'entrypoint',
                        label_tkey: 'entrypoint_tkey',
                    },
                },
                {
                    ...buildNodeCommonProperties(),
                    id: 'http_request1',
                    type: 'http_request',
                    data: {
                        name: '',
                        url: 'https://example.com',
                        method: 'GET',
                        headers: [],
                        variables: [
                            {
                                id: 'variable1',
                                name: '',
                                jsonpath: '$',
                                data_type: 'json',
                            },
                            {
                                id: 'variable2',
                                name: '',
                                jsonpath: '$.string',
                                data_type: 'string',
                            },
                        ],
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
                    id: 'trigger_button1_multiple_choices1',
                    source: 'trigger_button1',
                    target: 'http_request1',
                },
                {
                    ...buildEdgeCommonProperties(),
                    id: 'http_request1_end1',
                    source: 'http_request1',
                    target: 'end1',
                },
            ],
            available_languages: [],
            wfConfigurationOriginal: {
                id: '1',
                is_draft: false,
                name: 'my workflow',
                internal_id: '1',
                initial_step_id: 'messages1',
                steps: [
                    {
                        id: 'messages1',
                        kind: 'message',
                        settings: {
                            message: {content: {html: '', text: ''}},
                        },
                    },
                ],
                transitions: [],
                available_languages: [],
            },
            nodeEditingId: null,
            choiceEventIdEditing: null,
            branchIdsEditing: [],
        })

        expect(configuration.steps).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: 'http_request1',
                    kind: 'http-request',
                    settings: expect.objectContaining({
                        variables: [
                            {
                                id: 'variable1',
                                name: '',
                                jsonpath: '$',
                                data_type: null,
                            },
                            {
                                id: 'variable2',
                                name: '',
                                jsonpath: '$.string',
                                data_type: 'string',
                            },
                        ],
                    }),
                }),
                expect.objectContaining({
                    id: 'end1',
                    kind: 'end',
                }),
            ])
        )
    })

    it('should transform graph with an llm-prompt trigger', () => {
        const configuration = transformVisualBuilderGraphIntoWfConfiguration({
            name: 'Remove order item',
            available_languages: ['en-US'],
            nodes: [
                {
                    ...buildNodeCommonProperties(),
                    id: 'trigger',
                    type: 'llm_prompt_trigger',
                    data: {
                        instructions:
                            'This action removes the item from the order',
                        requires_confirmation: false,
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
                        conditionsType: null,
                        conditions: [],
                    },
                },
                {
                    ...buildNodeCommonProperties(),
                    id: 'remove_item',
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
                    ...buildNodeCommonProperties(),
                    id: 'end_success',
                    type: 'end',
                    data: {
                        action: 'end',
                    },
                },
                {
                    ...buildNodeCommonProperties(),
                    id: 'end_failure',
                    type: 'end',
                    data: {
                        action: 'end',
                    },
                },
            ],
            edges: [
                {
                    ...buildEdgeCommonProperties(),
                    source: 'trigger',
                    target: 'remove_item',
                },
                {
                    ...buildEdgeCommonProperties(),
                    source: 'remove_item',
                    target: 'end_success',
                },
                {
                    ...buildEdgeCommonProperties(),
                    source: 'remove_item',
                    target: 'end_failure',
                },
            ],
            wfConfigurationOriginal: {
                internal_id: '01J7ZTERASHHCT60ZJVYSBS3WZ',
                id: '01J7ZTERAST0PVVPF347XA37FR',
                name: 'Remove order item',
                is_draft: false,
                initial_step_id: 'trigger',
                entrypoint: null,
                available_languages: [],
                steps: [],
                transitions: [],
                updated_datetime: '2024-09-17T11:18:00.201Z',
                triggers: [],
                entrypoints: [],
                apps: [
                    {
                        type: 'shopify',
                    },
                ],
            },
            nodeEditingId: null,
            choiceEventIdEditing: null,
            branchIdsEditing: [],
        })
        expect(configuration.entrypoints).toEqual([
            {
                kind: 'llm-conversation',
                trigger: 'llm-prompt',
                settings: {
                    requires_confirmation: false,
                    instructions: 'This action removes the item from the order',
                },
            },
        ])
        expect(configuration.triggers).toEqual([
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
                    object_inputs: [
                        {
                            kind: 'customer',
                            integration_id: '{{store.helpdesk_integration_id}}',
                        },
                        {
                            kind: 'order',
                            integration_id: '{{store.helpdesk_integration_id}}',
                        },
                    ],
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
        ])
        expect(configuration.steps).toEqual([
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
        ])
    })
})

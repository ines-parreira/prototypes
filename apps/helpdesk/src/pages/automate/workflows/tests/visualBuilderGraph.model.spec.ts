import {
    SHIPMONK_APPLICATION_ID,
    type WorkflowVariableList,
} from '../models/variables.types'
import {
    buildEdgeCommonProperties,
    buildNodeCommonProperties,
    getAutomatedMessageNodeErrors,
    getAutomatedMessageNodeTouched,
    getCancelSubscriptionNodeErrors,
    getCancelSubscriptionNodeTouched,
    getChannelTriggerNodeErrors,
    getChannelTriggerNodeTouched,
    getConditionsNodeErrors,
    getConditionsNodeTouched,
    getFileUploadNodeErrors,
    getFileUploadNodeTouched,
    getGraphAppAppErrors,
    getGraphAppAppTouched,
    getGraphTouched,
    getHTTPRequestNodeErrors,
    getHTTPRequestNodeTouched,
    getLiquidTemplateNodeErrors,
    getLiquidTemplateNodeTouched,
    getLLMPromptTriggerNodeErrors,
    getLLMPromptTriggerNodeTouched,
    getMultipleChoicesNodeErrors,
    getMultipleChoicesNodeTouched,
    getOrderLineItemSelectionNodeErrors,
    getOrderLineItemSelectionNodeTouched,
    getOrderSelectionNodeErrors,
    getOrderSelectionNodeTouched,
    getRemoveItemNodeErrors,
    getRemoveItemNodeTouched,
    getReplaceItemNodeErrors,
    getReplaceItemNodeTouched,
    getReusableLLMPromptCallNodeHasAllValues,
    getReusableLLMPromptCallNodeHasCredentials,
    getReusableLLMPromptCallNodeHasInputs,
    getReusableLLMPromptCallNodeHasInvalidCredentials,
    getReusableLLMPromptCallNodeHasMissingCredentials,
    getReusableLLMPromptCallNodeHasMissingValues,
    getReusableLLMPromptCallNodeIsClickable,
    getReusableLLMPromptCallNodeStatuses,
    getReusableLLMPromptTriggerNodeErrors,
    getReusableLLMPromptTriggerNodeTouched,
    getSkipChargeNodeErrors,
    getSkipChargeNodeTouched,
    getTextReplyNodeErrors,
    getTextReplyNodeTouched,
    getUpdateShippingAddressNodeErrors,
    getUpdateShippingAddressNodeTouched,
    transformVisualBuilderGraphIntoWfConfiguration,
} from '../models/visualBuilderGraph.model'
import type {
    AutomatedMessageNodeType,
    CancelSubscriptionNodeType,
    ChannelTriggerNodeType,
    ConditionsNodeType,
    FileUploadNodeType,
    HttpRequestNodeType,
    LiquidTemplateNodeType,
    LLMPromptTriggerNodeType,
    MultipleChoicesNodeType,
    OrderLineItemSelectionNodeType,
    OrderSelectionNodeType,
    RemoveItemNodeType,
    ReplaceItemNodeType,
    ReusableLLMPromptTriggerNodeType,
    SkipChargeNodeType,
    TextReplyNodeType,
    UpdateShippingAddressNodeType,
    VisualBuilderEdge,
} from '../models/visualBuilderGraph.types'
import { transformWorkflowConfigurationIntoVisualBuilderGraph } from '../models/workflowConfiguration.model'
import { visualBuilderGraphSimpleChoicesFixture } from './visualBuilderGraph.fixtures'

describe('visualBuilderGraph is transformed into workflowConfiguration', () => {
    test('full graph', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const transformed = transformVisualBuilderGraphIntoWfConfiguration(
            transformWorkflowConfigurationIntoVisualBuilderGraph(
                transformVisualBuilderGraphIntoWfConfiguration(g, true, []),
            ),
            true,
            [],
        )
        const { id, is_draft, name, internal_id, initial_step_id } = transformed
        expect(transformed).toEqual(
            expect.objectContaining({
                id,
                is_draft,
                name,
                internal_id,
                initial_step_id,
            }),
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
            ]),
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
            ]),
        )
    })

    it('should transform http request step JSON variable', () => {
        const configuration = transformVisualBuilderGraphIntoWfConfiguration(
            {
                id: '',
                internal_id: '',
                is_draft: false,
                isTemplate: false,
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
                            json: null,
                            formUrlencoded: null,
                            bodyContentType: null,
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
                nodeEditingId: null,
                choiceEventIdEditing: null,
                branchIdsEditing: [],
            },
            true,
            [],
        )

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
            ]),
        )
    })

    it('should transform http request step with service connection settings', () => {
        const configuration = transformVisualBuilderGraphIntoWfConfiguration(
            {
                id: '',
                internal_id: '',
                is_draft: false,
                isTemplate: false,
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
                            name: 'Shopify request',
                            url: '',
                            method: 'GET',
                            headers: [],
                            variables: [],
                            json: null,
                            formUrlencoded: null,
                            bodyContentType: null,
                            serviceConnectionSettings: {
                                integration_id:
                                    '{{store.helpdesk_integration_id}}',
                                path: '/admin/api/2025-01/orders.json',
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
                        id: 'trigger_button1_http_request1',
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
                nodeEditingId: null,
                choiceEventIdEditing: null,
                branchIdsEditing: [],
                apps: [{ type: 'shopify' }],
            },
            true,
            [],
        )

        expect(configuration.steps).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: 'http_request1',
                    kind: 'http-request',
                    settings: expect.objectContaining({
                        url: '',
                        service_connection_settings: {
                            integration_id: '{{store.helpdesk_integration_id}}',
                            path: '/admin/api/2025-01/orders.json',
                        },
                    }),
                }),
            ]),
        )
    })

    it('should not include service_connection_settings when not set on node', () => {
        const configuration = transformVisualBuilderGraphIntoWfConfiguration(
            {
                id: '',
                internal_id: '',
                is_draft: false,
                isTemplate: false,
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
                            variables: [],
                            json: null,
                            formUrlencoded: null,
                            bodyContentType: null,
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
                        id: 'trigger_button1_http_request1',
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
                nodeEditingId: null,
                choiceEventIdEditing: null,
                branchIdsEditing: [],
            },
            true,
            [],
        )

        const httpStep = configuration.steps.find(
            (s) => s.kind === 'http-request',
        )
        expect(httpStep).toBeDefined()
        if (httpStep && httpStep.kind === 'http-request') {
            expect(httpStep.settings.url).toBe('https://example.com')
            expect(
                httpStep.settings.service_connection_settings,
            ).toBeUndefined()
        }
    })

    it('should transform graph with a edit order note step', () => {
        const triggers = [
            ['llm_prompt_trigger', 'llm-prompt'],
            ['reusable_llm_prompt_trigger', 'reusable-llm-prompt'],
        ]
        for (const [nodeTrigger, flowTrigger] of triggers) {
            const configuration =
                transformVisualBuilderGraphIntoWfConfiguration(
                    {
                        id: '',
                        internal_id: '',
                        is_draft: false,
                        isTemplate: false,
                        name: 'Edit order note',
                        available_languages: ['en-US'],
                        inputs: [],
                        values: {},
                        nodes: [
                            {
                                ...buildNodeCommonProperties(),
                                id: 'trigger',
                                type: nodeTrigger as any,
                                data: {
                                    instructions:
                                        'This action edits an order note',
                                    requires_confirmation: false,
                                    inputs: [],
                                    conditionsType: null,
                                    conditions: [],
                                },
                            },
                            {
                                ...buildNodeCommonProperties(),
                                id: 'edit_order_note',
                                type: 'edit_order_note',
                                data: {
                                    integrationId:
                                        '{{store.helpdesk_integration_id}}',
                                    orderExternalId:
                                        '{{objects.order.external_id}}',
                                    customerId: '{{objects.customer.id}}',
                                    note: '',
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
                                target: 'edit_order_note',
                            },
                            {
                                ...buildEdgeCommonProperties(),
                                source: 'edit_order_note',
                                target: 'end_success',
                            },
                            {
                                ...buildEdgeCommonProperties(),
                                source: 'edit_order_note',
                                target: 'end_failure',
                            },
                        ],
                        nodeEditingId: null,
                        choiceEventIdEditing: null,
                        branchIdsEditing: [],
                    },
                    true,
                    [],
                )
            expect(configuration.triggers).toEqual([
                expect.objectContaining({
                    kind: flowTrigger,
                }),
            ])
            expect(configuration.steps).toEqual([
                {
                    id: 'edit_order_note',
                    kind: 'edit-order-note',
                    settings: {
                        integration_id: '{{store.helpdesk_integration_id}}',
                        order_external_id: '{{objects.order.external_id}}',
                        customer_id: '{{objects.customer.id}}',
                        note: '{{values.note}}',
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
            expect(configuration.values).toEqual({
                note: '',
            })
            expect(configuration.inputs).toEqual([
                {
                    id: 'note',
                    name: 'Order Note',
                    description: '',
                    data_type: 'string',
                },
            ])
        }
    })

    it('should transform graph with a create discount code step', () => {
        const configuration = transformVisualBuilderGraphIntoWfConfiguration(
            {
                id: '',
                internal_id: '',
                is_draft: false,
                isTemplate: false,
                name: 'Create discount code',
                available_languages: ['en-US'],
                inputs: [
                    {
                        id: 'test',
                        name: 'test',
                        description: '',
                        data_type: 'string',
                    },
                ],
                values: {
                    test: 'test',
                },
                nodes: [
                    {
                        ...buildNodeCommonProperties(),
                        id: 'trigger',
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
                        ...buildNodeCommonProperties(),
                        id: 'create_discount_code',
                        type: 'create_discount_code',
                        data: {
                            integrationId: '{{store.helpdesk_integration_id}}',
                            amount: '',
                            discountType: '',
                            validFor: '',
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
                        target: 'create_discount_code',
                    },
                    {
                        ...buildEdgeCommonProperties(),
                        source: 'create_discount_code',
                        target: 'end_success',
                    },
                    {
                        ...buildEdgeCommonProperties(),
                        source: 'create_discount_code',
                        target: 'end_failure',
                    },
                ],
                nodeEditingId: null,
                choiceEventIdEditing: null,
                branchIdsEditing: [],
            },
            true,
            [],
        )
        expect(configuration.entrypoints).toEqual([
            {
                kind: 'llm-conversation',
                trigger: 'llm-prompt',
                settings: {
                    requires_confirmation: false,
                    instructions: 'This action creates a discount code',
                },
            },
        ])
        expect(configuration.triggers).toEqual([
            {
                kind: 'llm-prompt',
                settings: {
                    custom_inputs: [],
                    object_inputs: [],
                    conditions: null,
                    outputs: [
                        {
                            id: 'create_discount_code',
                            description: 'Created discount code',
                            path: 'steps_state.create_discount_code.discount_code',
                        },
                    ],
                },
            },
        ])
        expect(configuration.steps).toEqual([
            {
                id: 'create_discount_code',
                kind: 'create-discount-code',
                settings: {
                    integration_id: '{{store.helpdesk_integration_id}}',
                    amount: '{{values.amount}}',
                    type: '{{values.discount_type}}',
                    valid_for: '{{values.valid_for}}',
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
        expect(configuration.values).toEqual({
            discount_type: 'fixed',
            amount: 0,
            valid_for: 0,
            test: 'test',
        })
        expect(configuration.inputs).toEqual([
            {
                id: 'test',
                name: 'test',
                description: '',
                data_type: 'string',
            },
            {
                id: 'discount_type',
                name: 'Discount Type',
                description: '',
                data_type: 'string',
                options: [
                    {
                        label: 'Fixed amount (currency set in Shopify)',
                        value: 'fixed',
                    },
                    {
                        label: 'Percentange (%)',
                        value: 'percentage',
                    },
                ],
            },
            {
                id: 'amount',
                name: 'Discount amount',
                description: '',
                data_type: 'number',
            },
            {
                id: 'valid_for',
                name: 'How many days should the discount code be valid?',
                description: '',
                data_type: 'number',
            },
        ])
    })

    it('should transform reusable graph with a create discount code step', () => {
        const configuration = transformVisualBuilderGraphIntoWfConfiguration(
            {
                id: '',
                internal_id: '',
                is_draft: false,
                isTemplate: false,
                name: 'Create discount code',
                available_languages: [],
                nodes: [
                    {
                        ...buildNodeCommonProperties(),
                        id: 'trigger',
                        type: 'reusable_llm_prompt_trigger',
                        data: {
                            requires_confirmation: false,
                            inputs: [],
                            conditionsType: null,
                            conditions: [],
                        },
                    },
                    {
                        ...buildNodeCommonProperties(),
                        id: 'create_discount_code',
                        type: 'create_discount_code',
                        data: {
                            integrationId: '{{store.helpdesk_integration_id}}',
                            amount: '',
                            discountType: '',
                            validFor: '',
                        },
                    },
                ],
                edges: [
                    {
                        ...buildEdgeCommonProperties(),
                        source: 'trigger',
                        target: 'create_discount_code',
                    },
                ],
                nodeEditingId: null,
                choiceEventIdEditing: null,
                branchIdsEditing: [],
            },
            true,
            [],
        )
        expect(configuration.entrypoints).toEqual([
            {
                kind: 'reusable-llm-prompt-call-step',
                trigger: 'reusable-llm-prompt',
                settings: {
                    conditions: null,
                    requires_confirmation: false,
                },
                deactivated_datetime: null,
            },
        ])
        expect(configuration.triggers).toEqual([
            {
                kind: 'reusable-llm-prompt',
                settings: {
                    custom_inputs: [],
                    object_inputs: [],
                    outputs: [
                        {
                            data_type: 'string',
                            description: '',
                            id: 'create_discount_code',
                            name: 'Discount code',
                            path: 'steps_state.create_discount_code.discount_code',
                        },
                    ],
                },
            },
        ])
    })

    it('should transform graph with a reship for free step', () => {
        const configuration = transformVisualBuilderGraphIntoWfConfiguration(
            {
                id: '',
                internal_id: '',
                is_draft: false,
                isTemplate: false,
                name: 'Reship for free',
                available_languages: ['en-US'],
                nodes: [
                    {
                        ...buildNodeCommonProperties(),
                        id: 'trigger',
                        type: 'llm_prompt_trigger',
                        data: {
                            instructions:
                                'This action reships an order for free',
                            requires_confirmation: false,
                            inputs: [],
                            conditionsType: null,
                            conditions: [],
                        },
                    },
                    {
                        ...buildNodeCommonProperties(),
                        id: 'reship_for_free',
                        type: 'reship_for_free',
                        data: {
                            customerId: '{{objects.customer.id}}',
                            orderExternalId: '{{objects.order.external_id}}',
                            integrationId: '{{store.helpdesk_integration_id}}',
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
                        target: 'reship_for_free',
                    },
                    {
                        ...buildEdgeCommonProperties(),
                        source: 'reship_for_free',
                        target: 'end_success',
                    },
                    {
                        ...buildEdgeCommonProperties(),
                        source: 'reship_for_free',
                        target: 'end_failure',
                    },
                ],
                nodeEditingId: null,
                choiceEventIdEditing: null,
                branchIdsEditing: [],
            },
            true,
            [],
        )
        expect(configuration.entrypoints).toEqual([
            {
                kind: 'llm-conversation',
                trigger: 'llm-prompt',
                settings: {
                    requires_confirmation: false,
                    instructions: 'This action reships an order for free',
                },
            },
        ])
        expect(configuration.triggers).toEqual([
            {
                kind: 'llm-prompt',
                settings: {
                    custom_inputs: [],
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
                            id: 'reship_for_free',
                            description: '',
                            path: 'steps_state.reship_for_free.success',
                        },
                    ],
                },
            },
        ])
        expect(configuration.steps).toEqual([
            {
                id: 'reship_for_free',
                kind: 'reship-for-free',
                settings: {
                    order_external_id: '{{objects.order.external_id}}',
                    customer_id: '{{objects.customer.id}}',
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
        ])
    })

    it('should transform graph with a refund shipping costs step', () => {
        const configuration = transformVisualBuilderGraphIntoWfConfiguration(
            {
                id: '',
                internal_id: '',
                is_draft: false,
                isTemplate: false,
                name: 'Refund shipping costs',
                available_languages: ['en-US'],
                nodes: [
                    {
                        ...buildNodeCommonProperties(),
                        id: 'trigger',
                        type: 'llm_prompt_trigger',
                        data: {
                            instructions:
                                'This action refunds the shipping costs',
                            requires_confirmation: false,
                            inputs: [],
                            conditionsType: null,
                            conditions: [],
                        },
                    },
                    {
                        ...buildNodeCommonProperties(),
                        id: 'refund_shipping_costs',
                        type: 'refund_shipping_costs',
                        data: {
                            customerId: '{{objects.customer.id}}',
                            orderExternalId: '{{objects.order.external_id}}',
                            integrationId: '{{store.helpdesk_integration_id}}',
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
                        target: 'refund_shipping_costs',
                    },
                    {
                        ...buildEdgeCommonProperties(),
                        source: 'refund_shipping_costs',
                        target: 'end_success',
                    },
                    {
                        ...buildEdgeCommonProperties(),
                        source: 'refund_shipping_costs',
                        target: 'end_failure',
                    },
                ],
                nodeEditingId: null,
                choiceEventIdEditing: null,
                branchIdsEditing: [],
            },
            true,
            [],
        )
        expect(configuration.entrypoints).toEqual([
            {
                kind: 'llm-conversation',
                trigger: 'llm-prompt',
                settings: {
                    requires_confirmation: false,
                    instructions: 'This action refunds the shipping costs',
                },
            },
        ])
        expect(configuration.triggers).toEqual([
            {
                kind: 'llm-prompt',
                settings: {
                    custom_inputs: [],
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
                            id: 'refund_shipping_costs',
                            description: '',
                            path: 'steps_state.refund_shipping_costs.success',
                        },
                    ],
                },
            },
        ])
        expect(configuration.steps).toEqual([
            {
                id: 'refund_shipping_costs',
                kind: 'refund-shipping-costs',
                settings: {
                    order_external_id: '{{objects.order.external_id}}',
                    customer_id: '{{objects.customer.id}}',
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
        ])
    })

    it('should transform graph with a replace item step', () => {
        const configuration = transformVisualBuilderGraphIntoWfConfiguration(
            {
                id: '',
                internal_id: '',
                is_draft: false,
                isTemplate: false,
                name: 'Replace item',
                available_languages: ['en-US'],
                advanced_datetime: new Date(),
                nodes: [
                    {
                        ...buildNodeCommonProperties(),
                        id: 'trigger',
                        type: 'llm_prompt_trigger',
                        data: {
                            instructions: 'This action replaces an item',
                            requires_confirmation: false,
                            inputs: [
                                {
                                    kind: 'product',
                                    id: 'product1',
                                    name: 'Product to replace',
                                    instructions:
                                        'Select the product to replace',
                                },
                                {
                                    kind: 'product',
                                    id: 'product2',
                                    name: 'Product to replace with',
                                    instructions:
                                        'Select the product to replace with',
                                },
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
                                    instructions:
                                        'How much of the product to add',
                                },
                            ],
                            conditionsType: null,
                            conditions: [],
                        },
                    },
                    {
                        ...buildNodeCommonProperties(),
                        id: 'replace_item',
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
                        target: 'replace_item',
                    },
                    {
                        ...buildEdgeCommonProperties(),
                        source: 'replace_item',
                        target: 'end_success',
                    },
                    {
                        ...buildEdgeCommonProperties(),
                        source: 'replace_item',
                        target: 'end_failure',
                    },
                ],
                nodeEditingId: null,
                choiceEventIdEditing: null,
                branchIdsEditing: [],
            },
            true,
            [],
        )
        expect(configuration.entrypoints).toEqual([
            {
                kind: 'llm-conversation',
                trigger: 'llm-prompt',
                settings: {
                    requires_confirmation: false,
                    instructions: 'This action replaces an item',
                },
            },
        ])
        expect(configuration.triggers).toEqual([
            {
                kind: 'llm-prompt',
                settings: {
                    custom_inputs: [
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
                    ],
                    object_inputs: [
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
                            id: 'replace_item',
                            description: '',
                            path: 'steps_state.replace_item.success',
                        },
                    ],
                },
            },
        ])
        expect(configuration.steps).toEqual([
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
        ])
    })

    it('should transform graph with reusable LLM prompt trigger', () => {
        const configuration = transformVisualBuilderGraphIntoWfConfiguration(
            {
                id: '',
                internal_id: '',
                is_draft: false,
                isTemplate: false,
                name: 'Reusable LLM prompt trigger',
                available_languages: [],
                nodes: [
                    {
                        ...buildNodeCommonProperties(),
                        id: 'trigger',
                        type: 'reusable_llm_prompt_trigger',
                        data: {
                            requires_confirmation: false,
                            inputs: [
                                {
                                    data_type: 'string',
                                    id: 'input1',
                                    name: 'Input 1',
                                    instructions: 'some instructions',
                                },
                            ],
                            conditionsType: null,
                            conditions: [],
                        },
                    },
                    {
                        ...buildNodeCommonProperties(),
                        id: 'conditions1',
                        type: 'conditions',
                        data: {
                            name: '',
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
                                    name: 'test',
                                    jsonpath: '$.string',
                                    data_type: 'string',
                                },
                            ],
                            json: null,
                            formUrlencoded: null,
                            bodyContentType: null,
                            outputs: [
                                {
                                    id: 'output1',
                                    path: 'steps_state.http_request1.content.variable1',
                                    description: 'some description',
                                },
                            ],
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
                        target: 'conditions1',
                    },
                    {
                        ...buildEdgeCommonProperties(),
                        id: 'conditions1_branch1',
                        source: 'conditions1',
                        target: 'http_request1',
                        data: {
                            conditions: {
                                and: [
                                    {
                                        equals: [
                                            { var: 'objects.order.name' },
                                            'test',
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                    {
                        ...buildEdgeCommonProperties(),
                        source: 'http_request1',
                        target: 'end_success',
                    },
                    {
                        ...buildEdgeCommonProperties(),
                        source: 'http_request1',
                        target: 'end_failure',
                    },
                ],
                nodeEditingId: null,
                choiceEventIdEditing: null,
                branchIdsEditing: [],
            },
            true,
            [],
        )
        expect(configuration.entrypoints).toEqual([
            {
                kind: 'reusable-llm-prompt-call-step',
                trigger: 'reusable-llm-prompt',
                settings: {
                    requires_confirmation: false,
                    conditions: null,
                },
                deactivated_datetime: null,
            },
        ])
        expect(configuration.triggers).toEqual([
            {
                kind: 'reusable-llm-prompt',
                settings: {
                    custom_inputs: [
                        {
                            data_type: 'string',
                            id: 'input1',
                            name: 'Input 1',
                            instructions: 'some instructions',
                        },
                    ],
                    object_inputs: [
                        {
                            kind: 'customer',
                        },
                        {
                            kind: 'order',
                        },
                    ],
                    outputs: [
                        {
                            id: 'output1',
                            name: 'test',
                            path: 'steps_state.http_request1.content.variable1',
                            description: 'some description',
                            data_type: 'string',
                        },
                    ],
                },
            },
        ])
    })

    it('should transform graph with end success/failure actions', () => {
        const configuration = transformVisualBuilderGraphIntoWfConfiguration(
            {
                id: '',
                internal_id: '',
                is_draft: false,
                isTemplate: false,
                name: 'Reusable LLM prompt trigger',
                available_languages: [],
                nodes: [
                    {
                        ...buildNodeCommonProperties(),
                        id: 'trigger',
                        type: 'reusable_llm_prompt_trigger',
                        data: {
                            requires_confirmation: false,
                            inputs: [],
                            conditionsType: null,
                            conditions: [],
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
                            variables: [],
                            json: null,
                            formUrlencoded: null,
                            bodyContentType: null,
                            outputs: [],
                        },
                    },
                    {
                        ...buildNodeCommonProperties(),
                        id: 'end_success',
                        type: 'end',
                        data: {
                            action: 'end-success',
                        },
                    },
                    {
                        ...buildNodeCommonProperties(),
                        id: 'end_failure',
                        type: 'end',
                        data: {
                            action: 'end-failure',
                        },
                    },
                ],
                edges: [
                    {
                        ...buildEdgeCommonProperties(),
                        source: 'trigger',
                        target: 'http_request1',
                    },
                    {
                        ...buildEdgeCommonProperties(),
                        source: 'http_request1',
                        target: 'end_success',
                    },
                    {
                        ...buildEdgeCommonProperties(),
                        source: 'http_request1',
                        target: 'end_failure',
                    },
                ],
                nodeEditingId: null,
                choiceEventIdEditing: null,
                branchIdsEditing: [],
            },
            true,
            [],
        )

        expect(configuration.steps).toEqual([
            {
                id: 'http_request1',
                kind: 'http-request',
                settings: {
                    headers: {},
                    method: 'GET',
                    name: '',
                    url: 'https://example.com',
                    variables: [],
                },
            },
            {
                id: 'end_success',
                kind: 'end',
                settings: {
                    success: true,
                },
            },
            {
                id: 'end_failure',
                kind: 'end',
                settings: {
                    success: false,
                },
            },
        ])
    })

    it('should transform graph with reusable_llm_prompt_call node', () => {
        const configuration = transformVisualBuilderGraphIntoWfConfiguration(
            {
                id: '',
                internal_id: '',
                is_draft: false,
                isTemplate: false,
                name: 'Reusable LLM prompt call step',
                available_languages: [],
                nodes: [
                    {
                        ...buildNodeCommonProperties(),
                        id: 'trigger',
                        type: 'llm_prompt_trigger',
                        data: {
                            requires_confirmation: false,
                            inputs: [],
                            conditionsType: null,
                            conditions: [],
                            instructions: '',
                        },
                    },
                    {
                        ...buildNodeCommonProperties(),
                        id: 'reusable_llm_prompt_call1',
                        type: 'reusable_llm_prompt_call',
                        data: {
                            configuration_id: 'configurationid1',
                            configuration_internal_id:
                                'configurationinternalid1',
                            objects: {
                                order: '{{objects.order}}',
                                customer: '{{objects.customer}}',
                                products: {
                                    product1: '{{objects.products.product1}}',
                                },
                            },
                            custom_inputs: {
                                input1: '{{custom_inputs.input1}}',
                            },
                            values: {
                                value1: 'test',
                                value2: 1,
                                value3: true,
                            },
                        },
                    },
                ],
                edges: [
                    {
                        ...buildEdgeCommonProperties(),
                        source: 'trigger',
                        target: 'reusable_llm_prompt_call1',
                    },
                ],
                nodeEditingId: null,
                choiceEventIdEditing: null,
                branchIdsEditing: [],
            },
            true,
            [
                {
                    id: 'configurationid1',
                    internal_id: 'configurationinternalid1',
                    is_draft: false,
                    name: '',
                    initial_step_id: '',
                    entrypoints: [
                        {
                            kind: 'reusable-llm-prompt-call-step',
                            trigger: 'reusable-llm-prompt',
                            settings: {
                                requires_confirmation: false,
                                conditions: null,
                            },
                            deactivated_datetime: null,
                        },
                    ],
                    triggers: [
                        {
                            kind: 'reusable-llm-prompt',
                            settings: {
                                custom_inputs: [],
                                object_inputs: [],
                                outputs: [
                                    {
                                        data_type: 'string',
                                        description: 'somedescription',
                                        id: 'someid',
                                        name: '',
                                        path: '',
                                    },
                                ],
                            },
                        },
                    ],
                    steps: [],
                    transitions: [],
                    available_languages: [],
                },
            ],
        )

        expect(configuration.triggers).toEqual([
            {
                kind: 'llm-prompt',
                settings: {
                    conditions: null,
                    custom_inputs: [],
                    object_inputs: [
                        {
                            integration_id: '{{store.helpdesk_integration_id}}',
                            kind: 'customer',
                        },
                        {
                            integration_id: '{{store.helpdesk_integration_id}}',
                            kind: 'order',
                        },
                    ],
                    outputs: [
                        {
                            description: 'somedescription',
                            id: expect.any(String),
                            path: 'steps_state.reusable_llm_prompt_call1.outputs.someid',
                        },
                    ],
                },
            },
        ])
        expect(configuration.steps).toEqual([
            {
                id: 'reusable_llm_prompt_call1',
                kind: 'reusable-llm-prompt-call',
                settings: {
                    configuration_id: 'configurationid1',
                    configuration_internal_id: 'configurationinternalid1',
                    custom_inputs: {
                        input1: '{{custom_inputs.input1}}',
                    },
                    objects: {
                        customer: '{{objects.customer}}',
                        order: '{{objects.order}}',
                        products: {
                            product1: '{{objects.products.product1}}',
                        },
                    },
                    values: {
                        value1: 'test',
                        value2: 1,
                        value3: true,
                    },
                },
            },
        ])
    })

    it('should transform graph with LLM prompt trigger', () => {
        const configuration = transformVisualBuilderGraphIntoWfConfiguration(
            {
                id: '',
                internal_id: '',
                is_draft: false,
                isTemplate: false,
                name: 'LLM prompt trigger',
                available_languages: [],
                nodes: [
                    {
                        ...buildNodeCommonProperties(),
                        id: 'trigger',
                        type: 'llm_prompt_trigger',
                        data: {
                            instructions: '',
                            requires_confirmation: false,
                            inputs: [
                                {
                                    data_type: 'string',
                                    id: 'input1',
                                    name: 'Input 1',
                                    instructions: 'some instructions',
                                },
                            ],
                            conditionsType: null,
                            conditions: [
                                {
                                    equals: [
                                        { var: 'custom_inputs.input1' },
                                        '123',
                                    ],
                                },
                            ],
                        },
                    },
                    {
                        ...buildNodeCommonProperties(),
                        id: 'conditions1',
                        type: 'conditions',
                        data: {
                            name: '',
                        },
                    },
                    {
                        ...buildNodeCommonProperties(),
                        id: 'http_request1',
                        type: 'http_request',
                        data: {
                            name: '',
                            url: 'https://example.com?orderId={{objects.order.external_id}}',
                            method: 'GET',
                            headers: [],
                            variables: [
                                {
                                    id: 'variable1',
                                    name: 'test',
                                    jsonpath: '$.string',
                                    data_type: 'string',
                                },
                            ],
                            json: null,
                            formUrlencoded: null,
                            bodyContentType: null,
                            outputs: [
                                {
                                    id: 'output1',
                                    path: 'steps_state.http_request1.content.variable1',
                                    description: 'some description',
                                },
                            ],
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
                        target: 'conditions1',
                    },
                    {
                        ...buildEdgeCommonProperties(),
                        id: 'conditions1_branch1',
                        source: 'conditions1',
                        target: 'http_request1',
                        data: {
                            conditions: {
                                and: [
                                    {
                                        equals: [
                                            { var: 'objects.customer.name' },
                                            'test',
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                    {
                        ...buildEdgeCommonProperties(),
                        source: 'http_request1',
                        target: 'end_success',
                    },
                    {
                        ...buildEdgeCommonProperties(),
                        source: 'http_request1',
                        target: 'end_failure',
                    },
                ],
                nodeEditingId: null,
                choiceEventIdEditing: null,
                branchIdsEditing: [],
            },
            true,
            [],
        )
        expect(configuration.entrypoints).toEqual([
            {
                kind: 'llm-conversation',
                trigger: 'llm-prompt',
                settings: {
                    requires_confirmation: false,
                    instructions: '',
                },
            },
        ])
        expect(configuration.triggers).toEqual([
            {
                kind: 'llm-prompt',
                settings: {
                    custom_inputs: [
                        {
                            data_type: 'string',
                            id: 'input1',
                            name: 'Input 1',
                            instructions: 'some instructions',
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
                    outputs: [
                        {
                            id: 'output1',
                            path: 'steps_state.http_request1.content.variable1',
                            description: 'some description',
                        },
                    ],
                    conditions: null,
                },
            },
        ])
    })

    it('should transform graph with shipmonk variables', () => {
        const configuration = transformVisualBuilderGraphIntoWfConfiguration(
            {
                id: '',
                internal_id: '',
                is_draft: false,
                isTemplate: false,
                name: 'LLM prompt trigger',
                available_languages: [],
                nodes: [
                    {
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
                                            var: 'objects.order_shipmonk.status',
                                        },
                                        'complete',
                                    ],
                                },
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
                    },
                    {
                        ...buildNodeCommonProperties(),
                        id: 'http_request1',
                        type: 'http_request',
                        data: {
                            name: '',
                            url: 'https://test.com?orderNumber={{objects.order_shipmonk.order_number}}&orderId={{objects.order.external_id}}',
                            method: 'GET',
                            headers: [],
                            variables: [
                                {
                                    id: 'variable1',
                                    name: 'test',
                                    jsonpath: '$.string',
                                    data_type: 'string',
                                },
                            ],
                            json: null,
                            formUrlencoded: null,
                            bodyContentType: null,
                            outputs: [
                                {
                                    id: 'output1',
                                    path: 'steps_state.http_request1.content.variable1',
                                    description: 'some description',
                                },
                            ],
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
                        target: 'http_request1',
                    },
                    {
                        ...buildEdgeCommonProperties(),
                        source: 'http_request1',
                        target: 'end_success',
                    },
                    {
                        ...buildEdgeCommonProperties(),
                        source: 'http_request1',
                        target: 'end_failure',
                    },
                ],
                nodeEditingId: null,
                choiceEventIdEditing: null,
                branchIdsEditing: [],
            },
            true,
            [],
            [
                {
                    application_id: SHIPMONK_APPLICATION_ID,
                    integration_id: 1,
                },
            ],
        )

        expect(configuration.triggers).toEqual([
            {
                kind: 'llm-prompt',
                settings: {
                    custom_inputs: [],
                    object_inputs: [
                        {
                            kind: 'customer',
                            integration_id: '{{store.helpdesk_integration_id}}',
                        },
                        {
                            kind: 'order-shipmonk',
                            integration_id: 1,
                        },
                        {
                            kind: 'order',
                            integration_id: '{{store.helpdesk_integration_id}}',
                        },
                    ],
                    conditions: {
                        and: [
                            {
                                equals: [
                                    {
                                        var: 'objects.order_shipmonk.status',
                                    },
                                    'complete',
                                ],
                            },
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
                    outputs: [
                        {
                            id: 'output1',
                            path: 'steps_state.http_request1.content.variable1',
                            description: 'some description',
                        },
                    ],
                },
            },
        ])
    })

    it('should transform graph with a liquid template step', () => {
        const configuration = transformVisualBuilderGraphIntoWfConfiguration(
            {
                id: '',
                internal_id: '',
                is_draft: false,
                isTemplate: false,
                name: 'Liquid Template Test',
                available_languages: ['en-US'],
                nodes: [
                    {
                        ...buildNodeCommonProperties(),
                        id: 'trigger',
                        type: 'llm_prompt_trigger',
                        data: {
                            instructions: 'This action uses a liquid template',
                            requires_confirmation: false,
                            inputs: [],
                            conditionsType: null,
                            conditions: [],
                        },
                    },
                    {
                        ...buildNodeCommonProperties(),
                        id: 'liquid_template1',
                        type: 'liquid_template',
                        data: {
                            name: 'Format customer data',
                            template:
                                'Customer: [[objects.customer.name]] (ID: [[objects.customer.id]])',
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
                        source: 'trigger',
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
            },
            true,
            [],
        )

        expect(configuration.entrypoints).toEqual([
            {
                kind: 'llm-conversation',
                trigger: 'llm-prompt',
                settings: {
                    requires_confirmation: false,
                    instructions: 'This action uses a liquid template',
                },
            },
        ])
        expect(configuration.triggers).toEqual([
            {
                kind: 'llm-prompt',
                settings: {
                    custom_inputs: [],
                    object_inputs: [
                        {
                            kind: 'customer',
                            integration_id: '{{store.helpdesk_integration_id}}',
                        },
                    ],
                    conditions: null,
                    outputs: [
                        {
                            id: expect.any(String),
                            description: 'Format customer data',
                            path: 'steps_state.liquid_template1.output',
                        },
                    ],
                },
            },
        ])
        expect(configuration.steps).toEqual([
            {
                id: 'liquid_template1',
                kind: 'liquid-template',
                settings: {
                    name: 'Format customer data',
                    template:
                        'Customer: [[objects.customer.name]] (ID: [[objects.customer.id]])',
                    output: {
                        data_type: 'string',
                    },
                },
            },
            {
                id: 'end1',
                kind: 'end',
            },
        ])
    })

    it('should transform graph with reusable LLM prompt liquid template step', () => {
        const configuration = transformVisualBuilderGraphIntoWfConfiguration(
            {
                id: '',
                internal_id: '',
                is_draft: false,
                isTemplate: false,
                name: 'Reusable Liquid Template',
                available_languages: [],
                nodes: [
                    {
                        ...buildNodeCommonProperties(),
                        id: 'trigger',
                        type: 'reusable_llm_prompt_trigger',
                        data: {
                            requires_confirmation: false,
                            inputs: [],
                            conditionsType: null,
                            conditions: [],
                        },
                    },
                    {
                        ...buildNodeCommonProperties(),
                        id: 'liquid_template1',
                        type: 'liquid_template',
                        data: {
                            name: 'Process order data',
                            template:
                                'Order: [[objects.order.name]] - Status: [[objects.order.external_status]]',
                            output: {
                                data_type: 'string',
                            },
                        },
                    },
                ],
                edges: [
                    {
                        ...buildEdgeCommonProperties(),
                        source: 'trigger',
                        target: 'liquid_template1',
                    },
                ],
                nodeEditingId: null,
                choiceEventIdEditing: null,
                branchIdsEditing: [],
            },
            true,
            [],
        )

        expect(configuration.entrypoints).toEqual([
            {
                kind: 'reusable-llm-prompt-call-step',
                trigger: 'reusable-llm-prompt',
                settings: {
                    requires_confirmation: false,
                    conditions: null,
                },
                deactivated_datetime: null,
            },
        ])
        expect(configuration.triggers).toEqual([
            {
                kind: 'reusable-llm-prompt',
                settings: {
                    custom_inputs: [],
                    object_inputs: [
                        {
                            kind: 'customer',
                        },
                        {
                            kind: 'order',
                        },
                    ],
                    outputs: [
                        {
                            id: expect.any(String),
                            name: 'Process order data',
                            description: 'Process order data',
                            path: 'steps_state.liquid_template1.output',
                            data_type: 'string',
                        },
                    ],
                },
            },
        ])
    })
})

describe('touched', () => {
    it('should touch graph', () => {
        expect(getGraphTouched()).toEqual({
            name: true,
            nodes: true,
        })
    })

    it('should touch API Key graph app app', () => {
        expect(getGraphAppAppTouched('api-key')).toEqual({
            api_key: true,
        })
    })

    it('should touch OAuth2 graph app app', () => {
        expect(getGraphAppAppTouched('oauth2-token')).toEqual({
            refresh_token: true,
        })
    })

    it('should touch Trackstar graph app app', () => {
        expect(getGraphAppAppTouched('trackstar')).toEqual({
            trackstar_connection: true,
        })
    })

    it('should touch LLM prompt trigger node', () => {
        expect(
            getLLMPromptTriggerNodeTouched({
                ...buildNodeCommonProperties(),
                id: 'trigger',
                type: 'llm_prompt_trigger',
                data: {
                    instructions: '',
                    requires_confirmation: false,
                    inputs: [
                        {
                            id: 'someid',
                            name: '',
                            instructions: '',
                            data_type: 'string',
                        },
                    ],
                    conditionsType: 'and',
                    conditions: [{ equals: [{ var: '' }, ''] }],
                },
            }),
        ).toEqual({
            conditions: {
                0: true,
            },
            inputs: {
                someid: {
                    instructions: true,
                    name: true,
                },
            },
            instructions: true,
        })
    })

    it('should touch HTTP request node', () => {
        expect(
            getHTTPRequestNodeTouched({
                ...buildNodeCommonProperties(),
                id: 'http_request1',
                type: 'http_request',
                data: {
                    name: '',
                    url: '',
                    method: 'GET',
                    headers: [
                        {
                            name: 'test',
                            value: 'test',
                        },
                    ],
                    variables: [
                        {
                            id: 'variable1',
                            name: '',
                            jsonpath: '',
                            data_type: 'json',
                        },
                        {
                            id: 'variable2',
                            name: '',
                            jsonpath: '',
                            data_type: 'string',
                        },
                    ],
                    json: null,
                    formUrlencoded: [
                        {
                            key: 'test',
                            value: 'test',
                        },
                    ],
                    bodyContentType: null,
                },
            }),
        ).toEqual({
            headers: {
                '0': {
                    name: true,
                    value: true,
                },
            },
            json: true,
            name: true,
            url: true,
            variables: {
                '0': {
                    jsonpath: true,
                    name: true,
                },
                '1': {
                    jsonpath: true,
                    name: true,
                },
            },
            formUrlencoded: {
                '0': {
                    key: true,
                    value: true,
                },
            },
        })
    })

    it('should touch conditions node', () => {
        expect(
            getConditionsNodeTouched(
                [
                    {
                        ...buildEdgeCommonProperties(),
                        source: 'trigger',
                        target: 'conditions1',
                    },
                    {
                        ...buildEdgeCommonProperties(),
                        id: 'conditions1_branch1',
                        source: 'conditions1',
                        target: 'end1',
                        data: {
                            conditions: { and: [] },
                        },
                    },
                ],
                {
                    ...buildNodeCommonProperties(),
                    id: 'conditions1',
                    type: 'conditions',
                    data: {
                        name: 'conditions1',
                        touched: {
                            branches: {
                                conditions1_branch1: {
                                    conditions: {},
                                    name: true,
                                },
                            },
                        },
                    },
                },
            ),
        ).toEqual({
            branches: {
                conditions1_branch1: {
                    conditions: {},
                    name: true,
                },
            },
        })
    })

    it('should touch channel trigger node', () => {
        expect(getChannelTriggerNodeTouched()).toEqual({
            label: true,
        })
    })

    it('should touch reusable LLM prompt trigger node', () => {
        expect(
            getReusableLLMPromptTriggerNodeTouched({
                ...buildNodeCommonProperties(),
                id: 'trigger',
                type: 'reusable_llm_prompt_trigger',
                data: {
                    requires_confirmation: false,
                    inputs: [
                        {
                            id: 'someid',
                            name: '',
                            instructions: '',
                            data_type: 'string',
                        },
                    ],
                    conditionsType: 'and',
                    conditions: [{ equals: [{ var: '' }, ''] }],
                },
            }),
        ).toEqual({
            conditions: {
                0: true,
            },
            inputs: {
                someid: {
                    instructions: true,
                    name: true,
                },
            },
        })
    })

    it('should touch multiple choices node', () => {
        expect(
            getMultipleChoicesNodeTouched({
                ...buildNodeCommonProperties(),
                id: 'trigger',
                type: 'multiple_choices',
                data: {
                    content: {
                        html: '',
                        text: '',
                    },
                    choices: [
                        {
                            event_id: 'someid',
                            label: '',
                        },
                    ],
                },
            }),
        ).toEqual({
            content: true,
            choices: {
                someid: {
                    label: true,
                },
            },
        })
    })

    it('should touch automated message node', () => {
        expect(getAutomatedMessageNodeTouched()).toEqual({
            content: true,
        })
    })

    it('should touch text reply node', () => {
        expect(getTextReplyNodeTouched()).toEqual({
            content: true,
        })
    })

    it('should touch file upload node', () => {
        expect(getFileUploadNodeTouched()).toEqual({
            content: true,
        })
    })

    it('should touch order selection node', () => {
        expect(getOrderSelectionNodeTouched()).toEqual({
            content: true,
        })
    })

    it('should touch order line item selection node', () => {
        expect(getOrderLineItemSelectionNodeTouched()).toEqual({
            content: true,
        })
    })

    it('should touch skip charge node', () => {
        expect(getSkipChargeNodeTouched()).toEqual({
            subscriptionId: true,
            chargeId: true,
        })
    })

    it('should touch cancel subscription node', () => {
        expect(getCancelSubscriptionNodeTouched()).toEqual({
            subscriptionId: true,
            reason: true,
        })
    })

    it('should touch replace item node', () => {
        expect(getReplaceItemNodeTouched()).toEqual({
            productVariantId: true,
            quantity: true,
            addedProductVariantId: true,
            addedQuantity: true,
        })
    })

    it('should touch remove item node', () => {
        expect(getRemoveItemNodeTouched()).toEqual({
            productVariantId: true,
            quantity: true,
        })
    })

    it('should touch update shipping address item node', () => {
        expect(getUpdateShippingAddressNodeTouched()).toEqual({
            name: true,
            address1: true,
            address2: true,
            city: true,
            zip: true,
            province: true,
            country: true,
            phone: true,
            lastName: true,
            firstName: true,
        })
    })

    it('should touch liquid template node', () => {
        expect(getLiquidTemplateNodeTouched()).toEqual({
            name: true,
            template: true,
            output: {
                data_type: true,
            },
        })
    })
})

describe('errors', () => {
    describe('getGraphAppAppErrors()', () => {
        it('should validate API key graph app app', () => {
            expect(
                getGraphAppAppErrors({
                    app_id: 'someid',
                    type: 'app',
                    api_key: '',
                    touched: {
                        api_key: true,
                    },
                }),
            ).toEqual({
                api_key: 'API key is required',
            })
        })

        it('should validate refresh token graph app app', () => {
            expect(
                getGraphAppAppErrors({
                    app_id: 'someid',
                    type: 'app',
                    refresh_token: '',
                    touched: {
                        refresh_token: true,
                    },
                }),
            ).toEqual({
                refresh_token: 'Refresh token is required',
            })
        })
        it('should validate Trackstar graph app app', () => {
            expect(
                getGraphAppAppErrors({
                    app_id: 'someid',
                    type: 'app',
                    touched: {
                        trackstar_connection: true,
                    },
                }),
            ).toEqual({
                trackstar_connection: 'Trackstar connection is required',
            })
        })
    })

    describe('getLLMPromptTriggerNodeErrors()', () => {
        it('should return null if there are no errors', () => {
            const node: LLMPromptTriggerNodeType = {
                ...buildNodeCommonProperties(),
                type: 'llm_prompt_trigger',
                data: {
                    touched: {
                        instructions: true,
                        inputs: {},
                        conditions: true,
                    },
                    instructions: 'some instructions',
                    inputs: [],
                    conditionsType: null,
                    conditions: [],
                    requires_confirmation: false,
                },
            }

            const errors = getLLMPromptTriggerNodeErrors(node, [])

            expect(errors).toEqual(null)
        })

        it('should add an error if instructions are empty and touched', () => {
            const node: LLMPromptTriggerNodeType = {
                ...buildNodeCommonProperties(),
                type: 'llm_prompt_trigger',
                data: {
                    touched: {
                        instructions: true,
                    },
                    instructions: '',
                    inputs: [],
                    conditionsType: null,
                    conditions: [],
                    requires_confirmation: false,
                },
            }

            const errors = getLLMPromptTriggerNodeErrors(node, [])

            expect(errors).toEqual({
                instructions: 'Description is required',
            })
        })

        it('should add an error if input name & instructions are empty and touched', () => {
            const node: LLMPromptTriggerNodeType = {
                ...buildNodeCommonProperties(),
                type: 'llm_prompt_trigger',
                data: {
                    touched: {
                        inputs: {
                            input1: { name: true, instructions: true },
                        },
                    },
                    instructions: '',
                    inputs: [
                        {
                            id: 'input1',
                            name: '',
                            instructions: '',
                            data_type: 'string',
                        },
                    ],
                    conditionsType: null,
                    conditions: [],
                    requires_confirmation: false,
                },
            }

            const errors = getLLMPromptTriggerNodeErrors(node, [])

            expect(errors).toEqual({
                inputs: {
                    input1: {
                        name: 'Name is required',
                        instructions: 'Description is required',
                    },
                },
            })
        })

        it('should add an error for invalid conditions', () => {
            const node: LLMPromptTriggerNodeType = {
                ...buildNodeCommonProperties(),
                type: 'llm_prompt_trigger',
                data: {
                    touched: {
                        conditions: { 0: true },
                    },
                    instructions: '',
                    inputs: [],
                    conditionsType: 'and',
                    conditions: [{ startsWith: [{ var: 'variable1' }, null] }],
                    requires_confirmation: false,
                },
            }

            const errors = getLLMPromptTriggerNodeErrors(node, [])

            expect(errors).toEqual({
                conditions: { 0: 'Invalid variables' },
            })
        })

        it('should add an error if a string condition value is empty', () => {
            const node: LLMPromptTriggerNodeType = {
                ...buildNodeCommonProperties(),
                type: 'llm_prompt_trigger',
                data: {
                    touched: {
                        conditions: { 0: true },
                    },
                    instructions: '',
                    inputs: [],
                    conditionsType: 'and',
                    conditions: [{ equals: [{ var: 'variable1' }, ''] }],
                    requires_confirmation: false,
                },
            }

            const errors = getLLMPromptTriggerNodeErrors(node, [
                {
                    type: 'string',
                    value: 'variable1',
                    nodeType: 'http_request',
                    name: '',
                },
            ])

            expect(errors).toEqual({
                conditions: { 0: 'Enter a value' },
            })
        })

        it('should not add an error for a number condition with exists or doesNotExist', () => {
            const node: LLMPromptTriggerNodeType = {
                ...buildNodeCommonProperties(),
                type: 'llm_prompt_trigger',
                data: {
                    touched: {
                        conditions: { 0: true },
                    },
                    instructions: '',
                    inputs: [],
                    conditionsType: 'or',
                    conditions: [
                        { exists: [{ var: 'variable1' }] },
                        { doesNotExist: [{ var: 'variable1' }] },
                    ],
                    requires_confirmation: false,
                },
            }

            const errors = getLLMPromptTriggerNodeErrors(node, [
                {
                    type: 'number',
                    value: 'variable1',
                    nodeType: 'http_request',
                    name: '',
                },
            ])

            expect(errors).toEqual(null)
        })

        it('should add an error if a date condition value is empty', () => {
            const node: LLMPromptTriggerNodeType = {
                ...buildNodeCommonProperties(),
                type: 'llm_prompt_trigger',
                data: {
                    touched: {
                        conditions: { 0: true },
                    },
                    instructions: '',
                    inputs: [],
                    conditionsType: 'and',
                    conditions: [
                        { greaterThan: [{ var: 'variable1' }, undefined] },
                    ],
                    requires_confirmation: false,
                },
            }

            const errors = getLLMPromptTriggerNodeErrors(node, [
                {
                    type: 'date',
                    value: 'variable1',
                    nodeType: 'http_request',
                    name: '',
                },
            ])

            expect(errors).toEqual({
                conditions: { 0: 'Choose a date' },
            })
        })
    })

    describe('getHTTPRequestNodeErrors()', () => {
        it('should return null if there are no errors', () => {
            const node: HttpRequestNodeType = {
                ...buildNodeCommonProperties(),
                type: 'http_request',
                data: {
                    touched: {
                        name: true,
                        url: true,
                        headers: {
                            0: {
                                name: true,
                                value: true,
                            },
                        },
                    },
                    name: 'Some name',
                    method: 'POST',
                    url: 'https://example.com',
                    headers: [{ name: 'test', value: 'test' }],
                    bodyContentType: 'application/json',
                    json: '{"key": "value"}',
                    formUrlencoded: [],
                    variables: [],
                },
            }

            const errors = getHTTPRequestNodeErrors(node, [])

            expect(errors).toEqual(null)
        })

        it('should add an error if name is empty and touched', () => {
            const node: HttpRequestNodeType = {
                ...buildNodeCommonProperties(),
                type: 'http_request',
                data: {
                    touched: {
                        name: true,
                    },
                    name: '',
                    method: 'GET',
                    url: '',
                    headers: [],
                    bodyContentType: null,
                    json: null,
                    formUrlencoded: [],
                    variables: [],
                },
            }

            const errors = getHTTPRequestNodeErrors(node, [])

            expect(errors).toEqual({
                name: 'Request name is required',
            })
        })

        it('should add an error if URL is empty and touched', () => {
            const node: HttpRequestNodeType = {
                ...buildNodeCommonProperties(),
                type: 'http_request',
                data: {
                    touched: {
                        url: true,
                    },
                    name: '',
                    method: 'GET',
                    url: '',
                    headers: [],
                    bodyContentType: null,
                    json: null,
                    formUrlencoded: [],
                    variables: [],
                },
            }

            const errors = getHTTPRequestNodeErrors(node, [])

            expect(errors).toEqual({
                url: 'URL is required',
            })
        })

        it('should add an error for invalid URL format', () => {
            const node: HttpRequestNodeType = {
                ...buildNodeCommonProperties(),
                type: 'http_request',
                data: {
                    touched: {
                        url: true,
                    },
                    name: '',
                    method: 'GET',
                    url: 'invalid-url',
                    headers: [],
                    bodyContentType: null,
                    json: null,
                    formUrlencoded: [],
                    variables: [],
                },
            }

            const errors = getHTTPRequestNodeErrors(node, [])

            expect(errors).toEqual({
                url: 'Invalid url',
            })
        })

        it('should add an error for invalid header name & value', () => {
            const node: HttpRequestNodeType = {
                ...buildNodeCommonProperties(),
                type: 'http_request',
                data: {
                    touched: {
                        headers: {
                            0: {
                                name: true,
                                value: true,
                            },
                        },
                    },
                    name: '',
                    method: 'GET',
                    url: '',
                    headers: [{ name: '', value: '' }],
                    bodyContentType: null,
                    json: null,
                    formUrlencoded: [],
                    variables: [],
                },
            }

            const errors = getHTTPRequestNodeErrors(node, [])

            expect(errors).toEqual({
                headers: {
                    0: {
                        name: 'Name is required',
                        value: 'Value is required',
                    },
                },
            })
        })

        it('should add an error for invalid JSON body', () => {
            const node: HttpRequestNodeType = {
                ...buildNodeCommonProperties(),
                type: 'http_request',
                data: {
                    touched: {
                        json: true,
                    },
                    name: '',
                    method: 'POST',
                    url: '',
                    headers: [],
                    bodyContentType: 'application/json',
                    json: '{invalid-json}',
                    formUrlencoded: [],
                    variables: [],
                },
            }

            const errors = getHTTPRequestNodeErrors(node, [])

            expect(errors).toEqual({
                json: 'Invalid JSON',
            })
        })

        it('should add an error for invalid form-urlencoded key & value', () => {
            const node: HttpRequestNodeType = {
                ...buildNodeCommonProperties(),
                type: 'http_request',
                data: {
                    touched: {
                        formUrlencoded: {
                            0: {
                                key: true,
                                value: true,
                            },
                        },
                    },
                    name: '',
                    method: 'POST',
                    url: '',
                    headers: [],
                    bodyContentType: 'application/x-www-form-urlencoded',
                    json: null,
                    formUrlencoded: [{ key: '', value: '' }],
                    variables: [],
                },
            }

            const errors = getHTTPRequestNodeErrors(node, [])

            expect(errors).toEqual({
                formUrlencoded: {
                    0: {
                        key: 'Key is required',
                        value: 'Value is required',
                    },
                },
            })
        })

        it('should add an error for invalid variable name & JSONPath', () => {
            const node: HttpRequestNodeType = {
                ...buildNodeCommonProperties(),
                type: 'http_request',
                data: {
                    touched: {
                        variables: {
                            0: {
                                name: true,
                                jsonpath: true,
                            },
                        },
                    },
                    name: '',
                    method: 'GET',
                    url: '',
                    headers: [],
                    bodyContentType: null,
                    json: null,
                    formUrlencoded: [],
                    variables: [
                        {
                            id: 'someid',
                            name: '',
                            jsonpath: '',
                            data_type: 'string',
                        },
                    ],
                },
            }

            const errors = getHTTPRequestNodeErrors(node, [])

            expect(errors).toEqual({
                variables: {
                    0: {
                        name: 'Name is required',
                        jsonpath: 'JSONPath is required',
                    },
                },
            })
        })

        it('should return "Path is required" when service connection path is empty and touched', () => {
            const node: HttpRequestNodeType = {
                ...buildNodeCommonProperties(),
                type: 'http_request',
                data: {
                    touched: {
                        url: true,
                    },
                    name: '',
                    method: 'GET',
                    url: '',
                    headers: [],
                    bodyContentType: null,
                    json: null,
                    formUrlencoded: [],
                    variables: [],
                    serviceConnectionSettings: {
                        integration_id: '{{store.helpdesk_integration_id}}',
                        path: '',
                    },
                },
            }

            const errors = getHTTPRequestNodeErrors(node, [])

            expect(errors).toEqual({
                url: 'Path is required',
            })
        })

        it('should return no error for a valid service connection path', () => {
            const node: HttpRequestNodeType = {
                ...buildNodeCommonProperties(),
                type: 'http_request',
                data: {
                    touched: {
                        url: true,
                        name: true,
                    },
                    name: 'Some name',
                    method: 'GET',
                    url: '',
                    headers: [],
                    bodyContentType: null,
                    json: null,
                    formUrlencoded: [],
                    variables: [],
                    serviceConnectionSettings: {
                        integration_id: '{{store.helpdesk_integration_id}}',
                        path: '/admin/api/2025-01/orders.json',
                    },
                },
            }

            const errors = getHTTPRequestNodeErrors(node, [])

            expect(errors).toEqual(null)
        })

        it('should not validate URL format for service connection path', () => {
            const node: HttpRequestNodeType = {
                ...buildNodeCommonProperties(),
                type: 'http_request',
                data: {
                    touched: {
                        url: true,
                    },
                    name: '',
                    method: 'GET',
                    url: '',
                    headers: [],
                    bodyContentType: null,
                    json: null,
                    formUrlencoded: [],
                    variables: [],
                    serviceConnectionSettings: {
                        integration_id: '{{store.helpdesk_integration_id}}',
                        path: '/admin/api/orders.json',
                    },
                },
            }

            const errors = getHTTPRequestNodeErrors(node, [])

            expect(errors).toEqual(null)
        })

        it('should return "Invalid variables" when service connection path has invalid variables', () => {
            const node: HttpRequestNodeType = {
                ...buildNodeCommonProperties(),
                type: 'http_request',
                data: {
                    touched: {
                        url: true,
                    },
                    name: '',
                    method: 'GET',
                    url: '',
                    headers: [],
                    bodyContentType: null,
                    json: null,
                    formUrlencoded: [],
                    variables: [],
                    serviceConnectionSettings: {
                        integration_id: '{{store.helpdesk_integration_id}}',
                        path: '/admin/api/{{nonexistent_variable}}/orders.json',
                    },
                },
            }

            const errors = getHTTPRequestNodeErrors(node, [])

            expect(errors).toEqual({
                url: 'Invalid variables',
            })
        })

        it('should return "Invalid variables syntax" when service connection path has invalid liquid syntax', () => {
            const node: HttpRequestNodeType = {
                ...buildNodeCommonProperties(),
                type: 'http_request',
                data: {
                    touched: {
                        url: true,
                    },
                    name: '',
                    method: 'GET',
                    url: '',
                    headers: [],
                    bodyContentType: null,
                    json: null,
                    formUrlencoded: [],
                    variables: [],
                    serviceConnectionSettings: {
                        integration_id: '{{store.helpdesk_integration_id}}',
                        path: '/admin/api/{{ invalid/orders.json',
                    },
                },
            }

            const errors = getHTTPRequestNodeErrors(node, [])

            expect(errors).toEqual({
                url: 'Invalid variables syntax',
            })
        })

        it('should return no error when service connection path has valid variables', () => {
            const variables: WorkflowVariableList = [
                {
                    name: 'order_id',
                    value: 'order_id',
                    nodeType: 'text_reply',
                    type: 'string',
                },
            ]

            const node: HttpRequestNodeType = {
                ...buildNodeCommonProperties(),
                type: 'http_request',
                data: {
                    touched: {
                        url: true,
                    },
                    name: '',
                    method: 'GET',
                    url: '',
                    headers: [],
                    bodyContentType: null,
                    json: null,
                    formUrlencoded: [],
                    variables: [],
                    serviceConnectionSettings: {
                        integration_id: '{{store.helpdesk_integration_id}}',
                        path: '/admin/api/orders/{{order_id}}.json',
                    },
                },
            }

            const errors = getHTTPRequestNodeErrors(node, variables)

            expect(errors).toEqual(null)
        })
    })

    describe('getConditionsNodeErrors()', () => {
        it('should return null if there are no errors', () => {
            const edges: VisualBuilderEdge[] = [
                {
                    ...buildEdgeCommonProperties(),
                    id: 'edge1',
                    source: 'node1',
                    target: 'node2',
                    data: {
                        name: 'Some name',
                        conditions: {
                            and: [{ equals: [{ var: 'variable1' }, 'value'] }],
                        },
                    },
                },
            ]
            const node: ConditionsNodeType = {
                ...buildNodeCommonProperties(),
                id: 'node1',
                type: 'conditions',
                data: {
                    touched: {
                        branches: {
                            edge1: {
                                name: true,
                                conditions: {
                                    0: true,
                                },
                            },
                        },
                    },
                    name: '',
                },
            }

            const errors = getConditionsNodeErrors(edges, node, [
                {
                    type: 'string',
                    value: 'variable1',
                    nodeType: 'http_request',
                    name: '',
                },
            ])

            expect(errors).toEqual(null)
        })

        it('should add an error if branch name is empty and touched', () => {
            const edges: VisualBuilderEdge[] = [
                {
                    ...buildEdgeCommonProperties(),
                    id: 'edge1',
                    source: 'node1',
                    target: 'node2',
                    data: {
                        name: '',
                        conditions: {
                            and: [],
                        },
                    },
                },
            ]
            const node: ConditionsNodeType = {
                ...buildNodeCommonProperties(),
                id: 'node1',
                type: 'conditions',
                data: {
                    touched: {
                        branches: {
                            edge1: {
                                name: true,
                            },
                        },
                    },
                    name: '',
                },
            }

            const errors = getConditionsNodeErrors(edges, node, [])

            expect(errors).toEqual({
                branches: {
                    edge1: {
                        name: 'Name is required',
                    },
                },
            })
        })

        it('should add an error if conditions array is empty and touched', () => {
            const edges: VisualBuilderEdge[] = [
                {
                    ...buildEdgeCommonProperties(),
                    id: 'edge1',
                    source: 'node1',
                    target: 'node2',
                    data: {
                        name: '',
                        conditions: {
                            and: [],
                        },
                    },
                },
            ]
            const node: ConditionsNodeType = {
                ...buildNodeCommonProperties(),
                id: 'node1',
                type: 'conditions',
                data: {
                    touched: {
                        branches: {
                            edge1: {
                                conditions: true,
                            },
                        },
                    },
                    name: '',
                },
            }

            const errors = getConditionsNodeErrors(edges, node, [])

            expect(errors).toEqual({
                branches: {
                    edge1: {
                        conditions: 'A branch must have at least 1 condition',
                    },
                },
            })
        })

        it('should add an error for invalid variables in a condition', () => {
            const edges: VisualBuilderEdge[] = [
                {
                    ...buildEdgeCommonProperties(),
                    id: 'edge1',
                    source: 'node1',
                    target: 'node2',
                    data: {
                        name: '',
                        conditions: {
                            and: [{ equals: [{ var: 'variable1' }, null] }],
                        },
                    },
                },
            ]
            const node: ConditionsNodeType = {
                ...buildNodeCommonProperties(),
                id: 'node1',
                type: 'conditions',
                data: {
                    touched: {
                        branches: {
                            edge1: {
                                conditions: {
                                    0: true,
                                },
                            },
                        },
                    },
                    name: '',
                },
            }

            const errors = getConditionsNodeErrors(edges, node, [])

            expect(errors).toEqual({
                branches: {
                    edge1: {
                        conditions: {
                            0: 'Invalid variables',
                        },
                    },
                },
            })
        })

        it('should add an error for empty string value in a condition', () => {
            const edges: VisualBuilderEdge[] = [
                {
                    ...buildEdgeCommonProperties(),
                    id: 'edge1',
                    source: 'node1',
                    target: 'node2',
                    data: {
                        name: '',
                        conditions: {
                            and: [{ equals: [{ var: 'variable1' }, ''] }],
                        },
                    },
                },
            ]
            const node: ConditionsNodeType = {
                ...buildNodeCommonProperties(),
                id: 'node1',
                type: 'conditions',
                data: {
                    touched: {
                        branches: {
                            edge1: {
                                conditions: {
                                    0: true,
                                },
                            },
                        },
                    },
                    name: '',
                },
            }

            const errors = getConditionsNodeErrors(edges, node, [
                {
                    type: 'string',
                    value: 'variable1',
                    nodeType: 'http_request',
                    name: '',
                },
            ])

            expect(errors).toEqual({
                branches: {
                    edge1: {
                        conditions: {
                            0: 'Enter a value',
                        },
                    },
                },
            })
        })

        it('should add an error for empty value in a date condition', () => {
            const edges: VisualBuilderEdge[] = [
                {
                    ...buildEdgeCommonProperties(),
                    id: 'edge1',
                    source: 'node1',
                    target: 'node2',
                    data: {
                        name: '',
                        conditions: {
                            and: [
                                {
                                    greaterThan: [
                                        { var: 'variable1' },
                                        undefined,
                                    ],
                                },
                            ],
                        },
                    },
                },
            ]
            const node: ConditionsNodeType = {
                ...buildNodeCommonProperties(),
                id: 'node1',
                type: 'conditions',
                data: {
                    touched: {
                        branches: {
                            edge1: {
                                conditions: {
                                    0: true,
                                },
                            },
                        },
                    },
                    name: '',
                },
            }

            const errors = getConditionsNodeErrors(edges, node, [
                {
                    type: 'date',
                    value: 'variable1',
                    nodeType: 'http_request',
                    name: '',
                },
            ])

            expect(errors).toEqual({
                branches: {
                    edge1: {
                        conditions: {
                            0: 'Choose a date',
                        },
                    },
                },
            })
        })

        it('should not add an error for number type condition with exists operator', () => {
            const edges: VisualBuilderEdge[] = [
                {
                    ...buildEdgeCommonProperties(),
                    id: 'edge1',
                    source: 'node1',
                    target: 'node2',
                    data: {
                        name: 'Branch name',
                        conditions: {
                            and: [{ exists: [{ var: 'variable1' }] }],
                        },
                    },
                },
            ]
            const node: ConditionsNodeType = {
                ...buildNodeCommonProperties(),
                id: 'node1',
                type: 'conditions',
                data: {
                    touched: {
                        branches: {
                            edge1: {
                                name: true,
                                conditions: {
                                    0: true,
                                },
                            },
                        },
                    },
                    name: '',
                },
            }

            const errors = getConditionsNodeErrors(edges, node, [
                {
                    type: 'number',
                    value: 'variable1',
                    nodeType: 'http_request',
                    name: '',
                },
            ])

            expect(errors).toEqual(null)
        })
    })

    describe('getChannelTriggerNodeErrors()', () => {
        it('should return null if there are no errors', () => {
            const node: ChannelTriggerNodeType = {
                ...buildNodeCommonProperties(),
                type: 'channel_trigger',
                data: {
                    label: 'some label',
                    label_tkey: '',
                    touched: {
                        label: true,
                    },
                },
            }

            const errors = getChannelTriggerNodeErrors(node)

            expect(errors).toEqual(null)
        })

        it('should add an error if the label is empty and touched', () => {
            const node: ChannelTriggerNodeType = {
                ...buildNodeCommonProperties(),
                type: 'channel_trigger',
                data: {
                    label: '',
                    label_tkey: '',
                    touched: {
                        label: true,
                    },
                },
            }

            const errors = getChannelTriggerNodeErrors(node)

            expect(errors).toEqual({
                label: 'Trigger button is required',
            })
        })
    })

    describe('getReusableLLMPromptTriggerNodeErrors()', () => {
        it('should return null if there are no errors', () => {
            const node: ReusableLLMPromptTriggerNodeType = {
                ...buildNodeCommonProperties(),
                type: 'reusable_llm_prompt_trigger',
                data: {
                    touched: {
                        inputs: {},
                        conditions: true,
                    },
                    inputs: [],
                    conditionsType: null,
                    conditions: [],
                    requires_confirmation: false,
                },
            }

            const errors = getReusableLLMPromptTriggerNodeErrors(node, [])

            expect(errors).toEqual(null)
        })

        it('should add an error if input name & instructions are empty and touched', () => {
            const node: ReusableLLMPromptTriggerNodeType = {
                ...buildNodeCommonProperties(),
                type: 'reusable_llm_prompt_trigger',
                data: {
                    touched: {
                        inputs: {
                            input1: { name: true, instructions: true },
                        },
                    },
                    inputs: [
                        {
                            id: 'input1',
                            name: '',
                            instructions: '',
                            data_type: 'string',
                        },
                    ],
                    conditionsType: null,
                    conditions: [],
                    requires_confirmation: false,
                },
            }

            const errors = getReusableLLMPromptTriggerNodeErrors(node, [])

            expect(errors).toEqual({
                inputs: {
                    input1: {
                        name: 'Name is required',
                        instructions: 'Description is required',
                    },
                },
            })
        })

        it('should add an error for invalid conditions', () => {
            const node: ReusableLLMPromptTriggerNodeType = {
                ...buildNodeCommonProperties(),
                type: 'reusable_llm_prompt_trigger',
                data: {
                    touched: {
                        conditions: { 0: true },
                    },
                    inputs: [],
                    conditionsType: 'and',
                    conditions: [{ startsWith: [{ var: 'variable1' }, null] }],
                    requires_confirmation: false,
                },
            }

            const errors = getReusableLLMPromptTriggerNodeErrors(node, [])

            expect(errors).toEqual({
                conditions: { 0: 'Invalid variables' },
            })
        })

        it('should add an error if a string condition value is empty', () => {
            const node: ReusableLLMPromptTriggerNodeType = {
                ...buildNodeCommonProperties(),
                type: 'reusable_llm_prompt_trigger',
                data: {
                    touched: {
                        conditions: { 0: true },
                    },
                    inputs: [],
                    conditionsType: 'and',
                    conditions: [{ equals: [{ var: 'variable1' }, ''] }],
                    requires_confirmation: false,
                },
            }

            const errors = getReusableLLMPromptTriggerNodeErrors(node, [
                {
                    type: 'string',
                    value: 'variable1',
                    nodeType: 'http_request',
                    name: '',
                },
            ])

            expect(errors).toEqual({
                conditions: { 0: 'Enter a value' },
            })
        })

        it('should add an error if a date condition is empty', () => {
            const node: ReusableLLMPromptTriggerNodeType = {
                ...buildNodeCommonProperties(),
                type: 'reusable_llm_prompt_trigger',
                data: {
                    touched: {
                        conditions: { 0: true },
                    },
                    inputs: [],
                    conditionsType: 'and',
                    conditions: [
                        { greaterThan: [{ var: 'variable1' }, undefined] },
                    ],
                    requires_confirmation: false,
                },
            }

            const errors = getReusableLLMPromptTriggerNodeErrors(node, [
                {
                    type: 'date',
                    value: 'variable1',
                    nodeType: 'http_request',
                    name: '',
                },
            ])

            expect(errors).toEqual({
                conditions: { 0: 'Choose a date' },
            })
        })
    })

    describe('getMultipleChoicesNodeErrors()', () => {
        it('should return null if there are no errors', () => {
            const node: MultipleChoicesNodeType = {
                ...buildNodeCommonProperties(),
                type: 'multiple_choices',
                data: {
                    touched: {
                        content: true,
                        choices: {
                            choice1: {
                                label: true,
                            },
                        },
                    },
                    content: {
                        html: 'some html',
                        text: 'some text',
                    },
                    choices: [{ event_id: 'choice1', label: 'Option 1' }],
                },
            }

            const errors = getMultipleChoicesNodeErrors(node, [])

            expect(errors).toEqual(null)
        })

        it('should add an error if the content text is empty and touched', () => {
            const node: MultipleChoicesNodeType = {
                ...buildNodeCommonProperties(),
                type: 'multiple_choices',
                data: {
                    touched: {
                        content: true,
                    },
                    content: {
                        html: '',
                        text: '',
                    },
                    choices: [],
                },
            }

            const errors = getMultipleChoicesNodeErrors(node, [])

            expect(errors).toEqual({
                content: 'Question is required',
            })
        })

        it('should add an error if the content text contains invalid variables', () => {
            const node: MultipleChoicesNodeType = {
                ...buildNodeCommonProperties(),
                type: 'multiple_choices',
                data: {
                    touched: {
                        content: true,
                    },
                    content: {
                        html: 'Question with {{variable1}}',
                        text: 'Question with {{variable1}}',
                    },
                    choices: [],
                },
            }

            const errors = getMultipleChoicesNodeErrors(node, [])

            expect(errors).toEqual({
                content: 'Invalid variables',
            })
        })

        it('should add an error if the content text has invalid syntax', () => {
            const node: MultipleChoicesNodeType = {
                ...buildNodeCommonProperties(),
                type: 'multiple_choices',
                data: {
                    touched: {
                        content: true,
                    },
                    content: {
                        html: 'Question with {{',
                        text: 'Question with {{',
                    },
                    choices: [],
                },
            }

            const errors = getMultipleChoicesNodeErrors(node, [])

            expect(errors).toEqual({
                content: 'Invalid variables syntax',
            })
        })

        it('should add an error for an empty choice label if touched', () => {
            const node: MultipleChoicesNodeType = {
                ...buildNodeCommonProperties(),
                type: 'multiple_choices',
                data: {
                    touched: {
                        choices: {
                            choice1: {
                                label: true,
                            },
                        },
                    },
                    content: {
                        html: '',
                        text: '',
                    },
                    choices: [{ event_id: 'choice1', label: '' }],
                },
            }

            const errors = getMultipleChoicesNodeErrors(node, [])

            expect(errors).toEqual({
                choices: {
                    choice1: {
                        label: 'Option label is required',
                    },
                },
            })
        })

        it('should add an error for invalid variables in a choice label', () => {
            const node: MultipleChoicesNodeType = {
                ...buildNodeCommonProperties(),
                type: 'multiple_choices',
                data: {
                    touched: {
                        choices: {
                            choice1: {
                                label: true,
                            },
                        },
                    },
                    content: {
                        html: '',
                        text: '',
                    },
                    choices: [{ event_id: 'choice1', label: '{{variable1}}' }],
                },
            }

            const errors = getMultipleChoicesNodeErrors(node, [])

            expect(errors).toEqual({
                choices: {
                    choice1: {
                        label: 'Invalid variables',
                    },
                },
            })
        })

        it('should add an error for invalid syntax in a choice label', () => {
            const node: MultipleChoicesNodeType = {
                ...buildNodeCommonProperties(),
                type: 'multiple_choices',
                data: {
                    touched: {
                        choices: {
                            choice1: {
                                label: true,
                            },
                        },
                    },
                    content: {
                        html: '',
                        text: '',
                    },
                    choices: [{ event_id: 'choice1', label: '{{' }],
                },
            }

            const errors = getMultipleChoicesNodeErrors(node, [])

            expect(errors).toEqual({
                choices: {
                    choice1: {
                        label: 'Invalid variables syntax',
                    },
                },
            })
        })
    })

    describe('getAutomatedMessageNodeErrors()', () => {
        it('should return null if there are no errors', () => {
            const node: AutomatedMessageNodeType = {
                ...buildNodeCommonProperties(),
                type: 'automated_message',
                data: {
                    touched: {
                        content: true,
                    },
                    content: {
                        html: 'some html',
                        text: 'some text',
                    },
                },
            }

            const errors = getAutomatedMessageNodeErrors(node, [])

            expect(errors).toEqual(null)
        })

        it('should add an error if the content text is empty and touched', () => {
            const node: AutomatedMessageNodeType = {
                ...buildNodeCommonProperties(),
                type: 'automated_message',
                data: {
                    touched: {
                        content: true,
                    },
                    content: {
                        html: '',
                        text: '',
                    },
                },
            }

            const errors = getAutomatedMessageNodeErrors(node, [])

            expect(errors).toEqual({
                content: 'Message is required',
            })
        })

        it('should add an error if the content text contains invalid variables', () => {
            const node: AutomatedMessageNodeType = {
                ...buildNodeCommonProperties(),
                type: 'automated_message',
                data: {
                    touched: {
                        content: true,
                    },
                    content: {
                        html: 'Message with {{variable1}}',
                        text: 'Message with {{variable1}}',
                    },
                },
            }

            const errors = getAutomatedMessageNodeErrors(node, [])

            expect(errors).toEqual({
                content: 'Invalid variables',
            })
        })

        it('should add an error if the content text has invalid syntax', () => {
            const node: AutomatedMessageNodeType = {
                ...buildNodeCommonProperties(),
                type: 'automated_message',
                data: {
                    touched: {
                        content: true,
                    },
                    content: {
                        html: 'Message with {{',
                        text: 'Message with {{',
                    },
                },
            }

            const errors = getAutomatedMessageNodeErrors(node, [])

            expect(errors).toEqual({
                content: 'Invalid variables syntax',
            })
        })
    })

    describe('getTextReplyNodeErrors()', () => {
        it('should return null if there are no errors', () => {
            const node: TextReplyNodeType = {
                ...buildNodeCommonProperties(),
                type: 'text_reply',
                data: {
                    touched: {
                        content: true,
                    },
                    content: {
                        html: 'some html',
                        text: 'some text',
                    },
                },
            }

            const errors = getTextReplyNodeErrors(node, [])

            expect(errors).toEqual(null)
        })

        it('should add an error if the content text is empty and touched', () => {
            const node: TextReplyNodeType = {
                ...buildNodeCommonProperties(),
                type: 'text_reply',
                data: {
                    touched: {
                        content: true,
                    },
                    content: {
                        html: '',
                        text: '',
                    },
                },
            }

            const errors = getTextReplyNodeErrors(node, [])

            expect(errors).toEqual({
                content: 'Message is required',
            })
        })

        it('should add an error if the content text contains invalid variables', () => {
            const node: TextReplyNodeType = {
                ...buildNodeCommonProperties(),
                type: 'text_reply',
                data: {
                    touched: {
                        content: true,
                    },
                    content: {
                        html: 'Message with {{variable1}}',
                        text: 'Message with {{variable1}}',
                    },
                },
            }

            const errors = getTextReplyNodeErrors(node, [])

            expect(errors).toEqual({
                content: 'Invalid variables',
            })
        })

        it('should add an error if the content text has invalid syntax', () => {
            const node: TextReplyNodeType = {
                ...buildNodeCommonProperties(),
                type: 'text_reply',
                data: {
                    touched: {
                        content: true,
                    },
                    content: {
                        html: 'Message with {{',
                        text: 'Message with {{',
                    },
                },
            }

            const errors = getTextReplyNodeErrors(node, [])

            expect(errors).toEqual({
                content: 'Invalid variables syntax',
            })
        })
    })

    describe('getFileUploadNodeErrors()', () => {
        it('should return null if there are no errors', () => {
            const node: FileUploadNodeType = {
                ...buildNodeCommonProperties(),
                type: 'file_upload',
                data: {
                    touched: {
                        content: true,
                    },
                    content: {
                        html: 'some html',
                        text: 'some text',
                    },
                },
            }

            const errors = getFileUploadNodeErrors(node, [])

            expect(errors).toEqual(null)
        })

        it('should add an error if the content text is empty and touched', () => {
            const node: FileUploadNodeType = {
                ...buildNodeCommonProperties(),
                type: 'file_upload',
                data: {
                    touched: {
                        content: true,
                    },
                    content: {
                        html: '',
                        text: '',
                    },
                },
            }

            const errors = getFileUploadNodeErrors(node, [])

            expect(errors).toEqual({
                content: 'Message is required',
            })
        })

        it('should add an error if the content text contains invalid variables', () => {
            const node: FileUploadNodeType = {
                ...buildNodeCommonProperties(),
                type: 'file_upload',
                data: {
                    touched: {
                        content: true,
                    },
                    content: {
                        html: 'Message with {{variable1}}',
                        text: 'Message with {{variable1}}',
                    },
                },
            }

            const errors = getFileUploadNodeErrors(node, [])

            expect(errors).toEqual({
                content: 'Invalid variables',
            })
        })

        it('should add an error if the content text has invalid syntax', () => {
            const node: FileUploadNodeType = {
                ...buildNodeCommonProperties(),
                type: 'file_upload',
                data: {
                    touched: {
                        content: true,
                    },
                    content: {
                        html: 'Message with {{',
                        text: 'Message with {{',
                    },
                },
            }

            const errors = getFileUploadNodeErrors(node, [])

            expect(errors).toEqual({
                content: 'Invalid variables syntax',
            })
        })
    })

    describe('getOrderSelectionNodeErrors()', () => {
        it('should return null if there are no errors', () => {
            const node: OrderSelectionNodeType = {
                ...buildNodeCommonProperties(),
                type: 'order_selection',
                data: {
                    touched: {
                        content: true,
                    },
                    content: {
                        html: 'some html',
                        text: 'some text',
                    },
                },
            }

            const errors = getOrderSelectionNodeErrors(node, [])

            expect(errors).toEqual(null)
        })

        it('should add an error if the content text is empty and touched', () => {
            const node: OrderSelectionNodeType = {
                ...buildNodeCommonProperties(),
                type: 'order_selection',
                data: {
                    touched: {
                        content: true,
                    },
                    content: {
                        html: '',
                        text: '',
                    },
                },
            }

            const errors = getOrderSelectionNodeErrors(node, [])

            expect(errors).toEqual({
                content: 'Message is required',
            })
        })

        it('should add an error if the content text contains invalid variables', () => {
            const node: OrderSelectionNodeType = {
                ...buildNodeCommonProperties(),
                type: 'order_selection',
                data: {
                    touched: {
                        content: true,
                    },
                    content: {
                        html: 'Message with {{variable1}}',
                        text: 'Message with {{variable1}}',
                    },
                },
            }

            const errors = getOrderSelectionNodeErrors(node, [])

            expect(errors).toEqual({
                content: 'Invalid variables',
            })
        })

        it('should add an error if the content text has invalid syntax', () => {
            const node: OrderSelectionNodeType = {
                ...buildNodeCommonProperties(),
                type: 'order_selection',
                data: {
                    touched: {
                        content: true,
                    },
                    content: {
                        html: 'Message with {{',
                        text: 'Message with {{',
                    },
                },
            }

            const errors = getOrderSelectionNodeErrors(node, [])

            expect(errors).toEqual({
                content: 'Invalid variables syntax',
            })
        })
    })

    describe('getOrderLineItemSelectionNodeErrors()', () => {
        it('should return null if there are no errors', () => {
            const node: OrderLineItemSelectionNodeType = {
                ...buildNodeCommonProperties(),
                type: 'order_line_item_selection',
                data: {
                    touched: {
                        content: true,
                    },
                    content: {
                        html: 'some html',
                        text: 'some text',
                    },
                },
            }

            const errors = getOrderLineItemSelectionNodeErrors(node, [])

            expect(errors).toEqual(null)
        })

        it('should add an error if the content text is empty and touched', () => {
            const node: OrderLineItemSelectionNodeType = {
                ...buildNodeCommonProperties(),
                type: 'order_line_item_selection',
                data: {
                    touched: {
                        content: true,
                    },
                    content: {
                        html: '',
                        text: '',
                    },
                },
            }

            const errors = getOrderLineItemSelectionNodeErrors(node, [])

            expect(errors).toEqual({
                content: 'Message is required',
            })
        })

        it('should add an error if the content text contains invalid variables', () => {
            const node: OrderLineItemSelectionNodeType = {
                ...buildNodeCommonProperties(),
                type: 'order_line_item_selection',
                data: {
                    touched: {
                        content: true,
                    },
                    content: {
                        html: 'Message with {{variable1}}',
                        text: 'Message with {{variable1}}',
                    },
                },
            }

            const errors = getOrderLineItemSelectionNodeErrors(node, [])

            expect(errors).toEqual({
                content: 'Invalid variables',
            })
        })

        it('should add an error if the content text has invalid syntax', () => {
            const node: OrderLineItemSelectionNodeType = {
                ...buildNodeCommonProperties(),
                type: 'order_line_item_selection',
                data: {
                    touched: {
                        content: true,
                    },
                    content: {
                        html: 'Message with {{',
                        text: 'Message with {{',
                    },
                },
            }

            const errors = getOrderLineItemSelectionNodeErrors(node, [])

            expect(errors).toEqual({
                content: 'Invalid variables syntax',
            })
        })
    })

    describe('getSkipChargeNodeErrors()', () => {
        it('should return null if there are no errors', () => {
            const node: SkipChargeNodeType = {
                ...buildNodeCommonProperties(),
                type: 'skip_charge',
                data: {
                    customerId: '',
                    integrationId: '',
                    subscriptionId: 'subscriptionId',
                    chargeId: 'chargeId',
                    touched: {
                        subscriptionId: true,
                        chargeId: true,
                    },
                },
            }

            const errors = getSkipChargeNodeErrors(node, [])

            expect(errors).toEqual(null)
        })

        it('should add an error if subscription id is empty and touched', () => {
            const node: SkipChargeNodeType = {
                ...buildNodeCommonProperties(),
                type: 'skip_charge',
                data: {
                    customerId: '',
                    integrationId: '',
                    subscriptionId: '',
                    chargeId: '',
                    touched: {
                        subscriptionId: true,
                    },
                },
            }

            const errors = getSkipChargeNodeErrors(node, [])

            expect(errors).toEqual({
                subscriptionId: 'Subscription id is required',
            })
        })

        it('should add an error if subscription id contains invalid variables', () => {
            const node: SkipChargeNodeType = {
                ...buildNodeCommonProperties(),
                type: 'skip_charge',
                data: {
                    customerId: '',
                    integrationId: '',
                    subscriptionId: '{{variable1}}',
                    chargeId: '',
                    touched: {
                        subscriptionId: true,
                    },
                },
            }

            const errors = getSkipChargeNodeErrors(node, [])

            expect(errors).toEqual({
                subscriptionId: 'Invalid variables',
            })
        })

        it('should add an error if subscription id has invalid syntax', () => {
            const node: SkipChargeNodeType = {
                ...buildNodeCommonProperties(),
                type: 'skip_charge',
                data: {
                    customerId: '',
                    integrationId: '',
                    subscriptionId: '{{',
                    chargeId: '',
                    touched: {
                        subscriptionId: true,
                    },
                },
            }

            const errors = getSkipChargeNodeErrors(node, [])

            expect(errors).toEqual({
                subscriptionId: 'Invalid variables syntax',
            })
        })

        it('should add an error if charge id is empty and touched', () => {
            const node: SkipChargeNodeType = {
                ...buildNodeCommonProperties(),
                type: 'skip_charge',
                data: {
                    customerId: '',
                    integrationId: '',
                    subscriptionId: '',
                    chargeId: '',
                    touched: {
                        chargeId: true,
                    },
                },
            }

            const errors = getSkipChargeNodeErrors(node, [])

            expect(errors).toEqual({
                chargeId: 'Charge id is required',
            })
        })

        it('should add an error if charge id contains invalid variables', () => {
            const node: SkipChargeNodeType = {
                ...buildNodeCommonProperties(),
                type: 'skip_charge',
                data: {
                    customerId: '',
                    integrationId: '',
                    subscriptionId: '',
                    chargeId: '{{variable1}}',
                    touched: {
                        chargeId: true,
                    },
                },
            }

            const errors = getSkipChargeNodeErrors(node, [])

            expect(errors).toEqual({
                chargeId: 'Invalid variables',
            })
        })

        it('should add an error if charge id has invalid syntax', () => {
            const node: SkipChargeNodeType = {
                ...buildNodeCommonProperties(),
                type: 'skip_charge',
                data: {
                    customerId: '',
                    integrationId: '',
                    subscriptionId: '',
                    chargeId: '{{',
                    touched: {
                        chargeId: true,
                    },
                },
            }

            const errors = getSkipChargeNodeErrors(node, [])

            expect(errors).toEqual({
                chargeId: 'Invalid variables syntax',
            })
        })
    })

    describe('getCancelSubscriptionNodeErrors()', () => {
        it('should return null if there are no errors', () => {
            const node: CancelSubscriptionNodeType = {
                ...buildNodeCommonProperties(),
                type: 'cancel_subscription',
                data: {
                    customerId: '',
                    integrationId: '',
                    subscriptionId: 'subscriptionId',
                    reason: 'reason',
                    touched: {
                        subscriptionId: true,
                        reason: true,
                    },
                },
            }

            const errors = getCancelSubscriptionNodeErrors(node, [])

            expect(errors).toEqual(null)
        })

        it('should add an error if subscription id is empty and touched', () => {
            const node: CancelSubscriptionNodeType = {
                ...buildNodeCommonProperties(),
                type: 'cancel_subscription',
                data: {
                    customerId: '',
                    integrationId: '',
                    subscriptionId: '',
                    reason: '',
                    touched: {
                        subscriptionId: true,
                    },
                },
            }

            const errors = getCancelSubscriptionNodeErrors(node, [])

            expect(errors).toEqual({
                subscriptionId: 'Subscription id is required',
            })
        })

        it('should add an error if subscription id contains invalid variables', () => {
            const node: CancelSubscriptionNodeType = {
                ...buildNodeCommonProperties(),
                type: 'cancel_subscription',
                data: {
                    customerId: '',
                    integrationId: '',
                    subscriptionId: '{{variable1}}',
                    reason: '',
                    touched: {
                        subscriptionId: true,
                    },
                },
            }

            const errors = getCancelSubscriptionNodeErrors(node, [])

            expect(errors).toEqual({
                subscriptionId: 'Invalid variables',
            })
        })

        it('should add an error if subscription id has invalid syntax', () => {
            const node: CancelSubscriptionNodeType = {
                ...buildNodeCommonProperties(),
                type: 'cancel_subscription',
                data: {
                    customerId: '',
                    integrationId: '',
                    subscriptionId: '{{',
                    reason: '',
                    touched: {
                        subscriptionId: true,
                    },
                },
            }

            const errors = getCancelSubscriptionNodeErrors(node, [])

            expect(errors).toEqual({
                subscriptionId: 'Invalid variables syntax',
            })
        })

        it('should add an error if reason is empty and touched', () => {
            const node: CancelSubscriptionNodeType = {
                ...buildNodeCommonProperties(),
                type: 'cancel_subscription',
                data: {
                    customerId: '',
                    integrationId: '',
                    subscriptionId: '',
                    reason: '',
                    touched: {
                        reason: true,
                    },
                },
            }

            const errors = getCancelSubscriptionNodeErrors(node, [])

            expect(errors).toEqual({
                reason: 'Reason is required',
            })
        })

        it('should add an error if reason contains invalid variables', () => {
            const node: CancelSubscriptionNodeType = {
                ...buildNodeCommonProperties(),
                type: 'cancel_subscription',
                data: {
                    customerId: '',
                    integrationId: '',
                    subscriptionId: '',
                    reason: '{{variable1}}',
                    touched: {
                        reason: true,
                    },
                },
            }

            const errors = getCancelSubscriptionNodeErrors(node, [])

            expect(errors).toEqual({
                reason: 'Invalid variables',
            })
        })

        it('should add an error if reason has invalid syntax', () => {
            const node: CancelSubscriptionNodeType = {
                ...buildNodeCommonProperties(),
                type: 'cancel_subscription',
                data: {
                    customerId: '',
                    integrationId: '',
                    subscriptionId: '',
                    reason: '{{',
                    touched: {
                        reason: true,
                    },
                },
            }

            const errors = getCancelSubscriptionNodeErrors(node, [])

            expect(errors).toEqual({
                reason: 'Invalid variables syntax',
            })
        })
    })

    describe('getReplaceItemNodeErrors()', () => {
        it('should return null if there are no errors', () => {
            const node: ReplaceItemNodeType = {
                ...buildNodeCommonProperties(),
                type: 'replace_item',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    productVariantId: 'productVariantId',
                    quantity: 'quantity',
                    addedProductVariantId: 'addedProductVariantId',
                    addedQuantity: 'addedQuantity',
                    touched: {
                        productVariantId: true,
                        quantity: true,
                        addedProductVariantId: true,
                        addedQuantity: true,
                    },
                },
            }

            const errors = getReplaceItemNodeErrors(node, [])

            expect(errors).toEqual(null)
        })

        it('should add an error if product variant id is empty and touched', () => {
            const node: ReplaceItemNodeType = {
                ...buildNodeCommonProperties(),
                type: 'replace_item',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    productVariantId: '',
                    quantity: '',
                    addedProductVariantId: '',
                    addedQuantity: '',
                    touched: {
                        productVariantId: true,
                    },
                },
            }

            const errors = getReplaceItemNodeErrors(node, [])

            expect(errors).toEqual({
                productVariantId: 'Product variant id is required',
            })
        })

        it('should add an error if product variant id contains invalid variables', () => {
            const node: ReplaceItemNodeType = {
                ...buildNodeCommonProperties(),
                type: 'replace_item',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    productVariantId: '{{variable1}}',
                    quantity: '',
                    addedProductVariantId: '',
                    addedQuantity: '',
                    touched: {
                        productVariantId: true,
                    },
                },
            }

            const errors = getReplaceItemNodeErrors(node, [])

            expect(errors).toEqual({
                productVariantId: 'Invalid variables',
            })
        })

        it('should add an error if product variant id has invalid syntax', () => {
            const node: ReplaceItemNodeType = {
                ...buildNodeCommonProperties(),
                type: 'replace_item',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    productVariantId: '{{',
                    quantity: '',
                    addedProductVariantId: '',
                    addedQuantity: '',
                    touched: {
                        productVariantId: true,
                    },
                },
            }

            const errors = getReplaceItemNodeErrors(node, [])

            expect(errors).toEqual({
                productVariantId: 'Invalid variables syntax',
            })
        })

        it('should add an error if quantity is empty and touched', () => {
            const node: ReplaceItemNodeType = {
                ...buildNodeCommonProperties(),
                type: 'replace_item',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    productVariantId: '',
                    quantity: '',
                    addedProductVariantId: '',
                    addedQuantity: '',
                    touched: {
                        quantity: true,
                    },
                },
            }

            const errors = getReplaceItemNodeErrors(node, [])

            expect(errors).toEqual({
                quantity: 'Quantity is required',
            })
        })

        it('should add an error if quantity contains invalid variables', () => {
            const node: ReplaceItemNodeType = {
                ...buildNodeCommonProperties(),
                type: 'replace_item',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    productVariantId: '',
                    quantity: '{{variable1}}',
                    addedProductVariantId: '',
                    addedQuantity: '',
                    touched: {
                        quantity: true,
                    },
                },
            }

            const errors = getReplaceItemNodeErrors(node, [])

            expect(errors).toEqual({
                quantity: 'Invalid variables',
            })
        })

        it('should add an error if quantity has invalid syntax', () => {
            const node: ReplaceItemNodeType = {
                ...buildNodeCommonProperties(),
                type: 'replace_item',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    productVariantId: '',
                    quantity: '{{',
                    addedProductVariantId: '',
                    addedQuantity: '',
                    touched: {
                        quantity: true,
                    },
                },
            }

            const errors = getReplaceItemNodeErrors(node, [])

            expect(errors).toEqual({
                quantity: 'Invalid variables syntax',
            })
        })

        it('should add an error if added product variant id is empty and touched', () => {
            const node: ReplaceItemNodeType = {
                ...buildNodeCommonProperties(),
                type: 'replace_item',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    productVariantId: '',
                    quantity: '',
                    addedProductVariantId: '',
                    addedQuantity: '',
                    touched: {
                        addedProductVariantId: true,
                    },
                },
            }

            const errors = getReplaceItemNodeErrors(node, [])

            expect(errors).toEqual({
                addedProductVariantId: 'Added product variant id is required',
            })
        })

        it('should add an error if added product variant id contains invalid variables', () => {
            const node: ReplaceItemNodeType = {
                ...buildNodeCommonProperties(),
                type: 'replace_item',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    productVariantId: '',
                    quantity: '',
                    addedProductVariantId: '{{variable1}}',
                    addedQuantity: '',
                    touched: {
                        addedProductVariantId: true,
                    },
                },
            }

            const errors = getReplaceItemNodeErrors(node, [])

            expect(errors).toEqual({
                addedProductVariantId: 'Invalid variables',
            })
        })

        it('should add an error if added product variant id has invalid syntax', () => {
            const node: ReplaceItemNodeType = {
                ...buildNodeCommonProperties(),
                type: 'replace_item',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    productVariantId: '',
                    quantity: '',
                    addedProductVariantId: '{{',
                    addedQuantity: '',
                    touched: {
                        addedProductVariantId: true,
                    },
                },
            }

            const errors = getReplaceItemNodeErrors(node, [])

            expect(errors).toEqual({
                addedProductVariantId: 'Invalid variables syntax',
            })
        })

        it('should add an error if added quantity is empty and touched', () => {
            const node: ReplaceItemNodeType = {
                ...buildNodeCommonProperties(),
                type: 'replace_item',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    productVariantId: '',
                    quantity: '',
                    addedProductVariantId: '',
                    addedQuantity: '',
                    touched: {
                        addedQuantity: true,
                    },
                },
            }

            const errors = getReplaceItemNodeErrors(node, [])

            expect(errors).toEqual({
                addedQuantity: 'Added quantity is required',
            })
        })

        it('should add an error if added quantity contains invalid variables', () => {
            const node: ReplaceItemNodeType = {
                ...buildNodeCommonProperties(),
                type: 'replace_item',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    productVariantId: '',
                    quantity: '',
                    addedProductVariantId: '',
                    addedQuantity: '{{variable1}}',
                    touched: {
                        addedQuantity: true,
                    },
                },
            }

            const errors = getReplaceItemNodeErrors(node, [])

            expect(errors).toEqual({
                addedQuantity: 'Invalid variables',
            })
        })

        it('should add an error if added quantity has invalid syntax', () => {
            const node: ReplaceItemNodeType = {
                ...buildNodeCommonProperties(),
                type: 'replace_item',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    productVariantId: '',
                    quantity: '',
                    addedProductVariantId: '',
                    addedQuantity: '{{',
                    touched: {
                        addedQuantity: true,
                    },
                },
            }

            const errors = getReplaceItemNodeErrors(node, [])

            expect(errors).toEqual({
                addedQuantity: 'Invalid variables syntax',
            })
        })
    })

    describe('getRemoveItemNodeErrors()', () => {
        it('should return null if there are no errors', () => {
            const node: RemoveItemNodeType = {
                ...buildNodeCommonProperties(),
                type: 'remove_item',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    productVariantId: 'productVariantId',
                    quantity: 'quantity',
                    touched: {
                        productVariantId: true,
                        quantity: true,
                    },
                },
            }

            const errors = getRemoveItemNodeErrors(node, [])

            expect(errors).toEqual(null)
        })

        it('should add an error if product variant id is empty and touched', () => {
            const node: RemoveItemNodeType = {
                ...buildNodeCommonProperties(),
                type: 'remove_item',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    productVariantId: '',
                    quantity: '',
                    touched: {
                        productVariantId: true,
                    },
                },
            }

            const errors = getRemoveItemNodeErrors(node, [])

            expect(errors).toEqual({
                productVariantId: 'Product variant id is required',
            })
        })

        it('should add an error if product variant id contains invalid variables', () => {
            const node: RemoveItemNodeType = {
                ...buildNodeCommonProperties(),
                type: 'remove_item',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    productVariantId: '{{variable1}}',
                    quantity: '',
                    touched: {
                        productVariantId: true,
                    },
                },
            }

            const errors = getRemoveItemNodeErrors(node, [])

            expect(errors).toEqual({
                productVariantId: 'Invalid variables',
            })
        })

        it('should add an error if product variant id has invalid syntax', () => {
            const node: RemoveItemNodeType = {
                ...buildNodeCommonProperties(),
                type: 'remove_item',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    productVariantId: '{{',
                    quantity: '',
                    touched: {
                        productVariantId: true,
                    },
                },
            }

            const errors = getRemoveItemNodeErrors(node, [])

            expect(errors).toEqual({
                productVariantId: 'Invalid variables syntax',
            })
        })

        it('should add an error if quantity is empty and touched', () => {
            const node: RemoveItemNodeType = {
                ...buildNodeCommonProperties(),
                type: 'remove_item',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    productVariantId: '',
                    quantity: '',
                    touched: {
                        quantity: true,
                    },
                },
            }

            const errors = getRemoveItemNodeErrors(node, [])

            expect(errors).toEqual({
                quantity: 'Quantity is required',
            })
        })

        it('should add an error if quantity contains invalid variables', () => {
            const node: RemoveItemNodeType = {
                ...buildNodeCommonProperties(),
                type: 'remove_item',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    productVariantId: '',
                    quantity: '{{variable1}}',
                    touched: {
                        quantity: true,
                    },
                },
            }

            const errors = getRemoveItemNodeErrors(node, [])

            expect(errors).toEqual({
                quantity: 'Invalid variables',
            })
        })

        it('should add an error if quantity has invalid syntax', () => {
            const node: RemoveItemNodeType = {
                ...buildNodeCommonProperties(),
                type: 'remove_item',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    productVariantId: '',
                    quantity: '{{',
                    touched: {
                        quantity: true,
                    },
                },
            }

            const errors = getRemoveItemNodeErrors(node, [])

            expect(errors).toEqual({
                quantity: 'Invalid variables syntax',
            })
        })
    })

    describe('getUpdateShippingAddressNodeErrors()', () => {
        it('should return null if there are no errors', () => {
            const node: UpdateShippingAddressNodeType = {
                ...buildNodeCommonProperties(),
                type: 'update_shipping_address',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    name: 'name',
                    address1: 'address1',
                    address2: 'address2',
                    city: 'city',
                    zip: 'zip',
                    province: 'province',
                    country: 'country',
                    phone: 'phone',
                    lastName: 'lastName',
                    firstName: 'firstName',
                    touched: {
                        name: true,
                        address1: true,
                        address2: true,
                        city: true,
                        zip: true,
                        province: true,
                        country: true,
                        phone: true,
                        lastName: true,
                        firstName: true,
                    },
                },
            }

            const errors = getUpdateShippingAddressNodeErrors(node, [])

            expect(errors).toEqual(null)
        })

        it('should add an error if name is empty and touched', () => {
            const node: UpdateShippingAddressNodeType = {
                ...buildNodeCommonProperties(),
                type: 'update_shipping_address',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    name: '',
                    address1: '',
                    address2: '',
                    city: '',
                    zip: '',
                    province: '',
                    country: '',
                    phone: '',
                    lastName: '',
                    firstName: '',
                    touched: {
                        name: true,
                    },
                },
            }

            const errors = getUpdateShippingAddressNodeErrors(node, [])

            expect(errors).toEqual({
                name: 'Name is required',
            })
        })

        it('should add an error if name contains invalid variables', () => {
            const node: UpdateShippingAddressNodeType = {
                ...buildNodeCommonProperties(),
                type: 'update_shipping_address',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    name: '{{variable1}}',
                    address1: '',
                    address2: '',
                    city: '',
                    zip: '',
                    province: '',
                    country: '',
                    phone: '',
                    lastName: '',
                    firstName: '',
                    touched: {
                        name: true,
                    },
                },
            }

            const errors = getUpdateShippingAddressNodeErrors(node, [])

            expect(errors).toEqual({
                name: 'Invalid variables',
            })
        })

        it('should add an error if name has invalid syntax', () => {
            const node: UpdateShippingAddressNodeType = {
                ...buildNodeCommonProperties(),
                type: 'update_shipping_address',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    name: '{{',
                    address1: '',
                    address2: '',
                    city: '',
                    zip: '',
                    province: '',
                    country: '',
                    phone: '',
                    lastName: '',
                    firstName: '',
                    touched: {
                        name: true,
                    },
                },
            }

            const errors = getUpdateShippingAddressNodeErrors(node, [])

            expect(errors).toEqual({
                name: 'Invalid variables syntax',
            })
        })

        it('should add an error if address1 is empty and touched', () => {
            const node: UpdateShippingAddressNodeType = {
                ...buildNodeCommonProperties(),
                type: 'update_shipping_address',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    name: '',
                    address1: '',
                    address2: '',
                    city: '',
                    zip: '',
                    province: '',
                    country: '',
                    phone: '',
                    lastName: '',
                    firstName: '',
                    touched: {
                        address1: true,
                    },
                },
            }

            const errors = getUpdateShippingAddressNodeErrors(node, [])

            expect(errors).toEqual({
                address1: 'Address line 1 is required',
            })
        })

        it('should add an error if address1 contains invalid variables', () => {
            const node: UpdateShippingAddressNodeType = {
                ...buildNodeCommonProperties(),
                type: 'update_shipping_address',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    name: '',
                    address1: '{{variable1}}',
                    address2: '',
                    city: '',
                    zip: '',
                    province: '',
                    country: '',
                    phone: '',
                    lastName: '',
                    firstName: '',
                    touched: {
                        address1: true,
                    },
                },
            }

            const errors = getUpdateShippingAddressNodeErrors(node, [])

            expect(errors).toEqual({
                address1: 'Invalid variables',
            })
        })

        it('should add an error if address1 has invalid syntax', () => {
            const node: UpdateShippingAddressNodeType = {
                ...buildNodeCommonProperties(),
                type: 'update_shipping_address',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    name: '',
                    address1: '{{',
                    address2: '',
                    city: '',
                    zip: '',
                    province: '',
                    country: '',
                    phone: '',
                    lastName: '',
                    firstName: '',
                    touched: {
                        address1: true,
                    },
                },
            }

            const errors = getUpdateShippingAddressNodeErrors(node, [])

            expect(errors).toEqual({
                address1: 'Invalid variables syntax',
            })
        })

        it('should add an error if address2 is empty and touched', () => {
            const node: UpdateShippingAddressNodeType = {
                ...buildNodeCommonProperties(),
                type: 'update_shipping_address',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    name: '',
                    address1: '',
                    address2: '',
                    city: '',
                    zip: '',
                    province: '',
                    country: '',
                    phone: '',
                    lastName: '',
                    firstName: '',
                    touched: {
                        address2: true,
                    },
                },
            }

            const errors = getUpdateShippingAddressNodeErrors(node, [])

            expect(errors).toEqual({
                address2: 'Address line 2 is required',
            })
        })

        it('should add an error if address2 contains invalid variables', () => {
            const node: UpdateShippingAddressNodeType = {
                ...buildNodeCommonProperties(),
                type: 'update_shipping_address',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    name: '',
                    address1: '',
                    address2: '{{variable1}}',
                    city: '',
                    zip: '',
                    province: '',
                    country: '',
                    phone: '',
                    lastName: '',
                    firstName: '',
                    touched: {
                        address2: true,
                    },
                },
            }

            const errors = getUpdateShippingAddressNodeErrors(node, [])

            expect(errors).toEqual({
                address2: 'Invalid variables',
            })
        })

        it('should add an error if address2 has invalid syntax', () => {
            const node: UpdateShippingAddressNodeType = {
                ...buildNodeCommonProperties(),
                type: 'update_shipping_address',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    name: '',
                    address1: '',
                    address2: '{{',
                    city: '',
                    zip: '',
                    province: '',
                    country: '',
                    phone: '',
                    lastName: '',
                    firstName: '',
                    touched: {
                        address2: true,
                    },
                },
            }

            const errors = getUpdateShippingAddressNodeErrors(node, [])

            expect(errors).toEqual({
                address2: 'Invalid variables syntax',
            })
        })

        it('should add an error if city is empty and touched', () => {
            const node: UpdateShippingAddressNodeType = {
                ...buildNodeCommonProperties(),
                type: 'update_shipping_address',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    name: '',
                    address1: '',
                    address2: '',
                    city: '',
                    zip: '',
                    province: '',
                    country: '',
                    phone: '',
                    lastName: '',
                    firstName: '',
                    touched: {
                        city: true,
                    },
                },
            }

            const errors = getUpdateShippingAddressNodeErrors(node, [])

            expect(errors).toEqual({
                city: 'City is required',
            })
        })

        it('should add an error if city contains invalid variables', () => {
            const node: UpdateShippingAddressNodeType = {
                ...buildNodeCommonProperties(),
                type: 'update_shipping_address',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    name: '',
                    address1: '',
                    address2: '',
                    city: '{{variable1}}',
                    zip: '',
                    province: '',
                    country: '',
                    phone: '',
                    lastName: '',
                    firstName: '',
                    touched: {
                        city: true,
                    },
                },
            }

            const errors = getUpdateShippingAddressNodeErrors(node, [])

            expect(errors).toEqual({
                city: 'Invalid variables',
            })
        })

        it('should add an error if city has invalid syntax', () => {
            const node: UpdateShippingAddressNodeType = {
                ...buildNodeCommonProperties(),
                type: 'update_shipping_address',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    name: '',
                    address1: '',
                    address2: '',
                    city: '{{',
                    zip: '',
                    province: '',
                    country: '',
                    phone: '',
                    lastName: '',
                    firstName: '',
                    touched: {
                        city: true,
                    },
                },
            }

            const errors = getUpdateShippingAddressNodeErrors(node, [])

            expect(errors).toEqual({
                city: 'Invalid variables syntax',
            })
        })

        it('should add an error if zip is empty and touched', () => {
            const node: UpdateShippingAddressNodeType = {
                ...buildNodeCommonProperties(),
                type: 'update_shipping_address',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    name: '',
                    address1: '',
                    address2: '',
                    city: '',
                    zip: '',
                    province: '',
                    country: '',
                    phone: '',
                    lastName: '',
                    firstName: '',
                    touched: {
                        zip: true,
                    },
                },
            }

            const errors = getUpdateShippingAddressNodeErrors(node, [])

            expect(errors).toEqual({
                zip: 'ZIP code is required',
            })
        })

        it('should add an error if zip contains invalid variables', () => {
            const node: UpdateShippingAddressNodeType = {
                ...buildNodeCommonProperties(),
                type: 'update_shipping_address',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    name: '',
                    address1: '',
                    address2: '',
                    city: '',
                    zip: '{{variable1}}',
                    province: '',
                    country: '',
                    phone: '',
                    lastName: '',
                    firstName: '',
                    touched: {
                        zip: true,
                    },
                },
            }

            const errors = getUpdateShippingAddressNodeErrors(node, [])

            expect(errors).toEqual({
                zip: 'Invalid variables',
            })
        })

        it('should add an error if zip has invalid syntax', () => {
            const node: UpdateShippingAddressNodeType = {
                ...buildNodeCommonProperties(),
                type: 'update_shipping_address',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    name: '',
                    address1: '',
                    address2: '',
                    city: '',
                    zip: '{{',
                    province: '',
                    country: '',
                    phone: '',
                    lastName: '',
                    firstName: '',
                    touched: {
                        zip: true,
                    },
                },
            }

            const errors = getUpdateShippingAddressNodeErrors(node, [])

            expect(errors).toEqual({
                zip: 'Invalid variables syntax',
            })
        })

        it('should add an error if province is empty and touched', () => {
            const node: UpdateShippingAddressNodeType = {
                ...buildNodeCommonProperties(),
                type: 'update_shipping_address',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    name: '',
                    address1: '',
                    address2: '',
                    city: '',
                    zip: '',
                    province: '',
                    country: '',
                    phone: '',
                    lastName: '',
                    firstName: '',
                    touched: {
                        province: true,
                    },
                },
            }

            const errors = getUpdateShippingAddressNodeErrors(node, [])

            expect(errors).toEqual({
                province: 'State is required',
            })
        })

        it('should add an error if province contains invalid variables', () => {
            const node: UpdateShippingAddressNodeType = {
                ...buildNodeCommonProperties(),
                type: 'update_shipping_address',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    name: '',
                    address1: '',
                    address2: '',
                    city: '',
                    zip: '',
                    province: '{{variable1}}',
                    country: '',
                    phone: '',
                    lastName: '',
                    firstName: '',
                    touched: {
                        province: true,
                    },
                },
            }

            const errors = getUpdateShippingAddressNodeErrors(node, [])

            expect(errors).toEqual({
                province: 'Invalid variables',
            })
        })

        it('should add an error if province has invalid syntax', () => {
            const node: UpdateShippingAddressNodeType = {
                ...buildNodeCommonProperties(),
                type: 'update_shipping_address',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    name: '',
                    address1: '',
                    address2: '',
                    city: '',
                    zip: '',
                    province: '{{',
                    country: '',
                    phone: '',
                    lastName: '',
                    firstName: '',
                    touched: {
                        province: true,
                    },
                },
            }

            const errors = getUpdateShippingAddressNodeErrors(node, [])

            expect(errors).toEqual({
                province: 'Invalid variables syntax',
            })
        })

        it('should add an error if country is empty and touched', () => {
            const node: UpdateShippingAddressNodeType = {
                ...buildNodeCommonProperties(),
                type: 'update_shipping_address',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    name: '',
                    address1: '',
                    address2: '',
                    city: '',
                    zip: '',
                    province: '',
                    country: '',
                    phone: '',
                    lastName: '',
                    firstName: '',
                    touched: {
                        country: true,
                    },
                },
            }

            const errors = getUpdateShippingAddressNodeErrors(node, [])

            expect(errors).toEqual({
                country: 'Country is required',
            })
        })

        it('should add an error if country contains invalid variables', () => {
            const node: UpdateShippingAddressNodeType = {
                ...buildNodeCommonProperties(),
                type: 'update_shipping_address',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    name: '',
                    address1: '',
                    address2: '',
                    city: '',
                    zip: '',
                    province: '',
                    country: '{{variable1}}',
                    phone: '',
                    lastName: '',
                    firstName: '',
                    touched: {
                        country: true,
                    },
                },
            }

            const errors = getUpdateShippingAddressNodeErrors(node, [])

            expect(errors).toEqual({
                country: 'Invalid variables',
            })
        })

        it('should add an error if country has invalid syntax', () => {
            const node: UpdateShippingAddressNodeType = {
                ...buildNodeCommonProperties(),
                type: 'update_shipping_address',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    name: '',
                    address1: '',
                    address2: '',
                    city: '',
                    zip: '',
                    province: '',
                    country: '{{',
                    phone: '',
                    lastName: '',
                    firstName: '',
                    touched: {
                        country: true,
                    },
                },
            }

            const errors = getUpdateShippingAddressNodeErrors(node, [])

            expect(errors).toEqual({
                country: 'Invalid variables syntax',
            })
        })

        it('should add an error if phone is empty and touched', () => {
            const node: UpdateShippingAddressNodeType = {
                ...buildNodeCommonProperties(),
                type: 'update_shipping_address',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    name: '',
                    address1: '',
                    address2: '',
                    city: '',
                    zip: '',
                    province: '',
                    country: '',
                    phone: '',
                    lastName: '',
                    firstName: '',
                    touched: {
                        phone: true,
                    },
                },
            }

            const errors = getUpdateShippingAddressNodeErrors(node, [])

            expect(errors).toEqual({
                phone: 'Phone number is required',
            })
        })

        it('should add an error if phone contains invalid variables', () => {
            const node: UpdateShippingAddressNodeType = {
                ...buildNodeCommonProperties(),
                type: 'update_shipping_address',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    name: '',
                    address1: '',
                    address2: '',
                    city: '',
                    zip: '',
                    province: '',
                    country: '',
                    phone: '{{variable1}}',
                    lastName: '',
                    firstName: '',
                    touched: {
                        phone: true,
                    },
                },
            }

            const errors = getUpdateShippingAddressNodeErrors(node, [])

            expect(errors).toEqual({
                phone: 'Invalid variables',
            })
        })

        it('should add an error if phone has invalid syntax', () => {
            const node: UpdateShippingAddressNodeType = {
                ...buildNodeCommonProperties(),
                type: 'update_shipping_address',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    name: '',
                    address1: '',
                    address2: '',
                    city: '',
                    zip: '',
                    province: '',
                    country: '',
                    phone: '{{',
                    lastName: '',
                    firstName: '',
                    touched: {
                        phone: true,
                    },
                },
            }

            const errors = getUpdateShippingAddressNodeErrors(node, [])

            expect(errors).toEqual({
                phone: 'Invalid variables syntax',
            })
        })

        it('should add an error if lastName is empty and touched', () => {
            const node: UpdateShippingAddressNodeType = {
                ...buildNodeCommonProperties(),
                type: 'update_shipping_address',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    name: '',
                    address1: '',
                    address2: '',
                    city: '',
                    zip: '',
                    province: '',
                    country: '',
                    phone: '',
                    lastName: '',
                    firstName: '',
                    touched: {
                        lastName: true,
                    },
                },
            }

            const errors = getUpdateShippingAddressNodeErrors(node, [])

            expect(errors).toEqual({
                lastName: 'Last name is required',
            })
        })

        it('should add an error if lastName contains invalid variables', () => {
            const node: UpdateShippingAddressNodeType = {
                ...buildNodeCommonProperties(),
                type: 'update_shipping_address',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    name: '',
                    address1: '',
                    address2: '',
                    city: '',
                    zip: '',
                    province: '',
                    country: '',
                    phone: '',
                    lastName: '{{variable1}}',
                    firstName: '',
                    touched: {
                        lastName: true,
                    },
                },
            }

            const errors = getUpdateShippingAddressNodeErrors(node, [])

            expect(errors).toEqual({
                lastName: 'Invalid variables',
            })
        })

        it('should add an error if lastName has invalid syntax', () => {
            const node: UpdateShippingAddressNodeType = {
                ...buildNodeCommonProperties(),
                type: 'update_shipping_address',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    name: '',
                    address1: '',
                    address2: '',
                    city: '',
                    zip: '',
                    province: '',
                    country: '',
                    phone: '',
                    lastName: '{{',
                    firstName: '',
                    touched: {
                        lastName: true,
                    },
                },
            }

            const errors = getUpdateShippingAddressNodeErrors(node, [])

            expect(errors).toEqual({
                lastName: 'Invalid variables syntax',
            })
        })

        it('should add an error if firstName is empty and touched', () => {
            const node: UpdateShippingAddressNodeType = {
                ...buildNodeCommonProperties(),
                type: 'update_shipping_address',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    name: '',
                    address1: '',
                    address2: '',
                    city: '',
                    zip: '',
                    province: '',
                    country: '',
                    phone: '',
                    lastName: '',
                    firstName: '',
                    touched: {
                        firstName: true,
                    },
                },
            }

            const errors = getUpdateShippingAddressNodeErrors(node, [])

            expect(errors).toEqual({
                firstName: 'First name is required',
            })
        })

        it('should add an error if firstName contains invalid variables', () => {
            const node: UpdateShippingAddressNodeType = {
                ...buildNodeCommonProperties(),
                type: 'update_shipping_address',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    name: '',
                    address1: '',
                    address2: '',
                    city: '',
                    zip: '',
                    province: '',
                    country: '',
                    phone: '',
                    lastName: '',
                    firstName: '{{variable1}}',
                    touched: {
                        firstName: true,
                    },
                },
            }

            const errors = getUpdateShippingAddressNodeErrors(node, [])

            expect(errors).toEqual({
                firstName: 'Invalid variables',
            })
        })

        it('should add an error if firstName has invalid syntax', () => {
            const node: UpdateShippingAddressNodeType = {
                ...buildNodeCommonProperties(),
                type: 'update_shipping_address',
                data: {
                    customerId: '',
                    orderExternalId: '',
                    integrationId: '',
                    name: '',
                    address1: '',
                    address2: '',
                    city: '',
                    zip: '',
                    province: '',
                    country: '',
                    phone: '',
                    lastName: '',
                    firstName: '{{',
                    touched: {
                        firstName: true,
                    },
                },
            }

            const errors = getUpdateShippingAddressNodeErrors(node, [])

            expect(errors).toEqual({
                firstName: 'Invalid variables syntax',
            })
        })
    })

    describe('getLiquidTemplateNodeErrors()', () => {
        it('should return null if there are no errors', () => {
            const node: LiquidTemplateNodeType = {
                ...buildNodeCommonProperties(),
                type: 'liquid_template',
                data: {
                    touched: {
                        name: true,
                        template: true,
                        output: {
                            data_type: true,
                        },
                    },
                    name: 'Test template',
                    template: 'Hello World',
                    output: {
                        data_type: 'string',
                    },
                },
            }

            const errors = getLiquidTemplateNodeErrors(node, [])

            expect(errors).toEqual(null)
        })

        it('should add an error if name is empty and touched', () => {
            const node: LiquidTemplateNodeType = {
                ...buildNodeCommonProperties(),
                type: 'liquid_template',
                data: {
                    touched: {
                        name: true,
                    },
                    name: '',
                    template: '',
                    output: {
                        data_type: 'string',
                    },
                },
            }

            const errors = getLiquidTemplateNodeErrors(node, [])

            expect(errors).toEqual({
                name: 'Name is required',
            })
        })

        it('should add an error if template is empty and touched', () => {
            const node: LiquidTemplateNodeType = {
                ...buildNodeCommonProperties(),
                type: 'liquid_template',
                data: {
                    touched: {
                        template: true,
                    },
                    name: 'Test',
                    template: '',
                    output: {
                        data_type: 'string',
                    },
                },
            }

            const errors = getLiquidTemplateNodeErrors(node, [])

            expect(errors).toEqual({
                template: 'Template is required',
            })
        })

        it('should add an error if template has invalid variables', () => {
            const node: LiquidTemplateNodeType = {
                ...buildNodeCommonProperties(),
                type: 'liquid_template',
                data: {
                    touched: {
                        template: true,
                    },
                    name: 'Test',
                    template: 'Hello [[invalid_variable]]',
                    output: {
                        data_type: 'string',
                    },
                },
            }

            const variables = [
                {
                    name: 'Valid variable',
                    value: 'valid_variable',
                    nodeType: 'text_reply' as const,
                    type: 'string' as const,
                },
            ]

            const errors = getLiquidTemplateNodeErrors(node, variables)

            expect(errors).toEqual({
                template: 'Invalid variables',
            })
        })

        it('should add an error if template has invalid liquid syntax', () => {
            const node: LiquidTemplateNodeType = {
                ...buildNodeCommonProperties(),
                type: 'liquid_template',
                data: {
                    touched: {
                        template: true,
                    },
                    name: 'Test',
                    template: 'Hello {{ unclosed tag',
                    output: {
                        data_type: 'string',
                    },
                },
            }

            const errors = getLiquidTemplateNodeErrors(node, [])

            expect(errors).toEqual({
                template: 'Invalid variables syntax',
            })
        })

        it('should add an error if output data type is empty and touched', () => {
            const node: LiquidTemplateNodeType = {
                ...buildNodeCommonProperties(),
                type: 'liquid_template',
                data: {
                    touched: {
                        output: {
                            data_type: true,
                        },
                    },
                    name: 'Test',
                    template: 'Hello',
                    output: {
                        data_type: '' as any,
                    },
                },
            }

            const errors = getLiquidTemplateNodeErrors(node, [])

            expect(errors).toEqual({
                output: {
                    data_type: 'Data type is required',
                },
            })
        })

        it('should add multiple errors when multiple fields are invalid', () => {
            const node: LiquidTemplateNodeType = {
                ...buildNodeCommonProperties(),
                type: 'liquid_template',
                data: {
                    touched: {
                        name: true,
                        template: true,
                        output: {
                            data_type: true,
                        },
                    },
                    name: '',
                    template: '',
                    output: {
                        data_type: '' as any,
                    },
                },
            }

            const errors = getLiquidTemplateNodeErrors(node, [])

            expect(errors).toEqual({
                name: 'Name is required',
                template: 'Template is required',
                output: {
                    data_type: 'Data type is required',
                },
            })
        })
    })
})

describe('getReusableLLMPromptCallNodeHasInputs()', () => {
    it('should return true if step has inputs', () => {
        expect(
            getReusableLLMPromptCallNodeHasInputs({
                inputs: [
                    {
                        id: '',
                        name: '',
                        description: '',
                        data_type: 'string',
                    },
                ],
            }),
        ).toEqual(true)
    })

    it('should return false if step has no inputs', () => {
        expect(
            getReusableLLMPromptCallNodeHasInputs({
                inputs: [],
            }),
        ).toEqual(false)
    })

    it('should return false if inputs are undefined', () => {
        expect(getReusableLLMPromptCallNodeHasInputs({})).toEqual(false)
    })
})

describe('getReusableLLMPromptCallNodeHasMissingValues()', () => {
    it('should return false if step has all inputs set', () => {
        expect(
            getReusableLLMPromptCallNodeHasMissingValues(
                true,
                {
                    inputs: [
                        {
                            id: '',
                            name: '',
                            description: '',
                            data_type: 'string',
                        },
                    ],
                },
                { input1: 'value1' },
            ),
        ).toEqual(false)
    })

    it('should return true if step has inputs but some values are not set', () => {
        expect(
            getReusableLLMPromptCallNodeHasMissingValues(
                true,
                {
                    inputs: [
                        {
                            id: '',
                            name: '',
                            description: '',
                            data_type: 'string',
                        },
                    ],
                },
                {},
            ),
        ).toEqual(true)
    })

    it('should return false if step has no inputs', () => {
        expect(
            getReusableLLMPromptCallNodeHasMissingValues(
                false,
                {
                    inputs: [],
                },
                {},
            ),
        ).toEqual(false)
    })
})

describe('getReusableLLMPromptCallNodeHasAllValues()', () => {
    it('should return false if some values are missing', () => {
        expect(
            getReusableLLMPromptCallNodeHasAllValues(
                true,
                {
                    inputs: [
                        {
                            id: '',
                            name: '',
                            description: '',
                            data_type: 'string',
                        },
                    ],
                },
                {},
            ),
        ).toEqual(false)
    })

    it('should return true if all values are set', () => {
        expect(
            getReusableLLMPromptCallNodeHasAllValues(
                true,
                {
                    inputs: [
                        {
                            id: '',
                            name: '',
                            description: '',
                            data_type: 'string',
                        },
                    ],
                },
                { input1: 'value1' },
            ),
        ).toEqual(true)
    })

    it('should return false if step has no inputs', () => {
        expect(
            getReusableLLMPromptCallNodeHasAllValues(
                false,
                {
                    inputs: [],
                },
                {},
            ),
        ).toEqual(false)
    })
})

describe('getReusableLLMPromptCallNodeHasMissingCredentials()', () => {
    it('should return true if API key app has missing credentials', () => {
        expect(
            getReusableLLMPromptCallNodeHasMissingCredentials(
                { type: 'app', app_id: '', api_key: '' },
                { auth_type: 'api-key' },
                false,
            ),
        ).toEqual(true)
    })

    it('should return true if OAuth2 token app has missing credentials', () => {
        expect(
            getReusableLLMPromptCallNodeHasMissingCredentials(
                { type: 'app', app_id: '', refresh_token: '' },
                { auth_type: 'oauth2-token' },
                false,
            ),
        ).toEqual(true)
    })

    it('should return false if API key app has credentials', () => {
        expect(
            getReusableLLMPromptCallNodeHasMissingCredentials(
                { type: 'app', app_id: '', api_key: 'test' },
                { auth_type: 'api-key' },
                false,
            ),
        ).toEqual(false)
    })

    it('should return false if template', () => {
        expect(
            getReusableLLMPromptCallNodeHasMissingCredentials(
                { type: 'app', app_id: '', api_key: '' },
                { auth_type: 'api-key' },
                true,
            ),
        ).toEqual(false)
    })
    it('should return true if no trackstar connection for trackstar app', () => {
        expect(
            getReusableLLMPromptCallNodeHasMissingCredentials(
                { type: 'app', app_id: '', api_key: '' },
                { auth_type: 'trackstar' },
                false,
            ),
        ).toEqual(true)
    })
    it('should return false if there is a trackstar connection for trackstar app', () => {
        expect(
            getReusableLLMPromptCallNodeHasMissingCredentials(
                { type: 'app', app_id: '', api_key: '' },
                { auth_type: 'trackstar' },
                false,
                {
                    connection_id: '123',
                    store_name: '',
                    store_type: 'shopify',
                    account_id: 0,
                    integration_name: 'sandbox',
                    error: false,
                },
            ),
        ).toEqual(false)
    })
})

describe('getReusableLLMPromptCallNodeHasInvalidCredentials()', () => {
    it('should return true if trackstar connection has error', () => {
        expect(
            getReusableLLMPromptCallNodeHasInvalidCredentials(
                { type: 'app', app_id: '', api_key: '' },
                { auth_type: 'trackstar' },
                false,
                {
                    connection_id: '123',
                    store_name: '',
                    store_type: 'shopify',
                    account_id: 0,
                    integration_name: 'sandbox',
                    error: true,
                },
            ),
        ).toEqual(true)
    })

    it('should return false if there is no trackstar connection', () => {
        expect(
            getReusableLLMPromptCallNodeHasInvalidCredentials(
                { type: 'app', app_id: '', api_key: '' },
                { auth_type: 'trackstar' },
                false,
            ),
        ).toEqual(false)
    })
})

describe('getReusableLLMPromptCallNodeHasCredentials()', () => {
    it('should return true if action template type is app and it is not a template', () => {
        expect(
            getReusableLLMPromptCallNodeHasCredentials({ type: 'app' }, false),
        ).toEqual(true)
    })

    it('should return false if action template type is app and it is a template', () => {
        expect(
            getReusableLLMPromptCallNodeHasCredentials({ type: 'app' }, true),
        ).toEqual(false)
    })

    it('should return false if action template type is not an app', () => {
        expect(
            getReusableLLMPromptCallNodeHasCredentials(
                { type: 'shopify' },
                false,
            ),
        ).toEqual(false)
    })
})

describe('getReusableLLMPromptCallNodeIsClickable()', () => {
    it('should return true if node has credentials', () => {
        expect(getReusableLLMPromptCallNodeIsClickable(true, false)).toEqual(
            true,
        )
    })

    it('should return true if node has inputs', () => {
        expect(getReusableLLMPromptCallNodeIsClickable(false, true)).toEqual(
            true,
        )
    })

    it('should return false if node has no credentials & no inputs', () => {
        expect(getReusableLLMPromptCallNodeIsClickable(false, false)).toEqual(
            false,
        )
    })
})

describe('getReusableLLMPromptCallNodeStatuses()', () => {
    it('should return statuses', () => {
        const statuses = getReusableLLMPromptCallNodeStatuses({
            graphApp: { type: 'app', app_id: '', api_key: '' },
            actionsApp: { auth_type: 'api-key' },
            step: {
                inputs: [
                    {
                        id: '',
                        name: '',
                        description: '',
                        data_type: 'string',
                    },
                ],
            },
            values: { input1: 'value1' },
            templateApp: { type: 'app' },
            isTemplate: false,
        })

        expect(statuses).toEqual({
            hasInputs: true,
            hasMissingValues: false,
            hasAllValues: true,
            hasMissingCredentials: true,
            hasCredentials: true,
            hasInvalidCredentials: false,
            isClickable: true,
        })
    })
})

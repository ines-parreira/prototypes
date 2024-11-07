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

    it('should transform graph with a create discount code step', () => {
        const configuration = transformVisualBuilderGraphIntoWfConfiguration({
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
                        customerId: '{{objects.customer.id}}',
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
            wfConfigurationOriginal: {
                internal_id: '01J7ZTERASHHCT60ZJVYSBS3WZ',
                id: '01J7ZTERAST0PVVPF347XA37FR',
                name: 'Create discount code',
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
                    instructions: 'This action creates a discount code',
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
                    customer_id: '{{objects.customer.id}}',
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
                        value: 'percent',
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

    it('should transform graph with a reship for free step', () => {
        const configuration = transformVisualBuilderGraphIntoWfConfiguration({
            name: 'Reship for free',
            available_languages: ['en-US'],
            nodes: [
                {
                    ...buildNodeCommonProperties(),
                    id: 'trigger',
                    type: 'llm_prompt_trigger',
                    data: {
                        instructions: 'This action reships an order for free',
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
            wfConfigurationOriginal: {
                internal_id: '01J7ZTERASHHCT60ZJVYSBS3WZ',
                id: '01J7ZTERAST0PVVPF347XA37FR',
                name: 'Reship for free',
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
        const configuration = transformVisualBuilderGraphIntoWfConfiguration({
            name: 'Refund shipping costs',
            available_languages: ['en-US'],
            nodes: [
                {
                    ...buildNodeCommonProperties(),
                    id: 'trigger',
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
            wfConfigurationOriginal: {
                internal_id: '01J7ZTERASHHCT60ZJVYSBS3WZ',
                id: '01J7ZTERAST0PVVPF347XA37FR',
                name: 'Refund shipping costs',
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
        const configuration = transformVisualBuilderGraphIntoWfConfiguration({
            name: 'Replace item',
            available_languages: ['en-US'],
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
                                instructions: 'Select the product to replace',
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
                                instructions: 'How much of the product to add',
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
            wfConfigurationOriginal: {
                internal_id: '01J7ZTERASHHCT60ZJVYSBS3WZ',
                id: '01J7ZTERAST0PVVPF347XA37FR',
                name: 'Replace item',
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
        const configuration = transformVisualBuilderGraphIntoWfConfiguration({
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
                    id: 'http_request1',
                    type: 'http_request',
                    data: {
                        name: '',
                        url: 'https://example.com?order_name={{objects.order.name}}',
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
            wfConfigurationOriginal: {
                internal_id: '01J7ZTERASHHCT60ZJVYSBS3WZ',
                id: '01J7ZTERAST0PVVPF347XA37FR',
                name: 'Reusable LLM prompt trigger',
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
        const configuration = transformVisualBuilderGraphIntoWfConfiguration({
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
            wfConfigurationOriginal: {
                internal_id: '01J7ZTERASHHCT60ZJVYSBS3WZ',
                id: '01J7ZTERAST0PVVPF347XA37FR',
                name: 'Reusable LLM prompt trigger',
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
})

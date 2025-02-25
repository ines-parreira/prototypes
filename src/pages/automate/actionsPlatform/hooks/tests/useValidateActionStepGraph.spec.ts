import { renderHook } from '@testing-library/react-hooks'

import {
    buildEdgeCommonProperties,
    buildNodeCommonProperties,
} from 'pages/automate/workflows/models/visualBuilderGraph.model'

import useValidateActionStepGraph from '../useValidateActionStepGraph'

describe('useValidateActionStepGraph()', () => {
    it('should validate action step graph', () => {
        const { result } = renderHook(() =>
            useValidateActionStepGraph(() => []),
        )

        expect(
            result.current({
                id: '',
                internal_id: '',
                is_draft: false,
                isTemplate: true,
                name: '',
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
                                    id: 'someid',
                                    name: '',
                                    instructions: '',
                                    data_type: 'string',
                                },
                            ],
                            conditionsType: 'and',
                            conditions: [],
                            touched: {
                                conditions: {},
                                inputs: {
                                    someid: {
                                        instructions: true,
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                    {
                        ...buildNodeCommonProperties(),
                        id: 'http_request1',
                        type: 'http_request',
                        data: {
                            name: '',
                            url: '',
                            method: 'GET',
                            headers: [],
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
                            formUrlencoded: null,
                            bodyContentType: null,
                            touched: {
                                headers: {},
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
                            },
                        },
                    },
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
                    {
                        ...buildNodeCommonProperties(),
                        id: 'end1',
                        type: 'end',
                        data: {
                            action: 'end',
                        },
                    },
                    {
                        ...buildNodeCommonProperties(),
                        id: 'cancel_order1',
                        type: 'cancel_order',
                        data: {
                            customerId: '',
                            orderExternalId: '',
                            integrationId: '',
                        },
                    },
                    {
                        ...buildNodeCommonProperties(),
                        id: 'refund_order1',
                        type: 'refund_order',
                        data: {
                            customerId: '',
                            orderExternalId: '',
                            integrationId: '',
                        },
                    },
                    {
                        ...buildNodeCommonProperties(),
                        id: 'skip_charge1',
                        type: 'skip_charge',
                        data: {
                            customerId: '',
                            integrationId: '',
                            subscriptionId: '',
                            chargeId: '',
                            touched: {
                                subscriptionId: true,
                                chargeId: true,
                            },
                        },
                    },
                    {
                        ...buildNodeCommonProperties(),
                        id: 'cancel_subscription1',
                        type: 'cancel_subscription',
                        data: {
                            customerId: '',
                            integrationId: '',
                            subscriptionId: '',
                            reason: '',
                            touched: {
                                subscriptionId: true,
                                reason: true,
                            },
                        },
                    },
                    {
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
                    },
                    {
                        ...buildNodeCommonProperties(),
                        id: 'replace_item1',
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
                                quantity: true,
                                addedProductVariantId: true,
                                addedQuantity: true,
                            },
                        },
                    },
                    {
                        ...buildNodeCommonProperties(),
                        id: 'remove_item1',
                        type: 'remove_item',
                        data: {
                            customerId: '',
                            orderExternalId: '',
                            integrationId: '',
                            productVariantId: '',
                            quantity: '',
                            touched: {
                                productVariantId: true,
                                quantity: true,
                            },
                        },
                    },
                    {
                        ...buildNodeCommonProperties(),
                        id: 'update_shipping_address1',
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
                    {
                        ...buildEdgeCommonProperties(),
                        source: 'conditions1_branch2',
                        target: 'cancel_order1',
                    },
                    {
                        ...buildEdgeCommonProperties(),
                        source: 'cancel_order1',
                        target: 'refund_order1',
                    },
                    {
                        ...buildEdgeCommonProperties(),
                        source: 'refund_order1',
                        target: 'skip_charge1',
                    },
                    {
                        ...buildEdgeCommonProperties(),
                        source: 'skip_charge1',
                        target: 'cancel_subscription1',
                    },
                    {
                        ...buildEdgeCommonProperties(),
                        source: 'cancel_subscription1',
                        target: 'create_discount_code1',
                    },
                    {
                        ...buildEdgeCommonProperties(),
                        source: 'create_discount_code1',
                        target: 'replace_item1',
                    },
                    {
                        ...buildEdgeCommonProperties(),
                        source: 'replace_item1',
                        target: 'remove_item1',
                    },
                    {
                        ...buildEdgeCommonProperties(),
                        source: 'remove_item1',
                        target: 'update_shipping_address1',
                    },
                ],
                nodeEditingId: null,
                choiceEventIdEditing: null,
                branchIdsEditing: [],
                touched: {
                    name: true,
                    nodes: true,
                },
                apps: [
                    {
                        app_id: 'someid',
                        type: 'app',
                    },
                ],
            }),
        ).toEqual(
            expect.objectContaining({
                nodes: [
                    expect.objectContaining({
                        data: expect.objectContaining({
                            errors: {
                                conditions:
                                    'Add conditions or select "No conditions required"',
                                inputs: {
                                    someid: {
                                        instructions: 'Description is required',
                                        name: 'Name is required',
                                    },
                                },
                            },
                        }),
                        id: 'trigger',
                        type: 'reusable_llm_prompt_trigger',
                    }),
                    expect.objectContaining({
                        data: expect.objectContaining({
                            errors: {
                                name: 'Request name is required',
                                url: 'URL is required',
                                variables: {
                                    0: {
                                        jsonpath: 'JSONPath is required',
                                        name: 'Name is required',
                                    },
                                    1: {
                                        jsonpath: 'JSONPath is required',
                                        name: 'Name is required',
                                    },
                                },
                            },
                        }),
                        id: 'http_request1',
                        type: 'http_request',
                    }),
                    expect.objectContaining({
                        data: expect.objectContaining({
                            errors: {
                                branches: {
                                    conditions1_branch1: {
                                        conditions:
                                            'A branch must have at least 1 condition',
                                        name: 'Name is required',
                                    },
                                },
                            },
                        }),
                        id: 'conditions1',
                        type: 'conditions',
                    }),
                    expect.objectContaining({
                        id: 'end1',
                        type: 'end',
                    }),
                    expect.objectContaining({
                        id: 'cancel_order1',
                        type: 'cancel_order',
                    }),
                    expect.objectContaining({
                        id: 'refund_order1',
                        type: 'refund_order',
                    }),
                    expect.objectContaining({
                        id: 'skip_charge1',
                        type: 'skip_charge',
                        data: expect.objectContaining({
                            errors: {
                                chargeId: 'Charge id is required',
                                subscriptionId: 'Subscription id is required',
                            },
                        }),
                    }),
                    expect.objectContaining({
                        id: 'cancel_subscription1',
                        type: 'cancel_subscription',
                        data: expect.objectContaining({
                            errors: {
                                reason: 'Reason is required',
                                subscriptionId: 'Subscription id is required',
                            },
                        }),
                    }),
                    expect.objectContaining({
                        id: 'create_discount_code1',
                        type: 'create_discount_code',
                    }),
                    expect.objectContaining({
                        id: 'replace_item1',
                        type: 'replace_item',
                        data: expect.objectContaining({
                            errors: {
                                addedProductVariantId:
                                    'Added product variant id is required',
                                addedQuantity: 'Added quantity is required',
                                productVariantId:
                                    'Product variant id is required',
                                quantity: 'Quantity is required',
                            },
                        }),
                    }),
                    expect.objectContaining({
                        id: 'remove_item1',
                        type: 'remove_item',
                        data: expect.objectContaining({
                            errors: {
                                productVariantId:
                                    'Product variant id is required',
                                quantity: 'Quantity is required',
                            },
                        }),
                    }),
                    expect.objectContaining({
                        id: 'update_shipping_address1',
                        type: 'update_shipping_address',
                        data: expect.objectContaining({
                            errors: {
                                address1: 'Address line 1 is required',
                                address2: 'Address line 2 is required',
                                city: 'City is required',
                                country: 'Country is required',
                                firstName: 'First name is required',
                                lastName: 'Last name is required',
                                name: 'Name is required',
                                phone: 'Phone number is required',
                                province: 'State is required',
                                zip: 'ZIP code is required',
                            },
                        }),
                    }),
                ],
                errors: {
                    name: 'Name is required',
                },
            }),
        )
    })

    it('should trigger error for long name & not enough steps', () => {
        const { result } = renderHook(() =>
            useValidateActionStepGraph(() => []),
        )

        expect(
            result.current({
                id: '',
                internal_id: '',
                is_draft: false,
                isTemplate: true,
                name: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce consectetur sed arcu quis tempus. Etiam tristique finibus tempus.',
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
                            touched: {
                                inputs: {},
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
                        target: 'end1',
                    },
                ],
                nodeEditingId: null,
                choiceEventIdEditing: null,
                branchIdsEditing: [],
                touched: {
                    name: true,
                    nodes: true,
                },
                apps: [
                    {
                        app_id: 'someid',
                        type: 'app',
                    },
                ],
            }),
        ).toEqual(
            expect.objectContaining({
                errors: {
                    name: 'Name must be less than 100 characters',
                    nodes: 'At least one step is required',
                },
            }),
        )
    })
})

import { renderHook } from '@testing-library/react-hooks'

import {
    buildEdgeCommonProperties,
    buildNodeCommonProperties,
} from 'pages/automate/workflows/models/visualBuilderGraph.model'

import useTouchActionTemplateGraph from '../useTouchActionTemplateGraph'

describe('useTouchActionTemplateGraph()', () => {
    it('should touch action template graph', () => {
        const { result } = renderHook(() => useTouchActionTemplateGraph())

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
                        type: 'llm_prompt_trigger',
                        data: {
                            instructions: '',
                            requires_confirmation: false,
                            inputs: [
                                {
                                    id: 'someid',
                                    name: 'some name',
                                    instructions: 'some instructions',
                                    data_type: 'string',
                                },
                            ],
                            conditionsType: 'and',
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
                        id: 'conditions1',
                        type: 'conditions',
                        data: {
                            name: 'conditions1',
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
                apps: [
                    {
                        app_id: 'app_id',
                        type: 'app',
                    },
                ],
            }),
        ).toEqual(
            expect.objectContaining({
                nodes: [
                    expect.objectContaining({
                        data: expect.objectContaining({
                            touched: {
                                instructions: true,
                                conditions: {},
                                inputs: {
                                    someid: {
                                        instructions: true,
                                        name: true,
                                    },
                                },
                            },
                        }),
                        id: 'trigger',
                        type: 'llm_prompt_trigger',
                    }),
                    expect.objectContaining({
                        data: expect.objectContaining({
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
                        }),
                        id: 'http_request1',
                        type: 'http_request',
                    }),
                    expect.objectContaining({
                        data: expect.objectContaining({
                            touched: {
                                branches: {
                                    conditions1_branch1: {
                                        conditions: {},
                                        name: true,
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
                            touched: {
                                subscriptionId: true,
                                chargeId: true,
                            },
                        }),
                    }),
                    expect.objectContaining({
                        id: 'cancel_subscription1',
                        type: 'cancel_subscription',
                        data: expect.objectContaining({
                            touched: {
                                subscriptionId: true,
                                reason: true,
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
                            touched: {
                                productVariantId: true,
                                quantity: true,
                                addedProductVariantId: true,
                                addedQuantity: true,
                            },
                        }),
                    }),
                    expect.objectContaining({
                        id: 'remove_item1',
                        type: 'remove_item',
                        data: expect.objectContaining({
                            touched: {
                                productVariantId: true,
                                quantity: true,
                            },
                        }),
                    }),
                    expect.objectContaining({
                        id: 'update_shipping_address1',
                        type: 'update_shipping_address',
                        data: expect.objectContaining({
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
                        }),
                    }),
                ],
                touched: {
                    name: true,
                    nodes: true,
                },
            }),
        )
    })
})

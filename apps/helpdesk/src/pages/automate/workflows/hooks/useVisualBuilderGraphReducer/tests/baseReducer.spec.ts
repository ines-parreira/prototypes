import _cloneDeep from 'lodash/cloneDeep'

import { buildNodeCommonProperties } from 'pages/automate/workflows/models/visualBuilderGraph.model'
import type {
    AutomatedMessageNodeType,
    CancelOrderNodeType,
    CancelSubscriptionNodeType,
    ChannelTriggerNodeType,
    EndNodeType,
    FileUploadNodeType,
    LLMPromptTriggerNodeType,
    OrderLineItemSelectionNodeType,
    OrderSelectionNodeType,
    RefundOrderNodeType,
    ReusableLLMPromptCallNodeType,
    ReusableLLMPromptTriggerNodeType,
    ShopperAuthenticationNodeType,
    SkipChargeNodeType,
    TextReplyNodeType,
    UpdateShippingAddressNodeType,
    VisualBuilderGraph,
} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import {
    visualBuilderGraphLlmPromptTriggerFixture,
    visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
    visualBuilderGraphSimpleChoicesFixture,
} from 'pages/automate/workflows/tests/visualBuilderGraph.fixtures'

import { baseReducer } from '../baseReducer'

describe('baseReducer', () => {
    describe('SET_CHANNEL_TRIGGER_LABEL', () => {
        test('Invalid graph without trigger node, and does not update anything', () => {
            const g = _cloneDeep(visualBuilderGraphSimpleChoicesFixture)
            const channelTriggerIndex = g.nodes.findIndex(
                (n): n is ChannelTriggerNodeType =>
                    n.type === 'channel_trigger',
            )
            expect(channelTriggerIndex).not.toBe(-1)
            g.nodes.splice(channelTriggerIndex, 1)
            const nextG = baseReducer(g, {
                type: 'SET_CHANNEL_TRIGGER_LABEL',
                channelTriggerNodeId: 'trigger_button1',
                label: 'new entrypoint',
            })
            expect(
                nextG.nodes.find(
                    (n): n is ChannelTriggerNodeType =>
                        n.type === 'channel_trigger',
                ),
            ).toBeUndefined()
        })

        test('Sets label and does not sync flow name', () => {
            const g = visualBuilderGraphSimpleChoicesFixture
            const nextG = baseReducer(g, {
                type: 'SET_CHANNEL_TRIGGER_LABEL',
                channelTriggerNodeId: 'trigger_button1',
                label: 'new entrypoint',
            })
            expect(
                nextG.nodes.find(
                    (n): n is ChannelTriggerNodeType =>
                        n.type === 'channel_trigger',
                )?.data.label,
            ).toEqual('new entrypoint')
            expect(nextG.name).toEqual(g.name)
        })

        test('Sets label and does sync flow name', () => {
            const g = visualBuilderGraphSimpleChoicesFixture
            const nextG = baseReducer(
                // Sync names to start, by setting flow to entry point label
                baseReducer(g, {
                    type: 'SET_NAME',
                    name: 'entrypoint',
                }),
                {
                    // Now update channel label, and flow name will update to match
                    type: 'SET_CHANNEL_TRIGGER_LABEL',
                    channelTriggerNodeId: 'trigger_button1',
                    label: 'entrypoint new',
                },
            )
            expect(
                nextG.nodes.find(
                    (n): n is ChannelTriggerNodeType =>
                        n.type === 'channel_trigger',
                )?.data.label,
            ).toEqual('entrypoint new')
            expect(nextG.name).toEqual('entrypoint new')
        })
    })

    test('SET_AUTOMATED_MESSAGE_CONTENT', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const nextG = baseReducer(g, {
            type: 'SET_AUTOMATED_MESSAGE_CONTENT',
            automatedMessageNodeId: 'automated_message1',
            content: {
                html: 'new html',
                text: 'new text',
            },
        })
        expect(
            nextG.nodes.find(
                (n): n is AutomatedMessageNodeType =>
                    n.id === 'automated_message1',
            )?.data.content,
        ).toEqual(
            expect.objectContaining({
                html: 'new html',
                text: 'new text',
            }),
        )
    })

    test('SET_TEXT_REPLY_CONTENT', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const nextG = baseReducer(g, {
            type: 'SET_TEXT_REPLY_CONTENT',
            textReplyNodeId: 'text_reply1',
            content: {
                html: 'new html',
                text: 'new text',
            },
        })
        expect(
            nextG.nodes.find(
                (n): n is TextReplyNodeType => n.id === 'text_reply1',
            )?.data.content,
        ).toEqual(
            expect.objectContaining({
                html: 'new html',
                text: 'new text',
            }),
        )
    })

    test('SET_FILE_UPLOAD_CONTENT', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const nextG = baseReducer(g, {
            type: 'SET_FILE_UPLOAD_CONTENT',
            fileUploadNodeId: 'file_upload1',
            content: {
                html: 'new html',
                text: 'new text',
            },
        })
        expect(
            nextG.nodes.find(
                (n): n is FileUploadNodeType => n.id === 'file_upload1',
            )?.data.content,
        ).toEqual(
            expect.objectContaining({
                html: 'new html',
                text: 'new text',
            }),
        )
    })

    test('INSERT_AUTOMATED_MESSAGE_NODE', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const nextG = baseReducer(g, {
            type: 'INSERT_AUTOMATED_MESSAGE_NODE',
            beforeNodeId: 'automated_message1',
        })
        // there should be one more node and one more edge
        expect(g.nodes.length).toEqual(nextG.nodes.length - 1)
        expect(g.edges.length).toEqual(nextG.edges.length - 1)
        // the new automated_message node has empty text
        expect(
            nextG.nodes
                .filter(
                    (n): n is AutomatedMessageNodeType =>
                        n.type === 'automated_message',
                )
                .find(
                    (n) =>
                        n.data.content.text === '' &&
                        n.data.content.html === '',
                ),
        ).toBeDefined()
    })

    test('INSERT_TEXT_REPLY_NODE', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const nextG = baseReducer(g, {
            type: 'INSERT_TEXT_REPLY_NODE',
            beforeNodeId: 'text_reply1',
        })
        // there should be one more node and one more edge
        expect(g.nodes.length).toEqual(nextG.nodes.length - 1)
        expect(g.edges.length).toEqual(nextG.edges.length - 1)
        // the new node has empty text
        expect(
            nextG.nodes
                .filter((n): n is TextReplyNodeType => n.type === 'text_reply')
                .find(
                    (n) =>
                        n.data.content.text === '' &&
                        n.data.content.html === '',
                ),
        ).toBeDefined()
    })

    test('INSERT_FILE_UPLOAD_NODE', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const nextG = baseReducer(g, {
            type: 'INSERT_FILE_UPLOAD_NODE',
            beforeNodeId: 'file_upload1',
        })
        // there should be one more node and one more edge
        expect(g.nodes.length).toEqual(nextG.nodes.length - 1)
        expect(g.edges.length).toEqual(nextG.edges.length - 1)
        // the new node has empty text
        expect(
            nextG.nodes
                .filter(
                    (n): n is FileUploadNodeType => n.type === 'file_upload',
                )
                .find(
                    (n) =>
                        n.data.content.text === '' &&
                        n.data.content.html === '',
                ),
        ).toBeDefined()
    })

    test('DELETE_NODE', () => {
        const g = visualBuilderGraphSimpleChoicesFixture

        expect(
            g.edges.filter((e) => {
                const conditions =
                    e.data?.conditions?.and ?? e.data?.conditions?.or ?? []
                return Object.keys(conditions).length > 0
            }),
        ).toHaveLength(1)

        const nextG = baseReducer(g, {
            type: 'DELETE_NODE',
            nodeId: 'automated_message1',
            steps: [],
            apps: [],
        })
        // there should be one less node and one less edge
        expect(g.nodes.length).toEqual(nextG.nodes.length + 1)
        expect(g.edges.length).toEqual(nextG.edges.length + 1)
        // the end node previously attached to the deleted node should be attached to the new one
        // and the initial ordering is preserved
        expect(
            nextG.edges
                .filter((e) => e.source === 'multiple_choices1')
                .map((e) => e.target),
        ).toEqual(['end1', 'automated_message2', 'text_reply1'])
        expect(
            nextG.edges.filter((e) => {
                const conditions =
                    e.data?.conditions?.and ?? e.data?.conditions?.or ?? []
                return Object.keys(conditions).length > 0
            }),
        ).toHaveLength(0)
    })

    test('DELETE_NODE keeps non-conditional edges when edge data is missing', () => {
        const g = _cloneDeep(visualBuilderGraphSimpleChoicesFixture)
        const edgeWithoutData = g.edges.find(
            (edge) => edge.id === 'multiple_choices1_automated_message2',
        )
        if (edgeWithoutData) {
            edgeWithoutData.data = undefined
        }

        const nextG = baseReducer(g, {
            type: 'DELETE_NODE',
            nodeId: 'automated_message1',
            steps: [],
            apps: [],
        })

        expect(
            nextG.edges.find(
                (edge) => edge.id === 'multiple_choices1_automated_message2',
            ),
        ).toEqual(
            expect.objectContaining({
                id: 'multiple_choices1_automated_message2',
                data: undefined,
            }),
        )
    })

    test('DELETE_BRANCH', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        let nextG = baseReducer(g, {
            type: 'DELETE_NODE',
            nodeId: 'automated_message1',
            steps: [],
            apps: [],
        })
        // there should be one less node and one less edge
        expect(g.nodes.length).toEqual(nextG.nodes.length + 1)
        expect(g.edges.length).toEqual(nextG.edges.length + 1)
        // the end node previously attached to the deleted node should be attached to the new one
        // and the initial ordering is preserved
        expect(
            nextG.edges
                .filter((e) => e.source === 'multiple_choices1')
                .map((e) => e.target),
        ).toEqual(['end1', 'automated_message2', 'text_reply1'])

        nextG = baseReducer(
            visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
            {
                type: 'DELETE_BRANCH',
                nodeId: 'reusable_llm_prompt_call1',
                steps: [],
            },
        )
        expect(nextG.apps).toEqual([])
    })

    test('GREY_OUT_BRANCH', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const nextG = baseReducer(g, {
            type: 'GREY_OUT_BRANCH',
            nodeId: 'multiple_choices1',
            isGreyedOut: true,
        })
        // all nodes except the trigger button + conditions should be greyed out
        expect(nextG.nodes.slice(0, 2).every((n) => !n.data.isGreyedOut)).toBe(
            true,
        )

        expect(nextG.nodes.slice(3).every((n) => n.data.isGreyedOut)).toBe(true)
    })

    test('SET_APPS', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const nextG = baseReducer(g, {
            type: 'SET_APPS',
            apps: [{ type: 'shopify' }],
        })

        expect(nextG.apps).toEqual([{ type: 'shopify' }])
    })

    test('INSERT_REMOVE_ITEM_NODE', () => {
        const g = visualBuilderGraphLlmPromptTriggerFixture
        const nextG = baseReducer(g, {
            type: 'INSERT_REMOVE_ITEM_NODE',
            beforeNodeId: 'end1',
            customerId: 'customerId',
            orderExternalId: 'orderExternalId',
            integrationId: 'integrationId',
        })

        expect(nextG.nodes.length).toEqual(g.nodes.length + 2) // 1 new node + 1 failure end
        expect(nextG.edges.length).toEqual(g.edges.length + 2)
        expect(
            nextG.nodes.find(
                (n) =>
                    n.type === 'remove_item' &&
                    n.data.customerId === 'customerId',
            ),
        ).toBeDefined()
    })

    test('SET_REMOVE_ITEM_NODE_SETTINGS', () => {
        const g = baseReducer(visualBuilderGraphLlmPromptTriggerFixture, {
            type: 'INSERT_REMOVE_ITEM_NODE',
            beforeNodeId: 'end1',
            customerId: 'customerId',
            orderExternalId: 'orderExternalId',
            integrationId: 'integrationId',
        })

        const nodeId = g.nodes.find((n) => n.type === 'remove_item')!.id
        const nextG = baseReducer(g, {
            type: 'SET_REMOVE_ITEM_NODE_SETTINGS',
            removeItemNodeId: nodeId,
            productVariantId: 'productVariantId',
            quantity: '1',
        })

        expect(
            nextG.nodes.find(
                (n) =>
                    n.type === 'remove_item' &&
                    n.data.productVariantId === 'productVariantId' &&
                    n.data.quantity === '1',
            ),
        ).toBeDefined()
    })

    test('SET_INPUTS', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const nextG = baseReducer(g, {
            type: 'SET_INPUTS',
            inputs: [
                {
                    name: 'name',
                    description: 'name',
                    data_type: 'string',
                    id: 'id',
                },
            ],
        })

        expect(nextG.inputs).toEqual([
            {
                name: 'name',
                description: 'name',
                data_type: 'string',
                id: 'id',
            },
        ])
    })

    test('INSERT_EDIT_ORDER_NOTE_NODE', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const nextG = baseReducer(g, {
            type: 'INSERT_EDIT_ORDER_NOTE_NODE',
            beforeNodeId: 'automated_message1',
            customerId: 'customerId',
            orderExternalId: 'orderExternalId',
            integrationId: 'integrationId',
        })

        expect(nextG.nodes.length).toEqual(g.nodes.length + 2) // 1 new node + 1 failure end
        expect(nextG.edges.length).toEqual(g.edges.length + 2)
        expect(
            nextG.nodes.find(
                (n) =>
                    n.type === 'edit_order_note' &&
                    n.data.customerId === 'customerId' &&
                    n.data.orderExternalId === 'orderExternalId' &&
                    n.data.integrationId === 'integrationId',
            ),
        ).toBeDefined()
    })
    test('INSERT_CREATE_DISCOUNT_CODE_NODE', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const nextG = baseReducer(g, {
            type: 'INSERT_CREATE_DISCOUNT_CODE_NODE',
            beforeNodeId: 'automated_message1',
            integrationId: 'integrationId',
        })

        expect(nextG.nodes.length).toEqual(g.nodes.length + 2) // 1 new node + 1 failure end
        expect(nextG.edges.length).toEqual(g.edges.length + 2)
        expect(
            nextG.nodes.find(
                (n) =>
                    n.type === 'create_discount_code' &&
                    n.data.integrationId === 'integrationId',
            ),
        ).toBeDefined()
    })

    test('SET_CREATE_DISCOUNT_CODE_NODE_SETTINGS', () => {
        const g = baseReducer(visualBuilderGraphSimpleChoicesFixture, {
            type: 'INSERT_CREATE_DISCOUNT_CODE_NODE',
            beforeNodeId: 'automated_message1',
            integrationId: 'integrationId',
        })

        const nodeId = g.nodes.find(
            (n) => n.type === 'create_discount_code',
        )!.id
        const nextG = baseReducer(g, {
            type: 'SET_CREATE_DISCOUNT_CODE_NODE_SETTINGS',
            createDiscountCodeNodeId: nodeId,
            discountType: 'percentage',
            amount: '10',
            validFor: '1',
        })

        expect(
            nextG.nodes.find(
                (n) =>
                    n.type === 'create_discount_code' &&
                    n.data.discountType === 'percentage' &&
                    n.data.amount === '10' &&
                    n.data.validFor === '1',
            ),
        ).toBeDefined()
    })

    test('INSERT_RESHIP_FOR_FREE_NODE', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const nextG = baseReducer(g, {
            type: 'INSERT_RESHIP_FOR_FREE_NODE',
            beforeNodeId: 'automated_message1',
            customerId: 'customerId',
            orderExternalId: 'orderExternalId',
            integrationId: 'integrationId',
        })

        expect(nextG.nodes.length).toEqual(g.nodes.length + 2) // 1 new node + 1 failure end
        expect(nextG.edges.length).toEqual(g.edges.length + 2)
        expect(
            nextG.nodes.find(
                (n) =>
                    n.type === 'reship_for_free' &&
                    n.data.customerId === 'customerId' &&
                    n.data.orderExternalId === 'orderExternalId' &&
                    n.data.integrationId === 'integrationId',
            ),
        ).toBeDefined()
    })
    test('INSERT_REFUND_SHIPPING_COSTS_NODE', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const nextG = baseReducer(g, {
            type: 'INSERT_REFUND_SHIPPING_COSTS_NODE',
            beforeNodeId: 'automated_message1',
            customerId: 'customerId',
            orderExternalId: 'orderExternalId',
            integrationId: 'integrationId',
        })

        expect(nextG.nodes.length).toEqual(g.nodes.length + 2) // 1 new node + 1 failure end
        expect(nextG.edges.length).toEqual(g.edges.length + 2)
        expect(
            nextG.nodes.find(
                (n) =>
                    n.type === 'refund_shipping_costs' &&
                    n.data.customerId === 'customerId' &&
                    n.data.orderExternalId === 'orderExternalId' &&
                    n.data.integrationId === 'integrationId',
            ),
        ).toBeDefined()
    })
    test('INSERT_REPLACE_ITEM_NODE / SET_REPLACE_ITEM_NODE_SETTINGS', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        let nextG = baseReducer(g, {
            type: 'INSERT_REPLACE_ITEM_NODE',
            beforeNodeId: 'automated_message1',
            customerId: 'customerId',
            orderExternalId: 'orderExternalId',
            integrationId: 'integrationId',
        })

        expect(nextG.nodes.length).toEqual(g.nodes.length + 2) // 1 new node + 1 failure end
        expect(nextG.edges.length).toEqual(g.edges.length + 2)
        expect(
            nextG.nodes.find(
                (n) =>
                    n.type === 'replace_item' &&
                    n.data.customerId === 'customerId' &&
                    n.data.orderExternalId === 'orderExternalId' &&
                    n.data.integrationId === 'integrationId',
            ),
        ).toBeDefined()

        nextG = baseReducer(nextG, {
            type: 'SET_REPLACE_ITEM_NODE_SETTINGS',
            replaceItemNodeId: nextG.nodes.find(
                (n) => n.type === 'replace_item',
            )!.id,
            addedProductVariantId: 'addedProductVariantId',
            addedQuantity: '1',
            productVariantId: 'productVariantId',
            quantity: '1',
        })

        expect(
            nextG.nodes.find(
                (n) =>
                    n.type === 'replace_item' &&
                    n.data.addedProductVariantId === 'addedProductVariantId' &&
                    n.data.addedQuantity === '1' &&
                    n.data.productVariantId === 'productVariantId' &&
                    n.data.quantity === '1',
            ),
        ).toBeDefined()
    })

    test('INSERT_SKIP_CHARGE_NODE', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const nextG = baseReducer(g, {
            type: 'INSERT_SKIP_CHARGE_NODE',
            beforeNodeId: 'automated_message2',
            customerId: 'customerId',
            integrationId: 'integrationId',
        })
        const node = nextG.nodes.find(
            (n): n is SkipChargeNodeType => n.type === 'skip_charge',
        )
        expect(node).toBeDefined()
        expect(node?.data.customerId).toBe('customerId')
        expect(node?.data.integrationId).toBe('integrationId')
    })

    test('SET_SKIP_CHARGE_NODE_SETTINGS', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        let nextG = baseReducer(g, {
            type: 'INSERT_SKIP_CHARGE_NODE',
            beforeNodeId: 'automated_message2',
            customerId: 'customerId',
            integrationId: 'integrationId',
        })
        let node = nextG.nodes.find(
            (n): n is SkipChargeNodeType => n.type === 'skip_charge',
        )
        expect(node).toBeDefined()
        expect(node?.data.subscriptionId).toBe('')
        expect(node?.data.chargeId).toBe('')

        nextG = baseReducer(nextG, {
            type: 'SET_SKIP_CHARGE_NODE_SETTINGS',
            skipChargeNodeId: node?.id || '',
            subscriptionId: 'subscription',
            chargeId: 'charge',
        })

        node = nextG.nodes.find(
            (n): n is SkipChargeNodeType => n.type === 'skip_charge',
        )
        expect(node?.data.subscriptionId).toBe('subscription')
        expect(node?.data.chargeId).toBe('charge')
    })

    test('SET_BRANCH_IDS_EDITING', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const nextG = baseReducer(g, {
            type: 'SET_BRANCH_IDS_EDITING',
            branchIds: ['branch-id-1'],
        })
        expect(nextG.branchIdsEditing.length).toBe(1)
        expect(nextG.branchIdsEditing[0]).toBe('branch-id-1')
    })

    test('ADD_BRANCH_ID_EDITING', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        expect(g.branchIdsEditing.length).toBe(0)
        let nextG = baseReducer(g, {
            type: 'ADD_BRANCH_ID_EDITING',
            branchId: 'branch-id-1',
        })
        expect(nextG.branchIdsEditing.length).toBe(1)
        expect(nextG.branchIdsEditing[0]).toBe('branch-id-1')

        nextG = baseReducer(nextG, {
            type: 'ADD_BRANCH_ID_EDITING',
            branchId: 'branch-id-2',
        })
        expect(nextG.branchIdsEditing.length).toBe(2)
        expect(nextG.branchIdsEditing[1]).toBe('branch-id-2')
    })

    test('CLOSE_EDITOR', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        expect(g.nodeEditingId).toBe(null)
        let nextG = baseReducer(g, {
            type: 'SET_NODE_EDITING_ID',
            nodeId: 'conditions1',
        })
        expect(nextG.nodeEditingId).toBe('conditions1')

        // Closing editor will clear editing
        nextG = baseReducer(nextG, {
            type: 'CLOSE_EDITOR',
        })
        expect(nextG.nodeEditingId).toBe(null)
    })

    test('SET_NODE_EDITING_ID', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        expect(g.nodeEditingId).toBe(null)
        let nextG = baseReducer(g, {
            type: 'SET_NODE_EDITING_ID',
            nodeId: 'conditions1',
        })
        expect(nextG.nodeEditingId).toBe('conditions1')

        // Since it's the same, it does not change
        nextG = baseReducer(nextG, {
            type: 'SET_NODE_EDITING_ID',
            nodeId: 'conditions1',
        })
        expect(nextG.nodeEditingId).toBe('conditions1')
    })

    test('INSERT_UPDATE_SHIPPING_ADDRESS_NODE', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const nextG = baseReducer(g, {
            type: 'INSERT_UPDATE_SHIPPING_ADDRESS_NODE',
            beforeNodeId: 'automated_message2',
            customerId: 'customerId',
            orderExternalId: 'external',
            integrationId: 'integrationId',
        })

        const node = nextG.nodes.find(
            (n): n is UpdateShippingAddressNodeType =>
                n.type === 'update_shipping_address',
        )
        expect(node).toBeDefined()
    })

    test('SET_UPDATE_SHIPPING_ADDRESS_NODE_SETTINGS', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        let nextG = baseReducer(g, {
            type: 'INSERT_UPDATE_SHIPPING_ADDRESS_NODE',
            beforeNodeId: 'automated_message2',
            customerId: 'customerId',
            orderExternalId: 'external',
            integrationId: 'integrationId',
        })

        let node = nextG.nodes.find(
            (n): n is UpdateShippingAddressNodeType =>
                n.type === 'update_shipping_address',
        )
        expect(node).toBeDefined()
        expect(node?.data.name).toBe('')
        expect(node?.data.address1).toBe('')
        expect(node?.data.address2).toBe('')
        expect(node?.data.city).toBe('')
        expect(node?.data.zip).toBe('')
        expect(node?.data.province).toBe('')
        expect(node?.data.country).toBe('')
        expect(node?.data.phone).toBe('')
        expect(node?.data.lastName).toBe('')
        expect(node?.data.firstName).toBe('')

        nextG = baseReducer(nextG, {
            type: 'SET_UPDATE_SHIPPING_ADDRESS_NODE_SETTINGS',
            updateShippingAddressNodeId: node?.id || '',
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
        })
        node = nextG.nodes.find(
            (n): n is UpdateShippingAddressNodeType =>
                n.type === 'update_shipping_address',
        )
        expect(node).toBeDefined()
        expect(node?.data.name).toBe('name')
        expect(node?.data.address1).toBe('address1')
        expect(node?.data.address2).toBe('address2')
        expect(node?.data.city).toBe('city')
        expect(node?.data.zip).toBe('zip')
        expect(node?.data.province).toBe('province')
        expect(node?.data.country).toBe('country')
        expect(node?.data.phone).toBe('phone')
        expect(node?.data.lastName).toBe('lastName')
        expect(node?.data.firstName).toBe('firstName')
    })

    test('INSERT_CANCEL_SUBSCRIPTION_NODE', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const nextG = baseReducer(g, {
            type: 'INSERT_CANCEL_SUBSCRIPTION_NODE',
            beforeNodeId: 'automated_message2',
            customerId: 'customerId',
            integrationId: 'integrationId',
        })

        const node = nextG.nodes.find(
            (n): n is CancelSubscriptionNodeType =>
                n.type === 'cancel_subscription',
        )
        expect(node).toBeDefined()
        expect(node?.data.customerId).toBe('customerId')
        expect(node?.data.integrationId).toBe('integrationId')
    })

    test('SET_CANCEL_SUBSCRIPTION_NODE_SETTINGS', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        let nextG = baseReducer(g, {
            type: 'INSERT_CANCEL_SUBSCRIPTION_NODE',
            beforeNodeId: 'automated_message2',
            customerId: 'customerId',
            integrationId: 'integrationId',
        })

        let node = nextG.nodes.find(
            (n): n is CancelSubscriptionNodeType =>
                n.type === 'cancel_subscription',
        )
        expect(node).toBeDefined()
        expect(node?.data.reason).toBe('')
        expect(node?.data.subscriptionId).toBe('')

        nextG = baseReducer(nextG, {
            type: 'SET_CANCEL_SUBSCRIPTION_NODE_SETTINGS',
            cancelSubscriptionNodeId: node?.id || '',
            subscriptionId: 'subscription',
            reason: 'reason',
        })

        node = nextG.nodes.find(
            (n): n is CancelSubscriptionNodeType =>
                n.type === 'cancel_subscription',
        )
        expect(node).toBeDefined()
        expect(node?.data.reason).toBe('reason')
        expect(node?.data.subscriptionId).toBe('subscription')
    })

    test('INSERT_REFUND_ORDER_NODE', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const nextG = baseReducer(g, {
            type: 'INSERT_REFUND_ORDER_NODE',
            beforeNodeId: 'automated_message2',
            customerId: 'customerId',
            integrationId: 'integrationId',
            orderExternalId: 'orderExternalId',
        })

        const node = nextG.nodes.find(
            (n): n is RefundOrderNodeType => n.type === 'refund_order',
        )
        expect(node).toBeDefined()
    })

    test('INSERT_CANCEL_ORDER_NODE', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const nextG = baseReducer(g, {
            type: 'INSERT_CANCEL_ORDER_NODE',
            beforeNodeId: 'automated_message2',
            customerId: 'customerId',
            integrationId: 'integrationId',
            orderExternalId: 'orderExternalId',
        })

        const node = nextG.nodes.find(
            (n): n is CancelOrderNodeType => n.type === 'cancel_order',
        )
        expect(node).toBeDefined()
    })

    test('INSERT_SHOPPER_AUTHENTICATION_NODE', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const nextG = baseReducer(g, {
            type: 'INSERT_SHOPPER_AUTHENTICATION_NODE',
            beforeNodeId: 'automated_message2',
            storeIntegrationId: 0,
        })

        const node = nextG.nodes.find(
            (n): n is ShopperAuthenticationNodeType =>
                n.type === 'shopper_authentication',
        )
        expect(node).toBeDefined()
    })

    test('INSERT_ORDER_LINE_ITEM_SELECTION_NODE', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const nextG = baseReducer(g, {
            type: 'INSERT_ORDER_LINE_ITEM_SELECTION_NODE',
            beforeNodeId: 'automated_message2',
        })

        const node = nextG.nodes.find(
            (n): n is OrderLineItemSelectionNodeType =>
                n.type === 'order_line_item_selection',
        )
        expect(node).toBeDefined()
    })

    test('SET_ORDER_LINE_ITEM_SELECTION_CONTENT', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        let nextG = baseReducer(g, {
            type: 'INSERT_ORDER_LINE_ITEM_SELECTION_NODE',
            beforeNodeId: 'automated_message2',
        })

        let node = nextG.nodes.find(
            (n): n is OrderLineItemSelectionNodeType =>
                n.type === 'order_line_item_selection',
        )
        expect(node).toBeDefined()

        nextG = baseReducer(nextG, {
            type: 'SET_ORDER_LINE_ITEM_SELECTION_CONTENT',
            orderLineItemSelectionNodeId: node?.id || '',
            content: {
                html: '<p>Hello</p>',
                text: 'Hello',
            },
        })

        node = nextG.nodes.find(
            (n): n is OrderLineItemSelectionNodeType =>
                n.type === 'order_line_item_selection',
        )
        expect(node).toBeDefined()
        expect(node?.data.content.text).toBe('Hello')
    })

    test('INSERT_ORDER_SELECTION_NODE', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const nextG = baseReducer(g, {
            type: 'INSERT_ORDER_SELECTION_NODE',
            beforeNodeId: 'automated_message2',
        })

        const node = nextG.nodes.find(
            (n): n is OrderSelectionNodeType => n.type === 'order_selection',
        )
        expect(node).toBeDefined()
    })

    test('SET_ORDER_SELECTION_CONTENT', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        let nextG = baseReducer(g, {
            type: 'INSERT_ORDER_SELECTION_NODE',
            beforeNodeId: 'automated_message2',
        })

        let node = nextG.nodes.find(
            (n): n is OrderSelectionNodeType => n.type === 'order_selection',
        )
        expect(node).toBeDefined()

        nextG = baseReducer(nextG, {
            type: 'SET_ORDER_SELECTION_CONTENT',
            orderSelectionNodeId: node?.id || '',
            content: {
                html: '<p>Hello</p>',
                text: 'Hello',
            },
        })
        node = nextG.nodes.find(
            (n): n is OrderSelectionNodeType => n.type === 'order_selection',
        )
        expect(node).toBeDefined()
        expect(node?.data.content.text).toBe('Hello')
    })

    test('SET_END_NODE_SETTINGS', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        let node = g.nodes.find((n): n is EndNodeType => n.id === 'end3')
        expect(node?.data.action).toBe('ask-for-feedback')
        const nextG = baseReducer(g, {
            type: 'SET_END_NODE_SETTINGS',
            endNodeId: 'end3',
            settings: {
                action: 'create-ticket',
            },
        })

        node = nextG.nodes.find((n): n is EndNodeType => n.id === 'end3')
        expect(node).toBeDefined()
        expect(node?.data.action).toBe('create-ticket')
    })

    test('SET_APP_API_KEY', () => {
        const nextG = baseReducer(
            visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
            {
                type: 'SET_APP_API_KEY',
                appId: '123',
                apiKey: 'some api key',
            },
        )

        expect(nextG.apps).toEqual([
            {
                type: 'app',
                app_id: '123',
                api_key: 'some api key',
            },
        ])
    })

    test('SET_APP_API_KEY when app is not found', () => {
        const graph = {
            ...visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
            apps: [
                {
                    type: 'shopify' as const,
                },
            ],
        }
        const nextG = baseReducer(graph, {
            type: 'SET_APP_API_KEY',
            appId: '123',
            apiKey: 'some api key',
        })

        // Should not modify the apps array when app is not found
        expect(nextG.apps).toEqual([{ type: 'shopify' }])
    })

    test('SET_APP_API_KEY with multiple apps sets key on correct app', () => {
        const graph = {
            ...visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
            apps: [
                { type: 'shopify' as const },
                { type: 'app' as const, app_id: '123', api_key: 'old key' },
                { type: 'app' as const, app_id: '456', api_key: 'other key' },
            ],
        }
        const nextG = baseReducer(graph, {
            type: 'SET_APP_API_KEY',
            appId: '123',
            apiKey: 'new key',
        })

        // Should only modify the API key of the matching app
        expect(nextG.apps).toEqual([
            { type: 'shopify' },
            { type: 'app', app_id: '123', api_key: 'new key' },
            { type: 'app', app_id: '456', api_key: 'other key' },
        ])
    })

    test('SET_APP_REFRESH_TOKEN', () => {
        const nextG = baseReducer(
            visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
            {
                type: 'SET_APP_REFRESH_TOKEN',
                appId: '123',
                refreshToken: 'some refresh token',
            },
        )

        expect(nextG.apps).toEqual([
            {
                type: 'app',
                app_id: '123',
                refresh_token: 'some refresh token',
            },
        ])
    })

    test('SET_ERRORS', () => {
        let nextG = baseReducer(
            visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
            {
                type: 'SET_ERRORS',
                nodeId: 'trigger',
                errors: {
                    instructions: 'error',
                    conditions: 'error',
                },
            },
        )
        nextG = baseReducer(nextG, {
            type: 'SET_ERRORS',
            errors: {
                name: 'error',
            },
        })
        nextG = baseReducer(nextG, {
            type: 'SET_ERRORS',
            appId: '123',
            errors: {
                api_key: 'error',
            },
        })

        expect(nextG.errors).toEqual({ name: 'error' })
        expect(nextG.nodes[0].data.errors).toEqual({
            instructions: 'error',
            conditions: 'error',
        })
        expect(nextG.apps?.[0]?.errors).toEqual({
            api_key: 'error',
        })
    })

    test('SET_ERRORS when node is not found', () => {
        const nextG = baseReducer(
            visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
            {
                type: 'SET_ERRORS',
                nodeId: 'non-existent-node',
                errors: {
                    instructions: 'error',
                },
            },
        )
        // Graph should remain unchanged when node is not found
        expect(nextG).toEqual(
            visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
        )
    })

    test('SET_ERRORS when apps is undefined', () => {
        const graph = {
            ...visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
            apps: undefined,
        }
        const nextG = baseReducer(graph, {
            type: 'SET_ERRORS',
            appId: '123',
            errors: {
                api_key: 'error',
            },
        })
        // Graph should remain unchanged when apps is undefined
        expect(nextG).toEqual(graph)
    })

    test('SET_TOUCHED', () => {
        let nextG = baseReducer(
            visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
            {
                type: 'SET_TOUCHED',
                nodeId: 'trigger',
                touched: {
                    instructions: true,
                    conditions: true,
                },
            },
        )
        nextG = baseReducer(nextG, {
            type: 'SET_TOUCHED',
            touched: {
                name: true,
            },
        })
        nextG = baseReducer(nextG, {
            type: 'SET_TOUCHED',
            appId: '123',
            touched: {
                api_key: true,
            },
        })

        expect(nextG.touched).toEqual({ name: true })
        expect(nextG.nodes[0].data.touched).toEqual({
            instructions: true,
            conditions: true,
        })
        expect(nextG.apps?.[0]?.touched).toEqual({
            api_key: true,
        })
    })

    test('MIGRATE_TO_ADVANCED_STEP_BUILDER sets advanced_datetime', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const nextG = baseReducer(g, {
            type: 'MIGRATE_TO_ADVANCED_STEP_BUILDER',
        })
        expect(nextG.advanced_datetime).toBeDefined()
    })

    test('SET_NODE_EDITING_ID clears choiceEventIdEditing and branchIdsEditing', () => {
        const g = {
            ...visualBuilderGraphSimpleChoicesFixture,
            choiceEventIdEditing: 'some-id',
            branchIdsEditing: ['branch-1'],
        }
        const nextG = baseReducer(g, {
            type: 'SET_NODE_EDITING_ID',
            nodeId: 'new-node',
        })
        expect(nextG.nodeEditingId).toBe('new-node')
        expect(nextG.choiceEventIdEditing).toBeNull()
        expect(nextG.branchIdsEditing).toEqual([])
    })

    test('ADD_BRANCH_ID_EDITING initializes array if empty', () => {
        const g = {
            ...visualBuilderGraphSimpleChoicesFixture,
            branchIdsEditing: [],
        }
        const nextG = baseReducer(g, {
            type: 'ADD_BRANCH_ID_EDITING',
            branchId: 'new-branch',
        })
        expect(nextG.branchIdsEditing).toEqual(['new-branch'])
    })

    test('DELETE_NODE preserves apps in template mode', () => {
        const g: VisualBuilderGraph = {
            ...visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
            apps: [
                { type: 'app' as const, app_id: '123' },
                { type: 'shopify' as const },
                { type: 'recharge' as const },
            ],
            isTemplate: true,
        }

        const nextG = baseReducer(g, {
            type: 'DELETE_NODE',
            nodeId: 'reusable_llm_prompt_call1',
            steps: [],
            apps: [],
        })

        // Apps should remain unchanged in template mode
        expect(nextG.apps).toEqual(g.apps)
    })

    test('DELETE_BRANCH cleans up apps', () => {
        const g: VisualBuilderGraph = {
            ...visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
            apps: [
                { type: 'app' as const, app_id: '123' },
                { type: 'shopify' as const },
                { type: 'recharge' as const },
            ],
            isTemplate: false,
        }

        const nextG = baseReducer(g, {
            type: 'DELETE_BRANCH',
            nodeId: 'reusable_llm_prompt_call1',
            steps: [],
        })

        // No apps should remain since none are in use after branch deletion
        expect(nextG.apps).toEqual([])
    })

    test('DELETE_BRANCH preserves apps in template mode', () => {
        const g: VisualBuilderGraph = {
            ...visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
            apps: [
                { type: 'app' as const, app_id: '123' },
                { type: 'shopify' as const },
                { type: 'recharge' as const },
            ],
            isTemplate: true,
        }

        const nextG = baseReducer(g, {
            type: 'DELETE_BRANCH',
            nodeId: 'reusable_llm_prompt_call1',
            steps: [],
        })

        expect(nextG.apps).toEqual(g.apps)
    })
})

describe('DELETE_NODE input cleanup', () => {
    // Factory functions for common node types
    const createLLMPromptTriggerNode = (
        inputs: LLMPromptTriggerNodeType['data']['inputs'] = [],
    ): LLMPromptTriggerNodeType => ({
        ...buildNodeCommonProperties(),
        id: 'trigger_button',
        type: 'llm_prompt_trigger',
        data: {
            instructions: 'Test instructions',
            requires_confirmation: false,
            inputs,
            conditionsType: null,
            conditions: [],
            deactivated_datetime: null,
        },
    })

    const createReusableLLMPromptTriggerNode = (
        inputs: ReusableLLMPromptTriggerNodeType['data']['inputs'] = [],
    ): ReusableLLMPromptTriggerNodeType => ({
        ...buildNodeCommonProperties(),
        id: 'trigger_button',
        type: 'reusable_llm_prompt_trigger',
        data: {
            requires_confirmation: false,
            inputs,
            conditionsType: null,
            conditions: [],
        },
    })

    const createChannelTriggerNode = (): ChannelTriggerNodeType => ({
        ...buildNodeCommonProperties(),
        id: 'trigger_button',
        type: 'channel_trigger',
        data: {
            label: 'Test Channel',
            label_tkey: 'test_channel',
        },
    })

    const createCallNode = (
        configId = 'config1',
        internalId = 'internal1',
        nodeId = 'call_node_1',
    ): ReusableLLMPromptCallNodeType => ({
        ...buildNodeCommonProperties(),
        id: nodeId,
        type: 'reusable_llm_prompt_call',
        data: {
            configuration_id: configId,
            configuration_internal_id: internalId,
            objects: {},
            custom_inputs: {},
            values: {},
        },
    })

    const createTextReplyNode = (): TextReplyNodeType => ({
        ...buildNodeCommonProperties(),
        id: 'text_reply_1',
        type: 'text_reply',
        data: {
            content: {
                text: 'Test reply',
                html: '<p>Test reply</p>',
            },
        },
    })

    const createEndNode = (): EndNodeType => ({
        ...buildNodeCommonProperties(),
        id: 'end1',
        type: 'end',
        data: {
            action: 'end-success',
        },
    })

    const createGraph = (
        nodes: VisualBuilderGraph['nodes'],
        edges: VisualBuilderGraph['edges'] = [],
    ) => ({
        id: 'test-graph',
        internal_id: 'test-internal',
        is_draft: false,
        name: 'Test Graph',
        nodes,
        edges,
        available_languages: [],
        nodeEditingId: null,
        choiceEventIdEditing: null,
        branchIdsEditing: [],
        isTemplate: false,
    })

    const createStepConfig = (
        id: string,
        internalId: string,
        customInputs: any[] = [],
        objectInputs: any[] = [],
        triggerKind:
            | 'reusable-llm-prompt'
            | 'llm-prompt' = 'reusable-llm-prompt',
        triggers?: any,
    ) => ({
        id,
        internal_id: internalId,
        name: 'Test Step',
        is_draft: false,
        triggers: triggers || [
            {
                kind: triggerKind,
                settings: {
                    custom_inputs: customInputs,
                    object_inputs: objectInputs,
                    outputs: [],
                },
            },
        ],
        entrypoints: [],
        steps: [],
        transitions: [],
        available_languages: [],
        apps: [],
        inputs: [],
        values: {},
        initial_step_id: null,
    })

    // Common input data
    const testInputs = {
        customInput: {
            id: 'input1',
            name: 'Test Input',
            instructions: 'Test input instructions',
            data_type: 'string' as const,
        },
        productInput: {
            id: 'input2',
            name: 'Product Input',
            instructions: 'Product input instructions',
            kind: 'product' as const,
        },
        productInput1: {
            id: 'product_input_1',
            name: 'Product Input 1',
            instructions: 'Product input 1 instructions',
            kind: 'product' as const,
        },
        productInput2: {
            id: 'product_input_2',
            name: 'Product Input 2',
            instructions: 'Product input 2 instructions',
            kind: 'product' as const,
        },
        sharedInput: {
            id: 'shared_input',
            name: 'Shared Input',
            instructions: 'Shared input instructions',
            data_type: 'string' as const,
        },
        unusedInput: {
            id: 'unused_input',
            name: 'Unused Input',
            instructions: 'Unused input instructions',
            data_type: 'number' as const,
        },
    }

    // Common step input configs
    const stepInputs = {
        customInput: {
            id: 'step_input1',
            name: 'Test Input',
            instructions: 'Test input instructions',
            data_type: 'string' as const,
        },
        productInput: {
            id: 'step_input2',
            name: 'Product Input',
            instructions: 'Product input instructions',
            kind: 'product' as const,
        },
        productInput1: {
            id: 'step_product_1',
            name: 'Product Input 1',
            instructions: 'Product input 1 instructions',
            kind: 'product' as const,
        },
        productInput2: {
            id: 'step_product_2',
            name: 'Product Input 2',
            instructions: 'Product input 2 instructions',
            kind: 'product' as const,
        },
        sharedInput: {
            id: 'step_input1',
            name: 'Shared Input',
            instructions: 'Shared input instructions',
            data_type: 'string' as const,
        },
        customInput2: {
            id: 'step_custom',
            name: 'Custom Input',
            instructions: 'Custom input instructions',
            data_type: 'string' as const,
        },
    }

    test('should clean up unused inputs from trigger node when reusable LLM prompt call node is deleted', () => {
        const triggerNode = createLLMPromptTriggerNode([
            testInputs.customInput,
            testInputs.productInput,
        ])
        const callNode = createCallNode()
        const endNode = createEndNode()
        const graph = createGraph([triggerNode, callNode, endNode])

        const steps = [
            createStepConfig(
                'config1',
                'internal1',
                [stepInputs.customInput],
                [stepInputs.productInput],
            ),
        ]

        const result = baseReducer(graph, {
            type: 'DELETE_NODE',
            nodeId: 'call_node_1',
            steps,
            apps: [],
        })

        const resultTriggerNode = result.nodes[0] as LLMPromptTriggerNodeType
        expect(resultTriggerNode.data.inputs).toHaveLength(0)
        expect(result.nodes).toHaveLength(2)
        expect(
            result.nodes.find((node) => node.id === 'call_node_1'),
        ).toBeUndefined()
    })

    test('should not remove inputs that are still used by other nodes', () => {
        const triggerNode = createLLMPromptTriggerNode([testInputs.sharedInput])
        const callNode1 = createCallNode()
        const callNode2 = createCallNode('config1', 'internal1', 'call_node_2')
        const endNode = createEndNode()
        const graph = createGraph([triggerNode, callNode1, callNode2, endNode])

        const steps = [
            createStepConfig('config1', 'internal1', [stepInputs.sharedInput]),
        ]

        const result = baseReducer(graph, {
            type: 'DELETE_NODE',
            nodeId: 'call_node_1',
            steps,
            apps: [],
        })

        const resultTriggerNode = result.nodes[0] as LLMPromptTriggerNodeType
        expect(resultTriggerNode.data.inputs).toHaveLength(1)
        expect(resultTriggerNode.data.inputs[0].id).toBe('shared_input')
        expect(result.nodes).toHaveLength(3)
        expect(
            result.nodes.find((node) => node.id === 'call_node_1'),
        ).toBeUndefined()
        expect(
            result.nodes.find((node) => node.id === 'call_node_2'),
        ).toBeDefined()
    })

    test('should clean up inputs when DELETE_BRANCH is used', () => {
        const triggerNode = createLLMPromptTriggerNode([testInputs.customInput])
        const callNode = createCallNode()
        const endNode = createEndNode()
        const edges = [
            {
                id: 'edge1',
                source: 'trigger_button',
                target: 'call_node_1',
                type: 'default',
                data: {},
            },
            {
                id: 'edge2',
                source: 'call_node_1',
                target: 'end1',
                type: 'default',
                data: {},
            },
        ]
        const graph = createGraph([triggerNode, callNode, endNode], edges)

        const steps = [
            createStepConfig('config1', 'internal1', [stepInputs.customInput]),
        ]

        const result = baseReducer(graph, {
            type: 'DELETE_BRANCH',
            nodeId: 'call_node_1',
            steps,
        })

        const resultTriggerNode = result.nodes[0] as LLMPromptTriggerNodeType
        expect(resultTriggerNode.data.inputs).toHaveLength(0)
    })

    test('should not clean up inputs when deleting non-reusable LLM prompt call nodes', () => {
        const triggerNode = createLLMPromptTriggerNode([testInputs.customInput])
        const textReplyNode = createTextReplyNode()
        const endNode = createEndNode()
        const graph = createGraph([triggerNode, textReplyNode, endNode])

        const result = baseReducer(graph, {
            type: 'DELETE_NODE',
            nodeId: 'text_reply_1',
            steps: [],
            apps: [],
        })

        const resultTriggerNode = result.nodes[0] as LLMPromptTriggerNodeType
        expect(resultTriggerNode.data.inputs).toHaveLength(1)
        expect(resultTriggerNode.data.inputs[0].id).toBe('input1')
    })

    test('should handle cleanup when trigger node is not LLM prompt trigger', () => {
        const channelTriggerNode = createChannelTriggerNode()
        const callNode = createCallNode()
        const endNode = createEndNode()
        const graph = createGraph([channelTriggerNode, callNode, endNode])

        const result = baseReducer(graph, {
            type: 'DELETE_NODE',
            nodeId: 'call_node_1',
            steps: [],
            apps: [],
        })

        expect(result.nodes).toHaveLength(2)
        expect(
            result.nodes.find((node) => node.id === 'call_node_1'),
        ).toBeUndefined()
    })

    test('should handle cleanup with missing or invalid step configurations', () => {
        const triggerNode = createLLMPromptTriggerNode([testInputs.customInput])
        const callNode = createCallNode(
            'nonexistent_config',
            'nonexistent_internal',
        )
        const endNode = createEndNode()
        const graph = createGraph([triggerNode, callNode, endNode])

        const result = baseReducer(graph, {
            type: 'DELETE_NODE',
            nodeId: 'call_node_1',
            steps: [],
            apps: [],
        })

        const resultTriggerNode = result.nodes[0] as LLMPromptTriggerNodeType
        expect(resultTriggerNode.data.inputs).toHaveLength(0)
    })

    test('should handle mixed input types (custom and product) correctly', () => {
        const triggerNode = createLLMPromptTriggerNode([
            testInputs.customInput,
            testInputs.productInput,
            testInputs.unusedInput,
        ])
        const callNode = createCallNode()
        const endNode = createEndNode()
        const graph = createGraph([triggerNode, callNode, endNode])

        const steps = [
            createStepConfig(
                'config1',
                'internal1',
                [stepInputs.customInput2],
                [stepInputs.productInput],
            ),
        ]

        const result = baseReducer(graph, {
            type: 'DELETE_NODE',
            nodeId: 'call_node_1',
            steps,
            apps: [],
        })

        const resultTriggerNode = result.nodes[0] as LLMPromptTriggerNodeType
        expect(resultTriggerNode.data.inputs).toHaveLength(0)
    })

    test('should handle step without reusable-llm-prompt trigger', () => {
        const triggerNode = createLLMPromptTriggerNode([testInputs.customInput])
        const callNode = createCallNode()
        const endNode = createEndNode()
        const graph = createGraph([triggerNode, callNode, endNode])

        const steps = [
            createStepConfig('config1', 'internal1', [], [], 'llm-prompt'),
        ]

        const result = baseReducer(graph, {
            type: 'DELETE_NODE',
            nodeId: 'call_node_1',
            steps,
            apps: [],
        })

        const resultTriggerNode = result.nodes[0] as LLMPromptTriggerNodeType
        expect(resultTriggerNode.data.inputs).toHaveLength(0)
    })

    test('should handle product inputs cleanup correctly', () => {
        const triggerNode = createLLMPromptTriggerNode([
            testInputs.productInput1,
            testInputs.productInput2,
        ])
        const callNode1 = createCallNode()
        const callNode2 = createCallNode('config2', 'internal2', 'call_node_2')
        const endNode = createEndNode()
        const graph = createGraph([triggerNode, callNode1, callNode2, endNode])

        const steps = [
            createStepConfig(
                'config1',
                'internal1',
                [],
                [stepInputs.productInput1],
            ),
            createStepConfig(
                'config2',
                'internal2',
                [],
                [stepInputs.productInput2],
            ),
        ]

        const result = baseReducer(graph, {
            type: 'DELETE_NODE',
            nodeId: 'call_node_1',
            steps,
            apps: [],
        })

        const resultTriggerNode = result.nodes[0] as LLMPromptTriggerNodeType
        expect(resultTriggerNode.data.inputs).toHaveLength(1)
        expect(resultTriggerNode.data.inputs[0].id).toBe('product_input_2')
    })

    test('should handle step configuration without triggers', () => {
        const triggerNode = createLLMPromptTriggerNode([testInputs.customInput])
        const callNode = createCallNode()
        const endNode = createEndNode()
        const graph = createGraph([triggerNode, callNode, endNode])

        const steps = [
            createStepConfig(
                'config1',
                'internal1',
                [],
                [],
                'reusable-llm-prompt',
                undefined,
            ),
        ]

        const result = baseReducer(graph, {
            type: 'DELETE_NODE',
            nodeId: 'call_node_1',
            steps,
            apps: [],
        })

        const resultTriggerNode = result.nodes[0] as LLMPromptTriggerNodeType
        expect(resultTriggerNode.data.inputs).toHaveLength(0)
    })

    test('should handle reusable LLM prompt trigger node type', () => {
        const triggerNode = createReusableLLMPromptTriggerNode([
            testInputs.customInput,
        ])
        const callNode = createCallNode()
        const endNode = createEndNode()
        const graph = createGraph([triggerNode, callNode, endNode])

        const steps = [
            createStepConfig('config1', 'internal1', [stepInputs.customInput]),
        ]

        const result = baseReducer(graph, {
            type: 'DELETE_NODE',
            nodeId: 'call_node_1',
            steps,
            apps: [],
        })

        const resultTriggerNode = result
            .nodes[0] as ReusableLLMPromptTriggerNodeType
        expect(resultTriggerNode.data.inputs).toHaveLength(0)
    })
})

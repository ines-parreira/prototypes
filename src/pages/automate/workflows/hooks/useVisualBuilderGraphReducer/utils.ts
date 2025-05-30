import { flextree } from 'd3-flextree'
import { produce } from 'immer'
import _keyBy from 'lodash/keyBy'
import { ulid } from 'ulidx'

import {
    buildNodeCommonProperties,
    walkVisualBuilderGraph,
} from '../../models/visualBuilderGraph.model'
import {
    AutomatedMessageNodeType,
    CancelOrderNodeType,
    CancelSubscriptionNodeType,
    ConditionsNodeType,
    CreateDiscountCodeNodeType,
    EditOrderNoteNodeType,
    EndNodeType,
    FileUploadNodeType,
    HttpRequestNodeType,
    MultipleChoicesNodeType,
    OrderLineItemSelectionNodeType,
    OrderSelectionNodeType,
    RefundOrderNodeType,
    RefundShippingCostsNodeType,
    RemoveItemNodeType,
    ReplaceItemNodeType,
    ReshipForFreeNodeType,
    ReusableLLMPromptCallNodeType,
    ShopperAuthenticationNodeType,
    SkipChargeNodeType,
    TextReplyNodeType,
    UpdateShippingAddressNodeType,
    VisualBuilderEdge,
    VisualBuilderGraph,
    VisualBuilderNode,
    VisualBuilderTriggerNode,
} from '../../models/visualBuilderGraph.types'
import { WorkflowTransition } from '../../models/workflowConfiguration.types'

export function greyOutBranch(
    graph: VisualBuilderGraph,
    nodeId: string,
    isGreyedOut: boolean,
): VisualBuilderGraph {
    const { nodes } = graph
    const childrenIds: Set<string> = new Set()
    walkVisualBuilderGraph(graph, nodeId, (node) => {
        childrenIds.add(node.id)
    })
    return {
        ...graph,
        nodes: nodes.map((n) =>
            childrenIds.has(n.id)
                ? produce(n, (draft) => {
                      draft.data.isGreyedOut = isGreyedOut
                  })
                : n,
        ) as VisualBuilderGraph['nodes'],
    }
}

export function deleteBranch(
    graph: VisualBuilderGraph,
    nodeId: string,
    { keepIncomingEdge }: { keepIncomingEdge?: boolean } = {},
): VisualBuilderGraph {
    const { nodes, edges } = graph
    const nodeIdsToDelete: Set<string> = new Set()
    const edgeIdsToDelete: Set<string> = new Set()
    let nodeToDeleteIncomingEdge: VisualBuilderEdge | undefined
    walkVisualBuilderGraph(
        graph,
        nodeId,
        (node, { incomingEdge, outgoingEdges }) => {
            nodeIdsToDelete.add(node.id)
            if (incomingEdge && !nodeToDeleteIncomingEdge) {
                nodeToDeleteIncomingEdge = incomingEdge
            }
            if (
                incomingEdge &&
                (!keepIncomingEdge ||
                    incomingEdge.id !== nodeToDeleteIncomingEdge?.id)
            )
                edgeIdsToDelete.add(incomingEdge.id)
            outgoingEdges.forEach((edge) => edgeIdsToDelete.add(edge.id))
        },
    )
    if (!nodeToDeleteIncomingEdge) return graph

    return {
        ...graph,
        nodes: nodes.filter(
            (n) => !nodeIdsToDelete.has(n.id),
        ) as VisualBuilderGraph['nodes'],
        edges: edges.filter((e) => !edgeIdsToDelete.has(e.id)),
    }
}

export const buildAutomatedMessageNode = (): AutomatedMessageNodeType => {
    const id = ulid()
    return {
        ...buildNodeCommonProperties(),
        id,
        type: 'automated_message',
        data: {
            content: {
                html: '',
                html_tkey: ulid(),
                text: '',
                text_tkey: ulid(),
            },
        },
    }
}

export const buildTextReplyNode = (): TextReplyNodeType => {
    const id = ulid()
    return {
        ...buildNodeCommonProperties(),
        id,
        type: 'text_reply',
        data: {
            content: {
                html: '',
                html_tkey: ulid(),
                text: '',
                text_tkey: ulid(),
            },
        },
    }
}

export const buildFileUploadNode = (): FileUploadNodeType => {
    const id = ulid()
    return {
        ...buildNodeCommonProperties(),
        id,
        type: 'file_upload',
        data: {
            content: {
                html: '',
                html_tkey: ulid(),
                text: '',
                text_tkey: ulid(),
            },
        },
    }
}

export const buildMultipleChoicesNode = (): MultipleChoicesNodeType => {
    const id = ulid()
    return {
        ...buildNodeCommonProperties(),
        id,
        type: 'multiple_choices',
        data: {
            content: {
                html: '',
                html_tkey: ulid(),
                text: '',
                text_tkey: ulid(),
            },
            choices: [
                {
                    event_id: ulid(),
                    label: '',
                    label_tkey: ulid(),
                },
                {
                    event_id: ulid(),
                    label: '',
                    label_tkey: ulid(),
                },
            ],
        },
    }
}

export const buildConditionsNode = (): ConditionsNodeType => {
    const id = ulid()
    return {
        ...buildNodeCommonProperties(),
        id,
        type: 'conditions',
        data: {
            name: '',
        },
    }
}

export const buildEndNode = (
    action: EndNodeType['data']['action'],
): EndNodeType => {
    const id = ulid()
    return {
        ...buildNodeCommonProperties(),
        id,
        type: 'end',
        data: {
            action,
        },
    }
}

export const buildOrderSelectionNode = (): OrderSelectionNodeType => {
    const id = ulid()
    return {
        ...buildNodeCommonProperties(),
        id,
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
}

export const buildHttpRequestNode = (): HttpRequestNodeType => {
    const id = ulid()
    return {
        ...buildNodeCommonProperties(),
        id,
        type: 'http_request',
        data: {
            name: '',
            url: '',
            method: 'GET',
            headers: [],
            variables: [],
            json: null,
            formUrlencoded: null,
            bodyContentType: null,
        },
    }
}

export const buildShopperAuthenticationNode = (
    storeIntegrationId: number,
): ShopperAuthenticationNodeType => {
    const id = ulid()
    return {
        ...buildNodeCommonProperties(),
        id,
        type: 'shopper_authentication',
        data: {
            integrationId: storeIntegrationId,
        },
    }
}

export const buildOrderLineItemSelectionNode =
    (): OrderLineItemSelectionNodeType => {
        const id = ulid()
        return {
            ...buildNodeCommonProperties(),
            id,
            type: 'order_line_item_selection',
            data: {
                content: {
                    html: '',
                    html_tkey: ulid(),
                    text: '',
                    text_tkey: ulid(),
                },
            },
        }
    }

export const buildCancelOrderNode = ({
    customerId,
    orderExternalId,
    integrationId,
}: Omit<CancelOrderNodeType['data'], 'isGreyedOut'>): CancelOrderNodeType => {
    const id = ulid()
    return {
        ...buildNodeCommonProperties(),
        id,
        type: 'cancel_order',
        data: {
            customerId,
            orderExternalId,
            integrationId,
        },
    }
}

export const buildRefundOrderNode = ({
    customerId,
    orderExternalId,
    integrationId,
}: Omit<CancelOrderNodeType['data'], 'isGreyedOut'>): RefundOrderNodeType => {
    const id = ulid()
    return {
        ...buildNodeCommonProperties(),
        id,
        type: 'refund_order',
        data: {
            customerId,
            orderExternalId,
            integrationId,
        },
    }
}

export const buildUpdateShippingAddressNode = ({
    customerId,
    orderExternalId,
    integrationId,
}: Pick<
    UpdateShippingAddressNodeType['data'],
    'customerId' | 'orderExternalId' | 'integrationId'
>): UpdateShippingAddressNodeType => {
    const id = ulid()
    return {
        ...buildNodeCommonProperties(),
        id,
        type: 'update_shipping_address',
        data: {
            customerId,
            orderExternalId,
            integrationId,
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
    }
}

export const buildRemoveItemNode = ({
    customerId,
    orderExternalId,
    integrationId,
}: Pick<
    RemoveItemNodeType['data'],
    'customerId' | 'orderExternalId' | 'integrationId'
>): RemoveItemNodeType => {
    const id = ulid()
    return {
        ...buildNodeCommonProperties(),
        id,
        type: 'remove_item',
        data: {
            customerId,
            orderExternalId,
            integrationId,
            productVariantId: '',
            quantity: '',
        },
    }
}

export const buildReplaceItemNode = ({
    customerId,
    orderExternalId,
    integrationId,
}: Pick<
    ReplaceItemNodeType['data'],
    'customerId' | 'orderExternalId' | 'integrationId'
>): ReplaceItemNodeType => {
    const id = ulid()
    return {
        ...buildNodeCommonProperties(),
        id,
        type: 'replace_item',
        data: {
            customerId,
            orderExternalId,
            integrationId,
            productVariantId: '',
            quantity: '',
            addedProductVariantId: '',
            addedQuantity: '',
        },
    }
}

export const buildCreateDiscountCodeNode = ({
    integrationId,
}: Pick<
    CreateDiscountCodeNodeType['data'],
    'integrationId'
>): CreateDiscountCodeNodeType => {
    const id = ulid()
    return {
        ...buildNodeCommonProperties(),
        id,
        type: 'create_discount_code',
        data: {
            integrationId,
            discountType: '',
            amount: '',
            validFor: '',
        },
    }
}

export const buildReshipForFreeNode = ({
    customerId,
    orderExternalId,
    integrationId,
}: Omit<
    ReshipForFreeNodeType['data'],
    'isGreyedOut'
>): ReshipForFreeNodeType => {
    const id = ulid()
    return {
        ...buildNodeCommonProperties(),
        id,
        type: 'reship_for_free',
        data: {
            customerId,
            orderExternalId,
            integrationId,
        },
    }
}

export const buildRefundShippingCostsNode = ({
    customerId,
    orderExternalId,
    integrationId,
}: Omit<
    RefundShippingCostsNodeType['data'],
    'isGreyedOut'
>): RefundShippingCostsNodeType => {
    const id = ulid()
    return {
        ...buildNodeCommonProperties(),
        id,
        type: 'refund_shipping_costs',
        data: {
            customerId,
            orderExternalId,
            integrationId,
        },
    }
}

export const buildCancelSubscriptionNode = ({
    customerId,
    integrationId,
}: Pick<
    CancelSubscriptionNodeType['data'],
    'customerId' | 'integrationId'
>): CancelSubscriptionNodeType => {
    const id = ulid()
    return {
        ...buildNodeCommonProperties(),
        id,
        type: 'cancel_subscription',
        data: {
            customerId,
            integrationId,
            subscriptionId: '',
            reason: '',
        },
    }
}

export const buildSkipChargeNode = ({
    customerId,
    integrationId,
}: Pick<
    SkipChargeNodeType['data'],
    'customerId' | 'integrationId'
>): SkipChargeNodeType => {
    const id = ulid()
    return {
        ...buildNodeCommonProperties(),
        id,
        type: 'skip_charge',
        data: {
            customerId,
            integrationId,
            subscriptionId: '',
            chargeId: '',
        },
    }
}

export const buildReusableLLMPromptCallNode = ({
    configuration_id,
    configuration_internal_id,
    values,
}: Pick<
    ReusableLLMPromptCallNodeType['data'],
    'configuration_id' | 'configuration_internal_id' | 'values'
>): ReusableLLMPromptCallNodeType => {
    const id = ulid()
    return {
        ...buildNodeCommonProperties(),
        id,
        type: 'reusable_llm_prompt_call',
        data: {
            configuration_id,
            configuration_internal_id,
            objects: {},
            custom_inputs: {},
            values,
        },
    }
}

export const buildEditOrderNoteNode = ({
    customerId,
    orderExternalId,
    integrationId,
}: Pick<
    EditOrderNoteNodeType['data'],
    'customerId' | 'orderExternalId' | 'integrationId'
>): EditOrderNoteNodeType => {
    const id = ulid()
    return {
        ...buildNodeCommonProperties(),
        id,
        type: 'edit_order_note',
        data: {
            customerId,
            orderExternalId,
            integrationId,
            note: '',
        },
    }
}

const nodeWidth = 300
const nodeHeight = 98
const nodeGap = 38

export function computeNodesPositions<
    T extends VisualBuilderTriggerNode = VisualBuilderTriggerNode,
>(g: VisualBuilderGraph<T>): VisualBuilderGraph<T> {
    const layout = flextree<VisualBuilderNode>({
        nodeSize: (node) => {
            const width = node.data.width || nodeWidth
            const height =
                node.data.height ||
                (node.data.type === 'shopper_authentication'
                    ? 80
                    : node.data.type === 'reusable_llm_prompt_trigger'
                      ? 48
                      : node.data.type === 'llm_prompt_trigger'
                        ? 88 + 34
                        : nodeHeight)

            return [width, height + nodeGap * 2]
        },
        spacing: nodeGap,
    })

    const nodesById = _keyBy(g.nodes, 'id')

    const triggerNode = g.nodes[0]

    const root = layout.hierarchy(triggerNode, (node) => {
        return g.edges
            .filter((edge) => edge.source === node.id)
            .map((edge) => nodesById[edge.target])
    })

    layout(root)

    const flextreeNodesById = _keyBy(root.nodes, 'data.id')

    const nextNodes = g.nodes.map((node) => {
        const x = flextreeNodesById[node.id]?.x ?? node.position.x
        const y = flextreeNodesById[node.id]?.y ?? node.position.y

        return { ...node, position: { x, y } }
    }) as [T, ...VisualBuilderNode[]]

    return {
        ...g,
        nodes: nextNodes,
    }
}

export function getFallibleNodeSuccessConditions(
    nodeId: string,
): WorkflowTransition['conditions'] {
    return {
        and: [
            {
                equals: [
                    {
                        var: `steps_state.${nodeId}.success`,
                    },
                    true,
                ],
            },
        ],
    }
}

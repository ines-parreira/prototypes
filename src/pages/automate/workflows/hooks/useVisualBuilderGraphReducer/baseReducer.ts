import {produce} from 'immer'

import {MessageContent} from 'pages/automate/workflows/models/workflowConfiguration.types'
import {
    buildEdgeCommonProperties,
    cleanConditionsFromEmptyVariables,
} from 'pages/automate/workflows/models/visualBuilderGraph.model'

import {
    AutomatedMessageNodeType,
    CancelSubscriptionNodeType,
    ChannelTriggerNodeType,
    EndNodeType,
    FileUploadNodeType,
    isTriggerNodeType,
    OrderLineItemSelectionNodeType,
    OrderSelectionNodeType,
    RemoveItemNodeType,
    CreateDiscountCodeNodeType,
    SkipChargeNodeType,
    TextReplyNodeType,
    UpdateShippingAddressNodeType,
    VisualBuilderEdge,
    VisualBuilderGraph,
    VisualBuilderNode,
} from '../../models/visualBuilderGraph.types'
import {getWorkflowVariableListForNode} from '../../models/variables.model'
import {
    buildAutomatedMessageNode,
    buildCancelOrderNode,
    buildCancelSubscriptionNode,
    buildEndNode,
    buildFileUploadNode,
    buildOrderLineItemSelectionNode,
    buildOrderSelectionNode,
    buildRefundOrderNode,
    buildRemoveItemNode,
    buildCreateDiscountCodeNode,
    buildShopperAuthenticationNode,
    buildSkipChargeNode,
    buildTextReplyNode,
    buildUpdateShippingAddressNode,
    computeNodesPositions,
    deleteBranch,
    getFallibleNodeSuccessConditions,
    greyOutBranch,
} from './utils'

export type VisualBuilderBaseAction =
    | {
          type: 'RESET_GRAPH'
          graph: VisualBuilderGraph
      }
    | {
          type: 'SET_NAME'
          name: string
      }
    | {
          type: 'SET_CHANNEL_TRIGGER_LABEL'
          channelTriggerNodeId: string
          label: string
      }
    | {
          type: 'SET_AUTOMATED_MESSAGE_CONTENT'
          automatedMessageNodeId: string
          content: MessageContent
      }
    | {
          type: 'SET_TEXT_REPLY_CONTENT'
          textReplyNodeId: string
          content: MessageContent
      }
    | {
          type: 'SET_FILE_UPLOAD_CONTENT'
          fileUploadNodeId: string
          content: MessageContent
      }
    | {
          type: 'SET_ORDER_SELECTION_CONTENT'
          orderSelectionNodeId: string
          content: MessageContent
      }
    | {
          type: 'SET_ORDER_LINE_ITEM_SELECTION_CONTENT'
          orderLineItemSelectionNodeId: string
          content: MessageContent
      }
    | {
          type: 'SET_END_NODE_SETTINGS'
          endNodeId: string
          settings: Pick<
              EndNodeType['data'],
              | 'action'
              | 'ticketTags'
              | 'ticketAssigneeUserId'
              | 'ticketAssigneeTeamId'
          >
      }
    | {
          type: 'INSERT_AUTOMATED_MESSAGE_NODE'
          beforeNodeId: string
      }
    | {
          type: 'INSERT_SHOPPER_AUTHENTICATION_NODE'
          beforeNodeId: string
          storeIntegrationId: number
      }
    | {
          type: 'INSERT_TEXT_REPLY_NODE'
          beforeNodeId: string
      }
    | {
          type: 'INSERT_FILE_UPLOAD_NODE'
          beforeNodeId: string
      }
    | {
          type: 'INSERT_ORDER_SELECTION_NODE'
          beforeNodeId: string
      }
    | {
          type: 'INSERT_ORDER_LINE_ITEM_SELECTION_NODE'
          beforeNodeId: string
      }
    | {
          type: 'DELETE_NODE'
          nodeId: string
      }
    | {
          type: 'DELETE_BRANCH'
          nodeId: string
      }
    | {
          type: 'GREY_OUT_BRANCH'
          nodeId: string
          isGreyedOut: boolean
      }
    | {
          type: 'SET_NODE_EDITING_ID'
          nodeId: string
      }
    | {
          type: 'CLOSE_EDITOR'
      }
    | {
          type: 'INSERT_CANCEL_ORDER_NODE'
          beforeNodeId: string
          customerId: string
          orderExternalId: string
          integrationId: string
      }
    | {
          type: 'INSERT_REFUND_ORDER_NODE'
          beforeNodeId: string
          customerId: string
          orderExternalId: string
          integrationId: string
      }
    | {
          type: 'INSERT_UPDATE_SHIPPING_ADDRESS_NODE'
          beforeNodeId: string
          customerId: string
          orderExternalId: string
          integrationId: string
      }
    | {
          type: 'SET_UPDATE_SHIPPING_ADDRESS_NODE_SETTINGS'
          updateShippingAddressNodeId: string
          name: string
          address1: string
          address2: string
          city: string
          zip: string
          province: string
          country: string
          phone: string
          lastName: string
          firstName: string
      }
    | {
          type: 'INSERT_REMOVE_ITEM_NODE'
          beforeNodeId: string
          customerId: string
          orderExternalId: string
          integrationId: string
      }
    | {
          type: 'SET_REMOVE_ITEM_NODE_SETTINGS'
          removeItemNodeId: string
          productVariantId: string
          quantity: string
      }
    | {
          type: 'INSERT_CREATE_DISCOUNT_CODE_NODE'
          beforeNodeId: string
          customerId: string
          integrationId: string
      }
    | {
          type: 'SET_CREATE_DISCOUNT_CODE_NODE_SETTINGS'
          createDiscountCodeNodeId: string
          discountType: string
          amount: string
          validFor: string
      }
    | {
          type: 'SET_BRANCH_IDS_EDITING'
          branchIds: VisualBuilderEdge['id'][]
      }
    | {
          type: 'ADD_BRANCH_ID_EDITING'
          branchId: VisualBuilderEdge['id']
      }
    | {
          type: 'SET_APPS'
          apps: NonNullable<VisualBuilderGraph['apps']>
      }
    | {
          type: 'SET_INPUTS'
          inputs: VisualBuilderGraph['inputs']
      }
    | {
          type: 'INSERT_CANCEL_SUBSCRIPTION_NODE'
          beforeNodeId: string
          customerId: string
          integrationId: string
      }
    | {
          type: 'INSERT_SKIP_CHARGE_NODE'
          beforeNodeId: string
          customerId: string
          integrationId: string
      }
    | {
          type: 'SET_CANCEL_SUBSCRIPTION_NODE_SETTINGS'
          cancelSubscriptionNodeId: string
          subscriptionId: string
          reason: string
      }
    | {
          type: 'SET_SKIP_CHARGE_NODE_SETTINGS'
          skipChargeNodeId: string
          subscriptionId: string
          chargeId: string
      }

export function baseReducer(
    graph: VisualBuilderGraph,
    action: VisualBuilderBaseAction
): VisualBuilderGraph {
    switch (action.type) {
        case 'RESET_GRAPH':
            return computeNodesPositions(action.graph)
        case 'SET_NODE_EDITING_ID':
            return produce(graph, (draft) => {
                if (draft.nodeEditingId !== action.nodeId) {
                    draft.nodeEditingId = action.nodeId
                    draft.choiceEventIdEditing = null
                    draft.branchIdsEditing = []
                }
            })
        case 'SET_NAME':
            return produce(graph, (draft) => {
                draft.name = action.name
            })
        case 'CLOSE_EDITOR':
            return produce(graph, (draft) => {
                draft.nodeEditingId = null
                draft.choiceEventIdEditing = null
                draft.branchIdsEditing = []
            })
        case 'SET_CHANNEL_TRIGGER_LABEL':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is ChannelTriggerNodeType =>
                        n.id === action.channelTriggerNodeId &&
                        n.type === 'channel_trigger'
                )
                if (node) node.data.label = action.label
            })
        case 'SET_AUTOMATED_MESSAGE_CONTENT':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is AutomatedMessageNodeType =>
                        n.id === action.automatedMessageNodeId &&
                        n.type === 'automated_message'
                )
                if (node) {
                    node.data.content = action.content
                }
            })
        case 'SET_TEXT_REPLY_CONTENT':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is TextReplyNodeType =>
                        n.id === action.textReplyNodeId &&
                        n.type === 'text_reply'
                )
                if (node) {
                    node.data.content = action.content
                }
            })
        case 'SET_FILE_UPLOAD_CONTENT':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is FileUploadNodeType =>
                        n.id === action.fileUploadNodeId &&
                        n.type === 'file_upload'
                )
                if (node) {
                    node.data.content = action.content
                }
            })
        case 'SET_ORDER_SELECTION_CONTENT':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is OrderSelectionNodeType =>
                        n.id === action.orderSelectionNodeId &&
                        n.type === 'order_selection'
                )
                if (node) {
                    node.data.content = action.content
                }
            })
        case 'SET_ORDER_LINE_ITEM_SELECTION_CONTENT':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is OrderLineItemSelectionNodeType =>
                        n.id === action.orderLineItemSelectionNodeId &&
                        n.type === 'order_line_item_selection'
                )
                if (node) {
                    node.data.content = action.content
                }
            })
        case 'SET_END_NODE_SETTINGS':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is EndNodeType => n.id === action.endNodeId
                )
                if (node) {
                    node.data.action = action.settings.action
                    node.data.ticketAssigneeTeamId =
                        action.settings.ticketAssigneeTeamId
                    node.data.ticketAssigneeUserId =
                        action.settings.ticketAssigneeUserId
                    node.data.ticketTags = action.settings.ticketTags
                }
            })
        case 'INSERT_AUTOMATED_MESSAGE_NODE':
            return computeNodesPositions(
                insertNodeBefore(
                    graph,
                    buildAutomatedMessageNode(),
                    action.beforeNodeId
                )
            )
        case 'INSERT_TEXT_REPLY_NODE':
            return computeNodesPositions(
                insertNodeBefore(
                    graph,
                    buildTextReplyNode(),
                    action.beforeNodeId
                )
            )
        case 'INSERT_FILE_UPLOAD_NODE':
            return computeNodesPositions(
                insertNodeBefore(
                    graph,
                    buildFileUploadNode(),
                    action.beforeNodeId
                )
            )
        case 'INSERT_SHOPPER_AUTHENTICATION_NODE':
            return computeNodesPositions(
                insertNodeBefore(
                    graph,
                    buildShopperAuthenticationNode(action.storeIntegrationId),
                    action.beforeNodeId
                )
            )
        case 'INSERT_ORDER_SELECTION_NODE':
            return computeNodesPositions(
                insertNodeBefore(
                    graph,
                    buildOrderSelectionNode(),
                    action.beforeNodeId
                )
            )
        case 'INSERT_ORDER_LINE_ITEM_SELECTION_NODE':
            return computeNodesPositions(
                insertNodeBefore(
                    graph,
                    buildOrderLineItemSelectionNode(),
                    action.beforeNodeId
                )
            )
        case 'DELETE_NODE':
            return computeNodesPositions(
                produce(graph, (draft) => {
                    const nodeIndex = draft.nodes.findIndex(
                        (n) => n.id === action.nodeId
                    )
                    if (nodeIndex === -1) return
                    draft.nodes.splice(nodeIndex, 1)
                    const incomingEdge = draft.edges.find(
                        (e) => e.target === action.nodeId
                    )
                    const outgoingEdges = draft.edges.filter(
                        (e) => e.source === action.nodeId
                    )
                    if (incomingEdge && outgoingEdges.length === 1) {
                        incomingEdge.target = outgoingEdges[0].target

                        // preserve edge ordering
                        draft.edges = [
                            ...draft.edges
                                .filter((e) => e.source !== action.nodeId)
                                .map((edge) => {
                                    // Removes variables from conditions that are associated with the deleted choice
                                    if (edge.data?.conditions) {
                                        edge.data.conditions =
                                            cleanConditionsFromEmptyVariables(
                                                edge.data.conditions,
                                                getWorkflowVariableListForNode(
                                                    draft,
                                                    edge.target
                                                )
                                            )
                                        return edge
                                    }
                                    return edge
                                }),
                        ]
                    }
                })
            )
        case 'DELETE_BRANCH': {
            const triggerNode = graph.nodes.find(isTriggerNodeType)!
            const nextGraph = deleteBranch(graph, action.nodeId, {
                keepIncomingEdge: true,
            })
            return computeNodesPositions(
                produce(nextGraph, (draft) => {
                    const incomingEdge = draft.edges.find(
                        (e) => e.target === action.nodeId
                    )
                    if (!incomingEdge) return
                    const endNode = buildEndNode(
                        triggerNode.type === 'llm_prompt_trigger'
                            ? 'end'
                            : 'ask-for-feedback'
                    )
                    draft.nodes.push(endNode)
                    incomingEdge.target = endNode.id
                })
            )
        }
        case 'GREY_OUT_BRANCH': {
            return greyOutBranch(graph, action.nodeId, action.isGreyedOut)
        }
        case 'INSERT_CANCEL_ORDER_NODE':
            return computeNodesPositions(
                insertFallibleNode(
                    graph,
                    buildCancelOrderNode(action),
                    action.beforeNodeId
                )
            )
        case 'INSERT_REFUND_ORDER_NODE':
            return computeNodesPositions(
                insertFallibleNode(
                    graph,
                    buildRefundOrderNode(action),
                    action.beforeNodeId
                )
            )
        case 'INSERT_UPDATE_SHIPPING_ADDRESS_NODE':
            return computeNodesPositions(
                insertFallibleNode(
                    graph,
                    buildUpdateShippingAddressNode(action),
                    action.beforeNodeId
                )
            )
        case 'INSERT_REMOVE_ITEM_NODE':
            return computeNodesPositions(
                insertFallibleNode(
                    graph,
                    buildRemoveItemNode(action),
                    action.beforeNodeId
                )
            )
        case 'INSERT_CREATE_DISCOUNT_CODE_NODE':
            return computeNodesPositions(
                insertFallibleNode(
                    graph,
                    buildCreateDiscountCodeNode(action),
                    action.beforeNodeId
                )
            )
        case 'INSERT_CANCEL_SUBSCRIPTION_NODE':
            return computeNodesPositions(
                insertFallibleNode(
                    graph,
                    buildCancelSubscriptionNode(action),
                    action.beforeNodeId
                )
            )
        case 'INSERT_SKIP_CHARGE_NODE':
            return computeNodesPositions(
                insertFallibleNode(
                    graph,
                    buildSkipChargeNode(action),
                    action.beforeNodeId
                )
            )
        case 'SET_BRANCH_IDS_EDITING':
            return produce(graph, (draft) => {
                draft.branchIdsEditing = action.branchIds
            })
        case 'ADD_BRANCH_ID_EDITING':
            return produce(graph, (draft) => {
                draft.branchIdsEditing ??= []
                draft.branchIdsEditing.push(action.branchId)
            })
        case 'SET_APPS':
            return produce(graph, (draft) => {
                draft.apps = action.apps
            })
        case 'SET_INPUTS':
            return produce(graph, (draft) => {
                draft.inputs = action.inputs
            })
        case 'SET_UPDATE_SHIPPING_ADDRESS_NODE_SETTINGS':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is UpdateShippingAddressNodeType =>
                        n.id === action.updateShippingAddressNodeId
                )

                if (node) {
                    node.data.name = action.name
                    node.data.address1 = action.address1
                    node.data.address2 = action.address2
                    node.data.city = action.city
                    node.data.zip = action.zip
                    node.data.province = action.province
                    node.data.country = action.country
                    node.data.phone = action.phone
                    node.data.lastName = action.lastName
                    node.data.firstName = action.firstName
                }
            })
        case 'SET_REMOVE_ITEM_NODE_SETTINGS':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is RemoveItemNodeType =>
                        n.id === action.removeItemNodeId
                )

                if (node) {
                    node.data.productVariantId = action.productVariantId
                    node.data.quantity = action.quantity
                }
            })
        case 'SET_CREATE_DISCOUNT_CODE_NODE_SETTINGS':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is CreateDiscountCodeNodeType =>
                        n.id === action.createDiscountCodeNodeId
                )

                if (node) {
                    node.data.amount = action.amount
                    node.data.validFor = action.validFor
                    node.data.discountType = action.discountType
                }
            })
        case 'SET_CANCEL_SUBSCRIPTION_NODE_SETTINGS':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is CancelSubscriptionNodeType =>
                        n.id === action.cancelSubscriptionNodeId
                )

                if (node) {
                    node.data.subscriptionId = action.subscriptionId
                    node.data.reason = action.reason
                }
            })
        case 'SET_SKIP_CHARGE_NODE_SETTINGS':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is SkipChargeNodeType =>
                        n.id === action.skipChargeNodeId
                )

                if (node) {
                    node.data.subscriptionId = action.subscriptionId
                    node.data.chargeId = action.chargeId
                }
            })
    }
}

function insertNodeBefore(
    graph: VisualBuilderGraph,
    nodeToInsert: VisualBuilderNode,
    beforeNodeId: string
) {
    return produce(graph, (draft) => {
        const edge = draft.edges.find((e) => e.target === beforeNodeId)
        if (!edge) return
        draft.nodes.push(nodeToInsert)
        edge.target = nodeToInsert.id
        const newEdge = {
            ...buildEdgeCommonProperties(),
            source: nodeToInsert.id,
            target: beforeNodeId,
        }
        draft.edges.push(newEdge)

        if (
            nodeToInsert.type !== 'refund_order' &&
            nodeToInsert.type !== 'cancel_order' &&
            nodeToInsert.type !== 'create_discount_code'
        ) {
            draft.nodeEditingId = nodeToInsert.id
            draft.choiceEventIdEditing = null
            draft.branchIdsEditing = []
        }
    })
}

function insertFallibleNode(
    graph: VisualBuilderGraph,
    nodeToInsert: VisualBuilderNode,
    beforeNodeId: string
) {
    const triggerNode = graph.nodes.find(isTriggerNodeType)!

    return produce(graph, (draft) => {
        const edge = draft.edges.find((e) => e.target === beforeNodeId)
        if (!edge) return
        const endNode = buildEndNode(
            triggerNode.type === 'llm_prompt_trigger' ? 'end' : 'create-ticket'
        )

        draft.nodes.push(nodeToInsert, endNode)
        edge.target = nodeToInsert.id
        draft.edges.push(
            {
                ...buildEdgeCommonProperties(),
                source: nodeToInsert.id,
                target: beforeNodeId,
                data: {
                    name: 'Success',
                    conditions: getFallibleNodeSuccessConditions(
                        nodeToInsert.id
                    ),
                },
            },
            {
                ...buildEdgeCommonProperties(),
                source: nodeToInsert.id,
                target: endNode.id,
                data: {
                    name: 'Error',
                },
            }
        )

        if (
            nodeToInsert.type !== 'refund_order' &&
            nodeToInsert.type !== 'cancel_order' &&
            nodeToInsert.type !== 'create_discount_code'
        ) {
            draft.nodeEditingId = nodeToInsert.id
            draft.choiceEventIdEditing = null
            draft.branchIdsEditing = []
        }
    })
}

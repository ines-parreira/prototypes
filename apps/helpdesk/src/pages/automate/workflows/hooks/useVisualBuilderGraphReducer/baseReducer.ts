import { produce } from 'immer'
import _merge from 'lodash/merge'

import type { App } from 'pages/automate/actionsPlatform/types'
import {
    buildEdgeCommonProperties,
    cleanConditionsFromEmptyVariables,
} from 'pages/automate/workflows/models/visualBuilderGraph.model'
import type {
    MessageContent,
    WorkflowConfiguration,
} from 'pages/automate/workflows/models/workflowConfiguration.types'

import { getWorkflowVariableListForNode } from '../../models/variables.model'
import type {
    AutomatedMessageNodeType,
    CancelSubscriptionNodeType,
    ChannelTriggerNodeType,
    CreateDiscountCodeNodeType,
    EndNodeType,
    FileUploadNodeType,
    OrderLineItemSelectionNodeType,
    OrderSelectionNodeType,
    RemoveItemNodeType,
    ReplaceItemNodeType,
    ReusableLLMPromptCallNodeType,
    SkipChargeNodeType,
    TextReplyNodeType,
    UpdateShippingAddressNodeType,
    VisualBuilderEdge,
    VisualBuilderErrors,
    VisualBuilderGraph,
    VisualBuilderGraphAppApp,
    VisualBuilderNode,
    VisualBuilderTouched,
} from '../../models/visualBuilderGraph.types'
import {
    buildAutomatedMessageNode,
    buildCancelOrderNode,
    buildCancelSubscriptionNode,
    buildCreateDiscountCodeNode,
    buildEditOrderNoteNode,
    buildEndNode,
    buildFileUploadNode,
    buildOrderLineItemSelectionNode,
    buildOrderSelectionNode,
    buildRefundOrderNode,
    buildRefundShippingCostsNode,
    buildRemoveItemNode,
    buildReplaceItemNode,
    buildReshipForFreeNode,
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
          steps: WorkflowConfiguration[]
          apps: App[]
      }
    | {
          type: 'DELETE_BRANCH'
          nodeId: string
          steps: WorkflowConfiguration[]
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
          type: 'INSERT_REFUND_SHIPPING_COSTS_NODE'
          beforeNodeId: string
          customerId: string
          orderExternalId: string
          integrationId: string
      }
    | {
          type: 'INSERT_RESHIP_FOR_FREE_NODE'
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
          type: 'INSERT_REPLACE_ITEM_NODE'
          beforeNodeId: string
          customerId: string
          orderExternalId: string
          integrationId: string
      }
    | {
          type: 'SET_REPLACE_ITEM_NODE_SETTINGS'
          replaceItemNodeId: string
          productVariantId: string
          quantity: string
          addedProductVariantId: string
          addedQuantity: string
      }
    | {
          type: 'INSERT_CREATE_DISCOUNT_CODE_NODE'
          beforeNodeId: string
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
          type: 'SET_APP_API_KEY'
          appId: string
          apiKey: string
      }
    | {
          type: 'SET_APP_REFRESH_TOKEN'
          appId: string
          refreshToken: string
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
    | {
          type: 'SET_CATEGORY'
          category: string
      }
    | {
          type: 'SET_ERRORS'
          nodeId?: string
          appId?: string
          errors: VisualBuilderErrors | null
      }
    | {
          type: 'SET_TOUCHED'
          nodeId?: string
          appId?: string
          touched: VisualBuilderTouched | null
      }
    | {
          type: 'MIGRATE_TO_ADVANCED_STEP_BUILDER'
      }
    | {
          type: 'INSERT_EDIT_ORDER_NOTE_NODE'
          beforeNodeId: string
          customerId: string
          orderExternalId: string
          integrationId: string
      }

export function baseReducer(
    graph: VisualBuilderGraph,
    action: VisualBuilderBaseAction,
): VisualBuilderGraph {
    switch (action.type) {
        case 'RESET_GRAPH':
            return computeNodesPositions(action.graph)
        case 'MIGRATE_TO_ADVANCED_STEP_BUILDER':
            return produce(graph, (draft) => {
                draft.advanced_datetime = new Date()
            })
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
                        n.type === 'channel_trigger',
                )
                if (node) {
                    // If the name of the flow is the same as the channel label, sync changes between them.
                    if (draft.name === node.data.label) {
                        draft.name = action.label
                    }
                    node.data.label = action.label
                }
            })
        case 'SET_AUTOMATED_MESSAGE_CONTENT':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is AutomatedMessageNodeType =>
                        n.id === action.automatedMessageNodeId &&
                        n.type === 'automated_message',
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
                        n.type === 'text_reply',
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
                        n.type === 'file_upload',
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
                        n.type === 'order_selection',
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
                        n.type === 'order_line_item_selection',
                )
                if (node) {
                    node.data.content = action.content
                }
            })
        case 'SET_END_NODE_SETTINGS':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is EndNodeType => n.id === action.endNodeId,
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
                    action.beforeNodeId,
                ),
            )
        case 'INSERT_TEXT_REPLY_NODE':
            return computeNodesPositions(
                insertNodeBefore(
                    graph,
                    buildTextReplyNode(),
                    action.beforeNodeId,
                ),
            )
        case 'INSERT_FILE_UPLOAD_NODE':
            return computeNodesPositions(
                insertNodeBefore(
                    graph,
                    buildFileUploadNode(),
                    action.beforeNodeId,
                ),
            )
        case 'INSERT_SHOPPER_AUTHENTICATION_NODE':
            return computeNodesPositions(
                insertNodeBefore(
                    graph,
                    buildShopperAuthenticationNode(action.storeIntegrationId),
                    action.beforeNodeId,
                ),
            )
        case 'INSERT_ORDER_SELECTION_NODE':
            return computeNodesPositions(
                insertNodeBefore(
                    graph,
                    buildOrderSelectionNode(),
                    action.beforeNodeId,
                ),
            )
        case 'INSERT_ORDER_LINE_ITEM_SELECTION_NODE':
            return computeNodesPositions(
                insertNodeBefore(
                    graph,
                    buildOrderLineItemSelectionNode(),
                    action.beforeNodeId,
                ),
            )
        case 'DELETE_NODE': {
            return computeNodesPositions(
                produce(graph, (draft) => {
                    const nodeIndex = draft.nodes.findIndex(
                        (n) => n.id === action.nodeId,
                    )
                    if (nodeIndex === -1) return

                    const node = draft.nodes[nodeIndex]

                    draft.nodes.splice(nodeIndex, 1)
                    const incomingEdge = draft.edges.find(
                        (e) => e.target === action.nodeId,
                    )
                    const outgoingEdges = draft.edges.filter(
                        (e) => e.source === action.nodeId,
                    )

                    if (incomingEdge) {
                        incomingEdge.target = outgoingEdges[0].target

                        for (
                            let index = 1;
                            index < outgoingEdges.length;
                            index++
                        ) {
                            const { nodes, edges } = deleteBranch(
                                draft,
                                outgoingEdges[index].target,
                            )

                            draft.nodes = nodes
                            draft.edges = edges
                        }

                        // preserve edge ordering
                        draft.edges = draft.edges
                            .filter((e) => e.source !== action.nodeId)
                            .map((edge) => {
                                // Removes variables from conditions that are associated with the deleted choice
                                if (edge.data?.conditions) {
                                    edge.data.conditions =
                                        cleanConditionsFromEmptyVariables(
                                            edge.data.conditions,
                                            getWorkflowVariableListForNode(
                                                draft,
                                                edge.target,
                                                action.steps,
                                                action.apps,
                                            ),
                                        )
                                    return edge
                                }
                                return edge
                            })
                    }

                    if (
                        node.type === 'reusable_llm_prompt_call' &&
                        draft.apps &&
                        !draft.isTemplate
                    ) {
                        const appUsage = computeAppUsage(draft, action.steps)

                        draft.apps = draft.apps.filter((app) => {
                            switch (app.type) {
                                case 'shopify':
                                case 'recharge':
                                    return app.type in appUsage
                                case 'app':
                                    return app.app_id in appUsage
                            }
                        })
                    }

                    // Clean up unused inputs from trigger node after deleting reusable LLM prompt call nodes
                    if (node.type === 'reusable_llm_prompt_call') {
                        cleanupUnusedTriggerInputs(draft, action.steps)
                    }
                }),
            )
        }
        case 'DELETE_BRANCH': {
            const triggerNode = graph.nodes[0]
            const nextGraph = deleteBranch(graph, action.nodeId, {
                keepIncomingEdge: true,
            })
            return computeNodesPositions(
                produce(nextGraph, (draft) => {
                    const incomingEdge = draft.edges.find(
                        (e) => e.target === action.nodeId,
                    )
                    if (!incomingEdge) return
                    const endNode = buildEndNode(
                        triggerNode.type === 'channel_trigger'
                            ? 'ask-for-feedback'
                            : 'end-success',
                    )
                    draft.nodes.push(endNode)
                    incomingEdge.target = endNode.id

                    if (draft.apps && !draft.isTemplate) {
                        const appUsage = computeAppUsage(draft, action.steps)

                        draft.apps = draft.apps.filter((app) => {
                            switch (app.type) {
                                case 'shopify':
                                case 'recharge':
                                    return app.type in appUsage
                                case 'app':
                                    return app.app_id in appUsage
                            }
                        })
                    }

                    // Clean up unused inputs from trigger node after deleting branch
                    cleanupUnusedTriggerInputs(draft, action.steps)
                }),
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
                    action.beforeNodeId,
                ),
            )
        case 'INSERT_REFUND_ORDER_NODE':
            return computeNodesPositions(
                insertFallibleNode(
                    graph,
                    buildRefundOrderNode(action),
                    action.beforeNodeId,
                ),
            )
        case 'INSERT_UPDATE_SHIPPING_ADDRESS_NODE':
            return computeNodesPositions(
                insertFallibleNode(
                    graph,
                    buildUpdateShippingAddressNode(action),
                    action.beforeNodeId,
                ),
            )
        case 'INSERT_REMOVE_ITEM_NODE':
            return computeNodesPositions(
                insertFallibleNode(
                    graph,
                    buildRemoveItemNode(action),
                    action.beforeNodeId,
                ),
            )
        case 'INSERT_REPLACE_ITEM_NODE':
            return computeNodesPositions(
                insertFallibleNode(
                    graph,
                    buildReplaceItemNode(action),
                    action.beforeNodeId,
                ),
            )
        case 'INSERT_CREATE_DISCOUNT_CODE_NODE':
            return computeNodesPositions(
                insertFallibleNode(
                    graph,
                    buildCreateDiscountCodeNode(action),
                    action.beforeNodeId,
                ),
            )
        case 'INSERT_REFUND_SHIPPING_COSTS_NODE':
            return computeNodesPositions(
                insertFallibleNode(
                    graph,
                    buildRefundShippingCostsNode(action),
                    action.beforeNodeId,
                ),
            )
        case 'INSERT_EDIT_ORDER_NOTE_NODE':
            return computeNodesPositions(
                insertFallibleNode(
                    graph,
                    buildEditOrderNoteNode(action),
                    action.beforeNodeId,
                ),
            )
        case 'INSERT_RESHIP_FOR_FREE_NODE':
            return computeNodesPositions(
                insertFallibleNode(
                    graph,
                    buildReshipForFreeNode(action),
                    action.beforeNodeId,
                ),
            )
        case 'INSERT_CANCEL_SUBSCRIPTION_NODE':
            return computeNodesPositions(
                insertFallibleNode(
                    graph,
                    buildCancelSubscriptionNode(action),
                    action.beforeNodeId,
                ),
            )
        case 'INSERT_SKIP_CHARGE_NODE':
            return computeNodesPositions(
                insertFallibleNode(
                    graph,
                    buildSkipChargeNode(action),
                    action.beforeNodeId,
                ),
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
                        n.id === action.updateShippingAddressNodeId,
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
                        n.id === action.removeItemNodeId,
                )

                if (node) {
                    node.data.productVariantId = action.productVariantId
                    node.data.quantity = action.quantity
                }
            })
        case 'SET_REPLACE_ITEM_NODE_SETTINGS':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is ReplaceItemNodeType =>
                        n.id === action.replaceItemNodeId,
                )

                if (node) {
                    node.data.productVariantId = action.productVariantId
                    node.data.quantity = action.quantity
                    node.data.addedProductVariantId =
                        action.addedProductVariantId
                    node.data.addedQuantity = action.addedQuantity
                }
            })
        case 'SET_CREATE_DISCOUNT_CODE_NODE_SETTINGS':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is CreateDiscountCodeNodeType =>
                        n.id === action.createDiscountCodeNodeId,
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
                        n.id === action.cancelSubscriptionNodeId,
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
                        n.id === action.skipChargeNodeId,
                )

                if (node) {
                    node.data.subscriptionId = action.subscriptionId
                    node.data.chargeId = action.chargeId
                }
            })
        case 'SET_APP_API_KEY':
            return produce(graph, (draft) => {
                const app = draft.apps?.find(
                    (app): app is VisualBuilderGraphAppApp =>
                        app.type === 'app' && app.app_id === action.appId,
                )

                if (app) {
                    app.api_key = action.apiKey
                }
            })
        case 'SET_APP_REFRESH_TOKEN':
            return produce(graph, (draft) => {
                const app = draft.apps?.find(
                    (app): app is VisualBuilderGraphAppApp =>
                        app.type === 'app' && app.app_id === action.appId,
                )

                if (app) {
                    app.refresh_token = action.refreshToken
                }
            })
        case 'SET_CATEGORY':
            return produce(graph, (draft) => {
                draft.category = action.category
            })
        case 'SET_ERRORS':
            return produce(graph, (draft) => {
                if (action.nodeId) {
                    const node = draft.nodes.find((n) => n.id === action.nodeId)

                    if (node) {
                        node.data.errors = action.errors
                    }
                } else if (action.appId) {
                    for (const app of draft.apps ?? []) {
                        if (app.type === 'app' && app.app_id === action.appId) {
                            app.errors = action.errors

                            break
                        }
                    }
                } else {
                    draft.errors = action.errors
                }
            })
        case 'SET_TOUCHED':
            return produce(graph, (draft) => {
                if (action.nodeId) {
                    const node = draft.nodes.find((n) => n.id === action.nodeId)

                    if (node) {
                        node.data.touched = _merge(
                            node.data.touched,
                            action.touched,
                        )
                    }
                } else if (action.appId) {
                    for (const app of draft.apps ?? []) {
                        if (app.type === 'app' && app.app_id === action.appId) {
                            app.touched = action.touched

                            break
                        }
                    }
                } else {
                    draft.touched = _merge(draft.touched, action.touched)
                }
            })
    }
}

export function insertNodeBefore(
    graph: VisualBuilderGraph,
    nodeToInsert: VisualBuilderNode,
    beforeNodeId: string,
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
    beforeNodeId: string,
) {
    const triggerNode = graph.nodes[0]

    return produce(graph, (draft) => {
        const edge = draft.edges.find((e) => e.target === beforeNodeId)
        if (!edge) return
        const endNode = buildEndNode(
            triggerNode.type === 'channel_trigger'
                ? 'ask-for-feedback'
                : 'end-failure',
        )

        const targetNode = draft.nodes.find((node) => node.id === beforeNodeId)

        if (
            targetNode?.type === 'end' &&
            targetNode.data.action === 'end-failure'
        ) {
            targetNode.data.action = 'end-success'
        }

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
                        nodeToInsert.id,
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
            },
        )

        if (
            nodeToInsert.type !== 'refund_order' &&
            nodeToInsert.type !== 'cancel_order' &&
            nodeToInsert.type !== 'reship_for_free' &&
            nodeToInsert.type !== 'refund_shipping_costs' &&
            nodeToInsert.type !== 'create_discount_code' &&
            nodeToInsert.type !== 'edit_order_note'
        ) {
            draft.nodeEditingId = nodeToInsert.id
            draft.choiceEventIdEditing = null
            draft.branchIdsEditing = []
        }
    })
}

function computeAppUsage(
    graph: VisualBuilderGraph,
    steps: WorkflowConfiguration[],
) {
    return graph.nodes.reduce<Record<string, boolean>>((acc, node) => {
        switch (node.type) {
            case 'reusable_llm_prompt_call': {
                const step = steps.find(
                    (step) =>
                        step.id === node.data.configuration_id &&
                        step.internal_id ===
                            node.data.configuration_internal_id,
                )

                if (step && step.apps) {
                    const app = step.apps[0]

                    switch (app.type) {
                        case 'shopify':
                        case 'recharge':
                            acc[app.type] = true
                            break
                        case 'app':
                            acc[app.app_id] = true
                            break
                    }
                }

                break
            }
            case 'cancel_order':
            case 'refund_order':
            case 'update_shipping_address':
            case 'remove_item':
            case 'replace_item':
            case 'create_discount_code':
            case 'reship_for_free':
            case 'refund_shipping_costs':
            case 'edit_order_note':
                acc['shopify'] = true
                break
            case 'cancel_subscription':
            case 'skip_charge':
                acc['recharge'] = true
                break
        }

        return acc
    }, {})
}

function cleanupUnusedTriggerInputs(
    draft: VisualBuilderGraph,
    steps: WorkflowConfiguration[],
) {
    const triggerNode = draft.nodes[0]

    if (
        triggerNode.type !== 'llm_prompt_trigger' &&
        triggerNode.type !== 'reusable_llm_prompt_trigger'
    ) {
        return
    }

    // Get all remaining reusable LLM prompt call nodes
    const remainingCallNodes = draft.nodes.filter(
        (node): node is ReusableLLMPromptCallNodeType =>
            node.type === 'reusable_llm_prompt_call',
    )

    // Collect all inputs still needed by remaining nodes
    const neededInputs = new Set<string>()

    remainingCallNodes.forEach((callNode) => {
        const step = steps.find(
            (step) =>
                step.id === callNode.data.configuration_id &&
                step.internal_id === callNode.data.configuration_internal_id,
        )

        if (!step || !step.triggers) return

        const trigger = step.triggers.find(
            (
                t,
            ): t is Extract<
                NonNullable<WorkflowConfiguration['triggers']>[number],
                { kind: 'reusable-llm-prompt' }
            > => t.kind === 'reusable-llm-prompt',
        )

        if (!trigger) return

        // Mark custom inputs as needed
        trigger.settings.custom_inputs.forEach((input) => {
            const triggerInput = triggerNode.data.inputs.find(
                (triggerInput) => {
                    return (
                        'data_type' in triggerInput &&
                        triggerInput.name === input.name &&
                        triggerInput.instructions === input.instructions &&
                        triggerInput.data_type === input.data_type
                    )
                },
            )
            if (triggerInput) {
                neededInputs.add(triggerInput.id)
            }
        })

        // Mark product inputs as needed
        trigger.settings.object_inputs.forEach((input) => {
            if (input.kind === 'product') {
                const triggerInput = triggerNode.data.inputs.find(
                    (triggerInput) => {
                        return (
                            'kind' in triggerInput &&
                            triggerInput.name === input.name &&
                            triggerInput.instructions === input.instructions &&
                            triggerInput.kind === input.kind
                        )
                    },
                )
                if (triggerInput) {
                    neededInputs.add(triggerInput.id)
                }
            }
        })
    })

    // Remove inputs that are no longer needed
    triggerNode.data.inputs = triggerNode.data.inputs.filter((input) =>
        neededInputs.has(input.id),
    )
}

import React, { useRef, useState } from 'react'

import {
    useVisualBuilderContext,
    VisualBuilderContextType,
} from 'pages/automate/workflows/hooks/useVisualBuilder'

import EdgeIconButton from './EdgeIconButton'
import EdgeLabel from './EdgeLabel'
import NodeMenu from './NodeMenu'

import css from './EdgeBlock.less'

export type VisualBuilderEdgeProps = {
    nodeId: string
    isSelected: boolean
    incomingChoice?: {
        label: string
        eventId: string
        nodeId: string
    }
    incomingCondition?: {
        id: string
        label: string
        nodeId: string
        isFallback: boolean
    }
    incomingHttpRequestCondition?: {
        label: string
        nodeId: string
    }
    incomingCancelOrderCondition?: {
        label: string
        nodeId: string
    }
    incomingRefundOrderCondition?: {
        label: string
        nodeId: string
    }
    incomingUpdateShippingAddressCondition?: {
        label: string
        nodeId: string
    }
    incomingRemoveItemCondition?: {
        label: string
        nodeId: string
    }
    incomingReplaceItemCondition?: {
        label: string
        nodeId: string
    }
    incomingCreateDiscountCodeCondition?: {
        label: string
        nodeId: string
    }
    incomingReshipForFreeCondition?: {
        label: string
        nodeId: string
    }
    incomingRefundShippingCostsCondition?: {
        label: string
        nodeId: string
    }
    incomingCancelSubscriptionCondition?: {
        label: string
        nodeId: string
    }
    incomingSkipChargeCondition?: {
        label: string
        nodeId: string
    }
    incomingReusableLLMPromptCallCondition?: {
        label: string
        nodeId: string
        isClickable: boolean
    }
    incomingEditOrderNoteCondition?: {
        label: string
        nodeId: string
    }
} & Pick<VisualBuilderContextType, 'dispatch'>

export default function EdgeBlock({
    nodeId,
    incomingChoice,
    incomingCondition,
    incomingHttpRequestCondition,
    incomingCancelOrderCondition,
    incomingRefundOrderCondition,
    incomingUpdateShippingAddressCondition,
    incomingRemoveItemCondition,
    incomingReplaceItemCondition,
    incomingCreateDiscountCodeCondition,
    incomingRefundShippingCostsCondition,
    incomingReshipForFreeCondition,
    incomingCancelSubscriptionCondition,
    incomingSkipChargeCondition,
    incomingReusableLLMPromptCallCondition,
    incomingEditOrderNoteCondition,
    isSelected,
    dispatch,
}: VisualBuilderEdgeProps) {
    const edgeRef = useRef<HTMLDivElement>(null)
    const [menuRef, setMenuRef] = useState<HTMLElement | null>(null)
    const [isNodeMenuDropdownOpen, setIsNodeMenuDropdownOpen] = useState(false)
    const { visualBuilderGraph } = useVisualBuilderContext()

    return (
        <div
            className={css.addNodeIconContainer}
            onClick={(e) => {
                e.stopPropagation()
            }}
            style={{
                top:
                    incomingChoice ||
                    incomingCondition ||
                    incomingHttpRequestCondition ||
                    incomingCancelOrderCondition ||
                    incomingRefundOrderCondition ||
                    incomingUpdateShippingAddressCondition ||
                    incomingRemoveItemCondition ||
                    incomingReplaceItemCondition ||
                    incomingCreateDiscountCodeCondition ||
                    incomingReshipForFreeCondition ||
                    incomingRefundShippingCostsCondition ||
                    incomingCancelSubscriptionCondition ||
                    incomingSkipChargeCondition ||
                    incomingReusableLLMPromptCallCondition ||
                    incomingEditOrderNoteCondition
                        ? -48
                        : -46,
            }}
        >
            {incomingChoice && (
                <EdgeLabel
                    onClick={() => {
                        dispatch({
                            type: 'SET_NODE_EDITING_ID',
                            nodeId: incomingChoice.nodeId,
                        })
                        dispatch({
                            type: 'SET_CHOICE_EVENT_EDITING_ID',
                            eventId: incomingChoice.eventId,
                        })
                    }}
                    isSelected={isSelected}
                    type="choice"
                >
                    {incomingChoice.label}
                </EdgeLabel>
            )}
            {incomingHttpRequestCondition && (
                <EdgeLabel
                    onClick={() => {
                        dispatch({
                            type: 'SET_NODE_EDITING_ID',
                            nodeId: incomingHttpRequestCondition.nodeId,
                        })
                    }}
                    isSelected={isSelected}
                    type="http_request"
                >
                    {incomingHttpRequestCondition.label}
                </EdgeLabel>
            )}
            {incomingCancelOrderCondition && (
                <EdgeLabel isSelected={isSelected} type="cancel_order">
                    {incomingCancelOrderCondition.label}
                </EdgeLabel>
            )}
            {incomingRefundOrderCondition && (
                <EdgeLabel isSelected={isSelected} type="refund_order">
                    {incomingRefundOrderCondition.label}
                </EdgeLabel>
            )}
            {incomingUpdateShippingAddressCondition && (
                <EdgeLabel
                    onClick={() => {
                        dispatch({
                            type: 'SET_NODE_EDITING_ID',
                            nodeId: incomingUpdateShippingAddressCondition.nodeId,
                        })
                    }}
                    isSelected={isSelected}
                    type="update_shipping_address"
                >
                    {incomingUpdateShippingAddressCondition.label}
                </EdgeLabel>
            )}
            {incomingRemoveItemCondition && (
                <EdgeLabel
                    onClick={() => {
                        dispatch({
                            type: 'SET_NODE_EDITING_ID',
                            nodeId: incomingRemoveItemCondition.nodeId,
                        })
                    }}
                    isSelected={isSelected}
                    type="remove_item"
                >
                    {incomingRemoveItemCondition.label}
                </EdgeLabel>
            )}
            {incomingReplaceItemCondition && (
                <EdgeLabel
                    onClick={() => {
                        dispatch({
                            type: 'SET_NODE_EDITING_ID',
                            nodeId: incomingReplaceItemCondition.nodeId,
                        })
                    }}
                    isSelected={isSelected}
                    type="replace_item"
                >
                    {incomingReplaceItemCondition.label}
                </EdgeLabel>
            )}
            {incomingCreateDiscountCodeCondition && (
                <EdgeLabel isSelected={isSelected} type="create_discount_code">
                    {incomingCreateDiscountCodeCondition.label}
                </EdgeLabel>
            )}
            {incomingReshipForFreeCondition && (
                <EdgeLabel isSelected={isSelected} type="reship_for_free">
                    {incomingReshipForFreeCondition.label}
                </EdgeLabel>
            )}
            {incomingRefundShippingCostsCondition && (
                <EdgeLabel isSelected={isSelected} type="refund_shipping_costs">
                    {incomingRefundShippingCostsCondition.label}
                </EdgeLabel>
            )}
            {incomingCancelSubscriptionCondition && (
                <EdgeLabel
                    onClick={() => {
                        dispatch({
                            type: 'SET_NODE_EDITING_ID',
                            nodeId: incomingCancelSubscriptionCondition.nodeId,
                        })
                    }}
                    isSelected={isSelected}
                    type="cancel_subscription"
                >
                    {incomingCancelSubscriptionCondition.label}
                </EdgeLabel>
            )}
            {incomingSkipChargeCondition && (
                <EdgeLabel
                    onClick={() => {
                        dispatch({
                            type: 'SET_NODE_EDITING_ID',
                            nodeId: incomingSkipChargeCondition.nodeId,
                        })
                    }}
                    isSelected={isSelected}
                    type="skip_charge"
                >
                    {incomingSkipChargeCondition.label}
                </EdgeLabel>
            )}
            {incomingReusableLLMPromptCallCondition && (
                <EdgeLabel
                    onClick={() => {
                        if (
                            incomingReusableLLMPromptCallCondition.isClickable
                        ) {
                            dispatch({
                                type: 'SET_NODE_EDITING_ID',
                                nodeId: incomingReusableLLMPromptCallCondition.nodeId,
                            })
                        }
                    }}
                    isSelected={isSelected}
                    type="reusable_llm_prompt_call"
                >
                    {incomingReusableLLMPromptCallCondition.label}
                </EdgeLabel>
            )}
            {incomingEditOrderNoteCondition && (
                <EdgeLabel isSelected={isSelected} type="edit_order_note">
                    {incomingEditOrderNoteCondition.label}
                </EdgeLabel>
            )}
            {incomingCondition && (
                <EdgeLabel
                    type="condition"
                    onClick={() => {
                        if (
                            visualBuilderGraph.nodeEditingId !==
                            incomingCondition.nodeId
                        ) {
                            dispatch({
                                type: 'SET_NODE_EDITING_ID',
                                nodeId: incomingCondition.nodeId,
                            })

                            if (!incomingCondition.isFallback) {
                                dispatch({
                                    type: 'SET_BRANCH_IDS_EDITING',
                                    branchIds: [incomingCondition.id],
                                })
                            }
                        } else if (!incomingCondition.isFallback) {
                            dispatch({
                                type: 'ADD_BRANCH_ID_EDITING',
                                branchId: incomingCondition.id,
                            })
                        }
                    }}
                    isSelected={isSelected}
                >
                    {incomingCondition.label}
                </EdgeLabel>
            )}
            <EdgeIconButton
                ref={edgeRef}
                icon="add"
                onClick={() => setIsNodeMenuDropdownOpen(true)}
            />
            <NodeMenu
                ref={setMenuRef}
                nodeId={nodeId}
                isOpen={isNodeMenuDropdownOpen}
                onToggle={setIsNodeMenuDropdownOpen}
                target={edgeRef}
                placement="right-start"
                floatingRef={menuRef?.parentElement}
            />
        </div>
    )
}

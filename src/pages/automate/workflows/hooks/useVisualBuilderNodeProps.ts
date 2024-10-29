import {useMemo} from 'react'

import {VisualBuilderEdgeProps} from '../editor/visualBuilder/components/EdgeBlock'
import {VisualBuilderDeleteProps} from '../editor/visualBuilder/components/NodeDeleteIcon'
import {workflowVariableRegex} from '../models/variables.model'
import {getIncoming} from '../models/visualBuilderGraph.model'
import {useVisualBuilderContext} from './useVisualBuilder'

type Node = {
    id: string
    data: {
        isGreyedOut?: boolean | null
    }
}

export type VisualBuilderNodeProps = {
    isGreyedOut: boolean | null | undefined
    shouldShowErrors: boolean
    isSelected: boolean
    edgeProps: VisualBuilderEdgeProps
    deleteProps: VisualBuilderDeleteProps
}

export function useVisualBuilderNodeProps({
    id,
    data: {isGreyedOut},
}: Node): VisualBuilderNodeProps {
    const {
        visualBuilderGraph,
        dispatch,
        checkNodeHasVariablesUsedInChildren,
        shouldShowErrors,
    } = useVisualBuilderContext()

    const isSelected = visualBuilderGraph.nodeEditingId === id
    const incomingChoice = getIncoming(visualBuilderGraph, id, 'choice')
    const incomingCondition = getIncoming(visualBuilderGraph, id, 'conditions')
    const incomingHttpRequestCondition = getIncoming(
        visualBuilderGraph,
        id,
        'http_request'
    )
    const incomingCancelOrderCondition = getIncoming(
        visualBuilderGraph,
        id,
        'cancel_order'
    )
    const incomingRefundOrderCondition = getIncoming(
        visualBuilderGraph,
        id,
        'refund_order'
    )
    const incomingUpdateShippingAddressCondition = getIncoming(
        visualBuilderGraph,
        id,
        'update_shipping_address'
    )
    const incomingRemoveItemCondition = getIncoming(
        visualBuilderGraph,
        id,
        'remove_item'
    )
    const incomingCreateDiscountCodeCondition = getIncoming(
        visualBuilderGraph,
        id,
        'create_discount_code'
    )
    const incomingCancelSubscriptionCondition = getIncoming(
        visualBuilderGraph,
        id,
        'cancel_subscription'
    )
    const incomingSkipChargeCondition = getIncoming(
        visualBuilderGraph,
        id,
        'skip_charge'
    )

    const isEdgeSelected = useMemo(() => {
        const isChoiceSelected =
            incomingChoice?.nodeId === visualBuilderGraph.nodeEditingId
        if (isChoiceSelected) return true

        const isConditionsSelected =
            incomingCondition?.id &&
            visualBuilderGraph.branchIdsEditing?.includes(incomingCondition.id)
        if (isConditionsSelected) return true

        const isHttpRequestSelected =
            incomingHttpRequestCondition?.nodeId ===
            visualBuilderGraph.nodeEditingId
        if (isHttpRequestSelected) return true

        const isUpdateShippingAddressSelected =
            incomingUpdateShippingAddressCondition?.nodeId ===
            visualBuilderGraph.nodeEditingId
        if (isUpdateShippingAddressSelected) return true

        const isRemoveItemSelected =
            incomingRemoveItemCondition?.nodeId ===
            visualBuilderGraph.nodeEditingId
        if (isRemoveItemSelected) return true

        const isCreateDiscountSelected =
            incomingCreateDiscountCodeCondition?.nodeId ===
            visualBuilderGraph.nodeEditingId
        if (isCreateDiscountSelected) return true

        const isCancelSubscriptionSelected =
            incomingCancelSubscriptionCondition?.nodeId ===
            visualBuilderGraph.nodeEditingId
        if (isCancelSubscriptionSelected) return true

        const isSkipChargeSelected =
            incomingSkipChargeCondition?.nodeId ===
            visualBuilderGraph.nodeEditingId
        if (isSkipChargeSelected) return true

        return false
    }, [
        incomingChoice?.nodeId,
        incomingCondition?.id,
        incomingHttpRequestCondition,
        incomingUpdateShippingAddressCondition,
        incomingRemoveItemCondition,
        incomingCreateDiscountCodeCondition,
        incomingCancelSubscriptionCondition,
        incomingSkipChargeCondition,
        visualBuilderGraph.branchIdsEditing,
        visualBuilderGraph.nodeEditingId,
    ])

    const edgeProps: VisualBuilderEdgeProps = useMemo(
        () => ({
            nodeId: id,
            incomingChoice:
                incomingChoice?.label &&
                incomingChoice?.eventId &&
                incomingChoice?.nodeId
                    ? {
                          label: incomingChoice.label.replace(
                              workflowVariableRegex,
                              '{...}'
                          ),
                          eventId: incomingChoice.eventId,
                          nodeId: incomingChoice.nodeId,
                      }
                    : undefined,
            incomingCondition:
                incomingCondition?.nodeId &&
                incomingCondition?.label &&
                incomingCondition?.id &&
                typeof incomingCondition?.isFallback !== 'undefined'
                    ? {
                          id: incomingCondition.id,
                          label: incomingCondition.label,
                          nodeId: incomingCondition.nodeId,
                          isFallback: incomingCondition.isFallback,
                      }
                    : undefined,
            incomingHttpRequestCondition:
                incomingHttpRequestCondition?.nodeId &&
                incomingHttpRequestCondition?.label
                    ? {
                          label: incomingHttpRequestCondition.label,
                          nodeId: incomingHttpRequestCondition.nodeId,
                      }
                    : undefined,
            incomingCancelOrderCondition:
                incomingCancelOrderCondition?.nodeId &&
                incomingCancelOrderCondition?.label
                    ? {
                          label: incomingCancelOrderCondition.label,
                          nodeId: incomingCancelOrderCondition.nodeId,
                      }
                    : undefined,
            incomingRefundOrderCondition:
                incomingRefundOrderCondition?.nodeId &&
                incomingRefundOrderCondition?.label
                    ? {
                          label: incomingRefundOrderCondition.label,
                          nodeId: incomingRefundOrderCondition.nodeId,
                      }
                    : undefined,
            incomingUpdateShippingAddressCondition:
                incomingUpdateShippingAddressCondition?.nodeId &&
                incomingUpdateShippingAddressCondition?.label
                    ? {
                          label: incomingUpdateShippingAddressCondition.label,
                          nodeId: incomingUpdateShippingAddressCondition.nodeId,
                      }
                    : undefined,
            incomingRemoveItemCondition:
                incomingRemoveItemCondition?.nodeId &&
                incomingRemoveItemCondition?.label
                    ? {
                          label: incomingRemoveItemCondition.label,
                          nodeId: incomingRemoveItemCondition.nodeId,
                      }
                    : undefined,
            incomingCreateDiscountCodeCondition:
                incomingCreateDiscountCodeCondition?.nodeId &&
                incomingCreateDiscountCodeCondition?.label
                    ? {
                          label: incomingCreateDiscountCodeCondition.label,
                          nodeId: incomingCreateDiscountCodeCondition.nodeId,
                      }
                    : undefined,
            incomingCancelSubscriptionCondition:
                incomingCancelSubscriptionCondition?.nodeId &&
                incomingCancelSubscriptionCondition?.label
                    ? {
                          label: incomingCancelSubscriptionCondition.label,
                          nodeId: incomingCancelSubscriptionCondition.nodeId,
                      }
                    : undefined,
            incomingSkipChargeCondition:
                incomingSkipChargeCondition?.nodeId &&
                incomingSkipChargeCondition?.label
                    ? {
                          label: incomingSkipChargeCondition.label,
                          nodeId: incomingSkipChargeCondition.nodeId,
                      }
                    : undefined,
            dispatch,
            isSelected: isEdgeSelected,
        }),
        [
            id,
            incomingCondition?.id,
            incomingCondition?.label,
            incomingCondition?.nodeId,
            incomingCondition?.isFallback,
            incomingChoice?.label,
            incomingChoice?.eventId,
            incomingChoice?.nodeId,
            isEdgeSelected,
            incomingHttpRequestCondition?.label,
            incomingHttpRequestCondition?.nodeId,
            incomingCancelOrderCondition?.label,
            incomingCancelOrderCondition?.nodeId,
            incomingRefundOrderCondition?.label,
            incomingRefundOrderCondition?.nodeId,
            incomingUpdateShippingAddressCondition?.label,
            incomingUpdateShippingAddressCondition?.nodeId,
            incomingRemoveItemCondition?.label,
            incomingRemoveItemCondition?.nodeId,
            incomingCreateDiscountCodeCondition?.label,
            incomingCreateDiscountCodeCondition?.nodeId,
            incomingCancelSubscriptionCondition?.label,
            incomingCancelSubscriptionCondition?.nodeId,
            incomingSkipChargeCondition?.label,
            incomingSkipChargeCondition?.nodeId,
            dispatch,
        ]
    )

    const hasMultipleChildren =
        visualBuilderGraph.edges
            .filter((e) => e.source === id)
            .map((e) => e.target).length > 1

    const hasVariablesUsedInChildren = useMemo(
        () => checkNodeHasVariablesUsedInChildren(id),
        [id, checkNodeHasVariablesUsedInChildren]
    )
    const deleteProps: VisualBuilderDeleteProps = useMemo(
        () => ({
            nodeId: id,
            hasMultipleChildren,
            hasVariablesUsedInChildren,
            dispatch,
        }),
        [id, hasMultipleChildren, hasVariablesUsedInChildren, dispatch]
    )

    return {
        shouldShowErrors,
        isSelected,
        isGreyedOut,
        edgeProps,
        deleteProps,
    }
}

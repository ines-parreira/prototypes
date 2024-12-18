import {useMemo} from 'react'

import {useGetWorkflowConfigurationTemplates} from 'models/workflows/queries'

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
    isSelected: boolean
    edgeProps: VisualBuilderEdgeProps
    deleteProps: VisualBuilderDeleteProps
}

export function useVisualBuilderNodeProps({
    id,
    data: {isGreyedOut},
}: Node): VisualBuilderNodeProps {
    const {visualBuilderGraph, dispatch, checkNodeHasVariablesUsedInChildren} =
        useVisualBuilderContext()

    const triggerNode = visualBuilderGraph.nodes[0]

    const {data: steps = []} = useGetWorkflowConfigurationTemplates(
        {
            triggers: ['reusable-llm-prompt'],
        },
        {enabled: triggerNode.type === 'llm_prompt_trigger'}
    )

    const isSelected = visualBuilderGraph.nodeEditingId === id
    const incomingChoice = getIncoming(visualBuilderGraph, id, 'choice', steps)
    const incomingCondition = getIncoming(
        visualBuilderGraph,
        id,
        'conditions',
        steps
    )
    const incomingHttpRequestCondition = getIncoming(
        visualBuilderGraph,
        id,
        'http_request',
        steps
    )
    const incomingCancelOrderCondition = getIncoming(
        visualBuilderGraph,
        id,
        'cancel_order',
        steps
    )
    const incomingRefundOrderCondition = getIncoming(
        visualBuilderGraph,
        id,
        'refund_order',
        steps
    )
    const incomingUpdateShippingAddressCondition = getIncoming(
        visualBuilderGraph,
        id,
        'update_shipping_address',
        steps
    )
    const incomingRemoveItemCondition = getIncoming(
        visualBuilderGraph,
        id,
        'remove_item',
        steps
    )
    const incomingCreateDiscountCodeCondition = getIncoming(
        visualBuilderGraph,
        id,
        'create_discount_code',
        steps
    )
    const incomingReshipForFreeCondition = getIncoming(
        visualBuilderGraph,
        id,
        'reship_for_free',
        steps
    )
    const incomingRefundShippingCostsCondition = getIncoming(
        visualBuilderGraph,
        id,
        'refund_shipping_costs',
        steps
    )
    const incomingCancelSubscriptionCondition = getIncoming(
        visualBuilderGraph,
        id,
        'cancel_subscription',
        steps
    )
    const incomingSkipChargeCondition = getIncoming(
        visualBuilderGraph,
        id,
        'skip_charge',
        steps
    )
    const incomingReusableLLMPromptCallCondition = getIncoming(
        visualBuilderGraph,
        id,
        'reusable_llm_prompt_call',
        steps
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

        const isReshipForFreeSelected =
            incomingReshipForFreeCondition?.nodeId ===
            visualBuilderGraph.nodeEditingId
        if (isReshipForFreeSelected) return true

        const isRefundShippingCostsSelected =
            incomingRefundShippingCostsCondition?.nodeId ===
            visualBuilderGraph.nodeEditingId
        if (isRefundShippingCostsSelected) return true

        const isCancelSubscriptionSelected =
            incomingCancelSubscriptionCondition?.nodeId ===
            visualBuilderGraph.nodeEditingId
        if (isCancelSubscriptionSelected) return true

        const isSkipChargeSelected =
            incomingSkipChargeCondition?.nodeId ===
            visualBuilderGraph.nodeEditingId
        if (isSkipChargeSelected) return true

        const isReusableLLMPromptCallSelected =
            incomingReusableLLMPromptCallCondition?.nodeId ===
            visualBuilderGraph.nodeEditingId
        if (isReusableLLMPromptCallSelected) return true

        return false
    }, [
        incomingChoice?.nodeId,
        incomingCondition?.id,
        incomingHttpRequestCondition,
        incomingUpdateShippingAddressCondition,
        incomingRemoveItemCondition,
        incomingCreateDiscountCodeCondition,
        incomingReshipForFreeCondition,
        incomingRefundShippingCostsCondition,
        incomingCancelSubscriptionCondition,
        incomingSkipChargeCondition,
        incomingReusableLLMPromptCallCondition,
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
            incomingReshipForFreeCondition:
                incomingReshipForFreeCondition?.nodeId &&
                incomingReshipForFreeCondition?.label
                    ? {
                          label: incomingReshipForFreeCondition.label,
                          nodeId: incomingReshipForFreeCondition.nodeId,
                      }
                    : undefined,
            incomingRefundShippingCostsCondition:
                incomingRefundShippingCostsCondition?.nodeId &&
                incomingRefundShippingCostsCondition?.label
                    ? {
                          label: incomingRefundShippingCostsCondition.label,
                          nodeId: incomingRefundShippingCostsCondition.nodeId,
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
            incomingReusableLLMPromptCallCondition:
                incomingReusableLLMPromptCallCondition?.nodeId &&
                incomingReusableLLMPromptCallCondition?.label &&
                typeof incomingReusableLLMPromptCallCondition?.isClickable !==
                    'undefined'
                    ? {
                          label: incomingReusableLLMPromptCallCondition.label,
                          nodeId: incomingReusableLLMPromptCallCondition.nodeId,
                          isClickable:
                              incomingReusableLLMPromptCallCondition.isClickable,
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
            incomingReshipForFreeCondition?.label,
            incomingReshipForFreeCondition?.nodeId,
            incomingRefundShippingCostsCondition?.label,
            incomingRefundShippingCostsCondition?.nodeId,
            incomingCancelSubscriptionCondition?.label,
            incomingCancelSubscriptionCondition?.nodeId,
            incomingSkipChargeCondition?.label,
            incomingSkipChargeCondition?.nodeId,
            incomingReusableLLMPromptCallCondition?.label,
            incomingReusableLLMPromptCallCondition?.nodeId,
            incomingReusableLLMPromptCallCondition?.isClickable,
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
        isSelected,
        isGreyedOut,
        edgeProps,
        deleteProps,
    }
}

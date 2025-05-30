import { useCallback } from 'react'

import { produce } from 'immer'
import _set from 'lodash/set'

import { VisualBuilderContextType } from 'pages/automate/workflows/hooks/useVisualBuilder'
import {
    getCancelSubscriptionNodeErrors,
    getConditionsNodeErrors,
    getHTTPRequestNodeErrors,
    getRemoveItemNodeErrors,
    getReplaceItemNodeErrors,
    getReusableLLMPromptTriggerNodeErrors,
    getSkipChargeNodeErrors,
    getUpdateShippingAddressNodeErrors,
} from 'pages/automate/workflows/models/visualBuilderGraph.model'
import { VisualBuilderGraph } from 'pages/automate/workflows/models/visualBuilderGraph.types'

const useValidateActionStepGraph = (
    getVariableListForNode: VisualBuilderContextType['getVariableListForNode'],
) => {
    return useCallback(
        (graph: VisualBuilderGraph) => {
            return produce(graph, (draft) => {
                draft.errors = null

                if (draft.touched?.name) {
                    if (!draft.name) {
                        draft.errors ??= {}
                        _set(draft.errors, 'name', 'Name is required')
                    } else if (draft.name.length > 100) {
                        draft.errors ??= {}
                        _set(
                            draft.errors,
                            'name',
                            'Name must be less than 100 characters',
                        )
                    }
                }

                if (draft.touched?.nodes && draft.nodes.length === 2) {
                    draft.errors ??= {}
                    _set(draft.errors, 'nodes', 'At least one step is required')
                }

                draft.nodes.forEach((node) => {
                    node.data.errors = null

                    switch (node.type) {
                        case 'reusable_llm_prompt_trigger':
                            node.data.errors =
                                getReusableLLMPromptTriggerNodeErrors(
                                    node,
                                    getVariableListForNode(node.id),
                                )
                            break
                        case 'http_request':
                            node.data.errors = getHTTPRequestNodeErrors(
                                node,
                                getVariableListForNode(node.id),
                            )
                            break
                        case 'conditions':
                            node.data.errors = getConditionsNodeErrors(
                                graph.edges,
                                node,
                                getVariableListForNode(node.id),
                            )
                            break
                        case 'skip_charge':
                            node.data.errors = getSkipChargeNodeErrors(
                                node,
                                getVariableListForNode(node.id),
                            )
                            break
                        case 'cancel_subscription':
                            node.data.errors = getCancelSubscriptionNodeErrors(
                                node,
                                getVariableListForNode(node.id),
                            )
                            break

                        case 'replace_item':
                            node.data.errors = getReplaceItemNodeErrors(
                                node,
                                getVariableListForNode(node.id),
                            )
                            break
                        case 'remove_item':
                            node.data.errors = getRemoveItemNodeErrors(
                                node,
                                getVariableListForNode(node.id),
                            )
                            break
                        case 'update_shipping_address':
                            node.data.errors =
                                getUpdateShippingAddressNodeErrors(
                                    node,
                                    getVariableListForNode(node.id),
                                )
                            break
                        case 'create_discount_code':
                        case 'edit_order_note':
                        case 'end':
                        case 'cancel_order':
                        case 'refund_order':
                            break
                    }
                })
            })
        },
        [getVariableListForNode],
    )
}

export default useValidateActionStepGraph

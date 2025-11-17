import { useCallback } from 'react'

import { produce } from 'immer'
import _set from 'lodash/set'

import type { VisualBuilderContextType } from 'pages/automate/workflows/hooks/useVisualBuilder'
import {
    getCancelSubscriptionNodeErrors,
    getConditionsNodeErrors,
    getHTTPRequestNodeErrors,
    getLLMPromptTriggerNodeErrors,
    getRemoveItemNodeErrors,
    getReplaceItemNodeErrors,
    getSkipChargeNodeErrors,
    getUpdateShippingAddressNodeErrors,
} from 'pages/automate/workflows/models/visualBuilderGraph.model'
import type { VisualBuilderGraph } from 'pages/automate/workflows/models/visualBuilderGraph.types'

const useValidateActionTemplateGraph = (
    getVariableListForNode: VisualBuilderContextType['getVariableListForNode'],
) => {
    return useCallback(
        (graph: VisualBuilderGraph) => {
            return produce(graph, (draft) => {
                draft.errors = null

                if (draft.touched?.name) {
                    if (!draft.name) {
                        draft.errors ??= {}
                        _set(draft.errors, 'name', 'Action name is required')
                    } else if (draft.name.length > 100) {
                        draft.errors ??= {}
                        _set(
                            draft.errors,
                            'name',
                            'Action name must be less than 100 characters',
                        )
                    }
                }

                if (draft.touched?.nodes && draft.nodes.length === 2) {
                    draft.errors ??= {}
                    _set(
                        draft.errors,
                        'nodes',
                        'At least one Action step is required',
                    )
                }

                draft.nodes.forEach((node) => {
                    node.data.errors = null

                    switch (node.type) {
                        case 'llm_prompt_trigger':
                            node.data.errors = getLLMPromptTriggerNodeErrors(
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
                        case 'reusable_llm_prompt_call':
                        case 'end':
                        case 'cancel_order':
                        case 'refund_order':
                        case 'edit_order_note':
                            break
                    }
                })
            })
        },
        [getVariableListForNode],
    )
}

export default useValidateActionTemplateGraph

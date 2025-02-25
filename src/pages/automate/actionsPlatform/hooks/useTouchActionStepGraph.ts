import { useCallback } from 'react'

import { produce } from 'immer'

import {
    getCancelSubscriptionNodeTouched,
    getConditionsNodeTouched,
    getGraphTouched,
    getHTTPRequestNodeTouched,
    getRemoveItemNodeTouched,
    getReplaceItemNodeTouched,
    getReusableLLMPromptTriggerNodeTouched,
    getSkipChargeNodeTouched,
    getUpdateShippingAddressNodeTouched,
} from 'pages/automate/workflows/models/visualBuilderGraph.model'
import { VisualBuilderGraph } from 'pages/automate/workflows/models/visualBuilderGraph.types'

const useTouchActionStepGraph = () => {
    return useCallback((graph: VisualBuilderGraph) => {
        return produce(graph, (draft) => {
            draft.touched = getGraphTouched()

            draft.nodes.forEach((node) => {
                switch (node.type) {
                    case 'reusable_llm_prompt_trigger':
                        node.data.touched =
                            getReusableLLMPromptTriggerNodeTouched(node)
                        break
                    case 'http_request':
                        node.data.touched = getHTTPRequestNodeTouched(node)
                        break
                    case 'conditions':
                        node.data.touched = getConditionsNodeTouched(
                            graph.edges,
                            node,
                        )
                        break
                    case 'end':
                        break
                    case 'cancel_order':
                        break
                    case 'refund_order':
                        break
                    case 'skip_charge':
                        node.data.touched = getSkipChargeNodeTouched()
                        break
                    case 'cancel_subscription':
                        node.data.touched = getCancelSubscriptionNodeTouched()
                        break
                    case 'create_discount_code':
                        break
                    case 'replace_item':
                        node.data.touched = getReplaceItemNodeTouched()
                        break
                    case 'remove_item':
                        node.data.touched = getRemoveItemNodeTouched()
                        break
                    case 'update_shipping_address':
                        node.data.touched =
                            getUpdateShippingAddressNodeTouched()
                        break
                }
            })
        })
    }, [])
}

export default useTouchActionStepGraph

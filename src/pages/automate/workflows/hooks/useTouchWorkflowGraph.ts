import { useCallback } from 'react'

import { produce } from 'immer'

import {
    getAutomatedMessageNodeTouched,
    getChannelTriggerNodeTouched,
    getConditionsNodeTouched,
    getFileUploadNodeTouched,
    getGraphTouched,
    getHTTPRequestNodeTouched,
    getMultipleChoicesNodeTouched,
    getOrderLineItemSelectionNodeTouched,
    getOrderSelectionNodeTouched,
    getTextReplyNodeTouched,
} from 'pages/automate/workflows/models/visualBuilderGraph.model'
import { VisualBuilderGraph } from 'pages/automate/workflows/models/visualBuilderGraph.types'

const useTouchWorkflowGraph = () => {
    return useCallback((graph: VisualBuilderGraph) => {
        return produce(graph, (draft) => {
            draft.touched = getGraphTouched()

            draft.nodes.forEach((node) => {
                switch (node.type) {
                    case 'channel_trigger':
                        node.data.touched = getChannelTriggerNodeTouched()
                        break
                    case 'automated_message':
                        node.data.touched = getAutomatedMessageNodeTouched()
                        break
                    case 'conditions':
                        node.data.touched = getConditionsNodeTouched(
                            graph.edges,
                            node,
                        )
                        break
                    case 'multiple_choices':
                        node.data.touched = getMultipleChoicesNodeTouched(node)
                        break
                    case 'text_reply':
                        node.data.touched = getTextReplyNodeTouched()
                        break
                    case 'file_upload':
                        node.data.touched = getFileUploadNodeTouched()
                        break
                    case 'order_selection':
                        node.data.touched = getOrderSelectionNodeTouched()
                        break
                    case 'http_request':
                        node.data.touched = getHTTPRequestNodeTouched(node)
                        break
                    case 'shopper_authentication':
                        break
                    case 'order_line_item_selection':
                        node.data.touched =
                            getOrderLineItemSelectionNodeTouched()
                        break
                    case 'end':
                        break
                }
            })
        })
    }, [])
}

export default useTouchWorkflowGraph

import { useCallback } from 'react'

import { produce } from 'immer'

import { VisualBuilderGraph } from 'pages/automate/workflows/models/visualBuilderGraph.types'

const useUntouchWorkflowGraph = () => {
    return useCallback((graph: VisualBuilderGraph) => {
        return produce(graph, (draft) => {
            draft.touched = null

            draft.nodes.forEach((node) => {
                switch (node.type) {
                    case 'channel_trigger':
                        node.data.touched = null
                        break
                    case 'automated_message':
                        node.data.touched = null
                        break
                    case 'conditions':
                        node.data.touched = null
                        break
                    case 'multiple_choices':
                        node.data.touched = null
                        break
                    case 'text_reply':
                        node.data.touched = null
                        break
                    case 'file_upload':
                        node.data.touched = null
                        break
                    case 'order_selection':
                        node.data.touched = null
                        break
                    case 'http_request':
                        node.data.touched = null
                        break
                    case 'shopper_authentication':
                        break
                    case 'order_line_item_selection':
                        node.data.touched = null
                        break
                    case 'end':
                        break
                }
            })
        })
    }, [])
}

export default useUntouchWorkflowGraph

import { useCallback } from 'react'

import { produce } from 'immer'
import _set from 'lodash/set'

import { VisualBuilderContextType } from 'pages/automate/workflows/hooks/useVisualBuilder'
import {
    getAutomatedMessageNodeErrors,
    getChannelTriggerNodeErrors,
    getConditionsNodeErrors,
    getFileUploadNodeErrors,
    getHTTPRequestNodeErrors,
    getMultipleChoicesNodeErrors,
    getOrderLineItemSelectionNodeErrors,
    getOrderSelectionNodeErrors,
    getTextReplyNodeErrors,
} from 'pages/automate/workflows/models/visualBuilderGraph.model'
import { VisualBuilderGraph } from 'pages/automate/workflows/models/visualBuilderGraph.types'

const useValidateWorkflowGraph = (
    getVariableListForNode: VisualBuilderContextType['getVariableListForNode'],
) => {
    return useCallback(
        (graph: VisualBuilderGraph, isDraft = false) => {
            return produce(graph, (draft) => {
                draft.errors = null

                if (!draft.name) {
                    draft.errors ??= {}
                    _set(
                        draft.errors,
                        'name',
                        `You must add a flow name in order to ${isDraft || !draft.is_draft ? 'save' : 'publish'}`,
                    )
                } else if (draft.name.length > 100) {
                    draft.errors ??= {}
                    _set(
                        draft.errors,
                        'name',
                        'Flow name must be less than 100 characters',
                    )
                }

                if (!isDraft && draft.nodes.length === 2) {
                    draft.errors ??= {}
                    _set(
                        draft.errors,
                        'nodes',
                        'You must add at least one step after the trigger button in order to publish',
                    )
                }

                draft.nodes.forEach((node) => {
                    node.data.errors = null

                    if (isDraft) {
                        return
                    }

                    switch (node.type) {
                        case 'channel_trigger':
                            node.data.errors = getChannelTriggerNodeErrors(node)
                            break
                        case 'automated_message':
                            node.data.errors = getAutomatedMessageNodeErrors(
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
                        case 'multiple_choices':
                            node.data.errors = getMultipleChoicesNodeErrors(
                                node,
                                getVariableListForNode(node.id),
                            )
                            break
                        case 'text_reply':
                            node.data.errors = getTextReplyNodeErrors(
                                node,
                                getVariableListForNode(node.id),
                            )
                            break
                        case 'file_upload':
                            node.data.errors = getFileUploadNodeErrors(
                                node,
                                getVariableListForNode(node.id),
                            )
                            break
                        case 'order_selection':
                            node.data.errors = getOrderSelectionNodeErrors(
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
                        case 'shopper_authentication':
                            break
                        case 'order_line_item_selection':
                            node.data.errors =
                                getOrderLineItemSelectionNodeErrors(
                                    node,
                                    getVariableListForNode(node.id),
                                )
                            break
                        case 'end':
                            break
                    }
                })
            })
        },
        [getVariableListForNode],
    )
}

export default useValidateWorkflowGraph

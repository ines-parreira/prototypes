import { useCallback } from 'react'

import { produce } from 'immer'
import _set from 'lodash/set'

import { VisualBuilderContextType } from 'pages/automate/workflows/hooks/useVisualBuilder'
import {
    getConditionsNodeErrors,
    getGraphAppAppErrors,
    getHTTPRequestNodeErrors,
    getLLMPromptTriggerNodeErrors,
} from 'pages/automate/workflows/models/visualBuilderGraph.model'
import { VisualBuilderGraph } from 'pages/automate/workflows/models/visualBuilderGraph.types'
import { WorkflowConfiguration } from 'pages/automate/workflows/models/workflowConfiguration.types'

const useValidateActionGraph = (
    getVariableListForNode: VisualBuilderContextType['getVariableListForNode'],
    actions: Pick<WorkflowConfiguration, 'id' | 'name'>[],
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
                    } else if (
                        actions.some(
                            (action) =>
                                action.name === graph.name &&
                                action.id !== graph.id,
                        )
                    ) {
                        draft.errors ??= {}
                        _set(
                            draft.errors,
                            'name',
                            'An Action already exists with this name. Choose a unique name.',
                        )
                    }
                }

                draft.apps?.forEach((app) => {
                    app.errors = null

                    switch (app.type) {
                        case 'app':
                            app.errors = getGraphAppAppErrors(app)
                            break
                    }
                })

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
                        case 'reusable_llm_prompt_call':
                            break
                        case 'end':
                            break
                    }
                })
            })
        },
        [getVariableListForNode, actions],
    )
}

export default useValidateActionGraph

import { useCallback } from 'react'

import { produce } from 'immer'
import _set from 'lodash/set'

import { VisualBuilderContextType } from 'pages/automate/workflows/hooks/useVisualBuilder'
import { getLLMPromptTriggerNodeErrors } from 'pages/automate/workflows/models/visualBuilderGraph.model'
import { VisualBuilderGraph } from 'pages/automate/workflows/models/visualBuilderGraph.types'

const useValidateActionUseCaseTemplateGraph = (
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

                if (draft.touched?.category && !draft.category?.trim()) {
                    draft.errors ??= {}
                    _set(draft.errors, 'category', 'Category is required')
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
                        case 'reusable_llm_prompt_call':
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

export default useValidateActionUseCaseTemplateGraph

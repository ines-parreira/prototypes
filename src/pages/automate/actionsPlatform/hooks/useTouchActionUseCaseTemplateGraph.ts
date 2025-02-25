import { useCallback } from 'react'

import { produce } from 'immer'

import { getLLMPromptTriggerNodeTouched } from 'pages/automate/workflows/models/visualBuilderGraph.model'
import { VisualBuilderGraph } from 'pages/automate/workflows/models/visualBuilderGraph.types'

const useTouchActionUseCaseTemplateGraph = () => {
    return useCallback((graph: VisualBuilderGraph) => {
        return produce(graph, (draft) => {
            draft.touched = {
                name: true,
                nodes: true,
                category: true,
            }

            draft.nodes.forEach((node) => {
                switch (node.type) {
                    case 'llm_prompt_trigger':
                        node.data.touched = getLLMPromptTriggerNodeTouched(node)
                        break
                    case 'reusable_llm_prompt_call':
                        break
                    case 'end':
                        break
                }
            })
        })
    }, [])
}

export default useTouchActionUseCaseTemplateGraph

import { useCallback } from 'react'

import { useFormContext } from 'react-hook-form'

import { getLayoutedElements } from 'core/ui/flows'
import { createFlowGraph } from 'core/ui/flows/utils'

import { VoiceFlowFormValues } from '../types'
import { useVoiceFlow } from '../useVoiceFlow'
import { getEdgeProps, getNextNodes, transformToReactFlowNodes } from '../utils'

export function useUpdateNodes() {
    const { setNodes, setEdges } = useVoiceFlow()
    const { watch } = useFormContext<VoiceFlowFormValues>()

    const updateNodes = useCallback(() => {
        const flow = watch()
        const newNodes = transformToReactFlowNodes(flow)
        const edges = createFlowGraph(newNodes, getNextNodes).edges
        const { nodes: finalNodes, edges: finalEdges } = getLayoutedElements(
            newNodes,
            edges,
            getEdgeProps,
        )

        setNodes(finalNodes)
        setEdges(finalEdges)
    }, [watch, setNodes, setEdges])

    return updateNodes
}

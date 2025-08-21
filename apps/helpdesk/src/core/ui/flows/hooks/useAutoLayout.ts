import { useEffect } from 'react'

import {
    ReactFlowState,
    useNodesInitialized,
    useReactFlow,
    useStore,
} from '@xyflow/react'

import { getLayoutedElements } from '../layout.utils'

const nodeCountSelector = (state: ReactFlowState) => state.nodeLookup.size

export function useAutoLayout() {
    const nodeCount = useStore(nodeCountSelector)
    const nodesInitialized = useNodesInitialized()
    const { getNodes, getEdges, setNodes, setEdges } = useReactFlow()

    useEffect(() => {
        if (nodeCount > 0) {
            const nodes = getNodes()
            const edges = getEdges()
            const { nodes: newNodes } = getLayoutedElements(nodes, edges)

            setNodes(newNodes)
        }
    }, [nodeCount, getNodes, getEdges, setNodes, setEdges, nodesInitialized])
}

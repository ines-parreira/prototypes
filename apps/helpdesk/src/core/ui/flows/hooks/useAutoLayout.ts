import { useEffect } from 'react'

import type { Edge, Node, ReactFlowState } from '@xyflow/react'
import { useNodesInitialized, useReactFlow, useStore } from '@xyflow/react'

import { getLayoutedElements } from '../layout.utils'

const nodeCountSelector = (state: ReactFlowState) => state.nodeLookup.size

export function useAutoLayout<TNode extends Node>(
    getEdgeProps?: (
        edge: Edge,
        nodes: TNode[],
    ) => { weight?: number; height?: number },
    computeEdges?: (nodes: TNode[]) => Edge[],
): void {
    const nodeCount = useStore(nodeCountSelector)
    const nodesInitialized = useNodesInitialized()
    const {
        getNodes,
        setNodes,
        getEdges: getDefaultEdges,
        setEdges,
    } = useReactFlow<TNode, Edge>()

    useEffect(() => {
        if (!nodesInitialized) return
        if (nodeCount > 0) {
            const nodes = getNodes()
            const edges = computeEdges ? computeEdges(nodes) : getDefaultEdges()
            const { nodes: newNodes, edges: newEdges } = getLayoutedElements(
                nodes,
                edges,
                getEdgeProps,
            )

            setNodes(newNodes)
            setEdges(newEdges)
        }
    }, [
        nodeCount,
        getNodes,
        computeEdges,
        getDefaultEdges,
        setNodes,
        setEdges,
        nodesInitialized,
        getEdgeProps,
    ])
}

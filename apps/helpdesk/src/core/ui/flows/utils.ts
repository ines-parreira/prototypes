import { Edge, Node } from '@xyflow/react'

export function createFlowGraph<TNode extends Node>(
    nodes: TNode[],
    getNextNodes: (node: TNode, nodes: TNode[]) => string[],
): { nodes: TNode[]; edges: Edge[] } {
    const edges: Edge[] = []

    nodes.forEach((node) => {
        const nextNodes = getNextNodes(node, nodes)

        nextNodes.forEach((nextNode) => {
            edges.push({
                id: `${node.id}->${nextNode}`,
                source: node.id,
                target: nextNode,
            })
        })
    })

    return { nodes, edges }
}

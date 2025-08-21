import Dagre from '@dagrejs/dagre'
import { Edge, Node } from '@xyflow/react'

const NODE_WIDTH_DEFAULT = 228
const NODE_HEIGHT_DEFAULT = 56
const EDGE_HEIGHT_DEFAULT = 56

export function getLayoutedElements(
    nodes: Node[],
    edges: Edge[],
): { nodes: Node[]; edges: Edge[] } {
    const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}))
    g.setGraph({
        rankdir: 'TB', // top-bottom
        ranksep: 45,
    })

    edges.forEach((edge) =>
        g.setEdge(edge.source, edge.target, {
            weight: 1,
            height: EDGE_HEIGHT_DEFAULT,
        }),
    )
    nodes.forEach((node) =>
        g.setNode(node.id, {
            width: node.measured?.width || NODE_WIDTH_DEFAULT,
            height: node.measured?.height || NODE_HEIGHT_DEFAULT,
        }),
    )

    Dagre.layout(g, {
        // without this it would re-arrange the branches when adding new nodes
        disableOptimalOrderHeuristic: true,
    })

    const newNodes = nodes.map((node) => {
        const nodeWithPosition = g.node(node.id)
        const newNode = {
            ...node,
            // We are shifting the dagre node position (anchor=center center) to the top left
            // so it matches the React Flow node anchor point (top left).
            position: {
                x:
                    nodeWithPosition.x -
                    (node.measured?.width ?? NODE_WIDTH_DEFAULT) / 2,
                y:
                    nodeWithPosition.y -
                    (node.measured?.height ?? NODE_HEIGHT_DEFAULT) / 2,
            },
        }

        return newNode
    })

    return {
        nodes: newNodes,
        edges,
    }
}

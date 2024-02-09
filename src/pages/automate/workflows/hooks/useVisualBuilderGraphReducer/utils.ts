import {ulid} from 'ulidx'
import {produce} from 'immer'
import {FlextreeNode, flextree} from 'd3-flextree'
import {Node, Position} from 'reactflow'

import {
    buildNodeCommonProperties,
    walkVisualBuilderGraph,
} from '../../models/visualBuilderGraph.model'
import {
    AutomatedMessageNodeType,
    EndNodeType,
    FileUploadNodeType,
    HttpRequestNodeType,
    MultipleChoicesNodeType,
    OrderSelectionNodeType,
    ShopperAuthenticationNodeType,
    TextReplyNodeType,
    VisualBuilderEdge,
    VisualBuilderGraph,
} from '../../models/visualBuilderGraph.types'

export function greyOutBranch(
    graph: VisualBuilderGraph,
    nodeId: string,
    isGreyedOut: boolean
): VisualBuilderGraph {
    const {nodes} = graph
    const childrenIds: Set<string> = new Set()
    walkVisualBuilderGraph(graph, nodeId, (node) => {
        childrenIds.add(node.id)
    })
    return {
        ...graph,
        nodes: nodes.map((n) =>
            childrenIds.has(n.id)
                ? produce(n, (draft) => {
                      draft.data.isGreyedOut = isGreyedOut
                  })
                : n
        ),
    }
}

export function deleteBranch(
    graph: VisualBuilderGraph,
    nodeId: string,
    {keepIncomingEdge}: {keepIncomingEdge?: boolean} = {}
) {
    const {nodes, edges} = graph
    const nodeIdsToDelete: Set<string> = new Set()
    const edgeIdsToDelete: Set<string> = new Set()
    let nodeToDeleteIncomingEdge: VisualBuilderEdge | undefined
    walkVisualBuilderGraph(
        graph,
        nodeId,
        (node, {incomingEdge, outgoingEdges}) => {
            nodeIdsToDelete.add(node.id)
            if (incomingEdge && !nodeToDeleteIncomingEdge) {
                nodeToDeleteIncomingEdge = incomingEdge
            }
            if (
                incomingEdge &&
                (!keepIncomingEdge ||
                    incomingEdge.id !== nodeToDeleteIncomingEdge?.id)
            )
                edgeIdsToDelete.add(incomingEdge.id)
            outgoingEdges.forEach((edge) => edgeIdsToDelete.add(edge.id))
        }
    )
    if (!nodeToDeleteIncomingEdge) return graph
    const nextGraph = {
        ...graph,
        nodes: nodes.filter((n) => !nodeIdsToDelete.has(n.id)),
        edges: edges.filter((e) => !edgeIdsToDelete.has(e.id)),
    }
    return nextGraph
}

export const buildAutomatedMessageNode = (): AutomatedMessageNodeType => {
    const id = ulid()
    return {
        ...buildNodeCommonProperties(),
        id,
        type: 'automated_message',
        data: {
            content: {
                html: '',
                html_tkey: ulid(),
                text: '',
                text_tkey: ulid(),
            },
        },
    }
}

export const buildTextReplyNode = (): TextReplyNodeType => {
    const id = ulid()
    return {
        ...buildNodeCommonProperties(),
        id,
        type: 'text_reply',
        data: {
            content: {
                html: '',
                html_tkey: ulid(),
                text: '',
                text_tkey: ulid(),
            },
        },
    }
}

export const buildFileUploadNode = (): FileUploadNodeType => {
    const id = ulid()
    return {
        ...buildNodeCommonProperties(),
        id,
        type: 'file_upload',
        data: {
            content: {
                html: '',
                html_tkey: ulid(),
                text: '',
                text_tkey: ulid(),
            },
        },
    }
}

export const buildMultipleChoicesNode = (): MultipleChoicesNodeType => {
    const id = ulid()
    return {
        ...buildNodeCommonProperties(),
        id,
        type: 'multiple_choices',
        data: {
            content: {
                html: '',
                html_tkey: ulid(),
                text: '',
                text_tkey: ulid(),
            },
            choices: [
                {
                    event_id: ulid(),
                    label: '',
                    label_tkey: ulid(),
                },
                {
                    event_id: ulid(),
                    label: '',
                    label_tkey: ulid(),
                },
            ],
        },
    }
}

export const buildEndNode = (): EndNodeType => {
    const id = ulid()
    return {
        ...buildNodeCommonProperties(),
        id,
        type: 'end',
        data: {
            withWasThisHelpfulPrompt: true,
        },
    }
}

export const buildOrderSelectionNode = (): OrderSelectionNodeType => {
    const id = ulid()
    return {
        ...buildNodeCommonProperties(),
        id,
        type: 'order_selection',
        data: {
            content: {
                html: '',
                html_tkey: ulid(),
                text: '',
                text_tkey: ulid(),
            },
        },
    }
}

export const buildHttpRequestNode = (): HttpRequestNodeType => {
    const id = ulid()
    return {
        ...buildNodeCommonProperties(),
        id,
        type: 'http_request',
        data: {
            name: '',
            url: '',
            method: 'GET',
            headers: [],
            variables: [],
        },
    }
}

export const buildShopperAuthenticationNode = (
    storeIntegrationId: number
): ShopperAuthenticationNodeType => {
    const id = ulid()
    return {
        ...buildNodeCommonProperties(),
        id,
        type: 'shopper_authentication',
        data: {
            integrationId: storeIntegrationId,
        },
    }
}

const nodeWidth = 300
const nodeHeight = 98
const nodeGap = 36

export function computeNodesPositions(
    g: VisualBuilderGraph
): VisualBuilderGraph {
    const layout = flextree<Node>({
        // the node size configures the spacing between the nodes ([width, height])
        nodeSize: (node) => {
            const width = node.data.width || nodeWidth
            const height =
                node.data.height ||
                (node.data.type === 'shopper_authentication' ? 80 : nodeHeight)
            return [width, height + nodeGap * 2]
        },
        // this is needed for creating equal space between all nodes horizontally
        spacing: nodeGap,
    })
    const root = layout.hierarchy(
        g.nodes.find((n) => n.type === 'trigger_button')!,
        (node) => {
            const outgoingEdges = g.edges.filter((e) => e.source === node.id)
            const childrenNodesIds = outgoingEdges.map((e) => e.target)
            return childrenNodesIds.map(
                (childrenId) => g.nodes.find(({id}) => id === childrenId)!
            )
        }
    )
    layout(root)
    const layoutedNodes: Record<string, {x: number; y: number}> = {}
    root.each<FlextreeNode<Node>>(({data, x, y}) => {
        layoutedNodes[data.id] = {x, y}
    })

    // set the React Flow nodes with the positions from the layout
    const nextNodes = g.nodes.map((node) => {
        // find the node in the hierarchy with the same id and get its coordinates
        const {x, y} = layoutedNodes?.[node.id] || {
            x: node.position.x,
            y: node.position.y,
        }

        return {
            ...node,
            sourcePosition: Position.Bottom,
            targetPosition: Position.Top,
            position: {x, y},
        }
    })
    return {
        ...g,
        nodes: nextNodes,
    }
}

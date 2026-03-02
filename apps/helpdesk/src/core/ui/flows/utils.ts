import type { Edge, Node } from '@xyflow/react'

import { DEFAULT_INTERMEDIARY_NODE_ID } from './constants'
import type { ConvergencePoint } from './types'

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

export function buildIncomingEdgesMap<TNode extends Node>(
    nodes: TNode[],
    getNextNodes: (node: TNode, nodes: TNode[]) => string[],
): Record<string, string[]> {
    const incomingEdges: Record<string, string[]> = {}

    /* Initialize all known nodes, intermediary nodes
     * might have been filtered out prior to calling this function */
    nodes.forEach((node) => {
        incomingEdges[node.id] = []
    })

    // Build the incoming edges map
    nodes.forEach((node) => {
        const nextNodes = getNextNodes(node, nodes)

        if (nextNodes.length === 0) {
            return
        }

        nextNodes.forEach((nextNode) => {
            incomingEdges[nextNode] = [
                ...(incomingEdges[nextNode] || []),
                node.id,
            ]
        })
    })

    return incomingEdges
}

export function findConvergencePoints<TNode extends Node>(
    nodes: TNode[],
    getNextNodes: (node: TNode, nodes: TNode[]) => string[],
): ConvergencePoint[] {
    const convergencePoints: ConvergencePoint[] = []
    const allNodes = nodes.map((n) => n.id)
    const incomingEdges = buildIncomingEdgesMap(nodes, getNextNodes)

    // Find nodes that have multiple incoming edges
    for (const nodeId of allNodes) {
        const incomingNodes = incomingEdges[nodeId] || []
        if (incomingNodes.length > 1) {
            convergencePoints.push({
                targetNodeId: nodeId,
                convergingNodes: incomingNodes,
            })
        }
    }

    return convergencePoints.sort(
        (a, b) => a.convergingNodes.length - b.convergingNodes.length,
    )
}

export function findPathFromRoot<TNode extends Node>(
    nodes: TNode[],
    rootId: string,
    targetId: string,
    getNextNodes: (node: TNode, nodes: TNode[]) => string[],
): string[] | null {
    const visited = new Set<string>()
    const path: string[] = []

    const dfs = (currentId: string): boolean => {
        if (visited.has(currentId)) return false
        visited.add(currentId)
        path.push(currentId)

        if (currentId === targetId) return true
        const currentNode = nodes.find((n) => n.id === currentId)
        if (!currentNode) return false

        const nextNodes = getNextNodes(currentNode, nodes)

        for (const nextNode of nextNodes) {
            if (dfs(nextNode)) return true
        }

        path.pop()
        return false
    }

    return dfs(rootId) ? path : null
}

export function getIntermediaryNodeId(rootId: string): string {
    return `${DEFAULT_INTERMEDIARY_NODE_ID}_${rootId}`
}

export function findLowestCommonAncestor<TNode extends Node>(
    nodes: TNode[],
    nodeIds: string[],
    rootId: string,
    getNextNodes: (node: TNode, nodes: TNode[]) => string[],
): string | null {
    if (nodeIds.length <= 1) return null

    // Build paths from root to each node
    const paths = nodeIds.map((nodeId) =>
        findPathFromRoot(nodes, rootId, nodeId, getNextNodes),
    )

    // Filter out null paths (unreachable nodes)
    const validPaths = paths.filter((path) => path !== null) as string[][]

    if (validPaths.length <= 1) return null

    // Find the longest common prefix
    let lcaIndex = 0
    const minLength = Math.min(...validPaths.map((path) => path.length))

    while (lcaIndex < minLength) {
        const currentNode = validPaths[0][lcaIndex]
        const allMatch = validPaths.every(
            (path) => path[lcaIndex] === currentNode,
        )

        if (!allMatch) break
        lcaIndex++
    }

    return lcaIndex > 0 ? validPaths[0][lcaIndex - 1] : null
}

function addSubIntermediaryNodes<
    TNode extends Node,
    TIntermediaryNode extends Node,
>(
    modifiedNodes: TNode[],
    firstNodeId: string,
    getNextNodes: (node: TNode, nodes: TNode[]) => string[],
    convergence: ConvergencePoint,
    intermediaryNode: TIntermediaryNode,
    createIntermediaryNode: (
        convergence: ConvergencePoint,
        id?: string | null,
    ) => TIntermediaryNode,
    insertIntermediaryNode: (
        intermediaryNode: TIntermediaryNode,
        convergence: ConvergencePoint,
        nodes: TNode[],
    ) => TNode[],
): TNode[] {
    let nodesWithIntermediaries = modifiedNodes

    // retrieve updated paths from root to each incoming node, sorted by length desc
    let incomingNodesPathsFromRoot = convergence.convergingNodes
        .map((incomingNode) => {
            const path =
                findPathFromRoot(
                    nodesWithIntermediaries,
                    firstNodeId,
                    incomingNode,
                    getNextNodes,
                ) ?? []
            return {
                nodeId: incomingNode,
                path: path.slice(0, -1),
            }
        })
        .sort((a, b) => b.path.length - a.path.length)

    // we try to see for each node in the path which other nodes are intersecting with it
    // we create intermediary nodes for those intersections
    const lcaForConvergence = findLowestCommonAncestor(
        nodesWithIntermediaries,
        convergence.convergingNodes,
        firstNodeId,
        getNextNodes,
    )

    for (let i = 0; i < incomingNodesPathsFromRoot.length; i++) {
        let { nodeId, path } = incomingNodesPathsFromRoot[i]

        for (let k = path.length; k > 1; k--) {
            const currentNode = path[k - 1]
            const intersectingHere = [nodeId]

            for (let j = i + 1; j < incomingNodesPathsFromRoot.length; j++) {
                const { nodeId: otherNodeId } = incomingNodesPathsFromRoot[j]
                if (nodeId === otherNodeId) {
                    continue
                }

                const LCA = findLowestCommonAncestor(
                    nodesWithIntermediaries,
                    [nodeId, otherNodeId],
                    firstNodeId,
                    getNextNodes,
                )
                if (LCA === currentNode && LCA !== lcaForConvergence) {
                    intersectingHere.push(otherNodeId)
                }
            }

            if (intersectingHere.length > 1) {
                const subIntermediaryNode = createIntermediaryNode(
                    {
                        targetNodeId: intermediaryNode.id,
                        convergingNodes: intersectingHere,
                    },
                    getIntermediaryNodeId(currentNode),
                )
                nodesWithIntermediaries = insertIntermediaryNode(
                    subIntermediaryNode,
                    {
                        targetNodeId: intermediaryNode.id,
                        convergingNodes: intersectingHere,
                    },
                    nodesWithIntermediaries,
                )

                // search for sub intermediary nodes if there are more than 2 intersecting nodes
                if (intersectingHere.length > 2) {
                    const subConvergencePoint: ConvergencePoint = {
                        targetNodeId: intermediaryNode.id,
                        convergingNodes: intersectingHere,
                    }
                    nodesWithIntermediaries = addSubIntermediaryNodes(
                        nodesWithIntermediaries,
                        lcaForConvergence || firstNodeId,
                        getNextNodes,
                        subConvergencePoint,
                        subIntermediaryNode,
                        createIntermediaryNode,
                        insertIntermediaryNode,
                    )
                }

                // update the paths of all incoming nodes to reflect the new intermediary node
                for (let k = i; k < incomingNodesPathsFromRoot.length; k++) {
                    if (
                        intersectingHere.includes(
                            incomingNodesPathsFromRoot[k].nodeId,
                        )
                    ) {
                        incomingNodesPathsFromRoot[k].nodeId =
                            subIntermediaryNode.id
                    }
                }

                nodeId = subIntermediaryNode.id
            }
        }
    }

    return nodesWithIntermediaries
}

export function insertConvergenceNodes<
    TNode extends Node,
    TIntermediaryNode extends TNode,
>(
    nodes: TNode[],
    getNextNodes: (node: TNode, nodes: TNode[]) => string[],
    findConvergencePointsInFlow: (nodes: TNode[]) => ConvergencePoint[],
    createIntermediaryNode: (
        convergence: ConvergencePoint,
        id?: string | null,
    ) => TIntermediaryNode,
    insertIntermediaryNode: (
        intermediaryNode: TIntermediaryNode,
        convergence: ConvergencePoint,
        nodes: TNode[],
    ) => TNode[],
): TNode[] {
    if (nodes.length === 0) {
        return []
    }

    const firstNodeId = nodes[0].id
    let modifiedNodes = [...nodes]

    // this function should filter out convergence points that are intermediary nodes already
    let convergencePoints = findConvergencePointsInFlow(modifiedNodes)

    // iterate over convergence points and insert intermediary nodes in their stead
    while (convergencePoints.length) {
        const convergence = convergencePoints[0]

        const lca = findLowestCommonAncestor(
            modifiedNodes,
            convergence.convergingNodes,
            firstNodeId,
            getNextNodes,
        )
        const intermediaryNode = createIntermediaryNode(
            convergence,
            lca ? getIntermediaryNodeId(lca) : null,
        )
        modifiedNodes = insertIntermediaryNode(
            intermediaryNode,
            convergence,
            modifiedNodes,
        )

        modifiedNodes = addSubIntermediaryNodes(
            modifiedNodes,
            firstNodeId,
            getNextNodes,
            convergence,
            intermediaryNode,
            createIntermediaryNode,
            insertIntermediaryNode,
        )

        // recompute convergence points until all of them are handled (replaced by intermediary nodes)
        convergencePoints = findConvergencePointsInFlow(modifiedNodes)
    }

    return modifiedNodes
}

export function bfsNodesBetween<TNode extends Omit<Node, 'position'>>(
    nodes: TNode[],
    startNodeId: string,
    endNodeId: string,
    getNextNodes: (node: TNode, nodes: TNode[]) => string[],
): string[] {
    let res: string[] = []
    let queue: string[] = [startNodeId]

    let visited: Record<string, boolean> = {
        [startNodeId]: true,
    }

    while (queue.length > 0) {
        let curr = queue.shift()
        const currNode = nodes.find((node) => node.id === curr)

        if (!curr || !currNode) continue

        res.push(curr)

        const nextNodes = getNextNodes(currNode, nodes)

        if (nextNodes.includes(endNodeId)) {
            continue
        }

        for (let x of nextNodes) {
            if (!visited[x]) {
                visited[x] = true
                queue.push(x)
            }
        }
    }
    return res
}

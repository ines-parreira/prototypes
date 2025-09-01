import { Node } from '@xyflow/react'
import { cloneDeep } from 'lodash'

import { VoiceFlowNodeType } from 'pages/integrations/integration/components/voice/flows/constants'

import {
    buildIncomingEdgesMap,
    createFlowGraph,
    findConvergencePoints,
    findIntermediaryNodeForRoot,
    findLowestCommonAncestor,
    findPathFromRoot,
    insertConvergenceNodes,
} from '../utils'

interface GenericNode extends Node {
    data: {
        next?: string | string[]
    }
}

const getNextNodes = (node: GenericNode, __: GenericNode[]): string[] => {
    if (!node.data.next) return []
    return Array.isArray(node.data.next) ? node.data.next : [node.data.next]
}

const linearFlowNodes: GenericNode[] = [
    {
        id: 'start',
        type: 'start',
        data: { next: 'step-1' },
        position: { x: 0, y: 0 },
    },
    {
        id: 'step-1',
        type: 'process',
        data: { next: 'step-2' },
        position: { x: 0, y: 100 },
    },
    {
        id: 'step-2',
        type: 'process',
        data: { next: 'end' },
        position: { x: 0, y: 200 },
    },
    {
        id: 'end',
        type: 'end',
        data: {},
        position: { x: 0, y: 300 },
    },
]

const branchedFlowNodes: GenericNode[] = [
    {
        id: 'start',
        type: 'start',
        data: { next: 'decision' },
        position: { x: 0, y: 0 },
    },
    {
        id: 'decision',
        type: 'decision',
        data: { next: ['branch-a', 'branch-b'] },
        position: { x: 0, y: 100 },
    },
    {
        id: 'branch-a',
        type: 'process',
        data: { next: 'merge' },
        position: { x: -100, y: 200 },
    },
    {
        id: 'branch-b',
        type: 'process',
        data: { next: 'merge' },
        position: { x: 100, y: 200 },
    },
    {
        id: 'merge',
        type: 'merge',
        data: { next: 'end' },
        position: { x: 0, y: 300 },
    },
    {
        id: 'end',
        type: 'end',
        data: {},
        position: { x: 0, y: 400 },
    },
]

const complexFlowNodes: GenericNode[] = [
    {
        id: 'root',
        type: 'start',
        data: { next: 'fork-1' },
        position: { x: 0, y: 0 },
    },
    {
        id: 'fork-1',
        type: 'decision',
        data: { next: ['path-a', 'path-b', 'path-c'] },
        position: { x: 0, y: 100 },
    },
    {
        id: 'path-a',
        type: 'process',
        data: { next: 'fork-2' },
        position: { x: -200, y: 200 },
    },
    {
        id: 'path-b',
        type: 'process',
        data: { next: 'merge-1' },
        position: { x: 0, y: 200 },
    },
    {
        id: 'path-c',
        type: 'process',
        data: { next: 'merge-1' },
        position: { x: 200, y: 200 },
    },
    {
        id: 'fork-2',
        type: 'decision',
        data: { next: ['path-d', 'path-e'] },
        position: { x: -200, y: 300 },
    },
    {
        id: 'path-d',
        type: 'process',
        data: { next: 'merge-2' },
        position: { x: -300, y: 400 },
    },
    {
        id: 'path-e',
        type: 'process',
        data: { next: 'merge-2' },
        position: { x: -100, y: 400 },
    },
    {
        id: 'merge-1',
        type: 'merge',
        data: { next: 'merge-2' },
        position: { x: 100, y: 300 },
    },
    {
        id: 'merge-2',
        type: 'merge',
        data: { next: 'end' },
        position: { x: 0, y: 500 },
    },
    {
        id: 'end',
        type: 'end',
        data: {},
        position: { x: 0, y: 600 },
    },
]

describe('createFlowGraph', () => {
    it('should create a flow graph', () => {
        const nodes: Node<{ next: string[] }>[] = [
            {
                id: '1',
                data: {
                    next: ['2', '3'],
                },
                position: { x: 0, y: 0 },
            },
            {
                id: '2',
                data: {
                    next: ['4'],
                },
                position: { x: 0, y: 0 },
            },
            {
                id: '3',
                data: {
                    next: ['4'],
                },
                position: { x: 0, y: 0 },
            },
        ]
        const getNextNodes = (
            node: Node<{ next: string[] }>,
            __: Node[],
        ): string[] => node.data.next

        const { nodes: newNodes, edges } = createFlowGraph(nodes, getNextNodes)

        expect(newNodes).toEqual(nodes)
        expect(edges).toEqual([
            { id: '1->2', source: '1', target: '2' },
            { id: '1->3', source: '1', target: '3' },
            { id: '2->4', source: '2', target: '4' },
            { id: '3->4', source: '3', target: '4' },
        ])
    })
})

describe('buildIncomingEdgesMap', () => {
    it('should return empty map for empty nodes array', () => {
        const result = buildIncomingEdgesMap([], getNextNodes)
        expect(result).toEqual({})
    })

    it('should build correct incoming edges map for linear flow', () => {
        const result = buildIncomingEdgesMap(linearFlowNodes, getNextNodes)

        expect(result).toEqual({
            start: [],
            'step-1': ['start'],
            'step-2': ['step-1'],
            end: ['step-2'],
        })
    })

    it('should build correct incoming edges map for branched flow', () => {
        const result = buildIncomingEdgesMap(branchedFlowNodes, getNextNodes)

        expect(result).toEqual({
            start: [],
            decision: ['start'],
            'branch-a': ['decision'],
            'branch-b': ['decision'],
            merge: ['branch-a', 'branch-b'],
            end: ['merge'],
        })
    })

    it('should not throw error when the next node does not exist on nodes array', () => {
        const [firstNode, ...restNodes] = linearFlowNodes
        const firstNodeWithNonexistentNext = cloneDeep(firstNode)
        firstNodeWithNonexistentNext.data.next = [
            firstNode.data.next as string,
            'nonexistent',
        ]

        const nodes: GenericNode[] = [
            firstNodeWithNonexistentNext,
            ...restNodes,
        ]

        expect(buildIncomingEdgesMap(nodes, getNextNodes)).toEqual({
            start: [],
            nonexistent: ['start'],
            'step-1': ['start'],
            'step-2': ['step-1'],
            end: ['step-2'],
        })
    })

    it('should handle nodes with no outgoing edges', () => {
        const nodes: GenericNode[] = [
            {
                id: 'node-1',
                type: 'process',
                data: { next: 'node-2' },
                position: { x: 0, y: 0 },
            },
            {
                id: 'node-2',
                type: 'end',
                data: {},
                position: { x: 0, y: 100 },
            },
            {
                id: 'isolated',
                type: 'isolated',
                data: {},
                position: { x: 100, y: 0 },
            },
        ]

        const result = buildIncomingEdgesMap(nodes, getNextNodes)

        expect(result).toEqual({
            'node-1': [],
            'node-2': ['node-1'],
            isolated: [],
        })
    })

    it('should handle complex flow with multiple convergence points', () => {
        const result = buildIncomingEdgesMap(complexFlowNodes, getNextNodes)

        expect(result).toEqual({
            root: [],
            'fork-1': ['root'],
            'path-a': ['fork-1'],
            'path-b': ['fork-1'],
            'path-c': ['fork-1'],
            'fork-2': ['path-a'],
            'path-d': ['fork-2'],
            'path-e': ['fork-2'],
            'merge-1': ['path-b', 'path-c'],
            'merge-2': ['path-d', 'path-e', 'merge-1'],
            end: ['merge-2'],
        })
    })
})

describe('findConvergencePoints', () => {
    it('should return empty array for empty nodes', () => {
        const result = findConvergencePoints([], getNextNodes)
        expect(result).toEqual([])
    })

    it('should find no convergence points in linear flow', () => {
        const result = findConvergencePoints(linearFlowNodes, getNextNodes)
        expect(result).toEqual([])
    })

    it('should find one convergence point in branched flow', () => {
        const result = findConvergencePoints(branchedFlowNodes, getNextNodes)

        expect(result).toEqual([
            {
                targetNodeId: 'merge',
                convergingNodes: ['branch-a', 'branch-b'],
            },
        ])
    })

    it('should find multiple convergence points sorted by converging nodes count', () => {
        const result = findConvergencePoints(complexFlowNodes, getNextNodes)

        expect(result).toEqual([
            {
                targetNodeId: 'merge-1',
                convergingNodes: ['path-b', 'path-c'],
            },
            {
                targetNodeId: 'merge-2',
                convergingNodes: ['path-d', 'path-e', 'merge-1'],
            },
        ])
    })

    it('should handle diamond pattern', () => {
        const diamondNodes: GenericNode[] = [
            {
                id: 'top',
                type: 'start',
                data: { next: ['left', 'right'] },
                position: { x: 0, y: 0 },
            },
            {
                id: 'left',
                type: 'process',
                data: { next: 'bottom' },
                position: { x: -50, y: 50 },
            },
            {
                id: 'right',
                type: 'process',
                data: { next: 'bottom' },
                position: { x: 50, y: 50 },
            },
            {
                id: 'bottom',
                type: 'end',
                data: {},
                position: { x: 0, y: 100 },
            },
        ]

        const result = findConvergencePoints(diamondNodes, getNextNodes)

        expect(result).toEqual([
            {
                targetNodeId: 'bottom',
                convergingNodes: ['left', 'right'],
            },
        ])
    })
})

describe('findPathFromRoot', () => {
    it('should return null for empty nodes', () => {
        const result = findPathFromRoot([], 'start', 'end', getNextNodes)
        expect(result).toBeNull()
    })

    it('should find path in linear flow', () => {
        const result = findPathFromRoot(
            linearFlowNodes,
            'start',
            'end',
            getNextNodes,
        )
        expect(result).toEqual(['start', 'step-1', 'step-2', 'end'])
    })

    it('should find path through branches', () => {
        const result = findPathFromRoot(
            branchedFlowNodes,
            'start',
            'branch-a',
            getNextNodes,
        )
        expect(result).toEqual(['start', 'decision', 'branch-a'])
    })

    it('should find path when there are only 2 nodes', () => {
        const nodes = [
            {
                id: 'parent',
                type: VoiceFlowNodeType.PlayMessage,
                data: {
                    next: 'child',
                },
                position: { x: 0, y: 0 },
            },
            {
                id: 'child',
                type: VoiceFlowNodeType.IvrMenu,
                data: {
                    next: undefined,
                },
                position: { x: 100, y: 100 },
            },
        ]
        const result = findPathFromRoot(nodes, 'parent', 'child', getNextNodes)
        expect(result).toEqual(['parent', 'child'])
    })

    it('should return null if target is unreachable', () => {
        const result = findPathFromRoot(
            linearFlowNodes,
            'step-2',
            'start',
            getNextNodes,
        )
        expect(result).toBeNull()
    })

    it('should return null if root does not exist', () => {
        const result = findPathFromRoot(
            linearFlowNodes,
            'nonexistent',
            'end',
            getNextNodes,
        )
        expect(result).toBeNull()
    })

    it('should return null if target does not exist', () => {
        const result = findPathFromRoot(
            linearFlowNodes,
            'start',
            'nonexistent',
            getNextNodes,
        )
        expect(result).toBeNull()
    })

    it('should handle self-path (root is target)', () => {
        const result = findPathFromRoot(
            linearFlowNodes,
            'start',
            'start',
            getNextNodes,
        )
        expect(result).toEqual(['start'])
    })

    it('should find one of multiple possible paths', () => {
        const result = findPathFromRoot(
            branchedFlowNodes,
            'start',
            'merge',
            getNextNodes,
        )
        expect(result).toContain('start')
        expect(result).toContain('decision')
        expect(result).toContain('merge')
        expect(result?.length).toBe(4)
    })

    it('should handle cycles correctly', () => {
        const cyclicNodes: GenericNode[] = [
            {
                id: 'node-1',
                type: 'process',
                data: { next: 'node-2' },
                position: { x: 0, y: 0 },
            },
            {
                id: 'node-2',
                type: 'process',
                data: { next: 'node-3' },
                position: { x: 0, y: 100 },
            },
            {
                id: 'node-3',
                type: 'process',
                data: { next: ['node-1', 'node-4'] },
                position: { x: 0, y: 200 },
            },
            {
                id: 'node-4',
                type: 'end',
                data: {},
                position: { x: 0, y: 300 },
            },
        ]

        const result = findPathFromRoot(
            cyclicNodes,
            'node-1',
            'node-4',
            getNextNodes,
        )
        expect(result).toEqual(['node-1', 'node-2', 'node-3', 'node-4'])
    })
})

describe('findLowestCommonAncestor', () => {
    it('should return null for empty nodes', () => {
        const result = findLowestCommonAncestor(
            [],
            ['node-1', 'node-2'],
            'root',
            getNextNodes,
        )
        expect(result).toBeNull()
    })

    it('should return null for single node', () => {
        const result = findLowestCommonAncestor(
            linearFlowNodes,
            ['step-1'],
            'start',
            getNextNodes,
        )
        expect(result).toBeNull()
    })

    it('should return null for empty node list', () => {
        const result = findLowestCommonAncestor(
            linearFlowNodes,
            [],
            'start',
            getNextNodes,
        )
        expect(result).toBeNull()
    })

    it('should find LCA in linear flow', () => {
        const result = findLowestCommonAncestor(
            linearFlowNodes,
            ['step-1', 'step-2'],
            'start',
            getNextNodes,
        )
        expect(result).toBe('step-1')
    })

    it('should find LCA in branched flow', () => {
        const result = findLowestCommonAncestor(
            branchedFlowNodes,
            ['branch-a', 'branch-b'],
            'start',
            getNextNodes,
        )
        expect(result).toBe('decision')
    })

    it('should find LCA for nodes at different depths', () => {
        const result = findLowestCommonAncestor(
            branchedFlowNodes,
            ['decision', 'merge'],
            'start',
            getNextNodes,
        )
        expect(result).toBe('decision')
    })

    it('should return null if any node is unreachable', () => {
        const result = findLowestCommonAncestor(
            linearFlowNodes,
            ['step-1', 'nonexistent'],
            'start',
            getNextNodes,
        )
        expect(result).toBeNull()
    })

    it('should handle complex flow with multiple branches', () => {
        const result = findLowestCommonAncestor(
            complexFlowNodes,
            ['path-d', 'path-e'],
            'root',
            getNextNodes,
        )
        expect(result).toBe('fork-2')
    })

    it('should find LCA for nodes from different branches', () => {
        const result = findLowestCommonAncestor(
            complexFlowNodes,
            ['path-d', 'path-b'],
            'root',
            getNextNodes,
        )
        expect(result).toBe('fork-1')
    })

    it('should return root as LCA when appropriate', () => {
        const result = findLowestCommonAncestor(
            complexFlowNodes,
            ['fork-1', 'end'],
            'root',
            getNextNodes,
        )
        expect(result).toBe('fork-1')
    })

    it('should handle nodes with shared path', () => {
        const result = findLowestCommonAncestor(
            complexFlowNodes,
            ['merge-1', 'merge-2'],
            'root',
            getNextNodes,
        )
        expect(result).toBe('fork-1')
    })
})

describe('insertConvergenceNodes', () => {
    interface IntermediaryNode extends GenericNode {
        type: 'intermediary'
        data: {
            next?: string | string[]
            isIntermediaryNode: boolean
        }
    }

    const createIntermediaryNode = (convergence: {
        targetNodeId: string
        convergingNodes: string[]
    }): IntermediaryNode => ({
        id: `intermediary-${convergence.convergingNodes.join('-')}->${convergence.targetNodeId}`,
        type: 'intermediary',
        data: {
            next: convergence.targetNodeId,
            isIntermediaryNode: true,
        },
        position: { x: 0, y: 0 },
    })

    const insertIntermediaryNode = (
        intermediaryNode: IntermediaryNode,
        convergence: { targetNodeId: string; convergingNodes: string[] },
        nodes: GenericNode[],
    ): GenericNode[] => {
        const newNodes = [...nodes, intermediaryNode]

        return newNodes.map((node) => {
            if (convergence.convergingNodes.includes(node.id)) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        next: intermediaryNode.id,
                    },
                }
            }
            return node
        })
    }

    const testFindConvergencePoints = (nodes: GenericNode[]) => {
        return findConvergencePoints(nodes, getNextNodes).filter(
            (cp) =>
                // filter out convergence points that are intermediary nodes as those are already handled
                nodes.find((n) => n.id === cp.targetNodeId)?.type !==
                'intermediary',
        )
    }

    it('should return nodes unchanged when no convergence points exist', () => {
        const result = insertConvergenceNodes(
            linearFlowNodes,
            getNextNodes,
            testFindConvergencePoints,
            createIntermediaryNode,
            insertIntermediaryNode,
        )

        expect(result).toHaveLength(linearFlowNodes.length)
        expect(result.every((node) => node.type !== 'intermediary')).toBe(true)
    })

    it('should insert intermediary node for single convergence point', () => {
        const result = insertConvergenceNodes(
            branchedFlowNodes,
            getNextNodes,
            testFindConvergencePoints,
            createIntermediaryNode,
            insertIntermediaryNode,
        )

        const intermediaryNodes = result.filter(
            (node) => node.type === 'intermediary',
        )
        expect(intermediaryNodes).toHaveLength(1)

        const intermediaryNode = intermediaryNodes[0] as IntermediaryNode
        expect(intermediaryNode.data.isIntermediaryNode).toBe(true)
        expect(intermediaryNode.data.next).toBe('merge')

        const branchA = result.find((node) => node.id === 'branch-a')
        const branchB = result.find((node) => node.id === 'branch-b')
        expect(branchA?.data.next).toBe(intermediaryNode.id)
        expect(branchB?.data.next).toBe(intermediaryNode.id)
    })

    it('should handle multiple convergence points', () => {
        const result = insertConvergenceNodes(
            complexFlowNodes,
            getNextNodes,
            testFindConvergencePoints,
            createIntermediaryNode,
            insertIntermediaryNode,
        )

        const intermediaryNodes = result.filter(
            (node) => node.type === 'intermediary',
        )

        expect(intermediaryNodes).toHaveLength(3)
    })

    it('should handle nested convergence points', () => {
        const nestedFlowNodes: GenericNode[] = [
            {
                id: 'start',
                type: 'start',
                data: { next: ['a', 'b', 'c', 'd'] },
                position: { x: 0, y: 0 },
            },
            {
                id: 'a',
                type: 'process',
                data: { next: 'merge-1' },
                position: { x: -150, y: 100 },
            },
            {
                id: 'b',
                type: 'process',
                data: { next: 'merge-1' },
                position: { x: -50, y: 100 },
            },
            {
                id: 'c',
                type: 'process',
                data: { next: 'merge-2' },
                position: { x: 50, y: 100 },
            },
            {
                id: 'd',
                type: 'process',
                data: { next: 'merge-2' },
                position: { x: 150, y: 100 },
            },
            {
                id: 'merge-1',
                type: 'merge',
                data: { next: 'final' },
                position: { x: -100, y: 200 },
            },
            {
                id: 'merge-2',
                type: 'merge',
                data: { next: 'final' },
                position: { x: 100, y: 200 },
            },
            {
                id: 'final',
                type: 'end',
                data: {},
                position: { x: 0, y: 300 },
            },
        ]

        const result = insertConvergenceNodes(
            nestedFlowNodes,
            getNextNodes,
            testFindConvergencePoints,
            createIntermediaryNode,
            insertIntermediaryNode,
        )

        const intermediaryNodes = result.filter(
            (node) => node.type === 'intermediary',
        )

        expect(intermediaryNodes).toHaveLength(3)
    })

    it('should handle empty nodes array', () => {
        const result = insertConvergenceNodes(
            [],
            getNextNodes,
            testFindConvergencePoints,
            createIntermediaryNode,
            insertIntermediaryNode,
        )

        expect(result).toEqual([])
    })

    it('should handle single node', () => {
        const singleNode: GenericNode[] = [
            {
                id: 'alone',
                type: 'start',
                data: {},
                position: { x: 0, y: 0 },
            },
        ]

        const result = insertConvergenceNodes(
            singleNode,
            getNextNodes,
            testFindConvergencePoints,
            createIntermediaryNode,
            insertIntermediaryNode,
        )

        expect(result).toEqual(singleNode)
    })
})

describe('findIntermediaryNodeForRoot', () => {
    it('should return null when no intermediary node is found', () => {
        // the flow is linear, there is no node connecting other nodes with the same lowest common ancestor
        const result = findIntermediaryNodeForRoot(
            linearFlowNodes,
            'start',
            getNextNodes,
            'merge',
        )
        expect(result).toBeNull()
    })

    it('should return the intermediary node connecting decision node branches when it is found', () => {
        const result = findIntermediaryNodeForRoot(
            branchedFlowNodes,
            'decision',
            getNextNodes,
            'merge',
        )

        const mergeNode = branchedFlowNodes.find((node) => node.id === 'merge')
        expect(result).toBe(mergeNode)
    })
})

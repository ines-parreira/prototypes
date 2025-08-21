import { Node } from '@xyflow/react'

import { createFlowGraph } from '../utils'

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

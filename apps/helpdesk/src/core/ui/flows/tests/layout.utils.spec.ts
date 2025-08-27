import { getLayoutedElements } from '../layout.utils'

describe('getLayoutedElements', () => {
    it('should only change the position of the nodes', () => {
        const nodes = [
            {
                id: '1',
                data: {},
                measured: { width: 100, height: 100 },
                position: { x: 0, y: 0 },
            },
            {
                id: '2',
                data: {},
                measured: { width: 50, height: 30 },
                position: { x: 0, y: 0 },
            },
        ]

        const edges = [{ id: '1', source: '1', target: '2' }]

        const { nodes: newNodes, edges: newEdges } = getLayoutedElements(
            nodes,
            edges,
        )

        expect(newNodes[0]).toEqual(
            expect.objectContaining({
                ...nodes[0],
                position: { x: 0, y: 0 },
            }),
        )
        expect(newNodes[1]).toEqual(
            expect.objectContaining({
                ...nodes[1],
                position: expect.not.objectContaining({ x: 0, y: 0 }),
            }),
        )

        expect(newEdges).toEqual(edges)
    })

    it('should use custom getEdgeProps when provided', () => {
        const nodes = [
            {
                id: '1',
                data: { type: 'start' },
                measured: { width: 100, height: 100 },
                position: { x: 0, y: 0 },
            },
            {
                id: '2',
                data: { type: 'middle' },
                measured: { width: 50, height: 30 },
                position: { x: 0, y: 0 },
            },
            {
                id: '3',
                data: { type: 'end' },
                measured: { width: 75, height: 40 },
                position: { x: 0, y: 0 },
            },
        ]

        const edges = [
            { id: 'e1', source: '1', target: '2' },
            { id: 'e2', source: '2', target: '3' },
        ]

        const getEdgeProps = jest.fn((edge, nodes) => {
            const targetNode = nodes.find((n: any) => n.id === edge.target)
            if (targetNode?.data?.type === 'end') {
                return { weight: 10, height: 100 }
            }
            return { weight: 1, height: 50 }
        })

        const { nodes: newNodes, edges: newEdges } = getLayoutedElements(
            nodes,
            edges,
            getEdgeProps,
        )

        expect(getEdgeProps).toHaveBeenCalledTimes(2)

        expect(newNodes[0].position).not.toEqual(newNodes[1].position)
        expect(newNodes[1].position).not.toEqual(newNodes[2].position)

        expect(newEdges).toEqual(edges)
    })
})

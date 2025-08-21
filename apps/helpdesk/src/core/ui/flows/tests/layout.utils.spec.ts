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
})

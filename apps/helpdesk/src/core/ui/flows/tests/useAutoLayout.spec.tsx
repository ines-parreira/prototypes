import { renderHook } from '@testing-library/react'

import {
    Edge,
    Flow,
    FlowProvider,
    Node,
    useEdgesState,
    useNodesState,
} from '..'
import { useAutoLayout } from '../hooks/useAutoLayout'
import * as layoutUtils from '../layout.utils'

const getLayoutedElementsSpy = jest.spyOn(layoutUtils, 'getLayoutedElements')

const onNodesChange = jest.fn()
const onEdgesChange = jest.fn()

function Wrapper({
    children,
    nodes: initialNodes = [],
    edges: initialEdges = [],
}: {
    children: React.ReactNode
    nodes?: Node[]
    edges?: Edge[]
}) {
    const [nodes] = useNodesState(initialNodes)
    const [edges] = useEdgesState(initialEdges)

    return (
        <FlowProvider>
            <Flow
                onEdgesChange={onEdgesChange}
                onNodesChange={onNodesChange}
                nodes={nodes}
                edges={edges}
            >
                {children}
            </Flow>
        </FlowProvider>
    )
}

describe('useAutoLayout', () => {
    it('should not attempt to layout if there are no nodes', () => {
        renderHook(() => useAutoLayout(), {
            wrapper: ({ children }) => <Wrapper nodes={[]}>{children}</Wrapper>,
        })

        expect(getLayoutedElementsSpy).not.toHaveBeenCalled()
        expect(onNodesChange).not.toHaveBeenCalled()
    })

    it('should attempt to layout if there are nodes', () => {
        const firstNode = { id: '1', position: { x: 0, y: 0 }, data: {} }
        const secondNode = { id: '2', position: { x: 0, y: 0 }, data: {} }
        const nodes = [firstNode, secondNode]
        const edges = [{ id: '1-2', source: '1', target: '2' }]

        renderHook(() => useAutoLayout(), {
            wrapper: ({ children }) => (
                <Wrapper nodes={nodes} edges={edges}>
                    {children}
                </Wrapper>
            ),
        })

        expect(getLayoutedElementsSpy).toHaveBeenCalledWith(nodes, edges)
        expect(onNodesChange).toHaveBeenCalledWith([
            {
                id: '1',
                item: { ...firstNode, position: expect.any(Object) },
                type: 'replace',
            },
            {
                id: '2',
                item: { ...secondNode, position: expect.any(Object) },
                type: 'replace',
            },
        ])
        expect(onEdgesChange).not.toHaveBeenCalled()
    })
})

import { renderHook, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'

import type { Edge, Node } from '..'
import { Flow, FlowProvider, useEdgesState, useNodesState } from '..'
import { useAutoLayout } from '../hooks/useAutoLayout'
import * as layoutUtils from '../layout.utils'

const mockUseNodesInitialized = jest.fn()
jest.mock('@xyflow/react', () => ({
    ...jest.requireActual('@xyflow/react'),
    useNodesInitialized: () => mockUseNodesInitialized(),
}))

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
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseNodesInitialized.mockReturnValue(true)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should not attempt to layout if there are no nodes', () => {
        renderHook(() => useAutoLayout(), {
            wrapper: ({ children }) => <Wrapper nodes={[]}>{children}</Wrapper>,
        })

        expect(getLayoutedElementsSpy).not.toHaveBeenCalled()
        expect(onNodesChange).not.toHaveBeenCalled()
    })

    it('should attempt to layout if there are nodes', async () => {
        const firstNode = { id: '1', position: { x: 0, y: 0 }, data: {} }
        const secondNode = { id: '2', position: { x: 0, y: 0 }, data: {} }
        const nodes = [firstNode, secondNode]
        const edges = [{ id: '1-2', source: '1', target: '2' }]

        act(() => {
            renderHook(() => useAutoLayout(), {
                wrapper: ({ children }) => (
                    <Wrapper nodes={nodes} edges={edges}>
                        {children}
                    </Wrapper>
                ),
            })
        })

        await waitFor(() => {
            expect(getLayoutedElementsSpy).toHaveBeenCalledWith(
                nodes,
                edges,
                undefined,
            )
        })
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
        expect(onEdgesChange).toHaveBeenCalledWith([
            {
                id: '1-2',
                item: { id: '1-2', source: '1', target: '2' },
                type: 'replace',
            },
        ])
    })
})

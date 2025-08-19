import { ComponentProps } from 'react'

import { Edge, Node, ReactFlow } from '@xyflow/react'

import '@xyflow/react/dist/style.css'

export type FlowProps<TNode extends Node, TEdge extends Edge> = Omit<
    ComponentProps<typeof ReactFlow>,
    'nodes' | 'edges'
> & {
    nodes?: TNode[]
    edges?: TEdge[]
}

export function Flow<TNode extends Node, TEdge extends Edge>({
    nodes = [],
    edges = [],
    children,
    ...props
}: FlowProps<TNode, TEdge>): JSX.Element {
    return (
        <ReactFlow
            proOptions={{
                hideAttribution: true,
            }}
            fitView
            fitViewOptions={{
                duration: 0,
            }}
            onlyRenderVisibleElements
            nodes={nodes}
            edges={edges}
            minZoom={0.1}
            maxZoom={1}
            nodesDraggable={false}
            nodesConnectable={false}
            zoomOnDoubleClick={false}
            zoomOnScroll={false}
            panOnScroll={true}
            {...props}
        >
            {children}
        </ReactFlow>
    )
}

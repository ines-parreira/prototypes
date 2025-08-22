import { Edge, Node, ReactFlow, ReactFlowProps } from '@xyflow/react'

import { THEME_NAME } from '@gorgias/design-tokens'

import { useTheme } from 'core/theme'

import '@xyflow/react/dist/style.css'

export function Flow<TNode extends Node, TEdge extends Edge>({
    nodes = [],
    edges = [],
    children,
    ...props
}: ReactFlowProps<TNode, TEdge>): JSX.Element {
    const theme = useTheme()

    return (
        <ReactFlow<TNode, TEdge>
            colorMode={
                theme.resolvedName === THEME_NAME.Dark ? 'dark' : 'light'
            }
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
